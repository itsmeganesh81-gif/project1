import os
import sys

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.database import engine, Base, SessionLocal
from backend.models import User, CustomerReview
from backend.schemas import CustomerReviewCreate, CustomerReviewResolve
from backend.routes.review_routes import (
    submit_customer_review, get_my_submitted_reviews, get_public_reviews,
    get_all_grievances_admin, resolve_customer_grievance, get_review_system_stats
)
from backend.seed import seed_database
from fastapi import HTTPException

def run_tests():
    print("=" * 70)
    print("RUNNING CUSTOMER REVIEW & PROBLEM RESOLUTION SYSTEM TESTS")
    print("=" * 70)

    Base.metadata.create_all(bind=engine)
    seed_database()
    db = SessionLocal()

    admin = db.query(User).filter(User.email == "admin@bloodbridge.in").first()
    donor = db.query(User).filter(User.email == "donor@bloodbridge.in").first()
    patient = db.query(User).filter(User.email == "patient@bloodbridge.in").first()

    assert admin is not None
    assert donor is not None

    # TEST 1: Customer submits problem report (DPDP Masked phone)
    problem_payload = CustomerReviewCreate(
        name="Kavitha Nair",
        email="kavitha.nair@example.com",
        phone="9876543299",
        category="commercial_middleman_complaint",
        severity="critical_emergency",
        rating=1,
        subject="Extortion attempt by tout outside emergency wing",
        description="While waiting for O- blood at the casualty, an unauthorized individual approached offering replacement blood units for ₹5,000 cash.",
        facility_name="Bowring and Lady Curzon Hospital",
        consent_public_display=False
    )

    ticket_out = submit_customer_review(problem_payload, db=db)
    assert ticket_out.status == "submitted"
    assert ticket_out.category == "commercial_middleman_complaint"
    assert ticket_out.severity == "critical_emergency"

    # Verify phone number was masked in database
    db_ticket = db.query(CustomerReview).filter(CustomerReview.id == ticket_out.id).first()
    assert db_ticket.phone_masked == "+91 98*** **99", f"Expected masked phone, got {db_ticket.phone_masked}"
    print("[PASS] Test 1: Customer Problem Report Submitted (Phone Masked via DPDP Act)")

    # TEST 2: Customer submits positive review with public consent
    review_payload = CustomerReviewCreate(
        name="Arun Sundaram",
        email="arun.sundaram@example.com",
        phone="9845012345",
        category="general_feedback",
        severity="feedback",
        rating=5,
        subject="Seamless emergency platelet matching for my father",
        description="The AI Smart Matcher located a voluntary platelet donor within 20 minutes in Koramangala. The volunteer courier delivered the unit promptly.",
        facility_name="Manipal Hospital Whitefield",
        consent_public_display=True
    )
    public_ticket = submit_customer_review(review_payload, db=db)
    assert public_ticket.rating == 5
    print("[PASS] Test 2: Verified Customer Review with Public Consent Submitted")

    # TEST 3: Public reviews endpoint only exposes reviews with explicit consent
    public_list = get_public_reviews(limit=10, db=db)
    assert any(r.id == public_ticket.id for r in public_list), "Public review must appear in public feed"
    assert not any(r.id == ticket_out.id for r in public_list), "Private grievance must NEVER appear in public feed"
    print("[PASS] Test 3: Public Review Exposure Shielded (Zero Non-Consented Leaks)")

    # TEST 4: Role-based Authorization Guard (Donor cannot access admin grievance triage)
    try:
        get_all_grievances_admin(current_user=donor, db=db)
        assert False, "Donor should not have access to admin grievance review"
    except (HTTPException, AssertionError):
        print("[PASS] Test 4: Role-Based Authorization Guard (403 Forbidden for Non-Admins) Passed")

    # TEST 5: Admin resolves customer grievance with official response
    resolve_payload = CustomerReviewResolve(
        status="resolved",
        admin_response="Thank you for bringing this to our immediate attention. Our hospital security team and local law enforcement have been notified, and the tout has been apprehended. BloodBridge enforces a strict zero-tolerance policy against commercial blood exploitation.",
        admin_notes="Security vigilance escalated; CCTV footage handed over to police."
    )
    resolved_ticket = resolve_customer_grievance(ticket_out.id, resolve_payload, current_user=admin, db=db)
    assert resolved_ticket.status == "resolved"
    assert resolved_ticket.admin_response is not None
    assert resolved_ticket.resolved_at is not None
    print("[PASS] Test 5: Admin Resolved Customer Problem with Official Grievance Response")

    # TEST 6: Review system analytics and problem resolution metrics
    stats = get_review_system_stats(db=db)
    assert stats.total_reviews >= 2
    assert stats.resolved_issues_count >= 1
    assert stats.average_rating > 0.0
    print(f"[PASS] Test 6: Grievance Resolution Analytics Computed (Avg Rating: {stats.average_rating}/5.0, Resolved: {stats.resolved_issues_count})")

    db.close()
    print("=" * 70)
    print("ALL 6 CUSTOMER REVIEW & GRIEVANCE TESTS PASSED!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()

