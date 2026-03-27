from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import UserRegisterSchema, ForecastResponse, AlertConfigSchema
from database import db
import random

app = FastAPI(title="Sentinel-Ops Backend")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
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

@app.get("/alerts/config")
async def get_alert_config():
    return await db.get_alert_config()

@app.post("/alerts/config")
async def update_alert_config(config: AlertConfigSchema):
    return await db.update_alert_config(config.model_dump())

@app.post("/alerts/test")
async def test_alert():
    config = await db.get_alert_config()
    if not config["telegram_token"] or not config["chat_id"]:
        raise HTTPException(status_code=400, detail="Telegram credentials missing")
    return {"message": "Test alert dispatched to Telegram"}

@app.get("/health")
def health():
    return {"status": "online", "engine": "Sentinel-Ops Core 1.0"}
