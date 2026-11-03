from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional
from backend.database import get_db
from backend.models import User, Institution, FraudReport, AuditLog, VerificationRecord
from backend.schemas import InstitutionOut, InstitutionVerify, FraudReportOut, FraudReportResolve, AuditLogOut
from backend.auth import require_roles, log_audit

router = APIRouter(prefix="/admin", tags=["Admin Moderation & Verification"])

# Strictly enforce 'admin' server-side role
admin_guard = require_roles("admin")

@router.get("/stats")
def get_admin_stats(
    current_admin: User = Depends(admin_guard),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    verified_donors = db.query(User).filter(User.role == "donor", User.is_verified == True).count()
    total_institutions = db.query(Institution).count()
    verified_institutions = db.query(Institution).filter(Institution.verification_status == "verified").count()
    pending_institutions = db.query(Institution).filter(Institution.verification_status == "pending").count()
    open_fraud_reports = db.query(FraudReport).filter(FraudReport.status.in_(["open", "under_review"])).count()

    return {
        "total_users": total_users,
        "verified_donors": verified_donors,
        "total_institutions": total_institutions,
        "verified_institutions": verified_institutions,
        "pending_institutions": pending_institutions,
        "open_fraud_reports": open_fraud_reports,
    }

@router.get("/pending-institutions", response_model=List[InstitutionOut])
def get_pending_institutions(
    current_admin: User = Depends(admin_guard),
    db: Session = Depends(get_db)
):
    pending = db.query(Institution).filter(Institution.verification_status == "pending").all()
    return pending

@router.get("/institutions", response_model=List[InstitutionOut])
def get_all_institutions(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_admin: User = Depends(admin_guard),
    db: Session = Depends(get_db)
):
    query = db.query(Institution)
    if status_filter:
        query = query.filter(Institution.verification_status == status_filter)
    return query.order_by(Institution.created_at.desc()).all()

@router.post("/verify-institution/{institution_id}", response_model=InstitutionOut)
def verify_institution(
    institution_id: str,
    verify_data: InstitutionVerify,
    current_admin: User = Depends(admin_guard),
    db: Session = Depends(get_db)
):
    inst = db.query(Institution).filter(Institution.id == institution_id).first()
    if not inst:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found")

    if verify_data.action not in ["approve", "reject"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Action must be 'approve' or 'reject'")

    now = datetime.now(timezone.utc)
    if verify_data.action == "approve":
        inst.verification_status = "verified"
        inst.verified_by_admin_id = current_admin.id
        inst.verified_at = now
        inst.rejection_reason = None
        # Mark associated user account as verified
        inst.user.is_verified = True
    else:
        inst.verification_status = "rejected"
        inst.rejection_reason = verify_data.notes or "Medical credentials could not be verified."
        inst.user.is_verified = False

    db.commit()
    db.refresh(inst)

    log_audit(
        db, current_admin.id, "admin",
        f"institution_{verify_data.action}d",
        "institution",
        inst.id
    )

    return inst

@router.get("/fraud-reports", response_model=List[FraudReportOut])
def get_fraud_reports(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_admin: User = Depends(admin_guard),
    db: Session = Depends(get_db)
):
    query = db.query(FraudReport)
    if status_filter and status_filter != "all":
        query = query.filter(FraudReport.status == status_filter)
    return query.order_by(FraudReport.created_at.desc()).all()

@router.post("/resolve-fraud/{report_id}", response_model=FraudReportOut)
def resolve_fraud_report(
    report_id: str,
    resolve_data: FraudReportResolve,
    current_admin: User = Depends(admin_guard),
    db: Session = Depends(get_db)
):
    report = db.query(FraudReport).filter(FraudReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fraud report not found")

    report.status = resolve_data.action
    report.admin_notes = resolve_data.admin_notes
    report.resolved_by_admin_id = current_admin.id
    report.resolved_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(report)

    log_audit(
        db, current_admin.id, "admin",
        f"fraud_report_{resolve_data.action}",
        "fraud_report",
        report.id
    )

    return report

@router.get("/audit-logs", response_model=List[AuditLogOut])
def get_audit_logs(
    limit: int = 100,
    current_admin: User = Depends(admin_guard),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return logs
