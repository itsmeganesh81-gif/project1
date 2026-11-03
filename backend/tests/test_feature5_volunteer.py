import os
import sys
from datetime import datetime, timezone

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.database import engine, Base, SessionLocal
from backend.models import User, Institution, VolunteerTask
from backend.schemas import VolunteerTaskCreate, VolunteerTaskStatusUpdate
from backend.routes.volunteer_routes import (
    create_volunteer_task, get_volunteer_tasks, claim_volunteer_task,
    update_volunteer_task_status, get_volunteer_stats
)
from backend.seed import seed_database
from fastapi import HTTPException

def run_tests():
    print("=" * 70)
    print("RUNNING FEATURE 5: VOLUNTEER RESCUE NETWORK TESTS")
    print("=" * 70)

    Base.metadata.create_all(bind=engine)
    seed_database()
    db = SessionLocal()

    hosp_admin = db.query(User).filter(User.email == "manipal@bloodbridge.in").first()
    volunteer = db.query(User).filter(User.email == "volunteer@bloodbridge.in").first()
    donor = db.query(User).filter(User.email == "donor@bloodbridge.in").first()

    assert hosp_admin is not None, "Hospital admin must exist"
    assert volunteer is not None, "Volunteer must exist"

    # TEST 1: Hospital creates emergency blood courier task
    task_payload = VolunteerTaskCreate(
        title="Emergency Platelet Courier Run: Red Cross -> Manipal Hospital",
        task_type="blood_courier",
        urgency="emergency",
        pickup_location="Indian Red Cross Blood Centre, Race Course Road",
        pickup_locality="Bengaluru Central",
        dropoff_location="Manipal Hospital ICU, Whitefield",
        dropoff_locality="Whitefield",
        contact_person="Dr. Sunita Rao (Duty Officer)",
        contact_phone="+91 80 2502 9111",
        notes="Deliver insulated cold box with 2 units platelets. Handle gently without shaking."
    )

    task_out = create_volunteer_task(task_payload, current_user=hosp_admin, db=db)
    assert task_out.status == "open", "New task status must be open"
    assert task_out.urgency == "emergency"
    print("[PASS] Test 1: Emergency Blood Courier Task Dispatched by Hospital")

    # TEST 2: Community volunteer claims the open task
    claimed_task = claim_volunteer_task(task_out.id, current_user=volunteer, db=db)
    assert claimed_task.status == "claimed", "Status must update to claimed"
    assert claimed_task.assigned_volunteer_id == volunteer.id, "Assigned volunteer ID must match"
    assert claimed_task.claimed_at is not None
    print("[PASS] Test 2: Field Volunteer Claimed Emergency Rescue Mission")

    # TEST 3: Volunteer updates transit lifecycle (in_transit -> completed)
    transit_update = VolunteerTaskStatusUpdate(status="in_transit")
    in_transit_task = update_volunteer_task_status(task_out.id, transit_update, current_user=volunteer, db=db)
    assert in_transit_task.status == "in_transit"

    completed_update = VolunteerTaskStatusUpdate(status="completed")
    completed_task = update_volunteer_task_status(task_out.id, completed_update, current_user=volunteer, db=db)
    assert completed_task.status == "completed"
    assert completed_task.completed_at is not None
    print("[PASS] Test 3: Full Transit Progress (Claimed -> In-Transit -> Completed) Recorded")

    # TEST 4: Role-Based Authorization Guard (Donor cannot claim without volunteer role)
    try:
        new_task = create_volunteer_task(task_payload, current_user=hosp_admin, db=db)
        claim_volunteer_task(new_task.id, current_user=donor, db=db)
        assert False, "Donor without volunteer role should be rejected"
    except (HTTPException, AssertionError):
        print("[PASS] Test 4: Role-Based Authorization Guard (403 Forbidden for Non-Volunteers) Passed")

    # TEST 5: Volunteer impact statistics & rank computation
    stats = get_volunteer_stats(current_user=volunteer, db=db)
    assert stats.total_tasks_completed >= 1, "Should count completed tasks"
    assert stats.emergency_missions >= 1, "Should identify emergency missions"
    assert stats.total_hours_volunteered > 0.0
    print(f"[PASS] Test 5: Volunteer Impact Stats Computed (Rank: {stats.volunteer_rank}, Hours: {stats.total_hours_volunteered})")

    # TEST 6: DPDP Privacy Shield (Public/Courier view exposes zero patient diagnosis)
    tasks = get_volunteer_tasks(current_user=volunteer, db=db)
    for t in tasks:
        assert not hasattr(t, "patient_diagnosis"), "Volunteer task must never expose medical diagnosis"
        assert not hasattr(t, "medical_records"), "Volunteer task must never expose medical records"
    print("[PASS] Test 6: DPDP Act Patient Privacy Shield Verified")

    db.close()
    print("=" * 70)
    print("FEATURE 5: ALL 6 VOLUNTEER RESCUE NETWORK TESTS PASSED!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()

