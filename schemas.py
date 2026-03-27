from pydantic import BaseModel, Field, EmailStr, field_validator
import re

class UserRegisterSchema(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., description="Indian phone number starting with 6-9")
    password: str = Field(..., min_length=8)

    @field_validator('phone')
    @classmethod
    def validate_indian_phone(cls, v: str) -> str:
        # Strict Regex for Indian Phone Numbers: ^[6-9]\d{9}$
        if not re.match(r'^[6-9]\d{9}$', v):
            raise ValueError('Invalid Indian phone number. Must be 10 digits starting with 6-9.')
        return v

class ForecastResponse(BaseModel):
    date: str
    predicted_cost: float
    carbon_estimate: float
