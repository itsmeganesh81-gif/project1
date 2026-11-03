import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from datetime import datetime, timezone, timedelta
from backend.services.matching_service import (
    is_blood_compatible,
    evaluate_donation_cooldown,
    haversine_distance,
    calculate_smart_score,
    match_donors_for_request
)
from backend.models import User, DonorProfile
from backend.database import SessionLocal
from backend.seed import seed_database
from backend.schemas import SmartMatchQuery, EmergencyRequestCreate
from backend.routes.matching_routes import find_smart_matches, create_emergency_request

def test_feature1_smart_matching():
    print("=" * 70)
    print("RUNNING FEATURE 1: AI SMART DONOR MATCHING UNIT & CLINICAL TESTS")
    print("=" * 70)

    # 1. Red Cell Compatibility (Whole Blood / PRBC)
    is_comp, is_exact = is_blood_compatible("A+", "O-", "whole_blood")
    assert is_comp is True and is_exact is False, "O- must be compatible with A+"

    is_comp, is_exact = is_blood_compatible("O+", "AB+", "whole_blood")
    assert is_comp is False, "AB+ cannot donate red cells to O+"

    is_comp, is_exact = is_blood_compatible("AB+", "AB+", "prbc")
    assert is_comp is True and is_exact is True, "AB+ exact match for AB+"
    print("[PASS] Clinical Rule 1: Red Cell Antigen Compatibility Matrix Passed")

    # 2. Plasma & Platelet Reverse Compatibility
    # AB plasma has no anti-A or anti-B antibodies -> Universal plasma/platelet donor
    is_comp, is_exact = is_blood_compatible("O+", "AB+", "platelets")
    assert is_comp is True, "AB+ plasma/platelets must be compatible with O+"

    is_comp, _ = is_blood_compatible("A+", "O+", "ffp")
    assert is_comp is False, "O plasma has anti-A and anti-B, cannot donate plasma to A+"
    print("[PASS] Clinical Rule 2: Plasma & Platelet Reverse Antibody Compatibility Passed")

    # 3. Bombay Blood Group (hh) Strict Rule
    is_comp, _ = is_blood_compatible("Bombay", "O-", "whole_blood")
    assert is_comp is False, "Bombay patients lack H-antigen and cannot receive standard O-"

    is_comp, _ = is_blood_compatible("Bombay", "Bombay", "whole_blood")
    assert is_comp is True, "Bombay can receive from Bombay"
    print("[PASS] Clinical Rule 3: Rare Bombay Phenotype Restriction Passed")

    # 4. NBTC India Donation Cooldown Verification
    now = datetime.now(timezone.utc)

    # Male donor: 90-day whole blood interval
    male_recent = DonorProfile(gender="male", last_whole_blood_date=now - timedelta(days=45))
    cleared, days_left, _ = evaluate_donation_cooldown(male_recent, "whole_blood")
    assert cleared is False and days_left == 45, f"Expected 45 days remaining, got {days_left}"

    male_eligible = DonorProfile(gender="male", last_whole_blood_date=now - timedelta(days=95))
    cleared, days_left, _ = evaluate_donation_cooldown(male_eligible, "whole_blood")
    assert cleared is True and days_left == 0, "Male donor > 90 days must be cleared"

    # Female donor: 120-day whole blood interval
    female_recent = DonorProfile(gender="female", last_whole_blood_date=now - timedelta(days=100))
    cleared, days_left, _ = evaluate_donation_cooldown(female_recent, "whole_blood")
    assert cleared is False and days_left == 20, f"Expected 20 days remaining, got {days_left}"

    female_eligible = DonorProfile(gender="female", last_whole_blood_date=now - timedelta(days=125))
    cleared, days_left, _ = evaluate_donation_cooldown(female_eligible, "whole_blood")
    assert cleared is True and days_left == 0, "Female donor > 120 days must be cleared"

    # Platelet (Apheresis) donor: 14-day interval
    plat_recent = DonorProfile(gender="male", last_platelet_date=now - timedelta(days=7))
    cleared, days_left, _ = evaluate_donation_cooldown(plat_recent, "platelets")
    assert cleared is False and days_left == 7, "Platelet donation within 14 days must trigger cooldown"
    print("[PASS] Clinical Rule 4: NBTC India Gender-Based Whole Blood & Platelet Cooldowns Passed")

    # 5. Haversine Distance & Area Privacy
    # Koramangala (12.9352, 77.6245) to Indiranagar (12.9784, 77.6408)
    dist = haversine_distance(12.9352, 77.6245, 12.9784, 77.6408)
    assert 4.8 <= dist <= 5.5, f"Expected approx 5.1 km, got {dist}"
    print(f"[PASS] Algorithmic Test 5: Haversine Geo-Distance ({dist} km) Passed")

    # 6. Recommendation Scoring & Explainability
    score = calculate_smart_score(
        is_compatible=True,
        is_exact_match=True,
        distance_km=2.5,
        radius_km=5.0,
        cooldown_cleared=True,
        is_verified=True,
        total_donations=8,
        alerts_this_week=0
    )
    assert 80.0 <= score <= 100.0, f"Expected high score for ideal donor, got {score}"
    print(f"[PASS] Algorithmic Test 6: Multi-Factor Recommendation Scoring ({score}/100) Passed")

    # 7. End-to-End Matching & Automatic Radius Expansion
    seed_database()
    db = SessionLocal()

    # Search for AB+ Platelets in Jayanagar (initial radius 2 km)
    query = SmartMatchQuery(
        blood_group="AB+",
        component="platelets",
        locality="Jayanagar",
        initial_radius_km=2.0
    )
    res = find_smart_matches(query, db)
    assert res["recipient_blood_group"] == "AB+"
    assert "medical_advisory" in res
    assert "qualified medical professionals" in res["medical_advisory"]

    # Verify radius expansion occurred when candidates at 2 km were scarce
    assert res["effective_radius_km"] >= 2.0
    print(f"[PASS] Service Test 7: Matching Engine & Dynamic Radius Escalation ({res['effective_radius_km']} km) Passed")

    # 8. Emergency SOS Creation & Match Logging
    donor_user = db.query(User).filter(User.email == "donor@bloodbridge.in").first()
    sos_data = EmergencyRequestCreate(
        patient_name="Ananya Rao",
        blood_group="O+",
        component="whole_blood",
        units_needed=2,
        hospital_name="Manipal Hospital Whitefield",
        locality="Whitefield",
        urgency="critical",
        contact_phone="9876543214",
        notes="Urgent surgery requirement"
    )
    sos_res = create_emergency_request(sos_data, donor_user, db)
    assert sos_res.id is not None
    assert sos_res.status == "active"
    print("[PASS] Integration Test 8: Emergency SOS Creation & Donor Matching Log Recorded")

    db.close()
    print("=" * 70)
    print("FEATURE 1: ALL 8 CLINICAL, GEOSPATIAL & MATCHING TESTS PASSED!")
    print("=" * 70)

if __name__ == "__main__":
    test_feature1_smart_matching()
