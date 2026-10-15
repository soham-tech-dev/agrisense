from pydantic import BaseModel
from typing import List, Optional

class WeatherCurrent(BaseModel):
    temperature: float
    feels_like: float
    condition: str
    condition_code: Optional[str] = "01d"
    humidity: int
    wind_speed: float
    rain_probability: int
    district: str
    location_name: Optional[str] = None
    last_updated: str
    cached: bool = False

class ForecastItem(BaseModel):
    day: str
    date: str
    temp_max: float
    temp_min: float
    condition: str
    rain_probability: int
    icon: Optional[str] = "01d"

class WeatherForecastResponse(BaseModel):
    district: str
    forecast: List[ForecastItem]
    last_updated: str
    cached: bool = False

class WeatherAdvisoryResponse(BaseModel):
    district: str
    advisory_en: str
    advisory_mr: str
    category: str  # e.g. "Spraying", "Irrigation", "Harvest", "General"
    rain_expected: bool
    disclaimer_en: str = "Farming Guidance (Decision Support - Not a guarantee)"
    disclaimer_mr: str = "कृषी सल्ला (निर्णय साहाय्य - कोणतीही अंतिम हमी नाही)"
    last_updated: str
    cached: bool = False
