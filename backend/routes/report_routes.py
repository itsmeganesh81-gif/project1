from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import User, FraudReport
from backend.schemas import FraudReportCreate, FraudReportOut
from backend.auth import get_current_user, log_audit

router = APIRouter(prefix="/reports", tags=["Community Trust & Fraud Reporting"])

@router.post("/fraud", response_model=FraudReportOut, status_code=status.HTTP_201_CREATED)
def submit_fraud_report(
    report_data: FraudReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = FraudReport(
        reporter_id=current_user.id,
        category=report_data.category,
        description=report_data.description,
        reported_user_id=report_data.reported_user_id,
        reported_request_id=report_data.reported_request_id,
        evidence_url=report_data.evidence_url,
        status="open"
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    log_audit(
        db, current_user.id, current_user.role,
        "submit_fraud_report", "fraud_report", report.id
    )

    return report

@router.get("/my-reports", response_model=List[FraudReportOut])
def get_my_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reports = db.query(FraudReport).filter(FraudReport.reporter_id == current_user.id).all()
    return reports
