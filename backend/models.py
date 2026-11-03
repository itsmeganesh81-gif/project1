import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, Integer, Float, Text, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from backend.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="donor")  # donor, patient, attendant, hospital_admin, blood_bank_admin, volunteer, admin
    name = Column(String(255), nullable=False)
    phone_masked = Column(String(20), nullable=True)  # e.g. +91 98*** **01
    phone_encrypted = Column(Text, nullable=True)
    blood_group = Column(String(5), nullable=True)  # A+, A-, B+, B-, AB+, AB-, O+, O-
    locality = Column(String(100), nullable=False, default="Bengaluru Central")
    lat = Column(Float, nullable=False, default=12.9716)
    lng = Column(Float, nullable=False, default=77.5946)
    is_verified = Column(Boolean, default=False)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    donor_profile = relationship("DonorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    consents = relationship("ConsentLedger", back_populates="user", cascade="all, delete-orphan")
    institution = relationship("Institution", back_populates="user", uselist=False, cascade="all, delete-orphan")
    fraud_reports_submitted = relationship("FraudReport", foreign_keys="FraudReport.reporter_id", back_populates="reporter")

    __table_args__ = (
        Index("idx_users_role_avail", "role", "is_available"),
        Index("idx_users_coords", "lat", "lng"),
    )


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    permissions = Column(Text, nullable=False, default="[]")  # JSON-encoded array of permission strings
    description = Column(String(255), nullable=True)


class ConsentLedger(Base):
    __tablename__ = "consent_ledger"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    consent_type = Column(String(50), nullable=False)  # health_data, approximate_location, emergency_broadcast, profile_discovery
    granted = Column(Boolean, nullable=False)
    consent_text_version = Column(String(20), default="1.0")
    ip_address = Column(String(45), nullable=True)
    timestamp = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="consents")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    actor_id = Column(String(36), nullable=True, index=True)
    actor_role = Column(String(50), nullable=True)
    action = Column(String(100), nullable=False, index=True)  # login, view_contact, verify_institution, update_inventory, delete_account, etc.
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(100), nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=utc_now, index=True)


class DeletionRequest(Base):
    __tablename__ = "deletion_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(String(30), default="pending")  # pending, processed
    requested_at = Column(DateTime, default=utc_now)
    completed_at = Column(DateTime, nullable=True)


class DonorProfile(Base):
    __tablename__ = "donor_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    gender = Column(String(20), nullable=False, default="prefer_not_to_say")  # male, female, other
    weight_kg = Column(Float, nullable=True)
    last_whole_blood_date = Column(DateTime, nullable=True)
    last_platelet_date = Column(DateTime, nullable=True)
    total_verified_donations = Column(Integer, default=0)
    points = Column(Integer, default=20)
    level = Column(String(30), default="Beginner")
    max_alerts_per_week = Column(Integer, default=3)
    alerts_received_this_week = Column(Integer, default=0)
    bio = Column(Text, nullable=True)

    user = relationship("User", back_populates="donor_profile")


class Institution(Base):
    __tablename__ = "institutions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    org_type = Column(String(30), nullable=False)  # hospital, blood_bank
    name = Column(String(255), nullable=False)
    license_number = Column(String(100), unique=True, nullable=False)
    nabh_accredited = Column(Boolean, default=False)
    address = Column(Text, nullable=False)
    locality = Column(String(100), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    contact_phone = Column(String(20), nullable=False)
    emergency_helpline = Column(String(20), nullable=True)
    operating_hours = Column(String(100), default="24/7")
    verification_status = Column(String(30), default="pending")  # pending, verified, rejected
    verified_by_admin_id = Column(String(36), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="institution")
    verification_records = relationship("VerificationRecord", back_populates="institution", cascade="all, delete-orphan")


class VerificationRecord(Base):
    __tablename__ = "verification_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    institution_id = Column(String(36), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False)
    document_type = Column(String(50), nullable=False)  # drug_license, nabh_cert, clinical_reg
    document_url = Column(String(500), nullable=False)
    uploaded_at = Column(DateTime, default=utc_now)
    reviewer_notes = Column(Text, nullable=True)
    status = Column(String(30), default="pending")  # pending, approved, rejected

    institution = relationship("Institution", back_populates="verification_records")


class FraudReport(Base):
    __tablename__ = "fraud_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    reporter_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reported_user_id = Column(String(36), nullable=True)
    reported_request_id = Column(String(100), nullable=True)
    category = Column(String(50), nullable=False)  # commercial_blood_sale, fake_request, fake_donor, harassment, other
    description = Column(Text, nullable=False)
    evidence_url = Column(String(500), nullable=True)
    status = Column(String(30), default="open")  # open, under_review, resolved, dismissed
    admin_notes = Column(Text, nullable=True)
    resolved_by_admin_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    resolved_at = Column(DateTime, nullable=True)

    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="fraud_reports_submitted")


class EmergencyRequest(Base):
    __tablename__ = "emergency_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    requester_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    patient_name = Column(String(255), nullable=False)
    blood_group = Column(String(5), nullable=False)
    component = Column(String(30), nullable=False, default="whole_blood")  # whole_blood, prbc, platelets, ffp, cryo
    units_needed = Column(Integer, default=1)
    hospital_name = Column(String(255), nullable=False)
    locality = Column(String(100), nullable=False, default="Bengaluru Central")
    lat = Column(Float, nullable=False, default=12.9716)
    lng = Column(Float, nullable=False, default=77.5946)
    urgency = Column(String(20), default="critical")  # critical, high, medium
    status = Column(String(30), default="active")  # active, fulfilled, cancelled, expired
    search_radius_km = Column(Float, default=5.0)
    medical_doc_url = Column(String(500), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    expires_at = Column(DateTime, nullable=True)

    requester = relationship("User", foreign_keys=[requester_id])
    matching_logs = relationship("DonorMatchingLog", back_populates="request", cascade="all, delete-orphan")


class DonorMatchingLog(Base):
    __tablename__ = "donor_matching_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    request_id = Column(String(36), ForeignKey("emergency_requests.id", ondelete="CASCADE"), nullable=False)
    donor_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    compatibility_score = Column(Float, nullable=False)  # 0.0 to 100.0
    distance_km = Column(Float, nullable=False)
    match_explanation = Column(Text, nullable=False)
    component_compatible = Column(Boolean, default=True)
    cooldown_cleared = Column(Boolean, default=True)
    alert_status = Column(String(30), default="dispatched")  # dispatched, viewed, accepted, declined, cooldown_active
    created_at = Column(DateTime, default=utc_now)

    request = relationship("EmergencyRequest", back_populates="matching_logs")
    donor = relationship("User", foreign_keys=[donor_id])


class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    attendant_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    patient_name = Column(String(255), nullable=False)
    condition_type = Column(String(50), nullable=False)  # thalassemia_major, sickle_cell, aplastic_anemia, oncology, other
    blood_group = Column(String(5), nullable=False)
    primary_hospital_id = Column(String(36), nullable=True)
    hospital_name = Column(String(255), nullable=False)
    treating_physician = Column(String(255), nullable=True)
    hospital_patient_id = Column(String(100), nullable=True)  # CR/MRN number
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", foreign_keys=[user_id])
    attendant = relationship("User", foreign_keys=[attendant_id])
    schedules = relationship("RecurringSchedule", back_populates="patient", cascade="all, delete-orphan")


class RecurringSchedule(Base):
    __tablename__ = "recurring_schedules"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    frequency_days = Column(Integer, nullable=False, default=21)  # 14, 21, 28
    component = Column(String(30), nullable=False, default="prbc")
    units_per_cycle = Column(Integer, default=1)
    last_transfusion_date = Column(DateTime, nullable=True)
    next_due_date = Column(DateTime, nullable=False)
    reminder_days_before = Column(Integer, default=3)
    hospital_name = Column(String(255), nullable=False)
    status = Column(String(20), default="active")  # active, paused, completed
    created_at = Column(DateTime, default=utc_now)

    patient = relationship("PatientProfile", back_populates="schedules")
    transfusions = relationship("TransfusionRecord", back_populates="schedule", cascade="all, delete-orphan")
    pledges = relationship("DonorCirclePledge", back_populates="schedule", cascade="all, delete-orphan")


class TransfusionRecord(Base):
    __tablename__ = "transfusion_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    schedule_id = Column(String(36), ForeignKey("recurring_schedules.id", ondelete="CASCADE"), nullable=False)
    transfusion_date = Column(DateTime, nullable=False)
    units_transfused = Column(Integer, default=1)
    hospital_name = Column(String(255), nullable=False)
    pre_transfusion_hb = Column(Float, nullable=True)   # g/dL
    post_transfusion_hb = Column(Float, nullable=True)  # g/dL
    verified_by_institution_id = Column(String(36), nullable=True)
    status = Column(String(30), default="completed")  # scheduled, completed, deferred
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    schedule = relationship("RecurringSchedule", back_populates="transfusions")


class DonorCirclePledge(Base):
    __tablename__ = "donor_circle_pledges"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    schedule_id = Column(String(36), ForeignKey("recurring_schedules.id", ondelete="CASCADE"), nullable=False)
    donor_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    pledge_date = Column(DateTime, nullable=False)
    status = Column(String(30), default="pledged")  # pledged, confirmed, completed, cancelled
    created_at = Column(DateTime, default=utc_now)

    schedule = relationship("RecurringSchedule", back_populates="pledges")
    donor = relationship("User", foreign_keys=[donor_id])


class RareBloodDonor(Base):
    __tablename__ = "rare_blood_donors"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    donor_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    phenotype = Column(String(50), nullable=False)  # bombay_hh, rh_null, duffy_negative, kell_negative, other_rare
    immunohematology_lab = Column(String(255), nullable=False)
    lab_report_number = Column(String(100), nullable=True)
    is_verified = Column(Boolean, default=False)
    verified_by_institution_id = Column(String(36), ForeignKey("institutions.id", ondelete="SET NULL"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    emergency_alert_consent = Column(Boolean, default=True)
    state_region = Column(String(100), default="Karnataka")
    created_at = Column(DateTime, default=utc_now)

    donor = relationship("User", foreign_keys=[donor_id])
    verified_by_institution = relationship("Institution", foreign_keys=[verified_by_institution_id])


class RareEmergencyRequest(Base):
    __tablename__ = "rare_emergency_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    hospital_id = Column(String(36), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False)
    patient_identifier = Column(String(100), nullable=False)  # Anonymous token
    phenotype_needed = Column(String(50), nullable=False)
    units_needed = Column(Integer, default=1)
    hospital_name = Column(String(255), nullable=False)
    locality = Column(String(100), nullable=False)
    urgency = Column(String(20), default="critical")
    status = Column(String(30), default="active")  # active, coordinating, fulfilled, cancelled
    treating_doctor = Column(String(255), nullable=True)
    clinical_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    hospital = relationship("Institution", foreign_keys=[hospital_id])
    responses = relationship("RareDonorResponse", back_populates="request", cascade="all, delete-orphan")


class RareDonorResponse(Base):
    __tablename__ = "rare_donor_responses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    request_id = Column(String(36), ForeignKey("rare_emergency_requests.id", ondelete="CASCADE"), nullable=False)
    donor_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    response_status = Column(String(30), default="alerted")  # alerted, accepted, declined, completed
    responded_at = Column(DateTime, default=utc_now)

    request = relationship("RareEmergencyRequest", back_populates="responses")
    donor = relationship("User", foreign_keys=[donor_id])


class BloodInventoryBatch(Base):
    __tablename__ = "blood_inventory_batches"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    institution_id = Column(String(36), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    batch_number = Column(String(50), nullable=False, index=True)
    blood_group = Column(String(5), nullable=False, index=True)  # A+, A-, B+, B-, AB+, AB-, O+, O-
    component = Column(String(30), nullable=False, default="prbc")  # whole_blood, prbc, platelets, ffp, cryoprecipitate
    units = Column(Integer, nullable=False, default=1)
    volume_ml = Column(Integer, nullable=False, default=350)
    collection_date = Column(DateTime, nullable=False, default=utc_now)
    expiry_date = Column(DateTime, nullable=False)
    storage_location = Column(String(100), default="Main Blood Bank Cold Room")
    storage_temp_celsius = Column(Float, default=4.0)

    # Mandatory TTI Screenings (Drugs & Cosmetics Rules, India / NBTC)
    tested_hiv = Column(Boolean, default=True)
    tested_hbv = Column(Boolean, default=True)
    tested_hcv = Column(Boolean, default=True)
    tested_syphilis = Column(Boolean, default=True)
    tested_malaria = Column(Boolean, default=True)
    is_cleared = Column(Boolean, default=True)
    technician_name = Column(String(100), nullable=True)

    status = Column(String(30), default="available")  # available, reserved, transfused, expired, quarantined, transferred
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    institution = relationship("Institution")


class HospitalBloodRequisition(Base):
    __tablename__ = "hospital_blood_requisitions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    hospital_id = Column(String(36), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    blood_bank_id = Column(String(36), ForeignKey("institutions.id", ondelete="SET NULL"), nullable=True, index=True)
    patient_identifier = Column(String(100), nullable=False)  # Masked Token / MRN (DPDP compliant)
    blood_group = Column(String(5), nullable=False)
    component = Column(String(30), nullable=False, default="prbc")
    units_requested = Column(Integer, nullable=False, default=1)
    units_allocated = Column(Integer, default=0)
    urgency = Column(String(30), default="routine")  # routine, urgent, emergency_mhp
    clinical_indication = Column(String(255), nullable=False)
    cross_match_required = Column(Boolean, default=True)
    cross_match_status = Column(String(30), default="pending")  # pending, compatible, incompatible, emergency_uncrossmatched
    status = Column(String(30), default="submitted")  # submitted, accepted, crossmatched, dispatched, fulfilled, cancelled
    treating_physician = Column(String(255), nullable=False)
    required_by = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    hospital = relationship("Institution", foreign_keys=[hospital_id])
    blood_bank = relationship("Institution", foreign_keys=[blood_bank_id])


class InterFacilityTransfer(Base):
    __tablename__ = "inter_facility_transfers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    source_institution_id = Column(String(36), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False)
    destination_institution_id = Column(String(36), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False)
    requisition_id = Column(String(36), ForeignKey("hospital_blood_requisitions.id", ondelete="SET NULL"), nullable=True)
    batch_id = Column(String(36), ForeignKey("blood_inventory_batches.id", ondelete="SET NULL"), nullable=True)
    blood_group = Column(String(5), nullable=False)
    component = Column(String(30), nullable=False)
    units_transferred = Column(Integer, nullable=False, default=1)
    cold_chain_carrier = Column(String(100), default="Validated Passive Cold Box (2-6°C)")
    temp_at_dispatch = Column(Float, default=4.0)
    temp_at_receipt = Column(Float, nullable=True)
    transfer_status = Column(String(30), default="dispatched")  # dispatched, in_transit, received, rejected_temp_breach
    dispatched_at = Column(DateTime, default=utc_now)
    received_at = Column(DateTime, nullable=True)

    source_institution = relationship("Institution", foreign_keys=[source_institution_id])
    destination_institution = relationship("Institution", foreign_keys=[destination_institution_id])


class DonationCamp(Base):
    __tablename__ = "donation_camps"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organizer_institution_id = Column(String(36), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False)
    camp_name = Column(String(255), nullable=False)
    venue = Column(Text, nullable=False)
    locality = Column(String(100), nullable=False)
    lat = Column(Float, nullable=False, default=12.9716)
    lng = Column(Float, nullable=False, default=77.5946)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    target_units = Column(Integer, default=100)
    units_collected = Column(Integer, default=0)
    status = Column(String(30), default="scheduled")  # scheduled, active, completed, cancelled
    contact_person = Column(String(100), nullable=False)
    contact_phone = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=utc_now)

    organizer = relationship("Institution", foreign_keys=[organizer_institution_id])


class VolunteerTask(Base):
    __tablename__ = "volunteer_tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    task_type = Column(String(50), nullable=False, default="blood_courier")  # sample_pickup, blood_courier, patient_escort, camp_support
    urgency = Column(String(20), nullable=False, default="high")  # emergency, high, routine
    pickup_location = Column(String(255), nullable=False)
    pickup_locality = Column(String(100), nullable=False, default="Bengaluru Central")
    dropoff_location = Column(String(255), nullable=False)
    dropoff_locality = Column(String(100), nullable=False, default="Whitefield")
    contact_person = Column(String(100), nullable=False)
    contact_phone = Column(String(20), nullable=False)
    notes = Column(Text, nullable=True)

    assigned_volunteer_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_by_institution_id = Column(String(36), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=True)
    status = Column(String(30), default="open")  # open, claimed, in_transit, completed, cancelled
    claimed_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    volunteer = relationship("User", foreign_keys=[assigned_volunteer_id])
    institution = relationship("Institution", foreign_keys=[created_by_institution_id])


class CustomerReview(Base):
    __tablename__ = "customer_reviews"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone_masked = Column(String(20), nullable=True)
    category = Column(String(50), nullable=False)  # emergency_delay, blood_bank_issue, commercial_middleman_complaint, donor_unavailability, technical_issue, general_feedback
    severity = Column(String(20), default="normal")  # critical_emergency, urgent, normal, feedback
    rating = Column(Integer, default=5)  # 1 to 5 stars
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    facility_name = Column(String(255), nullable=True)
    consent_public_display = Column(Boolean, default=False)
    status = Column(String(30), default="submitted")  # submitted, under_review, in_progress, resolved
    admin_notes = Column(Text, nullable=True)
    admin_response = Column(Text, nullable=True)
    resolved_by_admin_id = Column(String(36), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", foreign_keys=[user_id])
