from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
import uuid
from backend.database import get_db
from backend.models import (
    User, Institution, RareBloodDonor, RareEmergencyRequest, RareDonorResponse
)
from backend.schemas import (
    RareDonorRegister, RareDonorOut,
    RareEmergencyRequestCreate, RareEmergencyRequestOut,
    RareStatsOut
)
from backend.auth import get_current_user, require_roles, log_audit

router = APIRouter(prefix="/rare", tags=["Rare Blood Group Network"])

@router.post("/register", response_model=RareDonorOut, status_code=status.HTTP_201_CREATED)
def register_rare_donor(
    data: RareDonorRegister,
    current_user: User = Depends(require_roles("donor")),
    db: Session = Depends(get_db)
):
    """Voluntary opt-in registration for rare blood phenotype donors."""
    existing = db.query(RareBloodDonor).filter(RareBloodDonor.donor_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You are already registered in the Rare Blood Donor Network.")

    record = RareBloodDonor(
        donor_id=current_user.id,
        phenotype=data.phenotype,
        immunohematology_lab=data.immunohematology_lab,
        lab_report_number=data.lab_report_number,
        state_region=data.state_region,
        emergency_alert_consent=data.emergency_alert_consent,
        is_verified=False
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    log_audit(
        db, current_user.id, current_user.role,
        "register_rare_donor", "rare_blood_donor", record.id
    )

    return record

@router.get("/my-status", response_model=Optional[RareDonorOut])
def get_my_rare_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(RareBloodDonor).filter(RareBloodDonor.donor_id == current_user.id).first()
    return record

@router.post("/verify-donor/{rare_donor_id}", response_model=RareDonorOut)
def verify_rare_donor(
    rare_donor_id: str,
    current_user: User = Depends(require_roles("hospital_admin", "blood_bank_admin", "admin")),
    db: Session = Depends(get_db)
):
    """Authorized institution verifies the immunohematology lab test report for a rare donor."""
    record = db.query(RareBloodDonor).filter(RareBloodDonor.id == rare_donor_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rare donor record not found")

    inst = db.query(Institution).filter(Institution.user_id == current_user.id).first()
    inst_id = inst.id if inst else None

    record.is_verified = True
    record.verified_by_institution_id = inst_id
    record.verified_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(record)

    log_audit(
        db, current_user.id, current_user.role,
        "verify_rare_donor", "rare_blood_donor", record.id
    )

    return record

@router.post("/emergency-request", response_model=RareEmergencyRequestOut, status_code=status.HTTP_201_CREATED)
def create_rare_emergency_request(
    data: RareEmergencyRequestCreate,
    current_user: User = Depends(require_roles("hospital_admin", "admin")),
    db: Session = Depends(get_db)
):
    """
    Verified hospital creates an urgent rare blood emergency alert.
    Dispatches notifications to all matching verified rare donors across the state.
    """
    inst = db.query(Institution).filter(Institution.user_id == current_user.id).first()
    if not inst and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Must be an accredited institution to raise rare blood requests")

    inst_id = inst.id if inst else "inst-admin"
    patient_token = f"RARE-{data.phenotype_needed[:4].upper()}-{str(uuid.uuid4())[:8].upper()}"

    new_request = RareEmergencyRequest(
        hospital_id=inst_id,
        patient_identifier=patient_token,
        phenotype_needed=data.phenotype_needed,
        units_needed=data.units_needed,
        hospital_name=data.hospital_name,
        locality=data.locality,
        urgency="critical",
        status="active",
        treating_doctor=data.treating_doctor,
        clinical_summary=data.clinical_summary
    )
    db.add(new_request)
    db.flush()

    # Automatically alert matching rare donors
    matching_donors = db.query(RareBloodDonor).filter(
        RareBloodDonor.phenotype == data.phenotype_needed,
        RareBloodDonor.emergency_alert_consent == True
    ).all()

    for donor_rec in matching_donors:
        resp = RareDonorResponse(
            request_id=new_request.id,
            donor_id=donor_rec.donor_id,
            response_status="alerted"
        )
        db.add(resp)

    db.commit()
    db.refresh(new_request)

    log_audit(
        db, current_user.id, current_user.role,
        "create_rare_emergency_request", "rare_emergency_request", new_request.id
    )

    return new_request

@router.get("/emergency-requests", response_model=List[RareEmergencyRequestOut])
def get_rare_emergency_requests(
    status_filter: Optional[str] = Query("active", alias="status"),
    db: Session = Depends(get_db)
):
    query = db.query(RareEmergencyRequest)
    if status_filter and status_filter != "all":
        query = query.filter(RareEmergencyRequest.status == status_filter)
    return query.order_by(RareEmergencyRequest.created_at.desc()).all()

@router.post("/respond/{request_id}")
def respond_to_rare_alert(
    request_id: str,
    action: str = Query(..., regex="^(accepted|declined)$"),
    current_user: User = Depends(require_roles("donor")),
    db: Session = Depends(get_db)
):
    response_rec = db.query(RareDonorResponse).filter(
        RareDonorResponse.request_id == request_id,
        RareDonorResponse.donor_id == current_user.id
    ).first()

    if not response_rec:
        # Create response if not pre-alerted
        response_rec = RareDonorResponse(
            request_id=request_id,
            donor_id=current_user.id,
            response_status=action
        )
        db.add(response_rec)
    else:
        response_rec.response_status = action
        response_rec.responded_at = datetime.now(timezone.utc)

    db.commit()

    log_audit(
        db, current_user.id, current_user.role,
        f"rare_alert_{action}", "rare_emergency_request", request_id
    )

    return {"status": "success", "action": action, "request_id": request_id}

@router.get("/stats", response_model=RareStatsOut)
def get_rare_network_stats(db: Session = Depends(get_db)):
    """Public aggregated statistics (privacy-shielded, zero personal identities exposed)."""
    total = db.query(RareBloodDonor).count()
    verified = db.query(RareBloodDonor).filter(RareBloodDonor.is_verified == True).count()
    active_reqs = db.query(RareEmergencyRequest).filter(RareEmergencyRequest.status == "active").count()
    fulfilled = db.query(RareEmergencyRequest).filter(RareEmergencyRequest.status == "fulfilled").count()

    phenotypes = db.query(RareBloodDonor.phenotype).all()
    breakdown = {}
    for (pt,) in phenotypes:
        breakdown[pt] = breakdown.get(pt, 0) + 1

    return {
        "total_rare_donors": total,
        "verified_rare_donors": verified,
        "active_rare_requests": active_reqs,
        "fulfilled_coordinations": fulfilled,
        "phenotype_breakdown": breakdown
    }

