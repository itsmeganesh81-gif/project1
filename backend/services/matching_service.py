import math
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Tuple, Optional
from backend.models import User, DonorProfile, ConsentLedger
from backend.auth import LOCALITY_CENTROIDS

# Medically approved Red Blood Cell (PRBC & Whole Blood) compatibility matrix
RED_CELL_COMPATIBILITY = {
    "A+": ["A+", "A-", "O+", "O-"],
    "A-": ["A-", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "B-": ["B-", "O-"],
    "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],  # Universal recipient
    "AB-": ["A-", "B-", "AB-", "O-"],
    "O+": ["O+", "O-"],
    "O-": ["O-"],  # Universal donor
    "Bombay": ["Bombay"],
    "hh": ["Bombay", "hh"],
}

# Medically approved Plasma & Platelet compatibility matrix (Reverse logic)
# AB is universal plasma/platelet donor (contains neither anti-A nor anti-B antibodies)
PLASMA_PLATELET_COMPATIBILITY = {
    "O+": ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
    "O-": ["O-", "A-", "B-", "AB-"],
    "A+": ["A+", "A-", "AB+", "AB-"],
    "A-": ["A-", "AB-"],
    "B+": ["B+", "B-", "AB+", "AB-"],
    "B-": ["B-", "AB-"],
    "AB+": ["AB+", "AB-"],
    "AB-": ["AB-"],
    "Bombay": ["Bombay"],
    "hh": ["Bombay", "hh"],
}

def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculates great-circle distance between two geographic coordinates in kilometers."""
    R = 6371.0  # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlng / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def is_blood_compatible(recipient_group: str, donor_group: str, component: str = "whole_blood") -> Tuple[bool, bool]:
    """
    Evaluates compatibility according to component type.
    Returns: (is_compatible, is_exact_match)
    """
    if not recipient_group or not donor_group:
        return False, False

    rg = recipient_group.strip()
    dg = donor_group.strip()

    is_exact = (rg.upper() == dg.upper())

    if component.lower() in ["platelets", "ffp", "plasma", "cryo"]:
        allowed_donors = PLASMA_PLATELET_COMPATIBILITY.get(rg, [rg])
        is_comp = dg in allowed_donors
    else:
        # Default: whole blood, PRBC
        allowed_donors = RED_CELL_COMPATIBILITY.get(rg, [rg])
        is_comp = dg in allowed_donors

    return is_comp, is_exact

def evaluate_donation_cooldown(donor_profile: Optional[DonorProfile], component: str = "whole_blood") -> Tuple[bool, int, str]:
    """
    Evaluates NBTC India whole blood & platelet donation cooldowns.
    - Whole blood / PRBC: 90 days for men, 120 days for women.
    - Platelets (Apheresis): 14 days minimum.
    Returns: (cooldown_cleared, days_remaining, clinical_reason)
    """
    if not donor_profile:
        return True, 0, "No previous donation history recorded; donor is eligible."

    now = datetime.now(timezone.utc)
    is_female = (donor_profile.gender or "").lower() == "female"

    if component.lower() in ["platelets", "apheresis"]:
        required_interval_days = 14
        last_date = donor_profile.last_platelet_date
    else:
        required_interval_days = 120 if is_female else 90
        last_date = donor_profile.last_whole_blood_date

    if not last_date:
        return True, 0, f"No recent {component} donation on file; eligible under NBTC guidelines."

    if last_date.tzinfo is None:
        last_date = last_date.replace(tzinfo=timezone.utc)

    days_passed = (now - last_date).days
    if days_passed >= required_interval_days:
        return True, 0, f"Eligible: {days_passed} days passed since last donation (NBTC minimum: {required_interval_days} days)."
    else:
        remaining = required_interval_days - days_passed
        gender_str = "female" if is_female else "male"
        return False, remaining, f"In cooldown: {remaining} days remaining until next eligible donation date (NBTC {gender_str} interval: {required_interval_days} days)."

def calculate_smart_score(
    is_compatible: bool,
    is_exact_match: bool,
    distance_km: float,
    radius_km: float,
    cooldown_cleared: bool,
    is_verified: bool,
    total_donations: int,
    alerts_this_week: int
) -> float:
    """Calculates multi-factor AI recommendation score (0 to 100)."""
    if not is_compatible:
        return 0.0

    score = 0.0

    # 1. Compatibility Weight (Max 40 points)
    if is_exact_match:
        score += 40.0
    else:
        score += 32.0  # Compatible alternative

    # 2. Distance Proximity Weight (Max 25 points)
    if radius_km > 0:
        dist_factor = max(0.0, 1.0 - (distance_km / radius_km))
        score += dist_factor * 25.0
    else:
        score += 15.0

    # 3. Clinical Cooldown & Availability (Max 15 points)
    if cooldown_cleared:
        score += 15.0
    else:
        score += 2.0  # Severe penalty if not cleared

    # 4. Donor Reliability & Verification (Max 10 points)
    if is_verified:
        score += 5.0
    if total_donations >= 5:
        score += 5.0
    elif total_donations >= 1:
        score += 3.0

    # 5. Fair Notification Distribution (Max 10 points)
    # Give priority to donors who haven't received excessive alerts this week
    if alerts_this_week == 0:
        score += 10.0
    elif alerts_this_week <= 2:
        score += 6.0
    else:
        score += 1.0

    return round(min(100.0, score), 1)

def match_donors_for_request(
    recipient_blood_group: str,
    component: str,
    request_lat: float,
    request_lng: float,
    candidate_donors: List[User],
    initial_radius_km: float = 5.0,
    min_required_candidates: int = 3
) -> Dict[str, Any]:
    """
    Executes the intelligent recommendation algorithm with automatic radius expansion.
    Returns:
    {
        "effective_radius_km": float,
        "radius_expanded": bool,
        "expansion_reason": str,
        "matches": [ ... ]
    }
    """
    radii_steps = [initial_radius_km, 10.0, 20.0, 50.0]
    # Remove duplicates and sort ascending
    radii_steps = sorted(list(set(r for r in radii_steps if r >= initial_radius_km)))

    final_matches = []
    final_radius = initial_radius_km
    was_expanded = False
    expansion_note = "Standard search radius applied."

    for radius in radii_steps:
        matches_at_radius = []
        for donor in candidate_donors:
            # Check availability
            if not donor.is_available:
                continue

            # Calculate distance
            dist = haversine_distance(request_lat, request_lng, donor.lat, donor.lng)
            if dist > radius:
                continue

            # Check medical compatibility
            is_comp, is_exact = is_blood_compatible(recipient_blood_group, donor.blood_group, component)
            if not is_comp:
                continue

            # Check cooldown
            profile = donor.donor_profile
            cooldown_cleared, cooldown_days, cooldown_reason = evaluate_donation_cooldown(profile, component)

            total_donations = profile.total_verified_donations if profile else 0
            alerts_week = profile.alerts_received_this_week if profile else 0

            # Calculate multi-factor score
            score = calculate_smart_score(
                is_compatible=is_comp,
                is_exact_match=is_exact,
                distance_km=dist,
                radius_km=radius,
                cooldown_cleared=cooldown_cleared,
                is_verified=donor.is_verified,
                total_donations=total_donations,
                alerts_this_week=alerts_week
            )

            # Build human-readable explainability text
            explanation_parts = []
            if is_exact:
                explanation_parts.append(f"Direct {donor.blood_group} match for {component}")
            else:
                explanation_parts.append(f"Medically compatible alternative ({donor.blood_group} for {recipient_blood_group})")

            explanation_parts.append(f"~{dist} km away in {donor.locality}")

            if cooldown_cleared:
                explanation_parts.append("Donation cooldown cleared")
            else:
                explanation_parts.append(f"Cooldown active ({cooldown_days}d remaining)")

            if donor.is_verified:
                explanation_parts.append(f"Verified donor ({total_donations} completed donations)")

            match_obj = {
                "donor_id": donor.id,
                "name": donor.name,
                "blood_group": donor.blood_group,
                "locality": donor.locality,
                "lat": donor.lat,
                "lng": donor.lng,
                "distance_km": dist,
                "score": score,
                "is_exact_match": is_exact,
                "cooldown_cleared": cooldown_cleared,
                "cooldown_days_remaining": cooldown_days,
                "cooldown_note": cooldown_reason,
                "is_verified": donor.is_verified,
                "total_donations": total_donations,
                "phone_masked": donor.phone_masked or "+91 **********",
                "match_explanation": " • ".join(explanation_parts)
            }
            matches_at_radius.append(match_obj)

        final_radius = radius
        final_matches = sorted(matches_at_radius, key=lambda x: x["score"], reverse=True)

        if len(final_matches) >= min_required_candidates or radius == radii_steps[-1]:
            if radius > initial_radius_km:
                was_expanded = True
                expansion_note = f"Search radius automatically expanded from {initial_radius_km} km to {radius} km to identify sufficient compatible donors."
            break

    return {
        "recipient_blood_group": recipient_blood_group,
        "component": component,
        "initial_radius_km": initial_radius_km,
        "effective_radius_km": final_radius,
        "radius_expanded": was_expanded,
        "expansion_reason": expansion_note,
        "total_matched": len(final_matches),
        "matches": final_matches,
        "medical_advisory": "Final donor eligibility and transfusion compatibility must be confirmed by qualified medical professionals or certified blood banks."
    }

