from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List

class UserRegisterSchema(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., description="Indian phone number starting with 6-9")
    password: str = Field(..., min_length=8)

class ForecastResponse(BaseModel):
    date: str
    predicted_cost: float
    carbon_estimate: float

class ShadowResource(BaseModel):
    id: str
    type: str
    reason: str
    monthly_saving: float
    status: str = "detected"

class UnitEconomicsData(BaseModel):
    date: str
    total_cost: float
    cost_per_user: float
    is_healthy: bool

class GPUStatus(BaseModel):
    node_id: str
    type: str
    utilization: float
    hourly_cost: float
    recommendation: str

class GreenOpsSuggestion(BaseModel):
    current_region: str
    target_region: str
    cost_saving_pct: float
    carbon_reduction_pct: float
    is_active: bool

class AlertConfigSchema(BaseModel):
    telegram_token: Optional[str] = ""
    chat_id: Optional[str] = ""
    enabled: bool = False
