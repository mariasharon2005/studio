from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import (
    UserRegisterSchema, ForecastResponse, AlertConfigSchema, 
    ShadowResource, UnitEconomicsData, GPUStatus, GreenOpsSuggestion
)
from database import db
import random
from typing import List

app = FastAPI(title="Sentinel-Ops Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/shadow-scan", response_model=List[ShadowResource])
async def get_shadow_scan():
    return await db.get_shadow_scan()

@app.get("/unit-economics", response_model=List[UnitEconomicsData])
async def get_unit_economics():
    return await db.get_unit_economics()

@app.get("/gpu-sentinel", response_model=List[GPUStatus])
async def get_gpu_sentinel():
    return await db.get_gpu_sentinel()

@app.get("/green-ops", response_model=GreenOpsSuggestion)
async def get_green_ops():
    return await db.get_green_ops()

@app.get("/forecast", response_model=List[ForecastResponse])
async def get_forecast():
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

@app.get("/health")
def health():
    return {"status": "online", "engine": "Sentinel-Ops Core 2.0"}
