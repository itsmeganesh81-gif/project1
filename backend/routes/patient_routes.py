from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from backend.database import get_db
from backend.models import (
    User, PatientProfile, RecurringSchedule, TransfusionRecord, DonorCirclePledge
)
from backend.schemas import (
    PatientProfileCreate, PatientProfileOut,
    RecurringScheduleCreate, RecurringScheduleOut,
    TransfusionRecordCreate, TransfusionRecordOut,
    DonorPledgeCreate, DonorPledgeOut, PublicRecurringNeedOut
)
from backend.auth import get_current_user, require_roles, log_audit

router = APIRouter(prefix="/patient", tags=["Recurring Transfusions & Patient Support"])

@router.post("/profile", response_model=PatientProfileOut, status_code=status.HTTP_201_CREATED)
def create_patient_profile(
    profile_data: PatientProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Registers a patient profile for recurring transfusion support.
    Can be created directly by the patient or by an authorized family attendant.
    """
    new_profile = PatientProfile(
        user_id=current_user.id,
        attendant_id=profile_data.attendant_id,
        patient_name=profile_data.patient_name,
        condition_type=profile_data.condition_type,
        blood_group=profile_data.blood_group,
        hospital_name=profile_data.hospital_name,
        treating_physician=profile_data.treating_physician,
        hospital_patient_id=profile_data.hospital_patient_id,
        is_active=True
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    log_audit(
        db, current_user.id, current_user.role,
        "create_patient_profile", "patient_profile", new_profile.id
    )

    return new_profile

@router.get("/my-profile", response_model=List[PatientProfileOut])
def get_my_patient_profiles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves patient profiles associated with the user or where they are designated attendant."""
    profiles = db.query(PatientProfile).filter(
        (PatientProfile.user_id == current_user.id) | (PatientProfile.attendant_id == current_user.id)
    ).all()
    return profiles

@router.post("/schedules", response_model=RecurringScheduleOut, status_code=status.HTTP_201_CREATED)
def create_recurring_schedule(
    schedule_data: RecurringScheduleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a recurring transfusion schedule (e.g. 14, 21, or 28 days).
    Automatically calculates the next due date based on the last transfusion date.
    """
    profile = db.query(PatientProfile).filter(PatientProfile.id == schedule_data.patient_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found")

    # Verify ownership or attendant authorization
    if profile.user_id != current_user.id and profile.attendant_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to manage this patient schedule")

    now = datetime.now(timezone.utc)
    base_date = schedule_data.last_transfusion_date or now
    if base_date.tzinfo is None:
        base_date = base_date.replace(tzinfo=timezone.utc)

    next_due = base_date + timedelta(days=schedule_data.frequency_days)

    new_schedule = RecurringSchedule(
        patient_id=profile.id,
        frequency_days=schedule_data.frequency_days,
        component=schedule_data.component,
        units_per_cycle=schedule_data.units_per_cycle,
        last_transfusion_date=schedule_data.last_transfusion_date,
        next_due_date=next_due,
        reminder_days_before=schedule_data.reminder_days_before,
        hospital_name=schedule_data.hospital_name,
        status="active"
    )
    db.add(new_schedule)
    db.commit()
    db.refresh(new_schedule)

    log_audit(
        db, current_user.id, current_user.role,
        "create_recurring_schedule", "recurring_schedule", new_schedule.id
    )

    return new_schedule

@router.get("/schedules", response_model=List[RecurringScheduleOut])
def get_patient_schedules(
    patient_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(RecurringSchedule).join(PatientProfile)
    if patient_id:
        query = query.filter(RecurringSchedule.patient_id == patient_id)
    else:
        query = query.filter(
            (PatientProfile.user_id == current_user.id) | (PatientProfile.attendant_id == current_user.id)
        )
    return query.all()

@router.post("/transfusions", response_model=TransfusionRecordOut, status_code=status.HTTP_201_CREATED)
def record_transfusion(
    record_data: TransfusionRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Logs a completed transfusion, records pre- and post-transfusion Hb,
    and automatically calculates the next recurring cycle due date.
    """
    schedule = db.query(RecurringSchedule).filter(RecurringSchedule.id == record_data.schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recurring schedule not found")

    trans_date = record_data.transfusion_date
    if trans_date.tzinfo is None:
        trans_date = trans_date.replace(tzinfo=timezone.utc)

    new_record = TransfusionRecord(
        schedule_id=schedule.id,
        transfusion_date=trans_date,
        units_transfused=record_data.units_transfused,
        hospital_name=record_data.hospital_name,
        pre_transfusion_hb=record_data.pre_transfusion_hb,
        post_transfusion_hb=record_data.post_transfusion_hb,
        status="completed",
        notes=record_data.notes
    )
    db.add(new_record)

    # Advance the schedule
    schedule.last_transfusion_date = trans_date
    schedule.next_due_date = trans_date + timedelta(days=schedule.frequency_days)

    db.commit()
    db.refresh(new_record)

    log_audit(
        db, current_user.id, current_user.role,
        "record_transfusion", "transfusion_record", new_record.id
    )

    return new_record

@router.get("/transfusions/{schedule_id}", response_model=List[TransfusionRecordOut])
def get_transfusion_history(
    schedule_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = db.query(TransfusionRecord).filter(
        TransfusionRecord.schedule_id == schedule_id
    ).order_by(TransfusionRecord.transfusion_date.desc()).all()
    return records

@router.post("/pledge", response_model=DonorPledgeOut, status_code=status.HTTP_201_CREATED)
def pledge_recurring_donation(
    pledge_data: DonorPledgeCreate,
    current_user: User = Depends(require_roles("donor")),
    db: Session = Depends(get_db)
):
    """A voluntary donor pledges regular support for a patient's upcoming transfusion cycle."""
    schedule = db.query(RecurringSchedule).filter(RecurringSchedule.id == pledge_data.schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recurring schedule not found")

    pledge_dt = pledge_data.pledge_date
    if pledge_dt.tzinfo is None:
        pledge_dt = pledge_dt.replace(tzinfo=timezone.utc)

    new_pledge = DonorCirclePledge(
        schedule_id=schedule.id,
        donor_id=current_user.id,
        pledge_date=pledge_dt,
        status="pledged"
    )
    db.add(new_pledge)
    db.commit()
    db.refresh(new_pledge)

    log_audit(
        db, current_user.id, current_user.role,
        "pledge_recurring_donation", "donor_circle_pledge", new_pledge.id
    )

    return new_pledge

@router.get("/public-needs", response_model=List[PublicRecurringNeedOut])
def get_public_recurring_needs(db: Session = Depends(get_db)):
    """
    Public listing of recurring transfusion needs for community donors.
    CRITICAL PRIVACY GUARD: Patient medical condition (e.g. Thalassemia) and
    patient real identity are strictly SANITIZED and concealed.
    """
    now = datetime.now(timezone.utc)
    schedules = db.query(RecurringSchedule).join(PatientProfile).filter(
        RecurringSchedule.status == "active"
    ).all()

    results = []
    for s in schedules:
        due = s.next_due_date
        if due.tzinfo is None:
            due = due.replace(tzinfo=timezone.utc)
        days_left = (due - now).days

        results.append({
            "schedule_id": s.id,
            "component": s.component,
            "blood_group": s.patient.blood_group,
            "units_per_cycle": s.units_per_cycle,
            "hospital_name": s.hospital_name,
            "next_due_date": due,
            "days_until_due": max(0, days_left)
        })

    return sorted(results, key=lambda x: x["days_until_due"])

