import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import (
    User, Institution, HospitalBloodRequisition, BloodInventoryBatch, AuditLog
)
from backend.schemas import (
    HospitalRequisitionCreate, HospitalRequisitionOut, RequisitionStatusUpdate
)
from backend.auth import get_current_user, require_roles

router = APIRouter(prefix="/api/hospital", tags=["Hospital Clinical Requisitions"])

def utc_now():
    return datetime.now(timezone.utc)

@router.post("/requisition", response_model=HospitalRequisitionOut)
def create_hospital_requisition(
    payload: HospitalRequisitionCreate,
    current_user: User = Depends(require_roles("hospital_admin", "admin")),
    db: Session = Depends(get_db)
):
    """
    Submits a verified clinical blood requisition from an accredited hospital.
    Adheres to DPDP principles by using an anonymous/tokenized patient identifier.
    """
    hosp = db.query(Institution).filter(
        Institution.user_id == current_user.id,
        Institution.org_type == "hospital"
    ).first()

    if not hosp and current_user.role != "admin":
        raise HTTPException(status_code=400, detail="User is not linked to an accredited hospital.")

    hosp_id = hosp.id if hosp else "admin-hosp-override"

    # Emergency massive hemorrhage protocol triggers immediate uncrossmatched clearance flag
    cross_match_stat = "emergency_uncrossmatched" if payload.urgency == "emergency_mhp" else "pending"

    req = HospitalBloodRequisition(
        hospital_id=hosp_id,
        blood_bank_id=payload.blood_bank_id,
        patient_identifier=payload.patient_identifier,
        blood_group=payload.blood_group,
        component=payload.component,
        units_requested=payload.units_requested,
        units_allocated=0,
        urgency=payload.urgency,
        clinical_indication=payload.clinical_indication,
        cross_match_required=(payload.urgency != "emergency_mhp"),
        cross_match_status=cross_match_stat,
        status="submitted",
        treating_physician=payload.treating_physician,
        required_by=payload.required_by
    )
    db.add(req)

    db.add(AuditLog(
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="create_hospital_requisition",
        resource_type="hospital_blood_requisitions",
        resource_id=req.id
    ))

    db.commit()
    db.refresh(req)

    hosp_name = hosp.name if hosp else "General Hospital"
    return HospitalRequisitionOut(
        id=req.id,
        hospital_id=req.hospital_id,
        blood_bank_id=req.blood_bank_id,
        hospital_name=hosp_name,
        patient_identifier=req.patient_identifier,
        blood_group=req.blood_group,
        component=req.component,
        units_requested=req.units_requested,
        units_allocated=req.units_allocated,
        urgency=req.urgency,
        clinical_indication=req.clinical_indication,
        cross_match_required=req.cross_match_required,
        cross_match_status=req.cross_match_status,
        status=req.status,
        treating_physician=req.treating_physician,
        created_at=req.created_at
    )


@router.get("/requisitions", response_model=List[HospitalRequisitionOut])
def get_hospital_requisitions(
    current_user: User = Depends(require_roles("hospital_admin", "blood_bank_admin", "admin")),
    db: Session = Depends(get_db)
):
    """
    Returns requisitions for the authenticated hospital, or incoming requisitions for blood banks.
    """
    inst = db.query(Institution).filter(Institution.user_id == current_user.id).first()

    query = db.query(HospitalBloodRequisition)
    if inst:
        if inst.org_type == "hospital":
            query = query.filter(HospitalBloodRequisition.hospital_id == inst.id)
        elif inst.org_type == "blood_bank":
            query = query.filter(
                (HospitalBloodRequisition.blood_bank_id == inst.id) |
                (HospitalBloodRequisition.blood_bank_id == None)
            )

    requisitions = query.order_by(HospitalBloodRequisition.created_at.desc()).all()

    out = []
    for r in requisitions:
        hosp_name = r.hospital.name if r.hospital else "Accredited Hospital"
        out.append(HospitalRequisitionOut(
            id=r.id,
            hospital_id=r.hospital_id,
            blood_bank_id=r.blood_bank_id,
            hospital_name=hosp_name,
            patient_identifier=r.patient_identifier,
            blood_group=r.blood_group,
            component=r.component,
            units_requested=r.units_requested,
            units_allocated=r.units_allocated,
            urgency=r.urgency,
            clinical_indication=r.clinical_indication,
            cross_match_required=r.cross_match_required,
            cross_match_status=r.cross_match_status,
            status=r.status,
            treating_physician=r.treating_physician,
            created_at=r.created_at
        ))
    return out


@router.patch("/requisition/{req_id}/status", response_model=HospitalRequisitionOut)
def update_requisition_status(
    req_id: str,
    payload: RequisitionStatusUpdate,
    current_user: User = Depends(require_roles("blood_bank_admin", "hospital_admin", "admin")),
    db: Session = Depends(get_db)
):
    """
    Updates the crossmatch status, units allocated, or shipment dispatch for a requisition.
    """
    req = db.query(HospitalBloodRequisition).filter(HospitalBloodRequisition.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Requisition not found.")

    req.status = payload.status
    if payload.units_allocated is not None:
        req.units_allocated = payload.units_allocated
    if payload.cross_match_status is not None:
        req.cross_match_status = payload.cross_match_status

    db.add(AuditLog(
        actor_id=current_user.id,
        actor_role=current_user.role,
        action=f"update_requisition_status_{payload.status}",
        resource_type="hospital_blood_requisitions",
        resource_id=req.id
    ))

    db.commit()
    db.refresh(req)

    hosp_name = req.hospital.name if req.hospital else "Accredited Hospital"
    return HospitalRequisitionOut(
        id=req.id,
        hospital_id=req.hospital_id,
        blood_bank_id=req.blood_bank_id,
        hospital_name=hosp_name,
        patient_identifier=req.patient_identifier,
        blood_group=req.blood_group,
        component=req.component,
        units_requested=req.units_requested,
        units_allocated=req.units_allocated,
        urgency=req.urgency,
        clinical_indication=req.clinical_indication,
        cross_match_required=req.cross_match_required,
        cross_match_status=req.cross_match_status,
        status=req.status,
        treating_physician=req.treating_physician,
        created_at=req.created_at
    )


@router.get("/stats")
def get_hospital_requisition_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("hospital_admin", "blood_bank_admin", "admin"))
):
    """
    Aggregated hospital network statistics on requisition fulfillment.
    """
    total = db.query(HospitalBloodRequisition).count()
    fulfilled = db.query(HospitalBloodRequisition).filter(HospitalBloodRequisition.status == "fulfilled").count()
    active = db.query(HospitalBloodRequisition).filter(HospitalBloodRequisition.status.in_(["submitted", "accepted", "crossmatched"])).count()
    emergency_mhp = db.query(HospitalBloodRequisition).filter(HospitalBloodRequisition.urgency == "emergency_mhp").count()

    return {
        "total_requisitions": total,
        "active_requisitions": active,
        "fulfilled_requisitions": fulfilled,
        "emergency_mhp_count": emergency_mhp,
        "fulfillment_rate_percent": round((fulfilled / total * 100), 1) if total > 0 else 100.0
    }

