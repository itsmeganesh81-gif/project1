from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User
from backend.schemas import ShortageForecastSummaryOut, BloodGroupForecastOut
from backend.ml.shortage_forecaster import predict_blood_shortages
from backend.auth import get_current_user

router = APIRouter(prefix="/api/forecast", tags=["AI Blood Shortage Forecaster"])

@router.get("/shortages", response_model=ShortageForecastSummaryOut)
def get_predicted_blood_shortages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Runs the AI shortage prediction engine to project 7-day and 30-day regional
    blood component deficits across all 8 blood groups.
    """
    return predict_blood_shortages(db)


@router.get("/group/{blood_group}", response_model=BloodGroupForecastOut)
def get_group_shortage_forecast(
    blood_group: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns specific component deficit projections for a given blood group.
    """
    data = predict_blood_shortages(db)
    for g in data["forecasts"]:
        if g["blood_group"] == blood_group:
            return g
    raise HTTPException(status_code=404, detail=f"Blood group {blood_group} not found.")

