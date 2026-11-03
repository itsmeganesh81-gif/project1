import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.main import app
from backend.database import SessionLocal, Base, engine
from backend.models import User, Institution, FraudReport, AuditLog
from backend.seed import seed_database

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["dpdp_compliance"] == "enabled"

def test_dpdp_consent_required_on_register():
    # Attempting to register without explicit DPDP health consent must fail
    payload = {
        "email": "test_noconsent@test.com",
        "password": "password123",
        "role": "donor",
        "name": "Consent Test",
        "phone": "9876543219",
        "blood_group": "A+",
        "locality": "Koramangala",
        "consent_health": False,  # Missing consent
        "consent_location": True
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "Digital Personal Data Protection" in response.json()["detail"]

def test_successful_user_registration_and_phone_masking():
    payload = {
        "email": "new_donor@test.com",
        "password": "password123",
        "role": "donor",
        "name": "New Voluntary Donor",
        "phone": "9812345678",
        "blood_group": "O-",
        "locality": "Indiranagar",
        "consent_health": True,
        "consent_location": True,
        "donor_profile": {
            "gender": "male",
            "weight_kg": 68.5,
            "bio": "New registered donor"
        }
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    user = data["user"]
    assert user["email"] == "new_donor@test.com"
    # Verify phone number masking protects privacy (DPDP Rule 6)
    assert user["phone_masked"] == "+91 98*** **78"
    assert "9812345678" not in user["phone_masked"]

def test_duplicate_registration_rejected():
    payload = {
        "email": "new_donor@test.com",
        "password": "password123",
        "role": "donor",
        "name": "Duplicate Donor",
        "phone": "9812345678",
        "locality": "Indiranagar",
        "consent_health": True,
        "consent_location": True
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]

def test_login_success_and_failure():
    # Correct login
    res = client.post("/api/auth/login", json={"email": "donor@bloodbridge.in", "password": "donor123"})
    assert res.status_code == 200
    token = res.json()["access_token"]
    assert len(token) > 20

    # Wrong password
    res_wrong = client.post("/api/auth/login", json={"email": "donor@bloodbridge.in", "password": "wrongpassword"})
    assert res_wrong.status_code == 401

def test_server_side_rbac_denies_unauthorized_roles():
    # 1. Login as regular donor
    res = client.post("/api/auth/login", json={"email": "donor@bloodbridge.in", "password": "donor123"})
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Donor attempts to access Admin endpoint -> MUST return 403 Forbidden (Operating Rule 5)
    res_admin = client.get("/api/admin/pending-institutions", headers=headers)
    assert res_admin.status_code == 403
    assert "Access denied" in res_admin.json()["detail"]

def test_admin_institutional_verification_workflow():
    # 1. Login as Admin
    res_admin_login = client.post("/api/auth/login", json={"email": "admin@bloodbridge.in", "password": "admin123"})
    admin_token = res_admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Get pending institutions (Apollo Hospital Bannerghatta was seeded as pending)
    res_pending = client.get("/api/admin/pending-institutions", headers=admin_headers)
    assert res_pending.status_code == 200
    pending_list = res_pending.json()
    assert len(pending_list) >= 1
    apollo_inst = next((i for i in pending_list if "Apollo" in i["name"]), None)
    assert apollo_inst is not None

    # 3. Approve the institution
    verify_res = client.post(
        f"/api/admin/verify-institution/{apollo_inst['id']}",
        json={"action": "approve", "notes": "Clinical Establishment license KA-BLR-HOSP-2023-882 verified with Karnataka Health Directorate."},
        headers=admin_headers
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["verification_status"] == "verified"

    # 4. Confirm it is now in public verified directory
    pub_res = client.get("/api/institutions/verified")
    assert pub_res.status_code == 200
    verified_names = [i["name"] for i in pub_res.json()]
    assert "Apollo Hospital Bannerghatta" in verified_names

def test_fraud_reporting_and_admin_moderation():
    # 1. Donor submits a fraud report
    donor_login = client.post("/api/auth/login", json={"email": "donor@bloodbridge.in", "password": "donor123"})
    donor_headers = {"Authorization": f"Bearer {donor_login.json()['access_token']}"}

    fraud_payload = {
        "category": "commercial_blood_sale",
        "description": "Suspicious agent demanded cash upfront for Arrange Replacement Donor pledge.",
        "reported_request_id": "req-fake-99"
    }
    report_res = client.post("/api/reports/fraud", json=fraud_payload, headers=donor_headers)
    assert report_res.status_code == 201
    report_id = report_res.json()["id"]

    # 2. Admin inspects and resolves the fraud report
    admin_login = client.post("/api/auth/login", json={"email": "admin@bloodbridge.in", "password": "admin123"})
    admin_headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}

    resolve_res = client.post(
        f"/api/admin/resolve-fraud/{report_id}",
        json={"action": "resolved", "admin_notes": "Middleman phone number blacklisted and reported to authorities."},
        headers=admin_headers
    )
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "resolved"

def test_dpdp_account_deletion_request():
    donor_login = client.post("/api/auth/login", json={"email": "new_donor@test.com", "password": "password123"})
    donor_headers = {"Authorization": f"Bearer {donor_login.json()['access_token']}"}

    del_res = client.post("/api/auth/delete-account", json={"reason": "Revoking consent for personal records"}, headers=donor_headers)
    assert del_res.status_code == 202
    assert "data erasure has been logged" in del_res.json()["message"]
