import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import (
    User, Institution, BloodInventoryBatch, InterFacilityTransfer,
    DonationCamp, AuditLog
)
from backend.schemas import (
    InventoryBatchCreate, InventoryBatchUpdate, InventoryBatchOut,
    InterFacilityTransferCreate, InterFacilityTransferOut,
    DonationCampCreate, DonationCampOut
)
from backend.auth import get_current_user, require_roles

router = APIRouter(prefix="/api/inventory", tags=["Blood Bank Inventory & Network"])

def utc_now():
    return datetime.now(timezone.utc)

@router.post("/batch", response_model=InventoryBatchOut)
def register_inventory_batch(
    payload: InventoryBatchCreate,
    current_user: User = Depends(require_roles("blood_bank_admin", "admin")),
    db: Session = Depends(get_db)
):
    """
    Registers a new blood component batch into blood bank inventory.
    Strictly verifies Transfusion-Transmitted Infection (TTI) testing clearance
    as mandated by the Drugs and Cosmetics Rules (India) and NBTC guidelines.
    """
    inst = db.query(Institution).filter(
        Institution.user_id == current_user.id,
        Institution.org_type == "blood_bank"
    ).first()

    if not inst:
        raise HTTPException(status_code=400, detail="Authenticated user is not linked to an accredited blood bank.")

    # Clinical validation: All 5 mandatory TTI screenings must be negative/cleared
    all_tti_negative = (
        payload.tested_hiv and
        payload.tested_hbv and
        payload.tested_hcv and
        payload.tested_syphilis and
        payload.tested_malaria
    )

    batch_status = "available" if all_tti_negative else "quarantined"
    batch_num = f"BB-{payload.blood_group.replace('+', 'P').replace('-', 'N')}-{str(uuid.uuid4())[:6].upper()}"

    batch = BloodInventoryBatch(
        institution_id=inst.id,
        batch_number=batch_num,
        blood_group=payload.blood_group,
        component=payload.component,
        units=payload.units,
        volume_ml=payload.volume_ml,
        collection_date=payload.collection_date or utc_now(),
        expiry_date=payload.expiry_date,
        storage_location=payload.storage_location or "Cold Room Unit",
        storage_temp_celsius=payload.storage_temp_celsius or 4.0,
        tested_hiv=payload.tested_hiv,
        tested_hbv=payload.tested_hbv,
        tested_hcv=payload.tested_hcv,
        tested_syphilis=payload.tested_syphilis,
        tested_malaria=payload.tested_malaria,
        is_cleared=all_tti_negative,
        technician_name=payload.technician_name or current_user.name,
        status=batch_status
    )
    db.add(batch)

    # Audit log
    db.add(AuditLog(
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="register_inventory_batch",
        resource_type="blood_inventory_batches",
        resource_id=batch.id
    ))

    db.commit()
    db.refresh(batch)

    now = utc_now().replace(tzinfo=None)
    exp = batch.expiry_date.replace(tzinfo=None) if batch.expiry_date.tzinfo else batch.expiry_date
    days_left = max(0, (exp - now).days)

    return InventoryBatchOut(
        id=batch.id,
        institution_id=batch.institution_id,
        batch_number=batch.batch_number,
        blood_group=batch.blood_group,
        component=batch.component,
        units=batch.units,
        volume_ml=batch.volume_ml,
        collection_date=batch.collection_date,
        expiry_date=batch.expiry_date,
        storage_location=batch.storage_location,
        storage_temp_celsius=batch.storage_temp_celsius,
        tested_hiv=batch.tested_hiv,
        tested_hbv=batch.tested_hbv,
        tested_hcv=batch.tested_hcv,
        tested_syphilis=batch.tested_syphilis,
        tested_malaria=batch.tested_malaria,
        is_cleared=batch.is_cleared,
        technician_name=batch.technician_name,
        status=batch.status,
        days_to_expiry=days_left,
        created_at=batch.created_at
    )


@router.get("/batches", response_model=List[InventoryBatchOut])
def get_inventory_batches(
    blood_group: Optional[str] = None,
    component: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns inventory batches. If accessed by a blood bank admin, returns their specific batches.
    If accessed by hospital or other roles, returns available cleared stock.
    """
    query = db.query(BloodInventoryBatch)

    # If blood bank admin, filter to their institution
    inst = db.query(Institution).filter(Institution.user_id == current_user.id).first()
    if inst and inst.org_type == "blood_bank":
        query = query.filter(BloodInventoryBatch.institution_id == inst.id)
    else:
        # Non-blood-bank viewers can only see available, cleared batches
        query = query.filter(
            BloodInventoryBatch.status == "available",
            BloodInventoryBatch.is_cleared == True
        )

    if blood_group:
        query = query.filter(BloodInventoryBatch.blood_group == blood_group)
    if component:
        query = query.filter(BloodInventoryBatch.component == component)
    if status:
        query = query.filter(BloodInventoryBatch.status == status)

    batches = query.order_by(BloodInventoryBatch.expiry_date.asc()).all()

    now = utc_now().replace(tzinfo=None)
    out = []
    for b in batches:
        exp = b.expiry_date.replace(tzinfo=None) if b.expiry_date.tzinfo else b.expiry_date
        days_left = max(0, (exp - now).days)
        out.append(InventoryBatchOut(
            id=b.id,
            institution_id=b.institution_id,
            batch_number=b.batch_number,
            blood_group=b.blood_group,
            component=b.component,
            units=b.units,
            volume_ml=b.volume_ml,
            collection_date=b.collection_date,
            expiry_date=b.expiry_date,
            storage_location=b.storage_location,
            storage_temp_celsius=b.storage_temp_celsius,
            tested_hiv=b.tested_hiv,
            tested_hbv=b.tested_hbv,
            tested_hcv=b.tested_hcv,
            tested_syphilis=b.tested_syphilis,
            tested_malaria=b.tested_malaria,
            is_cleared=b.is_cleared,
            technician_name=b.technician_name,
            status=b.status,
            days_to_expiry=days_left,
            created_at=b.created_at
        ))
    return out


@router.patch("/batch/{batch_id}", response_model=InventoryBatchOut)
def update_inventory_batch(
    batch_id: str,
    payload: InventoryBatchUpdate,
    current_user: User = Depends(require_roles("blood_bank_admin", "admin")),
    db: Session = Depends(get_db)
):
    """
    Updates units, storage location, or status of an existing batch.
    """
    batch = db.query(BloodInventoryBatch).filter(BloodInventoryBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Inventory batch not found.")

    if payload.units is not None:
        batch.units = payload.units
        if batch.units == 0 and batch.status == "available":
            batch.status = "transfused"

    if payload.status is not None:
        batch.status = payload.status
    if payload.storage_location is not None:
        batch.storage_location = payload.storage_location
    if payload.storage_temp_celsius is not None:
        batch.storage_temp_celsius = payload.storage_temp_celsius

    db.add(AuditLog(
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="update_inventory_batch",
        resource_type="blood_inventory_batches",
        resource_id=batch.id
    ))

    db.commit()
    db.refresh(batch)

    now = utc_now().replace(tzinfo=None)
    exp = batch.expiry_date.replace(tzinfo=None) if batch.expiry_date.tzinfo else batch.expiry_date
    days_left = max(0, (exp - now).days)

    return InventoryBatchOut(
        id=batch.id,
        institution_id=batch.institution_id,
        batch_number=batch.batch_number,
        blood_group=batch.blood_group,
        component=batch.component,
        units=batch.units,
        volume_ml=batch.volume_ml,
        collection_date=batch.collection_date,
        expiry_date=batch.expiry_date,
        storage_location=batch.storage_location,
        storage_temp_celsius=batch.storage_temp_celsius,
        tested_hiv=batch.tested_hiv,
        tested_hbv=batch.tested_hbv,
        tested_hcv=batch.tested_hcv,
        tested_syphilis=batch.tested_syphilis,
        tested_malaria=batch.tested_malaria,
        is_cleared=batch.is_cleared,
        technician_name=batch.technician_name,
        status=batch.status,
        days_to_expiry=days_left,
        created_at=batch.created_at
    )


@router.get("/summary")
def get_inventory_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Calculates aggregated stock counts strictly from real database batches.
    No mock numbers or simulated statistics. Identifies shortage alerts.
    """
    batches = db.query(BloodInventoryBatch).filter(
        BloodInventoryBatch.status == "available",
        BloodInventoryBatch.is_cleared == True
    ).all()

    blood_groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    components = ["whole_blood", "prbc", "platelets", "ffp", "cryoprecipitate"]

    matrix = {bg: {comp: 0 for comp in components} for bg in blood_groups}
    total_units_by_group = {bg: 0 for bg in blood_groups}
    total_available_units = 0

    now = utc_now().replace(tzinfo=None)
    near_expiry_count = 0  # < 3 days left

    for b in batches:
        if b.blood_group in matrix and b.component in matrix[b.blood_group]:
            matrix[b.blood_group][b.component] += b.units
            total_units_by_group[b.blood_group] += b.units
            total_available_units += b.units

            exp = b.expiry_date.replace(tzinfo=None) if b.expiry_date.tzinfo else b.expiry_date
            if (exp - now).days <= 3:
                near_expiry_count += b.units

    shortage_alerts = []
    for bg, count in total_units_by_group.items():
        if count == 0:
            shortage_alerts.append({"blood_group": bg, "severity": "CRITICAL", "message": f"Zero units of {bg} available in verified inventory."})
        elif count <= 2:
            shortage_alerts.append({"blood_group": bg, "severity": "WARNING", "message": f"Low reserve: Only {count} units of {bg} in verified inventory."})

    return {
        "total_available_units": total_available_units,
        "near_expiry_count": near_expiry_count,
        "total_batches_tracked": len(batches),
        "stock_matrix": matrix,
        "group_totals": total_units_by_group,
        "shortage_alerts": shortage_alerts,
        "verified_at": utc_now().isoformat()
    }


@router.post("/transfer", response_model=InterFacilityTransferOut)
def initiate_inter_facility_transfer(
    payload: InterFacilityTransferCreate,
    current_user: User = Depends(require_roles("blood_bank_admin", "hospital_admin")),
    db: Session = Depends(get_db)
):
    """
    Coordinates cold-chain inter-facility blood transfers between verified institutions.
    """
    source_inst = db.query(Institution).filter(Institution.user_id == current_user.id).first()
    if not source_inst:
        raise HTTPException(status_code=400, detail="User is not associated with an accredited institution.")

    dest_inst = db.query(Institution).filter(Institution.id == payload.destination_institution_id).first()
    if not dest_inst:
        raise HTTPException(status_code=404, detail="Destination institution not found.")

    # Deduct from batch if batch_id provided
    if payload.batch_id:
        batch = db.query(BloodInventoryBatch).filter(BloodInventoryBatch.id == payload.batch_id).first()
        if not batch or batch.units < payload.units_transferred:
            raise HTTPException(status_code=400, detail="Insufficient batch units for transfer.")
        batch.units -= payload.units_transferred
        if batch.units == 0:
            batch.status = "transferred"

    transfer = InterFacilityTransfer(
        source_institution_id=source_inst.id,
        destination_institution_id=dest_inst.id,
        requisition_id=payload.requisition_id,
        batch_id=payload.batch_id,
        blood_group=payload.blood_group,
        component=payload.component,
        units_transferred=payload.units_transferred,
        cold_chain_carrier=payload.cold_chain_carrier or "Validated Passive Cold Box (2-6°C)",
        temp_at_dispatch=payload.temp_at_dispatch or 4.0,
        transfer_status="dispatched",
        dispatched_at=utc_now()
    )
    db.add(transfer)

    db.add(AuditLog(
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="initiate_inter_facility_transfer",
        resource_type="inter_facility_transfers",
        resource_id=transfer.id
    ))

    db.commit()
    db.refresh(transfer)
    return transfer


@router.get("/transfers", response_model=List[InterFacilityTransferOut])
def get_inter_facility_transfers(
    current_user: User = Depends(require_roles("blood_bank_admin", "hospital_admin", "admin")),
    db: Session = Depends(get_db)
):
    inst = db.query(Institution).filter(Institution.user_id == current_user.id).first()
    if not inst and current_user.role != "admin":
        return []

    if current_user.role == "admin":
        return db.query(InterFacilityTransfer).order_by(InterFacilityTransfer.dispatched_at.desc()).all()

    return db.query(InterFacilityTransfer).filter(
        (InterFacilityTransfer.source_institution_id == inst.id) |
        (InterFacilityTransfer.destination_institution_id == inst.id)
    ).order_by(InterFacilityTransfer.dispatched_at.desc()).all()


@router.post("/camps", response_model=DonationCampOut)
def schedule_donation_camp(
    payload: DonationCampCreate,
    current_user: User = Depends(require_roles("blood_bank_admin", "hospital_admin", "admin")),
    db: Session = Depends(get_db)
):
    """
    Schedules an accredited voluntary blood donation camp in compliance with NBTC standards.
    """
    inst = db.query(Institution).filter(Institution.user_id == current_user.id).first()
    if not inst:
        raise HTTPException(status_code=400, detail="User is not linked to an accredited medical institution.")

    camp = DonationCamp(
        organizer_institution_id=inst.id,
        camp_name=payload.camp_name,
        venue=payload.venue,
        locality=payload.locality,
        start_date=payload.start_date,
        end_date=payload.end_date,
        target_units=payload.target_units,
        status="scheduled",
        contact_person=payload.contact_person,
        contact_phone=payload.contact_phone
    )
    db.add(camp)
    db.commit()
    db.refresh(camp)
    return camp


@router.get("/camps", response_model=List[DonationCampOut])
def list_donation_camps(db: Session = Depends(get_db)):
    """
    Public listing of verified scheduled donation camps across Bengaluru and regional hubs.
    """
    return db.query(DonationCamp).order_by(DonationCamp.start_date.asc()).all()

