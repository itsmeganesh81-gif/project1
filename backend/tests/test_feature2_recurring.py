import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from datetime import datetime, timezone, timedelta
from backend.database import SessionLocal
from backend.models import User, PatientProfile, RecurringSchedule, TransfusionRecord
from backend.schemas import (
    PatientProfileCreate, RecurringScheduleCreate, TransfusionRecordCreate, DonorPledgeCreate
)
from backend.routes.patient_routes import (
    create_patient_profile, get_my_patient_profiles,
    create_recurring_schedule, record_transfusion,
    get_transfusion_history, pledge_recurring_donation,
    get_public_recurring_needs
)
from backend.seed import seed_database
from fastapi import HTTPException

def test_feature2_recurring_transfusions():
    print("=" * 70)
    print("RUNNING FEATURE 2: RECURRING TRANSFUSION & PATIENT SUPPORT TESTS")
    print("=" * 70)

    seed_database()
    db = SessionLocal()

    patient_user = db.query(User).filter(User.email == "patient@bloodbridge.in").first()
    donor_user = db.query(User).filter(User.email == "donor@bloodbridge.in").first()
    admin_user = db.query(User).filter(User.email == "admin@bloodbridge.in").first()

    now = datetime.now(timezone.utc)

    # 1. Register Patient Profile (Thalassemia Major)
    profile_data = PatientProfileCreate(
        patient_name="Rahul Varma (Age 11)",
        condition_type="thalassemia_major",
        blood_group="B+",
        hospital_name="Manipal Hospital Whitefield",
        treating_physician="Dr. Sunita Rao (Pediatric Hematology)",
        hospital_patient_id="CR-2024-THAL-091"
    )
    profile = create_patient_profile(profile_data, patient_user, db)
    assert profile.id is not None
    assert profile.condition_type == "thalassemia_major"
    print("[PASS] Test 1: Patient Profile & Pediatric Hematology Record Created")

    # 2. Create 21-Day Recurring Schedule
    last_transfusion = now - timedelta(days=14)
    sched_data = RecurringScheduleCreate(
        patient_id=profile.id,
        frequency_days=21,
        component="prbc",
        units_per_cycle=1,
        last_transfusion_date=last_transfusion,
        hospital_name="Manipal Hospital Whitefield",
        reminder_days_before=3
    )
    schedule = create_recurring_schedule(sched_data, patient_user, db)
    assert schedule.id is not None
    assert schedule.frequency_days == 21
    # next due date should be last_transfusion + 21 days = now + 7 days
    expected_due = last_transfusion + timedelta(days=21)
    assert abs((schedule.next_due_date.replace(tzinfo=timezone.utc) - expected_due).total_seconds()) < 60
    print("[PASS] Test 2: 21-Day Recurring Transfusion Cycle & Due Date Calculated")

    # 3. Server-Side Attendant Authorization Check
    # Donor attempting to create schedule for this patient must be rejected with 403 Forbidden
    try:
        unauthorized_sched = RecurringScheduleCreate(
            patient_id=profile.id,
            frequency_days=14,
            hospital_name="Fake Hospital"
        )
        create_recurring_schedule(unauthorized_sched, donor_user, db)
        assert False, "Unauthorized user must not be able to manage patient schedule"
    except HTTPException as e:
        assert e.status_code == 403
        assert "Not authorized" in e.detail
        print("[PASS] Test 3: Attendant Authorization Security Check (403 Forbidden) Passed")

    # 4. Record Completed Transfusion & Automatic Cycle Advancement
    trans_date = now - timedelta(days=1)
    trans_data = TransfusionRecordCreate(
        schedule_id=schedule.id,
        transfusion_date=trans_date,
        units_transfused=1,
        hospital_name="Manipal Hospital Whitefield",
        pre_transfusion_hb=7.8,
        post_transfusion_hb=10.4,
        notes="Transfusion tolerated well without febrile reaction."
    )
    trans_record = record_transfusion(trans_data, patient_user, db)
    assert trans_record.id is not None
    assert trans_record.pre_transfusion_hb == 7.8
    assert trans_record.post_transfusion_hb == 10.4

    # Verify schedule automatically advanced by 21 days from trans_date
    db.refresh(schedule)
    expected_new_due = trans_date + timedelta(days=21)
    assert abs((schedule.next_due_date.replace(tzinfo=timezone.utc) - expected_new_due).total_seconds()) < 60
    print("[PASS] Test 4: Transfusion Logged (Hb 7.8 -> 10.4 g/dL) & Cycle Advanced to Next 21 Days")

    # 5. Donor Support Circle Pledge
    pledge_data = DonorPledgeCreate(
        schedule_id=schedule.id,
        pledge_date=schedule.next_due_date
    )
    pledge = pledge_recurring_donation(pledge_data, donor_user, db)
    assert pledge.id is not None
    assert pledge.status == "pledged"
    assert pledge.donor_id == donor_user.id
    print("[PASS] Test 5: Voluntary Donor Circle Pledge Recorded for Upcoming Cycle")

    # 6. Privacy Protection Verification (DPDP Act Compliance)
    public_needs = get_public_recurring_needs(db)
    assert len(public_needs) >= 1
    sample_need = next(n for n in public_needs if n["schedule_id"] == schedule.id)

    # CRITICAL: Verify diagnosis is NOT in the public response
    assert "condition_type" not in sample_need
    assert "patient_name" not in sample_need
    assert sample_need["blood_group"] == "B+"
    assert sample_need["component"] == "prbc"
    assert "Manipal Hospital" in sample_need["hospital_name"]
    print("[PASS] Test 6: Medical Privacy Verified (Diagnoses Stripped for Public Community Donors)")

    db.close()
    print("=" * 70)
    print("FEATURE 2: ALL 6 RECURRING TRANSFUSION & PRIVACY TESTS PASSED!")
    print("=" * 70)

if __name__ == "__main__":
    test_feature2_recurring_transfusions()

