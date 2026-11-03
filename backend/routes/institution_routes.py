from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db
from backend.models import User, Institution
from backend.schemas import InstitutionOut
from backend.auth import get_current_user, require_roles

router = APIRouter(prefix="/institutions", tags=["Hospitals & Blood Banks"])

@router.get("/verified", response_model=List[InstitutionOut])
def get_verified_institutions(
    org_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Institution).filter(Institution.verification_status == "verified")
    if org_type:
        query = query.filter(Institution.org_type == org_type)
    return query.all()

@router.get("/me", response_model=InstitutionOut)
def get_my_institution(
    current_user: User = Depends(require_roles("hospital_admin", "blood_bank_admin")),
    db: Session = Depends(get_db)
):
    inst = db.query(Institution).filter(Institution.user_id == current_user.id).first()
    if not inst:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Institutional record not found for this account")
    return inst
