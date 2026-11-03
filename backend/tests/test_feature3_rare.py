import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from datetime import datetime, timezone
from backend.database import SessionLocal
from backend.models import User, Institution, RareBloodDonor, RareEmergencyRequest, RareDonorResponse
from backend.schemas import RareDonorRegister, RareEmergencyRequestCreate
from backend.routes.rare_routes import (
    register_rare_donor, verify_rare_donor,
    create_rare_emergency_request, get_rare_emergency_requests,
    respond_to_rare_alert, get_rare_network_stats
)
from backend.seed import seed_database
from fastapi import HTTPException

def test_feature3_rare_blood_network():
    print("=" * 70)
    print("RUNNING FEATURE 3: RARE BLOOD GROUP NETWORK TESTS")
    print("=" * 70)

    seed_database()
    db = SessionLocal()

    donor_user = db.query(User).filter(User.email == "donor@bloodbridge.in").first()
    hosp_user = db.query(User).filter(User.email == "manipal@bloodbridge.in").first()
    admin_user = db.query(User).filter(User.email == "admin@bloodbridge.in").first()
    patient_user = db.query(User).filter(User.email == "patient@bloodbridge.in").first()

    # Clean up existing rare record for donor if any
    db.query(RareBloodDonor).filter(RareBloodDonor.donor_id == donor_user.id).delete()
    db.commit()

    # 1. Voluntary Rare Donor Registration (Bombay hh phenotype)
    reg_data = RareDonorRegister(
        phenotype="bombay_hh",
        immunohematology_lab="Rotary TTK Blood Centre Immunohematology Reference Lab",
        lab_report_number="TTK-REF-2024-BOMBAY-018",
        state_region="Karnataka",
        emergency_alert_consent=True
    )
    rare_donor = register_rare_donor(reg_data, donor_user, db)
    assert rare_donor.id is not None
    assert rare_donor.phenotype == "bombay_hh"
    assert rare_donor.is_verified is False
    print("[PASS] Test 1: Voluntary Rare Donor Opt-in (Bombay hh Phenotype) Registered")

    # 2. Institutional Lab Report Verification
    verified_record = verify_rare_donor(rare_donor.id, hosp_user, db)
    assert verified_record.is_verified is True
    assert verified_record.verified_at is not None
    print("[PASS] Test 2: Reference Laboratory Immunohematology Report Verified by Hospital")

    # 3. Verified Hospital Rare Emergency SOS Creation
    req_data = RareEmergencyRequestCreate(
        phenotype_needed="bombay_hh",
        units_needed=1,
        hospital_name="Manipal Hospital Whitefield",
        locality="Whitefield",
        treating_doctor="Dr. Sunita Rao (Hematology)",
        clinical_summary="Emergency bypass surgery: patient confirmed Bombay blood group (anti-H in serum)."
    )
    rare_req = create_rare_emergency_request(req_data, hosp_user, db)
    assert rare_req.id is not None
    assert rare_req.status == "active"
    assert "RARE-BOMB" in rare_req.patient_identifier

    # Check that matching Bombay donor was automatically alerted
    alert = db.query(RareDonorResponse).filter(
        RareDonorResponse.request_id == rare_req.id,
        RareDonorResponse.donor_id == donor_user.id
    ).first()
    assert alert is not None
    assert alert.response_status == "alerted"
    print("[PASS] Test 3: Rare Blood Emergency SOS Created & Verified Donors Alerted")

    # 4. Server-Side Role Guard Check
    # Regular patient/attendant cannot create institutional rare blood emergency requests
    try:
        create_rare_emergency_request(req_data, patient_user, db)
        assert False, "Unauthorized user must not be able to raise rare blood emergency requests"
    except HTTPException as e:
        assert e.status_code == 403
        assert "Access denied" in e.detail or "accredited institution" in e.detail
        print("[PASS] Test 4: Role-Based Authorization Guard (403 Forbidden) Passed")

    # 5. Rare Donor Response Tracking
    resp_result = respond_to_rare_alert(rare_req.id, "accepted", donor_user, db)
    assert resp_result["status"] == "success"
    assert resp_result["action"] == "accepted"

    db.refresh(alert)
    assert alert.response_status == "accepted"
    print("[PASS] Test 5: Donor Alert Response Lifecycle (Alerted -> Accepted) Recorded")

    # 6. Aggregated Public Statistics & Privacy Protection
    stats = get_rare_network_stats(db)
    assert stats["total_rare_donors"] >= 1
    assert stats["verified_rare_donors"] >= 1
    assert "bombay_hh" in stats["phenotype_breakdown"]
    print("[PASS] Test 6: Aggregated Rare Network Statistics & Privacy Shield Verified")

    db.close()
    print("=" * 70)
    print("FEATURE 3: ALL 6 RARE BLOOD NETWORK TESTS PASSED!")
    print("=" * 70)

if __name__ == "__main__":
    test_feature3_rare_blood_network()

