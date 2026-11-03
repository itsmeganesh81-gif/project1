from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.database import get_db
from backend.models import User, DonorProfile, Institution, ConsentLedger, DeletionRequest
from backend.schemas import UserRegister, UserLogin, Token, UserOut, ConsentUpdate, DeletionRequestCreate
from backend.auth import (
    hash_password, verify_password, mask_phone, create_access_token,
    get_current_user, log_audit, get_locality_coords
)

router = APIRouter(prefix="/auth", tags=["Authentication & Privacy"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(req_data: UserRegister, request: Request, db: Session = Depends(get_db)):
    # 1. DPDP Compliance: Mandatory explicit consent check
    if not req_data.consent_health or not req_data.consent_location:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Under India's Digital Personal Data Protection (DPDP) Act, explicit consent for health data and approximate location is required to use BloodBridge."
        )

    # 2. Check for duplicate email
    existing = db.query(User).filter(User.email == req_data.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists."
        )

    # 3. Privacy: Snap to locality centroid instead of exact home GPS
    lat, lng = get_locality_coords(req_data.locality)

    new_user = User(
        email=req_data.email.lower(),
        password_hash=hash_password(req_data.password),
        role=req_data.role,
        name=req_data.name,
        phone_masked=mask_phone(req_data.phone),
        phone_encrypted=req_data.phone,  # In production: AES-256 encrypted
        blood_group=req_data.blood_group,
        locality=req_data.locality,
        lat=lat,
        lng=lng,
        is_verified=False,
        is_available=True
    )
    db.add(new_user)
    db.flush()

    # 4. Record explicit consent in ConsentLedger
    ip = request.client.host if request.client else "127.0.0.1"
    for c_type in ["health_data", "approximate_location", "emergency_broadcast", "profile_discovery"]:
        db.add(ConsentLedger(
            user_id=new_user.id,
            consent_type=c_type,
            granted=True,
            consent_text_version="DPDP-2023-v1.0",
            ip_address=ip
        ))

    # 5. Create DonorProfile if donor or patient
    if req_data.role in ["donor", "patient", "volunteer"]:
        gender = req_data.donor_profile.gender if req_data.donor_profile else "prefer_not_to_say"
        weight = req_data.donor_profile.weight_kg if req_data.donor_profile else None
        bio = req_data.donor_profile.bio if req_data.donor_profile else ""
        db.add(DonorProfile(
            user_id=new_user.id,
            gender=gender,
            weight_kg=weight,
            bio=bio,
            points=20,
            level="Beginner"
        ))

    # 6. Create Institution if hospital_admin or blood_bank_admin
    if req_data.role in ["hospital_admin", "blood_bank_admin"] and req_data.institution:
        inst = req_data.institution
        db.add(Institution(
            user_id=new_user.id,
            org_type=inst.org_type,
            name=inst.name,
            license_number=inst.license_number,
            address=inst.address,
            locality=inst.locality,
            lat=lat,
            lng=lng,
            contact_phone=inst.contact_phone,
            emergency_helpline=inst.emergency_helpline,
            operating_hours=inst.operating_hours or "24/7",
            verification_status="pending"
        ))

    db.commit()
    db.refresh(new_user)

    log_audit(db, new_user.id, new_user.role, "register", "user", new_user.id, ip)

    token = create_access_token({"sub": new_user.id, "role": new_user.role, "email": new_user.email})
    return {"access_token": token, "token_type": "bearer", "user": new_user}


@router.post("/login", response_model=Token)
def login(login_data: UserLogin, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower()).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    ip = request.client.host if request.client else "127.0.0.1"
    log_audit(db, user.id, user.role, "login", "user", user.id, ip)

    token = create_access_token({"sub": user.id, "role": user.role, "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.get("/me", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/consent")
def update_consent(
    consent_data: ConsentUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ip = request.client.host if request.client else "127.0.0.1"
    ledger_entry = ConsentLedger(
        user_id=current_user.id,
        consent_type=consent_data.consent_type,
        granted=consent_data.granted,
        consent_text_version="DPDP-2023-v1.0",
        ip_address=ip
    )
    db.add(ledger_entry)
    
    # If donor revokes profile discovery or location consent, update is_available
    if consent_data.consent_type in ["profile_discovery", "approximate_location"] and not consent_data.granted:
        current_user.is_available = False

    db.commit()
    log_audit(db, current_user.id, current_user.role, f"consent_{'granted' if consent_data.granted else 'revoked'}", "consent", consent_data.consent_type, ip)

    return {"status": "success", "consent_type": consent_data.consent_type, "granted": consent_data.granted}


@router.post("/delete-account", status_code=status.HTTP_202_ACCEPTED)
def request_deletion(
    deletion_data: DeletionRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = DeletionRequest(
        user_id=current_user.id,
        reason=deletion_data.reason or "User requested account erasure under DPDP Act."
    )
    db.add(req)
    # De-identify active availability immediately
    current_user.is_available = False
    db.commit()

    log_audit(db, current_user.id, current_user.role, "request_account_deletion", "user", current_user.id)
    return {"status": "deletion_requested", "message": "Your request for data erasure has been logged and scheduled in compliance with India's DPDP Act."}
