from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime

EMAIL_REGEX = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

# --- BASE & AUTH SCHEMAS ---
class ConsentItem(BaseModel):
    consent_type: str
    granted: bool

class DonorProfileCreate(BaseModel):
    gender: Optional[str] = "prefer_not_to_say"
    weight_kg: Optional[float] = None
    bio: Optional[str] = None

class InstitutionDetails(BaseModel):
    org_type: str  # hospital, blood_bank
    name: str
    license_number: str
    address: str
    locality: str
    contact_phone: str
    emergency_helpline: Optional[str] = None
    operating_hours: Optional[str] = "24/7"
    document_url: Optional[str] = None

class UserRegister(BaseModel):
    email: str = Field(..., pattern=EMAIL_REGEX)
    password: str = Field(..., min_length=6)
    role: str = "donor"  # donor, patient, attendant, hospital_admin, blood_bank_admin, volunteer
    name: str
    phone: str = Field(..., min_length=10)
    blood_group: Optional[str] = None
    locality: str = "Bengaluru Central"
    consent_health: bool = Field(..., description="Explicit DPDP consent for health data")
    consent_location: bool = Field(..., description="Explicit DPDP consent for location processing")
    donor_profile: Optional[DonorProfileCreate] = None
    institution: Optional[InstitutionDetails] = None

class UserLogin(BaseModel):
    email: str = Field(..., pattern=EMAIL_REGEX)
    password: str

class DonorProfileOut(BaseModel):
    gender: Optional[str] = None
    weight_kg: Optional[float] = None
    total_verified_donations: int = 0
    points: int = 0
    level: str = "Beginner"
    max_alerts_per_week: int = 3
    bio: Optional[str] = None

    class Config:
        from_attributes = True

class InstitutionOut(BaseModel):
    id: str
    org_type: str
    name: str
    license_number: str
    nabh_accredited: bool
    address: str
    locality: str
    contact_phone: str
    emergency_helpline: Optional[str]
    operating_hours: str
    verification_status: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserOut(BaseModel):
    id: str
    email: str
    role: str
    name: str
    phone_masked: Optional[str]
    blood_group: Optional[str]
    locality: str
    lat: float
    lng: float
    is_verified: bool
    is_available: bool
    created_at: datetime
    donor_profile: Optional[DonorProfileOut] = None
    institution: Optional[InstitutionOut] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class ConsentUpdate(BaseModel):
    consent_type: str  # health_data, approximate_location, emergency_broadcast, profile_discovery
    granted: bool

class DeletionRequestCreate(BaseModel):
    reason: Optional[str] = "User requested complete erasure under DPDP Section 12"

class DeletionRequestOut(BaseModel):
    id: str
    user_id: str
    status: str
    requested_at: datetime

    class Config:
        from_attributes = True

class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    locality: Optional[str] = None
    blood_group: Optional[str] = None
    is_available: Optional[bool] = None
    weight_kg: Optional[float] = None
    bio: Optional[str] = None

# --- FRAUD & ADMIN SCHEMAS ---
class FraudReportCreate(BaseModel):
    category: str  # commercial_blood_sale, fake_request, fake_donor, harassment, other
    description: str = Field(..., min_length=10)
    reported_user_id: Optional[str] = None
    reported_request_id: Optional[str] = None
    evidence_url: Optional[str] = None

class FraudReportOut(BaseModel):
    id: str
    reporter_id: Optional[str]
    category: str
    description: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class FraudReportResolve(BaseModel):
    action: str = "resolved"  # resolved, dismissed
    status: Optional[str] = None
    admin_notes: Optional[str] = None

class InstitutionVerify(BaseModel):
    action: str  # approve, reject
    notes: Optional[str] = None

InstitutionVerifyAction = InstitutionVerify

class AuditLogOut(BaseModel):
    id: int
    actor_id: Optional[str] = None
    actor_role: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class AdminStatsOut(BaseModel):
    total_users: int
    donors_count: int
    verified_donors_count: int
    institutions_count: int
    pending_verifications_count: int
    open_fraud_reports_count: int
    active_emergency_requests: int
    dpdp_deletion_requests_pending: int

# --- FEATURE 1: EMERGENCY REQUEST & MATCHING SCHEMAS ---
class SmartMatchQuery(BaseModel):
    blood_group: str
    component: str = "whole_blood"
    locality: str = "Bengaluru Central"
    lat: Optional[float] = None
    lng: Optional[float] = None
    initial_radius_km: Optional[float] = 5.0

class DonorMatchRecommendation(BaseModel):
    donor_id: str
    name: str
    blood_group: str
    locality: str
    lat: float
    lng: float
    distance_km: float
    score: float
    is_exact_match: bool
    cooldown_cleared: bool
    cooldown_days_remaining: int
    cooldown_note: str
    is_verified: bool
    total_donations: int
    phone_masked: str
    match_explanation: str

class SmartMatchResponse(BaseModel):
    recipient_blood_group: str
    component: str
    initial_radius_km: float
    effective_radius_km: float
    radius_expanded: bool
    expansion_reason: str
    total_matched: int
    matches: List[DonorMatchRecommendation]
    medical_advisory: str

class EmergencyRequestCreate(BaseModel):
    patient_name: str
    blood_group: str
    component: str = "whole_blood"  # whole_blood, prbc, platelets, ffp, cryo
    units_needed: int = 1
    hospital_name: str
    locality: str = "Bengaluru Central"
    urgency: str = "critical"  # critical, high, medium
    search_radius_km: Optional[float] = 5.0
    medical_doc_url: Optional[str] = None
    contact_phone: Optional[str] = None
    notes: Optional[str] = None

class DonorMatchLogOut(BaseModel):
    id: str
    donor_id: str
    compatibility_score: float
    distance_km: float
    match_explanation: str
    component_compatible: bool
    cooldown_cleared: bool
    alert_status: str

    class Config:
        from_attributes = True

class EmergencyRequestOut(BaseModel):
    id: str
    requester_id: str
    patient_name: str
    blood_group: str
    component: str
    units_needed: int
    hospital_name: str
    locality: str
    urgency: str
    status: str
    search_radius_km: float
    created_at: datetime
    matching_logs: List[DonorMatchLogOut] = []

    class Config:
        from_attributes = True

class DonorAlertResponse(BaseModel):
    response: str  # accepted, declined

# --- FEATURE 2: RECURRING TRANSFUSION SCHEMAS ---
class PatientProfileCreate(BaseModel):
    patient_name: str
    condition_type: str  # thalassemia_major, sickle_cell, aplastic_anemia, oncology, other
    blood_group: str
    hospital_name: str
    attendant_id: Optional[str] = None
    treating_physician: Optional[str] = None
    hospital_patient_id: Optional[str] = None

class PatientProfileOut(BaseModel):
    id: str
    user_id: str
    patient_name: str
    condition_type: str
    blood_group: str
    hospital_name: str
    treating_physician: Optional[str]
    hospital_patient_id: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class RecurringScheduleCreate(BaseModel):
    patient_id: str
    frequency_days: int = 21  # 14, 21, 28
    component: str = "prbc"
    units_per_cycle: int = 1
    last_transfusion_date: Optional[datetime] = None
    hospital_name: str
    reminder_days_before: Optional[int] = 3

class RecurringScheduleOut(BaseModel):
    id: str
    patient_id: str
    frequency_days: int
    component: str
    units_per_cycle: int
    last_transfusion_date: Optional[datetime]
    next_due_date: datetime
    hospital_name: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class TransfusionRecordCreate(BaseModel):
    schedule_id: str
    transfusion_date: datetime
    units_transfused: int = 1
    hospital_name: str
    pre_transfusion_hb: Optional[float] = None
    post_transfusion_hb: Optional[float] = None
    notes: Optional[str] = None

class TransfusionRecordOut(BaseModel):
    id: str
    schedule_id: str
    transfusion_date: datetime
    units_transfused: int
    hospital_name: str
    pre_transfusion_hb: Optional[float]
    post_transfusion_hb: Optional[float]
    status: str
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class DonorPledgeCreate(BaseModel):
    schedule_id: str
    pledge_date: datetime

class DonorPledgeOut(BaseModel):
    id: str
    schedule_id: str
    donor_id: str
    pledge_date: datetime
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class PublicRecurringNeedOut(BaseModel):
    schedule_id: str
    component: str
    blood_group: str
    units_per_cycle: int
    hospital_name: str
    next_due_date: datetime
    days_until_due: int

# --- FEATURE 3: RARE BLOOD NETWORK SCHEMAS ---
class RareDonorRegister(BaseModel):
    phenotype: str = "bombay_hh"  # bombay_hh, rh_null, duffy_negative, kell_negative, other_rare
    immunohematology_lab: str
    lab_report_number: Optional[str] = None
    state_region: str = "Karnataka"
    emergency_alert_consent: bool = True

class RareDonorOut(BaseModel):
    id: str
    donor_id: str
    phenotype: str
    immunohematology_lab: str
    lab_report_number: Optional[str]
    is_verified: bool
    state_region: str
    created_at: datetime

    class Config:
        from_attributes = True

class RareEmergencyRequestCreate(BaseModel):
    phenotype_needed: str
    units_needed: int = 1
    hospital_name: str
    locality: str = "Bengaluru Central"
    treating_doctor: Optional[str] = None
    clinical_summary: str

class RareEmergencyRequestOut(BaseModel):
    id: str
    hospital_id: str
    patient_identifier: str
    phenotype_needed: str
    units_needed: int
    hospital_name: str
    locality: str
    urgency: str
    status: str
    clinical_summary: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class RareStatsOut(BaseModel):
    total_rare_donors: int
    verified_rare_donors: int
    active_rare_requests: int
    fulfilled_coordinations: int
    phenotype_breakdown: dict

# --- FEATURE 4: VERIFIED BLOOD BANK & HOSPITAL NETWORK SCHEMAS ---
class InventoryBatchCreate(BaseModel):
    blood_group: str
    component: str = "prbc"  # whole_blood, prbc, platelets, ffp, cryoprecipitate
    units: int = 1
    volume_ml: int = 350
    collection_date: Optional[datetime] = None
    expiry_date: datetime
    storage_location: Optional[str] = "Main Blood Bank Cold Room"
    storage_temp_celsius: Optional[float] = 4.0
    tested_hiv: bool = True
    tested_hbv: bool = True
    tested_hcv: bool = True
    tested_syphilis: bool = True
    tested_malaria: bool = True
    technician_name: Optional[str] = "Quality Assurance Officer"

class InventoryBatchUpdate(BaseModel):
    units: Optional[int] = None
    status: Optional[str] = None
    storage_location: Optional[str] = None
    storage_temp_celsius: Optional[float] = None

class InventoryBatchOut(BaseModel):
    id: str
    institution_id: str
    batch_number: str
    blood_group: str
    component: str
    units: int
    volume_ml: int
    collection_date: datetime
    expiry_date: datetime
    storage_location: str
    storage_temp_celsius: float
    tested_hiv: bool
    tested_hbv: bool
    tested_hcv: bool
    tested_syphilis: bool
    tested_malaria: bool
    is_cleared: bool
    technician_name: Optional[str]
    status: str
    days_to_expiry: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

class HospitalRequisitionCreate(BaseModel):
    blood_bank_id: Optional[str] = None
    patient_identifier: str
    blood_group: str
    component: str = "prbc"
    units_requested: int = 1
    urgency: str = "routine"  # routine, urgent, emergency_mhp
    clinical_indication: str
    treating_physician: str
    required_by: Optional[datetime] = None

class RequisitionStatusUpdate(BaseModel):
    status: str
    units_allocated: Optional[int] = None
    cross_match_status: Optional[str] = None

class HospitalRequisitionOut(BaseModel):
    id: str
    hospital_id: str
    blood_bank_id: Optional[str]
    hospital_name: Optional[str] = None
    patient_identifier: str
    blood_group: str
    component: str
    units_requested: int
    units_allocated: int
    urgency: str
    clinical_indication: str
    cross_match_required: bool
    cross_match_status: str
    status: str
    treating_physician: str
    created_at: datetime

    class Config:
        from_attributes = True

class InterFacilityTransferCreate(BaseModel):
    destination_institution_id: str
    requisition_id: Optional[str] = None
    batch_id: Optional[str] = None
    blood_group: str
    component: str
    units_transferred: int = 1
    cold_chain_carrier: Optional[str] = "Validated Passive Cold Box (2-6°C)"
    temp_at_dispatch: Optional[float] = 4.0

class InterFacilityTransferOut(BaseModel):
    id: str
    source_institution_id: str
    destination_institution_id: str
    requisition_id: Optional[str]
    batch_id: Optional[str]
    blood_group: str
    component: str
    units_transferred: int
    cold_chain_carrier: str
    temp_at_dispatch: float
    temp_at_receipt: Optional[float]
    transfer_status: str
    dispatched_at: datetime
    received_at: Optional[datetime]

    class Config:
        from_attributes = True

class DonationCampCreate(BaseModel):
    camp_name: str
    venue: str
    locality: str = "Bengaluru Central"
    start_date: datetime
    end_date: datetime
    target_units: int = 100
    contact_person: str
    contact_phone: str

class DonationCampOut(BaseModel):
    id: str
    organizer_institution_id: str
    camp_name: str
    venue: str
    locality: str
    start_date: datetime
    end_date: datetime
    target_units: int
    units_collected: int
    status: str
    contact_person: str
    contact_phone: str

    class Config:
        from_attributes = True

# --- FEATURE 5: VOLUNTEER RESCUE NETWORK SCHEMAS ---
class VolunteerTaskCreate(BaseModel):
    title: str
    task_type: str = "blood_courier"  # sample_pickup, blood_courier, patient_escort, camp_support
    urgency: str = "high"  # emergency, high, routine
    pickup_location: str
    pickup_locality: str = "Bengaluru Central"
    dropoff_location: str
    dropoff_locality: str = "Whitefield"
    contact_person: str
    contact_phone: str
    notes: Optional[str] = None

class VolunteerTaskOut(BaseModel):
    id: str
    title: str
    task_type: str
    urgency: str
    pickup_location: str
    pickup_locality: str
    dropoff_location: str
    dropoff_locality: str
    contact_person: str
    contact_phone: str
    notes: Optional[str]
    assigned_volunteer_id: Optional[str]
    created_by_institution_id: Optional[str]
    status: str
    claimed_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

class VolunteerTaskStatusUpdate(BaseModel):
    status: str  # in_transit, completed, cancelled

class VolunteerStatsOut(BaseModel):
    total_tasks_completed: int
    emergency_missions: int
    active_rescue_tasks: int
    total_hours_volunteered: float
    volunteer_rank: str

# --- FEATURE 6: AI SHORTAGE PREDICTION SCHEMAS ---
class ComponentForecastOut(BaseModel):
    component: str
    forecasted_demand_7d: float
    forecasted_demand_30d: float
    current_verified_stock: int
    predicted_deficit_7d: float
    risk_level: str  # CRITICAL, ELEVATED, STABLE
    confidence_score: float

class BloodGroupForecastOut(BaseModel):
    blood_group: str
    components: List[ComponentForecastOut]
    group_risk_level: str

class ShortageForecastSummaryOut(BaseModel):
    forecast_generated_at: datetime
    overall_system_status: str
    forecasts: List[BloodGroupForecastOut]
    actionable_recommendations: List[str]

# --- FEATURE 7: NEAR-EXPIRY BLOOD & SURPLUS BOARD SCHEMAS ---
class SurplusListingOut(BaseModel):
    id: str
    blood_bank_id: str
    blood_bank_name: str
    locality: str
    blood_group: str
    component: str
    units: int
    volume_ml: int
    hours_to_expiry: int
    expiry_date: datetime
    storage_temp_celsius: float
    is_cleared: bool
    status: str  # available_for_transfer, claimed, transferred

class SurplusClaimCreate(BaseModel):
    batch_id: str
    units_claimed: int = 1
    urgency: str = "immediate_transfusion"  # immediate_transfusion, next_day_elective
    receiving_hospital_id: Optional[str] = None
    notes: Optional[str] = None

class SurplusClaimOut(BaseModel):
    claim_id: str
    batch_id: str
    units_claimed: int
    status: str
    cold_chain_dispatch_ready: bool
    claimed_at: datetime


# --- CUSTOMER REVIEW & GRIEVANCE RESOLUTION SCHEMAS ---
class CustomerReviewCreate(BaseModel):
    name: str
    email: str = Field(..., pattern=EMAIL_REGEX)
    phone: Optional[str] = None
    category: str = "general_feedback"  # emergency_delay, blood_bank_issue, commercial_middleman_complaint, donor_unavailability, technical_issue, general_feedback
    severity: str = "normal"  # critical_emergency, urgent, normal, feedback
    rating: int = Field(5, ge=1, le=5)
    subject: str
    description: str
    facility_name: Optional[str] = None
    consent_public_display: bool = False

class CustomerReviewOut(BaseModel):
    id: str
    user_id: Optional[str]
    name: str
    category: str
    severity: str
    rating: int
    subject: str
    description: str
    facility_name: Optional[str]
    status: str
    admin_response: Optional[str]
    resolved_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

class CustomerReviewResolve(BaseModel):
    status: str  # under_review, in_progress, resolved
    admin_response: str
    admin_notes: Optional[str] = None

class ReviewStatsOut(BaseModel):
    total_reviews: int
    average_rating: float
    resolved_issues_count: int
    active_grievances_count: int
    rating_breakdown: Dict[str, int]

