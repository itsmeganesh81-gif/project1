import os
import sys
from datetime import datetime, timezone, timedelta

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.database import engine, Base, SessionLocal
from backend.models import (
    User, Institution, BloodInventoryBatch, HospitalBloodRequisition,
    InterFacilityTransfer, DonationCamp
)
from backend.schemas import (
    InventoryBatchCreate, InventoryBatchUpdate, HospitalRequisitionCreate,
    RequisitionStatusUpdate, InterFacilityTransferCreate, DonationCampCreate
)
from backend.routes.inventory_routes import (
    register_inventory_batch, get_inventory_batches, update_inventory_batch,
    get_inventory_summary, initiate_inter_facility_transfer, schedule_donation_camp
)
from backend.routes.hospital_routes import (
    create_hospital_requisition, get_hospital_requisitions,
    update_requisition_status, get_hospital_requisition_stats
)
from backend.seed import seed_database
from fastapi import HTTPException

def run_tests():
    print("=" * 70)
    print("RUNNING FEATURE 4: VERIFIED BLOOD BANK & HOSPITAL NETWORK TESTS")
    print("=" * 70)

    # 1. Initialize schema and seed data
    Base.metadata.create_all(bind=engine)
    seed_database()
    db = SessionLocal()

    # Retrieve test personas
    bb_admin = db.query(User).filter(User.email == "redcross@bloodbridge.in").first()
    hosp_admin = db.query(User).filter(User.email == "manipal@bloodbridge.in").first()
    donor = db.query(User).filter(User.email == "donor@bloodbridge.in").first()

    assert bb_admin is not None, "Red Cross blood bank admin must be seeded"
    assert hosp_admin is not None, "Manipal hospital admin must be seeded"
    assert donor is not None, "Donor must be seeded"

    now = datetime.now(timezone.utc)

    # -------------------------------------------------------------
    # TEST 1: Blood Bank registers a verified PRBC batch (All TTI Cleared)
    # -------------------------------------------------------------
    batch_payload = InventoryBatchCreate(
        blood_group="O+",
        component="prbc",
        units=5,
        volume_ml=350,
        collection_date=now,
        expiry_date=now + timedelta(days=35),
        storage_location="Refrigerated Unit A-1 (4°C)",
        storage_temp_celsius=4.0,
        tested_hiv=True,
        tested_hbv=True,
        tested_hcv=True,
        tested_syphilis=True,
        tested_malaria=True,
        technician_name="Senior Lab Technologist Ramesh"
    )

    batch_out = register_inventory_batch(batch_payload, current_user=bb_admin, db=db)
    assert batch_out.is_cleared is True, "Batch with all 5 TTI negative must be cleared"
    assert batch_out.status == "available", "Cleared batch must be available"
    assert batch_out.days_to_expiry >= 34, "Expiry calculation must reflect 35 days"
    print("[PASS] Test 1: Verified PRBC Batch Registered with Full TTI Clearance")

    # -------------------------------------------------------------
    # TEST 2: Transfusion-Transmitted Infection Safety Quarantine Guard
    # -------------------------------------------------------------
    quarantined_payload = InventoryBatchCreate(
        blood_group="B+",
        component="whole_blood",
        units=2,
        volume_ml=450,
        expiry_date=now + timedelta(days=28),
        tested_hiv=False,  # Fails HIV clearance
        tested_hbv=True,
        tested_hcv=True,
        tested_syphilis=True,
        tested_malaria=True,
        technician_name="Lab Technician Priya"
    )
    quar_batch = register_inventory_batch(quarantined_payload, current_user=bb_admin, db=db)
    assert quar_batch.is_cleared is False, "Batch failing HIV test must NOT be cleared"
    assert quar_batch.status == "quarantined", "Uncleared batch must be in quarantine"
    print("[PASS] Test 2: TTI Infection Safety Guard - Uncleared Unit Quarantined")

    # -------------------------------------------------------------
    # TEST 3: Hospital Submits Clinical Blood Requisition
    # -------------------------------------------------------------
    bb_inst = db.query(Institution).filter(Institution.user_id == bb_admin.id).first()
    hosp_inst = db.query(Institution).filter(Institution.user_id == hosp_admin.id).first()

    req_payload = HospitalRequisitionCreate(
        blood_bank_id=bb_inst.id,
        patient_identifier="TOKEN-BLR-CARD-049",
        blood_group="O+",
        component="prbc",
        units_requested=2,
        urgency="urgent",
        clinical_indication="Elective CABG cardiac bypass scheduled",
        treating_physician="Dr. Sunita Rao",
        required_by=now + timedelta(hours=12)
    )

    req_out = create_hospital_requisition(req_payload, current_user=hosp_admin, db=db)
    assert req_out.status == "submitted", "Initial requisition status must be submitted"
    assert req_out.cross_match_required is True, "Urgent routine requisition requires cross-match"
    assert req_out.cross_match_status == "pending", "Initial cross-match must be pending"
    print("[PASS] Test 3: Hospital Submitted Verified Requisition with DPDP Patient Token")

    # -------------------------------------------------------------
    # TEST 4: Massive Hemorrhage Protocol (MHP) Emergency Requisition
    # -------------------------------------------------------------
    mhp_payload = HospitalRequisitionCreate(
        blood_bank_id=bb_inst.id,
        patient_identifier="TOKEN-TRAUMA-ER-911",
        blood_group="O-",
        component="prbc",
        units_requested=4,
        urgency="emergency_mhp",
        clinical_indication="Severe polytrauma road accident with hemorrhagic shock",
        treating_physician="Dr. Sunita Rao",
        required_by=now + timedelta(minutes=15)
    )

    mhp_out = create_hospital_requisition(mhp_payload, current_user=hosp_admin, db=db)
    assert mhp_out.urgency == "emergency_mhp"
    assert mhp_out.cross_match_status == "emergency_uncrossmatched", "MHP must permit emergency uncrossmatched release"
    print("[PASS] Test 4: Massive Hemorrhage Protocol (MHP) Emergency Uncrossmatched Clearance")

    # -------------------------------------------------------------
    # TEST 5: Blood Bank Allocates & Dispatches Requisition
    # -------------------------------------------------------------
    status_update = RequisitionStatusUpdate(
        status="dispatched",
        units_allocated=2,
        cross_match_status="compatible"
    )
    updated_req = update_requisition_status(req_out.id, status_update, current_user=bb_admin, db=db)
    assert updated_req.status == "dispatched", "Requisition status must update to dispatched"
    assert updated_req.units_allocated == 2, "Units allocated must equal 2"
    assert updated_req.cross_match_status == "compatible", "Cross-match marked compatible"
    print("[PASS] Test 5: Blood Bank Requisition Fulfillment (Cross-Match Compatible -> Dispatched)")

    # -------------------------------------------------------------
    # TEST 6: Inter-Facility Cold Chain Transfer Coordination
    # -------------------------------------------------------------
    transfer_payload = InterFacilityTransferCreate(
        destination_institution_id=hosp_inst.id,
        requisition_id=req_out.id,
        batch_id=batch_out.id,
        blood_group="O+",
        component="prbc",
        units_transferred=2,
        cold_chain_carrier="Insulated Passive Cold Box with Calibrated Temperature Data Logger",
        temp_at_dispatch=3.8
    )

    transfer_out = initiate_inter_facility_transfer(transfer_payload, current_user=bb_admin, db=db)
    assert transfer_out.transfer_status == "dispatched"
    assert transfer_out.temp_at_dispatch == 3.8
    # Verify batch was deducted
    updated_batch = db.query(BloodInventoryBatch).filter(BloodInventoryBatch.id == batch_out.id).first()
    assert updated_batch.units == 3, f"Expected 3 units remaining in batch, got {updated_batch.units}"
    print("[PASS] Test 6: Inter-Facility Cold Chain Transfer Logged & Batch Units Deducted")

    # -------------------------------------------------------------
    # TEST 7: Donation Camp Organization
    # -------------------------------------------------------------
    camp_payload = DonationCampCreate(
        camp_name="Bengaluru IT Corridor Voluntary Mega Blood Drive",
        venue="Manyata Tech Park, Nagavara Outer Ring Road, Bengaluru",
        locality="Nagavara",
        start_date=now + timedelta(days=7),
        end_date=now + timedelta(days=7, hours=8),
        target_units=150,
        contact_person="Blood Centre Camp Coordinator Mr. David",
        contact_phone="+91 98450 11223"
    )

    camp_out = schedule_donation_camp(camp_payload, current_user=bb_admin, db=db)
    assert camp_out.status == "scheduled"
    assert camp_out.target_units == 150
    print("[PASS] Test 7: Voluntary Donation Camp Scheduled with Full Venue Details")

    # -------------------------------------------------------------
    # TEST 8: Real-Time Verified Inventory Summary & Shortage Alerts
    # -------------------------------------------------------------
    summary = get_inventory_summary(db=db, current_user=bb_admin)
    assert summary["total_available_units"] >= 3, "Available units must match active cleared batches"
    assert "shortage_alerts" in summary, "Summary must contain shortage alert triggers"
    assert summary["stock_matrix"]["O+"]["prbc"] >= 3
    print("[PASS] Test 8: Aggregated Real-Time Inventory Summary & Shortage Alerts Computed")

    db.close()
    print("=" * 70)
    print("FEATURE 4: ALL 8 VERIFIED INVENTORY & REQUISITION TESTS PASSED!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()

