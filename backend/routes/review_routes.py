from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User, CustomerReview, AuditLog
from backend.schemas import (
    CustomerReviewCreate, CustomerReviewOut, CustomerReviewResolve, ReviewStatsOut
)
from backend.auth import get_current_user, require_roles, mask_phone

router = APIRouter(prefix="/api/reviews", tags=["Customer Reviews & Problem Resolution"])

def utc_now():
    return datetime.now(timezone.utc)

@router.post("", response_model=CustomerReviewOut)
def submit_customer_review(
    payload: CustomerReviewCreate,
    db: Session = Depends(get_db)
):
    """
    Submits a customer problem report, feedback, or review.
    Phone numbers are masked to adhere strictly to India's DPDP Act.
    """
    phone_m = mask_phone(payload.phone) if payload.phone else None

    # Check if an existing user matches the email to associate their account
    matched_user = db.query(User).filter(User.email == payload.email).first()
    user_id = matched_user.id if matched_user else None

    review = CustomerReview(
        user_id=user_id,
        name=payload.name,
        email=payload.email,
        phone_masked=phone_m,
        category=payload.category,
        severity=payload.severity,
        rating=payload.rating,
        subject=payload.subject,
        description=payload.description,
        facility_name=payload.facility_name,
        consent_public_display=payload.consent_public_display,
        status="submitted"
    )
    db.add(review)

    db.add(AuditLog(
        actor_id=user_id,
        actor_role="customer",
        action="submit_review_grievance",
        resource_type="customer_reviews",
        resource_id=review.id
    ))

    db.commit()
    db.refresh(review)
    return review


@router.get("/my", response_model=List[CustomerReviewOut])
def get_my_submitted_reviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns problem tickets and reviews submitted by the authenticated user,
    including medical coordinator responses and resolution statuses.
    """
    return db.query(CustomerReview).filter(
        (CustomerReview.user_id == current_user.id) |
        (CustomerReview.email == current_user.email)
    ).order_by(CustomerReview.created_at.desc()).all()


@router.get("/public", response_model=List[CustomerReviewOut])
def get_public_reviews(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Returns authentic public community reviews where users gave explicit DPDP consent.
    No simulated testimonials or fake reviews.
    """
    return db.query(CustomerReview).filter(
        CustomerReview.consent_public_display == True
    ).order_by(CustomerReview.created_at.desc()).limit(limit).all()


@router.get("/admin/all", response_model=List[CustomerReviewOut])
def get_all_grievances_admin(
    status: Optional[str] = None,
    category: Optional[str] = None,
    current_user: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db)
):
    """
    Administrator dashboard view to monitor, filter, and triage customer problems.
    """
    query = db.query(CustomerReview)
    if status:
        query = query.filter(CustomerReview.status == status)
    if category:
        query = query.filter(CustomerReview.category == category)
    return query.order_by(CustomerReview.created_at.desc()).all()


@router.patch("/admin/{review_id}/resolve", response_model=CustomerReviewOut)
def resolve_customer_grievance(
    review_id: str,
    payload: CustomerReviewResolve,
    current_user: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db)
):
    """
    Allows BloodBridge administrators and medical coordination officers
    to respond directly to customer problems and mark them resolved.
    """
    review = db.query(CustomerReview).filter(CustomerReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Grievance ticket not found.")

    review.status = payload.status
    review.admin_response = payload.admin_response
    review.admin_notes = payload.admin_notes
    review.resolved_by_admin_id = current_user.id
    if payload.status == "resolved":
        review.resolved_at = utc_now()

    db.add(AuditLog(
        actor_id=current_user.id,
        actor_role=current_user.role,
        action=f"resolve_grievance_{payload.status}",
        resource_type="customer_reviews",
        resource_id=review.id
    ))

    db.commit()
    db.refresh(review)
    return review


@router.get("/stats", response_model=ReviewStatsOut)
def get_review_system_stats(db: Session = Depends(get_db)):
    """
    Aggregates verified customer feedback scores and grievance resolution rates.
    """
    reviews = db.query(CustomerReview).all()
    total = len(reviews)
    resolved = sum(1 for r in reviews if r.status == "resolved")
    active = sum(1 for r in reviews if r.status in ["submitted", "under_review", "in_progress"])

    avg_rating = round(sum(r.rating for r in reviews) / total, 1) if total > 0 else 5.0

    breakdown = {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}
    for r in reviews:
        k = str(r.rating)
        if k in breakdown:
            breakdown[k] += 1

    return ReviewStatsOut(
        total_reviews=total,
        average_rating=avg_rating,
        resolved_issues_count=resolved,
        active_grievances_count=active,
        rating_breakdown=breakdown
    )

