import os
import sys
from datetime import datetime, timezone, timedelta

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.database import engine, Base, SessionLocal
from backend.models import User, Institution, BloodInventoryBatch
from backend.schemas import SurplusClaimCreate, InventoryBatchCreate
from backend.routes.inventory_routes import register_inventory_batch
from backend.routes.expiry_routes import (
    get_surplus_exchange_board, claim_near_expiry_surplus, get_wastage_prevention_stats
)
from backend.seed import seed_database
from fastapi import HTTPException

def run_tests():
    print("=" * 70)
    print("RUNNING FEATURE 7: NEAR-EXPIRY ALERTS & SURPLUS BOARD TESTS")
    print("=" * 70)

    Base.metadata.create_all(bind=engine)
    seed_database()
    db = SessionLocal()

    bb_admin = db.query(User).filter(User.email == "redcross@bloodbridge.in").first()
    hosp_admin = db.query(User).filter(User.email == "manipal@bloodbridge.in").first()
    donor = db.query(User).filter(User.email == "donor@bloodbridge.in").first()

    now = datetime.now(timezone.utc)

    # TEST 1: Register a platelet batch with 36 hours remaining (near-expiry threshold <= 48h)
    near_exp_batch = register_inventory_batch(
        InventoryBatchCreate(
            blood_group="AB+",
            component="platelets",
            units=2,
            volume_ml=70,
            expiry_date=now + timedelta(hours=36),
            storage_location="Platelet Agitator Chamber 1",
            storage_temp_celsius=22.0,
            tested_hiv=True,
            tested_hbv=True,
            tested_hcv=True,
            tested_syphilis=True,
            tested_malaria=True,
            technician_name="Quality Control Officer"
        ),
        current_user=bb_admin,
        db=db
    )
    assert near_exp_batch.is_cleared is True
    print("[PASS] Test 1: Near-Expiry Platelet Batch (36h shelf-life) Registered")

    # TEST 2: Surplus Exchange Board detects and lists the near-expiry batch
    board = get_surplus_exchange_board(db=db, current_user=hosp_admin)
    platelet_entry = next((e for e in board if e.id == near_exp_batch.id), None)
    assert platelet_entry is not None, "Surplus board must list the near-expiry platelet unit"
    assert platelet_entry.hours_to_expiry <= 36
    assert platelet_entry.status == "available_for_transfer"
    print(f"[PASS] Test 2: Surplus Board Detected Batch ({platelet_entry.hours_to_expiry} hours left)")

    # TEST 3: Hospital claims near-expiry batch to prevent discard
    claim_payload = SurplusClaimCreate(
        batch_id=near_exp_batch.id,
        units_claimed=1,
        urgency="immediate_transfusion",
        notes="Transfusion for ICU thrombocytopenia patient"
    )
    claim_out = claim_near_expiry_surplus(claim_payload, current_user=hosp_admin, db=db)
    assert claim_out.status == "claimed_and_dispatched"
    assert claim_out.cold_chain_dispatch_ready is True
    print("[PASS] Test 3: Hospital Claimed 1 Unit for Immediate Transfusion (Discard Prevented)")

    # TEST 4: Batch remaining balance updated in DB
    updated_batch = db.query(BloodInventoryBatch).filter(BloodInventoryBatch.id == near_exp_batch.id).first()
    assert updated_batch.units == 1, "Remaining units should be 1"
    print("[PASS] Test 4: Inventory Batch Balance Updated Accurately")

    # TEST 5: Wastage prevention statistics computed
    stats = get_wastage_prevention_stats(db=db)
    assert stats["units_rescued_from_expiry"] >= 1
    assert stats["prevented_wastage_percentage"] >= 90.0
    print(f"[PASS] Test 5: Wastage Prevention Metrics Computed (Rescued: {stats['units_rescued_from_expiry']} units)")

    db.close()
    print("=" * 70)
    print("FEATURE 7: ALL 5 NEAR-EXPIRY SURPLUS TESTS PASSED!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()

