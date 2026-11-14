import os
import sys

# Ensure backend package can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database import SessionLocal, Base, engine
from backend.models import User, Institution, FraudReport, AuditLog, ConsentLedger, DeletionRequest
from backend.schemas import (
    UserRegister, UserLogin, ConsentUpdate, DeletionRequestCreate,
    InstitutionVerify, FraudReportCreate, FraudReportResolve
)
from backend.auth import (
    hash_password, verify_password, mask_phone,
    create_access_token, decode_access_token, require_roles
)
from backend.routes.auth_routes import register, login, update_consent, request_deletion
from backend.routes.admin_routes import (
    get_admin_stats, get_pending_institutions, verify_institution,
    get_fraud_reports, resolve_fraud_report, get_audit_logs
)
from backend.routes.report_routes import submit_fraud_report, get_my_reports
from backend.routes.institution_routes import get_verified_institutions
from backend.seed import seed_database
from fastapi import HTTPException

class DummyRequest:
    class DummyClient:
        host = "127.0.0.1"
    client = DummyClient()

def run_all_tests():
    print("=" * 70)
    print("RUNNING BLOODBRIDGE PHASE 0 & PHASE 1 COMPREHENSIVE TEST SUITE")
    print("=" * 70)

    # 1. Database Initialization & Seeding
    seed_database()
    db = SessionLocal()
    req = DummyRequest()

    passed = 0

    # Test 1: Crypto & Password Hashing
    pwd = "SecurePassword2026!"
    hashed = hash_password(pwd)
    assert hashed != pwd, "Hash must not equal plain text"
    assert verify_password(pwd, hashed) is True, "Password verification must succeed"
    assert verify_password("WrongPassword", hashed) is False, "Wrong password must fail"
    print("✓ Test 1: PBKDF2 Password Hashing & Salt Verification Passed")
    passed += 1

    # Test 2: Privacy Phone Masking (DPDP Compliance)
    masked = mask_phone("9876543210")
    assert masked == "+91 98*** **10", f"Unexpected mask: {masked}"
    assert "765432" not in masked, "Middle digits must be completely concealed"
    print("✓ Test 2: Phone Number Masking (DPDP Rule 6) Passed")
    passed += 1

    # Test 3: JWT Token Generation & Verification
    token = create_access_token({"sub": "user-123", "role": "donor", "email": "test@bb.in"})
    payload = decode_access_token(token)
    assert payload is not None, "Token decoding failed"
    assert payload["sub"] == "user-123"
    assert payload["role"] == "donor"
    # Tampered token check
    tampered_token = token[:-4] + "abcd"
    assert decode_access_token(tampered_token) is None, "Tampered token must be rejected"
    print("✓ Test 3: HS256 JWT Token & Tamper Rejection Passed")
    passed += 1

    # Test 4: DPDP Explicit Consent Requirement on Registration
    try:
        no_consent_data = UserRegister(
            email="noconsent@test.com", password="password123", role="donor",
            name="No Consent User", phone="9876543299", locality="Koramangala",
            consent_health=False,  # Lacking health consent
            consent_location=True
        )
        register(no_consent_data, req, db)
        assert False, "Registration without explicit health consent must fail"
    except HTTPException as e:
        assert e.status_code == 400
        assert "Digital Personal Data Protection" in e.detail
        print("✓ Test 4: Mandatory DPDP Health & Location Consent Enforcement Passed")
        passed += 1

    # Test 5: Successful User Registration & Area Centroid Fuzzing
    donor_email = "sunil_donor_2026@test.com"
    # Clean up if already exists
    existing_user = db.query(User).filter(User.email == donor_email).first()
    if existing_user:
        db.delete(existing_user)
        db.commit()

    reg_data = UserRegister(
        email=donor_email, password="password123", role="donor",
        name="Sunil Gowda", phone="9876543299", blood_group="B+", locality="Jayanagar",
        consent_health=True, consent_location=True
    )
    reg_result = register(reg_data, req, db)
    assert "access_token" in reg_result
    new_user = reg_result["user"]
    assert new_user.email == donor_email
    assert new_user.phone_masked == "+91 98*** **99"
    # Verify locality centroid mapping (Jayanagar: 12.9250, 77.5938) instead of exact GPS
    assert abs(new_user.lat - 12.9250) < 0.001
    assert abs(new_user.lng - 77.5938) < 0.001
    print("✓ Test 5: Donor Registration & Area Privacy Snapping Passed")
    passed += 1

    # Test 6: Duplicate Email Rejection
    try:
        register(reg_data, req, db)
        assert False, "Duplicate registration must be rejected"
    except HTTPException as e:
        assert e.status_code == 409
        print("✓ Test 6: Duplicate Registration HTTP 409 Rejection Passed")
        passed += 1

    # Test 7: Login Success & Invalid Credential Rejection
    login_success = login(UserLogin(email="donor@bloodbridge.in", password="donor123"), req, db)
    assert "access_token" in login_success
    assert login_success["user"].email == "donor@bloodbridge.in"

    try:
        login(UserLogin(email="donor@bloodbridge.in", password="WrongPassword99"), req, db)
        assert False, "Invalid password must fail"
    except HTTPException as e:
        assert e.status_code == 401
        print("✓ Test 7: Authentication & Unauthorized Rejection Passed")
        passed += 1

    # Test 8: Server-Side RBAC Enforcement (Operating Rule 5)
    donor_user = db.query(User).filter(User.email == "donor@bloodbridge.in").first()
    admin_user = db.query(User).filter(User.email == "admin@bloodbridge.in").first()
    hospital_user = db.query(User).filter(User.email == "manipal@bloodbridge.in").first()

    admin_checker = require_roles("admin")
    # Donor accessing admin resource MUST throw 403 Forbidden
    try:
        admin_checker(donor_user)
        assert False, "Donor must NOT pass admin role check"
    except HTTPException as e:
        assert e.status_code == 403
        assert "Access denied" in e.detail

    # Admin accessing admin resource MUST succeed
    assert admin_checker(admin_user) == admin_user
    print("✓ Test 8: Server-Side Role-Based Authorization Guard (403 Forbidden) Passed")
    passed += 1

    # Test 9: Admin Institution Verification Workflow
    pending_list = get_pending_institutions(admin_user, db)
    if len(pending_list) == 0:
        # Reset or provision an institution to pending for idempotent test repeatability
        inst = db.query(Institution).first()
        if inst:
            inst.verification_status = "pending"
            if inst.user:
                inst.user.is_verified = False
            db.commit()
            pending_list = get_pending_institutions(admin_user, db)

    assert len(pending_list) >= 1, "Expected at least 1 pending institution"
    target_inst = pending_list[0]

    # Verify / Approve institution
    verify_result = verify_institution(
        target_inst.id,
        InstitutionVerify(action="approve", notes="License confirmed with State Health Directorate"),
        admin_user,
        db
    )
    assert verify_result.verification_status == "verified"
    assert verify_result.user.is_verified is True

    # Confirm it now appears in public verified directory
    verified_directory = get_verified_institutions(None, db)
    verified_ids = [inst.id for inst in verified_directory]
    assert target_inst.id in verified_ids
    print("✓ Test 9: Institutional Credential Verification & Accreditation Passed")
    passed += 1

    # Test 10: Community Fraud Reporting & Moderation
    fraud_data = FraudReportCreate(
        category="commercial_blood_sale",
        description="Observed broker touting replacement donors for cash outside emergency.",
        reported_request_id="req-test-01"
    )
    report = submit_fraud_report(fraud_data, donor_user, db)
    assert report.status == "open"
    assert report.reporter_id == donor_user.id

    # Admin resolves report
    resolved = resolve_fraud_report(
        report.id,
        FraudReportResolve(action="resolved", admin_notes="Hospital security escorted broker out and reported."),
        admin_user,
        db
    )
    assert resolved.status == "resolved"
    assert resolved.resolved_by_admin_id == admin_user.id
    print("✓ Test 10: Community Fraud Reporting & Admin Moderation Passed")
    passed += 1

    # Test 11: Security & Compliance Audit Trail
    audit_logs = get_audit_logs(50, admin_user, db)
    assert len(audit_logs) >= 5, "Audit logs must record authentication and verification events"
    actions = [log.action for log in audit_logs]
    assert "login" in actions or "register" in actions
    print(f"✓ Test 11: Audit Trail Verification ({len(audit_logs)} audit records captured) Passed")
    passed += 1

    # Test 12: DPDP Consent Revocation & Account Deletion Request
    del_res = request_deletion(DeletionRequestCreate(reason="User exercising Right to be Forgotten"), donor_user, db)
    assert del_res["status"] == "deletion_requested"
    assert donor_user.is_available is False, "Donor availability must immediately be deactivated"
    print("✓ Test 12: DPDP Consent Revocation & Right to Erasure Passed")
    passed += 1

    db.close()

    print("=" * 70)
    print(f"SUMMARY: ALL {passed} TESTS PASSED SUCCESSFULLY! ZERO FAILURES.")
    print("=" * 70)

if __name__ == "__main__":
    run_all_tests()
