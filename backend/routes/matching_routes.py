from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from backend.database import get_db
from backend.models import User, EmergencyRequest, DonorMatchingLog, DonorProfile
from backend.schemas import (
    SmartMatchQuery, SmartMatchResponse, EmergencyRequestCreate, EmergencyRequestOut
)
from backend.services.matching_service import match_donors_for_request
from backend.auth import get_current_user, log_audit, get_locality_coords

router = APIRouter(prefix="/matching", tags=["AI Smart Donor Matching"])

@router.post("/find-donors", response_model=SmartMatchResponse)
def find_smart_matches(
    query: SmartMatchQuery,
    db: Session = Depends(get_db)
):
    """
    Intelligent recommendation endpoint evaluating:
    1. Medically approved component compatibility (Whole Blood, PRBC, Platelets, FFP).
    2. NBTC India donation cooldowns (90d men / 120d women).
    3. Haversine distance with area-level privacy snapping.
    4. Automatic 5 km -> 10 km -> 20 km emergency radius expansion.
    """
    # 1. Determine search center coordinates
    req_lat = query.lat
    req_lng = query.lng
    if req_lat is None or req_lng is None:
        req_lat, req_lng = get_locality_coords(query.locality)

    # 2. Query available candidate donors with active profile discovery consent
    candidate_donors = db.query(User).filter(
        User.role == "donor",
        User.is_available == True
    ).all()

    # 3. Execute matching algorithm
    result = match_donors_for_request(
        recipient_blood_group=query.blood_group,
        component=query.component,
        request_lat=req_lat,
        request_lng=req_lng,
        candidate_donors=candidate_donors,
        initial_radius_km=query.initial_radius_km,
        min_required_candidates=3
    )

    return result

@router.post("/emergency-request", response_model=EmergencyRequestOut, status_code=status.HTTP_201_CREATED)
def create_emergency_request(
    req_data: EmergencyRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates verified Emergency SOS requirement and executes automatic donor matching and alert dispatch.
    """
    req_lat, req_lng = get_locality_coords(req_data.locality)

    new_request = EmergencyRequest(
        requester_id=current_user.id,
        patient_name=req_data.patient_name,
        blood_group=req_data.blood_group,
        component=req_data.component,
        units_needed=req_data.units_needed,
        hospital_name=req_data.hospital_name,
        locality=req_data.locality,
        lat=req_lat,
        lng=req_lng,
        urgency=req_data.urgency,
        status="active",
        search_radius_km=5.0,
        contact_phone=req_data.contact_phone,
        notes=req_data.notes
    )
    db.add(new_request)
    db.flush()

    # Run AI smart matching for the newly created request
    candidates = db.query(User).filter(User.role == "donor", User.is_available == True).all()
    match_result = match_donors_for_request(
        recipient_blood_group=req_data.blood_group,
        component=req_data.component,
        request_lat=req_lat,
        request_lng=req_lng,
        candidate_donors=candidates,
        initial_radius_km=5.0
    )

    new_request.search_radius_km = match_result["effective_radius_km"]

    # Record matched alerts in donor_matching_logs
    for m in match_result["matches"]:
        log_entry = DonorMatchingLog(
            request_id=new_request.id,
            donor_id=m["donor_id"],
            compatibility_score=m["score"],
            distance_km=m["distance_km"],
            match_explanation=m["match_explanation"],
            component_compatible=True,
            cooldown_cleared=m["cooldown_cleared"],
            alert_status="dispatched" if m["cooldown_cleared"] else "cooldown_active"
        )
        db.add(log_entry)

        # Update donor alerts count for fairness tracking
        donor_profile = db.query(DonorProfile).filter(DonorProfile.user_id == m["donor_id"]).first()
        if donor_profile and m["cooldown_cleared"]:
            donor_profile.alerts_received_this_week += 1

    db.commit()
    db.refresh(new_request)

    log_audit(
        db, current_user.id, current_user.role,
        "create_emergency_request", "emergency_request", new_request.id
    )

    return new_request

@router.get("/requests", response_model=List[EmergencyRequestOut])
def get_emergency_requests(
    status_filter: Optional[str] = Query("active", alias="status"),
    db: Session = Depends(get_db)
):
    query = db.query(EmergencyRequest)
    if status_filter and status_filter != "all":
        query = query.filter(EmergencyRequest.status == status_filter)
    return query.order_by(EmergencyRequest.created_at.desc()).all()

@router.post("/respond-alert/{log_id}")
def respond_to_donor_alert(
    log_id: str,
    action: str = Query(..., regex="^(accepted|declined)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log_entry = db.query(DonorMatchingLog).filter(
        DonorMatchingLog.id == log_id,
        DonorMatchingLog.donor_id == current_user.id
    ).first()

    if not log_entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Matching alert not found for this donor account")

    log_entry.alert_status = action
    db.commit()

    log_audit(
        db, current_user.id, current_user.role,
        f"donor_alert_{action}", "donor_matching_log", log_entry.id
    )

    return {"status": "success", "alert_status": action, "log_id": log_id}

