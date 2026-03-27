from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import UserRegisterSchema, ForecastResponse
from database import db
import random

app = FastAPI(title="Sentinel-Ops Backend")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:9002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def calculate_carbon_saved(energy_kwh: float, intensity: float = 0.475) -> float:
    """
    Intensity: 0.475 kgCO2e/kWh is the global average carbon intensity for grid electricity.
    """
    return energy_kwh * intensity

def detect_ghosts(cpu_percent: float, network_mb: float) -> bool:
    """
    Ghost Resource Threshold: CPU < 5% and Network < 10MB
    """
    return cpu_percent < 5.0 and network_mb < 10.0

@app.post("/register")
async def register_user(user: UserRegisterSchema):
    result = await db.save_user(user.model_dump())
    return {"message": "User registered successfully", "data": result}

@app.get("/forecast", response_model=list[ForecastResponse])
async def get_forecast():
    # Mock Prophet forecasting logic
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return [
        {
            "date": day,
            "predicted_cost": round(random.uniform(100.0, 500.0), 2),
            "carbon_estimate": round(random.uniform(50.0, 200.0), 2)
        }
        for day in days
    ]

@app.get("/health")
def health():
    return {"status": "online", "engine": "Sentinel-Ops Core 1.0"}
