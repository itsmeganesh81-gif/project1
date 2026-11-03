from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User, Institution, VolunteerTask, AuditLog
from backend.schemas import (
    VolunteerTaskCreate, VolunteerTaskOut, VolunteerTaskStatusUpdate, VolunteerStatsOut
)
from backend.auth import get_current_user, require_roles

router = APIRouter(prefix="/api/volunteer", tags=["Volunteer Rescue Network"])

def utc_now():
    return datetime.now(timezone.utc)

@router.post("/task", response_model=VolunteerTaskOut)
def create_volunteer_task(
    payload: VolunteerTaskCreate,
    current_user: User = Depends(require_roles("hospital_admin", "blood_bank_admin", "admin")),
    db: Session = Depends(get_db)
):
    """
    Dispatches a field rescue/courier task for volunteers.
    Adheres strictly to DPDP by exposing only logistical pickup/dropoff points,
    never exposing sensitive patient diagnostic records to field couriers.
    """
    inst = db.query(Institution).filter(Institution.user_id == current_user.id).first()
    inst_id = inst.id if inst else None

    task = VolunteerTask(
        title=payload.title,
        task_type=payload.task_type,
        urgency=payload.urgency,
        pickup_location=payload.pickup_location,
        pickup_locality=payload.pickup_locality,
        dropoff_location=payload.dropoff_location,
        dropoff_locality=payload.dropoff_locality,
        contact_person=payload.contact_person,
        contact_phone=payload.contact_phone,
        notes=payload.notes,
        created_by_institution_id=inst_id,
        status="open"
    )
    db.add(task)

    db.add(AuditLog(
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="create_volunteer_task",
        resource_type="volunteer_tasks",
        resource_id=task.id
    ))

    db.commit()
    db.refresh(task)
    return task


@router.get("/tasks", response_model=List[VolunteerTaskOut])
def get_volunteer_tasks(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns available rescue tasks. If volunteer, returns open tasks and their claimed tasks.
    """
    query = db.query(VolunteerTask)

    if status:
        query = query.filter(VolunteerTask.status == status)

    if current_user.role == "volunteer":
        # Volunteers see open tasks or tasks assigned to themselves
        query = query.filter(
            (VolunteerTask.status == "open") |
            (VolunteerTask.assigned_volunteer_id == current_user.id)
        )

    return query.order_by(VolunteerTask.created_at.desc()).all()


@router.patch("/task/{task_id}/claim", response_model=VolunteerTaskOut)
def claim_volunteer_task(
    task_id: str,
    current_user: User = Depends(require_roles("volunteer", "admin")),
    db: Session = Depends(get_db)
):
    """
    A verified community volunteer claims an open rescue task.
    """
    task = db.query(VolunteerTask).filter(VolunteerTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Volunteer task not found.")

    if task.status != "open":
        raise HTTPException(status_code=400, detail=f"Task is already {task.status}.")

    task.assigned_volunteer_id = current_user.id
    task.status = "claimed"
    task.claimed_at = utc_now()

    db.add(AuditLog(
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="claim_volunteer_task",
        resource_type="volunteer_tasks",
        resource_id=task.id
    ))

    db.commit()
    db.refresh(task)
    return task


@router.patch("/task/{task_id}/status", response_model=VolunteerTaskOut)
def update_volunteer_task_status(
    task_id: str,
    payload: VolunteerTaskStatusUpdate,
    current_user: User = Depends(require_roles("volunteer", "hospital_admin", "blood_bank_admin", "admin")),
    db: Session = Depends(get_db)
):
    """
    Updates the transit progress of a task (e.g. in_transit, completed).
    """
    task = db.query(VolunteerTask).filter(VolunteerTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Volunteer task not found.")

    if current_user.role == "volunteer" and task.assigned_volunteer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update tasks assigned to you.")

    task.status = payload.status
    if payload.status == "completed":
        task.completed_at = utc_now()

    db.add(AuditLog(
        actor_id=current_user.id,
        actor_role=current_user.role,
        action=f"update_volunteer_task_{payload.status}",
        resource_type="volunteer_tasks",
        resource_id=task.id
    ))

    db.commit()
    db.refresh(task)
    return task


@router.get("/stats", response_model=VolunteerStatsOut)
def get_volunteer_stats(
    current_user: User = Depends(require_roles("volunteer", "admin")),
    db: Session = Depends(get_db)
):
    """
    Calculates authenticated volunteer's actual community impact metrics.
    """
    tasks = db.query(VolunteerTask).filter(VolunteerTask.assigned_volunteer_id == current_user.id).all()

    completed = [t for t in tasks if t.status == "completed"]
    emergency = [t for t in completed if t.urgency == "emergency"]
    active = [t for t in tasks if t.status in ["claimed", "in_transit"]]

    hours = len(completed) * 1.5  # Estimated standard 1.5 hrs per rapid field transit mission

    rank = "Bronze Volunteer"
    if len(completed) >= 10:
        rank = "Gold Field Hero"
    elif len(completed) >= 5:
        rank = "Silver Volunteer Responder"

    return VolunteerStatsOut(
        total_tasks_completed=len(completed),
        emergency_missions=len(emergency),
        active_rescue_tasks=len(active),
        total_hours_volunteered=hours,
        volunteer_rank=rank
    )

