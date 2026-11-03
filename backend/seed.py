import os
import sys

# Ensure backend package can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database import engine, Base, SessionLocal
from backend.models import User, DonorProfile, Institution, FraudReport, ConsentLedger
from backend.auth import hash_password, mask_phone, get_locality_coords

def seed_database():
    print("Initializing BloodBridge Database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).filter(User.email == "admin@bloodbridge.in").first():
        print("Database already seeded with demo accounts.")
        db.close()
        return

    print("Seeding demo accounts and verified institutions...")

    # 1. Platform Administrator
    admin = User(
        email="admin@bloodbridge.in",
        password_hash=hash_password("admin123"),
        role="admin",
        name="Platform Administrator",
        phone_masked=mask_phone("9876543210"),
        phone_encrypted="9876543210",
        locality="Bengaluru Central",
        lat=12.9716,
        lng=77.5946,
        is_verified=True,
        is_available=True
    )
    db.add(admin)

    # 2. Verified Hospital: Manipal Hospital Whitefield
    lat_wh, lng_wh = get_locality_coords("Whitefield")
    hosp_user = User(
        email="manipal@bloodbridge.in",
        password_hash=hash_password("hospital123"),
        role="hospital_admin",
        name="Dr. Sunita Rao (Manipal Hospital)",
        phone_masked=mask_phone("9876543211"),
        phone_encrypted="9876543211",
        locality="Whitefield",
        lat=lat_wh,
        lng=lng_wh,
        is_verified=True,
        is_available=True
    )
    db.add(hosp_user)
    db.flush()

    hosp_inst = Institution(
        user_id=hosp_user.id,
        org_type="hospital",
        name="Manipal Hospital Whitefield",
        license_number="KA-BLR-HOSP-2021-049",
        nabh_accredited=True,
        address="#143, 212-215, EPIP Zone, Whitefield, Bengaluru - 560066",
        locality="Whitefield",
        lat=lat_wh,
        lng=lng_wh,
        contact_phone="+91 80 2502 4444",
        emergency_helpline="+91 80 2502 9111",
        operating_hours="24/7 Emergency",
        verification_status="verified"
    )
    db.add(hosp_inst)

    # 3. Pending Hospital for Admin Verification Demo: Apollo Bannerghatta
    lat_jay, lng_jay = get_locality_coords("Jayanagar")
    hosp_pending_user = User(
        email="apollo@bloodbridge.in",
        password_hash=hash_password("hospital123"),
        role="hospital_admin",
        name="Dr. K. Sharma (Apollo BG Road)",
        phone_masked=mask_phone("9876543212"),
        phone_encrypted="9876543212",
        locality="Jayanagar",
        lat=lat_jay,
        lng=lng_jay,
        is_verified=False,
        is_available=True
    )
    db.add(hosp_pending_user)
    db.flush()

    hosp_pending_inst = Institution(
        user_id=hosp_pending_user.id,
        org_type="hospital",
        name="Apollo Hospital Bannerghatta",
        license_number="KA-BLR-HOSP-2023-882",
        nabh_accredited=True,
        address="154/11, Opp IIMB, Bannerghatta Road, Bengaluru - 560076",
        locality="Jayanagar",
        lat=lat_jay,
        lng=lng_jay,
        contact_phone="+91 80 2630 4050",
        emergency_helpline="+91 80 2630 4106",
        operating_hours="24/7 Emergency",
        verification_status="pending"
    )
    db.add(hosp_pending_inst)

    # 4. Verified Blood Bank: Indian Red Cross Society Blood Centre
    lat_cen, lng_cen = get_locality_coords("Bengaluru Central")
    bb_user = User(
        email="redcross@bloodbridge.in",
        password_hash=hash_password("bloodbank123"),
        role="blood_bank_admin",
        name="Red Cross Blood Centre Officer",
        phone_masked=mask_phone("9876543213"),
        phone_encrypted="9876543213",
        locality="Bengaluru Central",
        lat=lat_cen,
        lng=lng_cen,
        is_verified=True,
        is_available=True
    )
    db.add(bb_user)
    db.flush()

    bb_inst = Institution(
        user_id=bb_user.id,
        org_type="blood_bank",
        name="Indian Red Cross Society Blood Centre",
        license_number="KA-BLR-BB-28C-0012",
        nabh_accredited=True,
        address="#26, Red Cross Bhavan, 1st Main Road, Race Course, Bengaluru - 560001",
        locality="Bengaluru Central",
        lat=lat_cen,
        lng=lng_cen,
        contact_phone="+91 80 2226 8435",
        emergency_helpline="+91 80 2226 4205",
        operating_hours="24/7",
        verification_status="verified"
    )
    db.add(bb_inst)

    # 5. Verified Voluntary Donor
    lat_kor, lng_kor = get_locality_coords("Koramangala")
    donor_user = User(
        email="donor@bloodbridge.in",
        password_hash=hash_password("donor123"),
        role="donor",
        name="Arjun Sharma",
        phone_masked=mask_phone("9876543214"),
        phone_encrypted="9876543214",
        blood_group="O+",
        locality="Koramangala",
        lat=lat_kor,
        lng=lng_kor,
        is_verified=True,
        is_available=True
    )
    db.add(donor_user)
    db.flush()

    db.add(DonorProfile(
        user_id=donor_user.id,
        gender="male",
        weight_kg=72.0,
        total_verified_donations=8,
        points=480,
        level="Silver",
        bio="Regular voluntary blood donor. Happy to help during verified emergencies."
    ))

    # Add DPDP consents for donor
    for c_type in ["health_data", "approximate_location", "emergency_broadcast", "profile_discovery"]:
        db.add(ConsentLedger(
            user_id=donor_user.id,
            consent_type=c_type,
            granted=True,
            consent_text_version="DPDP-2023-v1.0"
        ))

    # 6. Patient Attendant
    lat_ind, lng_ind = get_locality_coords("Indiranagar")
    patient_user = User(
        email="patient@bloodbridge.in",
        password_hash=hash_password("patient123"),
        role="patient",
        name="Priya Varma (Patient Family)",
        phone_masked=mask_phone("9876543215"),
        phone_encrypted="9876543215",
        blood_group="B+",
        locality="Indiranagar",
        lat=lat_ind,
        lng=lng_ind,
        is_verified=True,
        is_available=False
    )
    db.add(patient_user)

    # 7. Community Volunteer
    volunteer_user = User(
        email="volunteer@bloodbridge.in",
        password_hash=hash_password("volunteer123"),
        role="volunteer",
        name="Sanjay Hegde",
        phone_masked=mask_phone("9876543216"),
        phone_encrypted="9876543216",
        locality="Malleshwaram",
        lat=13.0035,
        lng=77.5697,
        is_verified=True,
        is_available=True
    )
    db.add(volunteer_user)
    db.flush()

    # 8. Sample Fraud Report for Admin Dashboard moderation
    db.add(FraudReport(
        reporter_id=donor_user.id,
        category="commercial_blood_sale",
        description="Received an anonymous call from someone claiming to represent a middleman demanding ₹4,000 for replacement donor arrangement outside hospital.",
        status="open"
    ))

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
