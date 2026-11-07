import os
import sys

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base
from backend.routes.auth_routes import router as auth_router
from backend.routes.admin_routes import router as admin_router
from backend.routes.report_routes import router as report_router
from backend.routes.institution_routes import router as institution_router
from backend.routes.matching_routes import router as matching_router
from backend.routes.patient_routes import router as patient_router
from backend.routes.rare_routes import router as rare_router
from backend.routes.inventory_routes import router as inventory_router
from backend.routes.hospital_routes import router as hospital_router
from backend.routes.volunteer_routes import router as volunteer_router
from backend.routes.expiry_routes import router as expiry_router
from backend.routes.review_routes import router as review_router
from backend.seed import seed_database

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BloodBridge Core API",
    description="Secure, DPDP-Compliant Healthcare & Blood Coordination Platform Backend",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all frontend dev servers & previews
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed initial database records if needed
seed_database()

# Mount routers under /api
app.include_router(auth_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(report_router, prefix="/api")
app.include_router(institution_router, prefix="/api")
app.include_router(matching_router, prefix="/api")
app.include_router(patient_router, prefix="/api")
app.include_router(rare_router, prefix="/api")
app.include_router(inventory_router)
app.include_router(hospital_router)
app.include_router(volunteer_router)
app.include_router(expiry_router)
app.include_router(review_router)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "BloodBridge Healthcare API",
        "version": "1.0.0",
        "dpdp_compliance": "enabled",
        "server_authorization": "strict"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
