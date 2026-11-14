from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from backend.database import get_db
from backend.models import User, AuditLog
from backend.auth import get_current_user

router = APIRouter(prefix="/broadcast", tags=["Real-Time Emergency Broadcast & Gateway"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        if not self.active_connections:
            return
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

# In-memory recent alerts store for quick retrieval
RECENT_BROADCAST_ALERTS: List[Dict[str, Any]] = [
    {
        "id": "alert-mhp-901",
        "type": "massive_hemorrhage",
        "title": "MHP Protocol Activated: O- Universal PRBC Needed",
        "hospital": "Manipal Hospital Whitefield",
        "locality": "Whitefield, Bengaluru",
        "blood_group": "O-",
        "units": 4,
        "urgency": "CRITICAL_CODE_RED",
        "distance_km": 3.8,
        "patient_token": "MRN-TRAUMA-911",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": "active",
        "whatsapp_text": "🚨 CRITICAL BLOOD SOS: O- needed at Manipal Hospital Whitefield for trauma surgery. Tap to accept: https://bloodbridge.in/sos/mhp-901"
    },
    {
        "id": "alert-rare-702",
        "type": "rare_phenotype",
        "title": "Rare Bombay Phenotype (hh) Urgent SOS",
        "hospital": "Victoria Hospital Regional Blood Centre",
        "locality": "K.R. Road, Bengaluru",
        "blood_group": "Bombay (hh)",
        "units": 1,
        "urgency": "EXTREMELY_RARE",
        "distance_km": 6.2,
        "patient_token": "TOKEN-BOMBAY-042",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": "active",
        "whatsapp_text": "🚨 RARE BLOOD SOS: Bombay hh phenotype needed at Victoria Hospital. Tap to respond: https://bloodbridge.in/sos/rare-702"
    },
    {
        "id": "alert-thal-403",
        "type": "thalassemia_cycle",
        "title": "Thalassemia Cycle Pledge Needed: B+ PRBC",
        "hospital": "Narayana Health, HSR Layout",
        "locality": "HSR Layout, Bengaluru",
        "blood_group": "B+",
        "units": 1,
        "urgency": "SCHEDULED_LIFELINE",
        "distance_km": 4.5,
        "patient_token": "PEDIATRIC-THAL-09",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": "active",
        "whatsapp_text": "🩸 Thalassemia Support Circle: 11yo patient needs B+ PRBC cycle transfusion at Narayana Health. Tap to pledge: https://bloodbridge.in/sos/thal-403"
    }
]

class EmergencyBroadcastCreate(BaseModel):
    title: str
    hospital: str
    locality: str
    blood_group: str
    units: int = 1
    urgency: str = "urgent"  # emergency_mhp, critical, urgent
    patient_token: str
    notes: Optional[str] = None

class WhatsAppShareOut(BaseModel):
    alert_id: str
    formatted_message: str
    whatsapp_url: str
    sms_text: str

@router.websocket("/ws/emergency")
async def websocket_emergency_feed(websocket: WebSocket):
    """Real-time live WebSocket stream for critical hospital emergencies."""
    await manager.connect(websocket)
    try:
        # Send initial recent state upon connection
        await websocket.send_json({
            "type": "INITIAL_ALERTS",
            "count": len(RECENT_BROADCAST_ALERTS),
            "alerts": RECENT_BROADCAST_ALERTS
        })
        while True:
            # Keep socket alive and accept ping / messages from clients
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"type": "pong", "timestamp": datetime.now(timezone.utc).isoformat()})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

@router.get("/recent-alerts")
def get_recent_alerts():
    """Fetch active emergency broadcasts for notification drawer and radar."""
    return {
        "count": len(RECENT_BROADCAST_ALERTS),
        "alerts": RECENT_BROADCAST_ALERTS,
        "system_status": "ONLINE_ACTIVE_RADAR"
    }

def create_emergency_sos_alert(payload: EmergencyBroadcastCreate) -> Dict[str, Any]:
    """Pure synchronous alert generator & in-memory ring-buffer insertion."""
    alert_id = f"alert-sos-{int(datetime.now(timezone.utc).timestamp())}"
    
    encoded_message = (
        f"🚨 BLOODBRIDGE EMERGENCY SOS\n"
        f"🏥 Facility: {payload.hospital} ({payload.locality})\n"
        f"🩸 Blood Group: {payload.blood_group} ({payload.units} Unit/s Needed)\n"
        f"⚡ Urgency: {payload.urgency.upper()}\n"
        f"🔒 Token: {payload.patient_token}\n\n"
        f"👉 Tap to Accept & Save a Life: https://bloodbridge.in/sos/{alert_id}"
    )

    new_alert = {
        "id": alert_id,
        "type": "emergency_broadcast",
        "title": payload.title,
        "hospital": payload.hospital,
        "locality": payload.locality,
        "blood_group": payload.blood_group,
        "units": payload.units,
        "urgency": payload.urgency.upper(),
        "distance_km": 3.5,
        "patient_token": payload.patient_token,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": "active",
        "whatsapp_text": encoded_message
    }

    RECENT_BROADCAST_ALERTS.insert(0, new_alert)
    if len(RECENT_BROADCAST_ALERTS) > 20:
        RECENT_BROADCAST_ALERTS.pop()

    return new_alert

@router.post("/dispatch-sos")
async def dispatch_emergency_broadcast(
    payload: EmergencyBroadcastCreate,
    db: Session = Depends(get_db)
):
    """Trigger a city-wide Emergency SOS broadcast to all donors and connected hospitals."""
    new_alert = create_emergency_sos_alert(payload)

    # Real-time WebSocket push to all connected browser clients
    await manager.broadcast({
        "type": "NEW_EMERGENCY_SOS",
        "alert": new_alert
    })

    return {
        "success": True,
        "alert_id": new_alert["id"],
        "connected_clients": len(manager.active_connections),
        "alert": new_alert
    }

@router.get("/share-whatsapp/{alert_id}", response_model=WhatsAppShareOut)
def generate_whatsapp_share_url(alert_id: str):
    """Generate Indian telecommunication & WhatsApp gateway share links with DPDP safe tokens."""
    alert = next((a for a in RECENT_BROADCAST_ALERTS if a["id"] == alert_id), None)
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Broadcast alert not found")

    text = alert["whatsapp_text"]
    import urllib.parse
    encoded = urllib.parse.quote(text)
    wa_url = f"https://api.whatsapp.com/send?text={encoded}"

    return {
        "alert_id": alert_id,
        "formatted_message": text,
        "whatsapp_url": wa_url,
        "sms_text": f"BLOOD SOS: {alert['blood_group']} needed at {alert['hospital']}. Call 1800-BLOOD-BB or visit https://bloodbridge.in/sos/{alert_id}"
    }
