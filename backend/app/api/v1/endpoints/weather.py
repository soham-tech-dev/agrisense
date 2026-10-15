from fastapi import APIRouter, Query, Depends
from typing import Optional
from app.schemas.weather import WeatherCurrent, WeatherForecastResponse, WeatherAdvisoryResponse
from app.services.weather_service import weather_service

router = APIRouter()

@router.get("/current", response_model=WeatherCurrent)
def get_current_weather(
    district: str = Query("Nashik", description="Farmer district name"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude")
):
    """
    Get current weather for a district/location. Backend communicates with OpenWeatherMap.
    Exposes no API keys to frontend.
    """
    return weather_service.get_current_weather(district=district, lat=lat, lon=lon)

@router.get("/forecast", response_model=WeatherForecastResponse)
def get_weather_forecast(
    district: str = Query("Nashik", description="Farmer district name"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude")
):
    """
    Get 5-day weather forecast.
    """
    return weather_service.get_forecast(district=district, lat=lat, lon=lon)

@router.get("/advisory", response_model=WeatherAdvisoryResponse)
def get_weather_advisory(
    district: str = Query("Nashik", description="Farmer district name"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude")
):
    """
    Get decision-support farming guidance advisory based on weather parameters.
    """
    return weather_service.get_advisory(district=district, lat=lat, lon=lon)
