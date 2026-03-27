import pytest
from fastapi.testclient import TestClient
from main import app, calculate_carbon_saved, detect_ghosts

client = TestClient(app)

def test_calculate_carbon_saved():
    # Test: 100 kWh * 0.475 = 47.5
    result = calculate_carbon_saved(100)
    assert result == 47.5
    
    # Custom intensity test
    result_custom = calculate_carbon_saved(200, 0.5)
    assert result_custom == 100.0

def test_detect_ghosts():
    # Case 1: Active resource (Not a ghost)
    assert detect_ghosts(10.0, 50.0) is False
    
    # Case 2: Idle CPU but high network (Not a ghost)
    assert detect_ghosts(2.0, 50.0) is False
    
    # Case 3: Ghost resource detected (CPU < 5% and Network < 10MB)
    assert detect_ghosts(4.9, 9.9) is True

def test_forecast_endpoint():
    response = client.get("/forecast")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 7
    assert "predicted_cost" in data[0]
    assert "carbon_estimate" in data[0]

def test_registration_validation():
    # Test valid registration
    valid_payload = {
        "name": "Arjun Sharma",
        "email": "arjun@sentinel.ops",
        "phone": "9876543210",
        "password": "securepassword123"
    }
    response = client.post("/register", json=valid_payload)
    assert response.status_code == 200

    # Test invalid phone (Indian prefix validation)
    invalid_payload = valid_payload.copy()
    invalid_payload["phone"] = "5555555555" # Starts with 5, invalid
    response_invalid = client.post("/register", json=invalid_payload)
    assert response_invalid.status_code == 422
