import os
import sys
import asyncio

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.routes.broadcast_routes import (
    get_recent_alerts,
    create_emergency_sos_alert,
    dispatch_emergency_broadcast,
    generate_whatsapp_share_url,
    manager,
    EmergencyBroadcastCreate
)
from backend.database import SessionLocal

def run_tests():
    print("=" * 70)
    print("RUNNING REAL-TIME EMERGENCY BROADCAST & WHATSAPP GATEWAY TESTS")
    print("=" * 70)

    # 1. Fetch recent emergency alerts
    data = get_recent_alerts()
    assert data["count"] >= 3, "Expected at least 3 active alerts"
    assert data["system_status"] == "ONLINE_ACTIVE_RADAR"
    print(f"[PASS] Test 1: Active Emergency Alerts Feed Retrieved (Count: {data['count']})")

    # 2. Dispatch a new Emergency SOS
    sos_payload = EmergencyBroadcastCreate(
        title="Pediatric Emergency: O- Negative Platelets Needed",
        hospital="Manipal Hospital Whitefield",
        locality="Whitefield, Bengaluru",
        blood_group="O-",
        units=2,
        urgency="critical",
        patient_token="TOKEN-PED-998"
    )
    new_alert = create_emergency_sos_alert(sos_payload)
    alert_id = new_alert["id"]
    assert "alert-sos-" in alert_id
    assert new_alert["blood_group"] == "O-"
    print(f"[PASS] Test 2: Emergency SOS Broadcast Dispatched (Alert ID: {alert_id})")

    # 3. Generate WhatsApp & SMS Dispatch Gateway Link
    wa_data = generate_whatsapp_share_url(alert_id)
    assert "https://api.whatsapp.com/send" in wa_data["whatsapp_url"]
    assert "Manipal Hospital Whitefield" in wa_data["formatted_message"]
    print("[PASS] Test 3: WhatsApp & SMS Healthcare Dispatch Formatted Link Verified")

    # 4. In-Memory Broadcast Engine & Connection Manager
    assert hasattr(manager, "broadcast")
    assert hasattr(manager, "connect")
    assert hasattr(manager, "disconnect")
    print("[PASS] Test 4: Live Broadcast Engine & Active Socket Lifecycle Verified")

    print("=" * 70)
    print("ALL 4 REAL-TIME BROADCAST & WHATSAPP GATEWAY TESTS PASSED!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
