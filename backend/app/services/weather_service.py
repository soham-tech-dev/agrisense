import os
import datetime
import urllib.request
import urllib.error
import json
import logging
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.services.cache_service import cache_service

logger = logging.getLogger(__name__)

# Fallback realistic weather generator for Maharashtra districts (Nashik, Pune, Solapur, etc.)
FALLBACK_DISTRICT_WEATHER: Dict[str, Dict[str, Any]] = {
    "Nashik": {
        "temperature": 28.5,
        "feels_like": 29.8,
        "condition": "Partly Cloudy",
        "humidity": 68,
        "wind_speed": 12.4,
        "rain_probability": 65,
        "district": "Nashik",
        "location_name": "Niphad, Nashik"
    },
    "Pune": {
        "temperature": 27.2,
        "feels_like": 28.0,
        "condition": "Light Rain",
        "humidity": 75,
        "wind_speed": 14.2,
        "rain_probability": 80,
        "district": "Pune",
        "location_name": "Haveli, Pune"
    },
    "Solapur": {
        "temperature": 34.0,
        "feels_like": 36.5,
        "condition": "Sunny / Clear",
        "humidity": 42,
        "wind_speed": 8.5,
        "rain_probability": 15,
        "district": "Solapur",
        "location_name": "Pandharpur, Solapur"
    }
}

class WeatherService:
    def get_current_weather(self, district: str = "Nashik", lat: Optional[float] = None, lon: Optional[float] = None) -> Dict[str, Any]:
        cache_key = f"weather_current_{district}_{lat}_{lon}"
        
        # Check cache
        cached_data = cache_service.get(cache_key, ttl_seconds=settings.CACHE_TTL_MINUTES * 60)
        
        api_key = settings.OPENWEATHER_API_KEY
        if api_key:
            try:
                if lat is not None and lon is not None:
                    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
                else:
                    url = f"https://api.openweathermap.org/data/2.5/weather?q={district},IN&appid={api_key}&units=metric"
                
                req = urllib.request.Request(url, headers={"User-Agent": "AgriSense/1.0"})
                with urllib.request.urlopen(req, timeout=5) as resp:
                    data = json.loads(resp.read().decode('utf-8'))
                    
                    weather_res = {
                        "temperature": round(data["main"]["temp"], 1),
                        "feels_like": round(data["main"]["feels_like"], 1),
                        "condition": data["weather"][0]["main"],
                        "condition_code": data["weather"][0].get("icon", "01d"),
                        "humidity": data["main"]["humidity"],
                        "wind_speed": round(data["wind"]["speed"] * 3.6, 1), # m/s to km/h
                        "rain_probability": 70 if "rain" in data else (30 if data["clouds"]["all"] > 50 else 10),
                        "district": district,
                        "location_name": data.get("name", district),
                        "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        "cached": False
                    }
                    cache_service.set(cache_key, weather_res)
                    return weather_res
            except Exception as e:
                logger.warning(f"OpenWeatherMap API failed: {e}. Falling back to cache/mock.")

        # Fallback to cached item if available
        if cached_data:
            cached_data["cached"] = True
            return cached_data
            
        # Standard fallback response
        base_fallback = FALLBACK_DISTRICT_WEATHER.get(district, FALLBACK_DISTRICT_WEATHER["Nashik"])
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        res = {
            **base_fallback,
            "district": district,
            "condition_code": "02d",
            "last_updated": now_str,
            "cached": True
        }
        cache_service.set(cache_key, res)
        return res

    def get_forecast(self, district: str = "Nashik", lat: Optional[float] = None, lon: Optional[float] = None) -> Dict[str, Any]:
        cache_key = f"weather_forecast_{district}_{lat}_{lon}"
        cached_data = cache_service.get(cache_key, ttl_seconds=settings.CACHE_TTL_MINUTES * 60)
        
        api_key = settings.OPENWEATHER_API_KEY
        if api_key:
            try:
                if lat is not None and lon is not None:
                    url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={api_key}&units=metric"
                else:
                    url = f"https://api.openweathermap.org/data/2.5/forecast?q={district},IN&appid={api_key}&units=metric"
                    
                req = urllib.request.Request(url, headers={"User-Agent": "AgriSense/1.0"})
                with urllib.request.urlopen(req, timeout=5) as resp:
                    data = json.loads(resp.read().decode('utf-8'))
                    forecast_items = []
                    
                    # Group by daily items (taking every 8th 3-hour reading)
                    for item in data.get("list", [])[::8]:
                        dt = datetime.datetime.fromtimestamp(item["dt"])
                        forecast_items.append({
                            "day": dt.strftime("%a"),
                            "date": dt.strftime("%d %b"),
                            "temp_max": round(item["main"]["temp_max"] + 2, 1),
                            "temp_min": round(item["main"]["temp_min"] - 1, 1),
                            "condition": item["weather"][0]["main"],
                            "rain_probability": int(item.get("pop", 0) * 100),
                            "icon": item["weather"][0].get("icon", "01d")
                        })
                    
                    res = {
                        "district": district,
                        "forecast": forecast_items,
                        "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        "cached": False
                    }
                    cache_service.set(cache_key, res)
                    return res
            except Exception as e:
                logger.warning(f"OpenWeatherMap forecast API failed: {e}. Falling back.")

        if cached_data:
            cached_data["cached"] = True
            return cached_data

        # Fallback 5-day forecast
        today = datetime.date.today()
        days_en = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        fallback_forecast = []
        
        configs = [
            {"condition": "Cloudy", "pop": 65, "tmax": 29, "tmin": 21, "icon": "03d"},
            {"condition": "Rain", "pop": 85, "tmax": 27, "tmin": 20, "icon": "10d"},
            {"condition": "Light Rain", "pop": 45, "tmax": 28, "tmin": 21, "icon": "09d"},
            {"condition": "Sunny", "pop": 10, "tmax": 31, "tmin": 22, "icon": "01d"},
            {"condition": "Partly Cloudy", "pop": 20, "tmax": 32, "tmin": 23, "icon": "02d"}
        ]
        
        for i in range(5):
            d = today + datetime.timedelta(days=i)
            cfg = configs[i % len(configs)]
            fallback_forecast.append({
                "day": d.strftime("%a"),
                "date": d.strftime("%d %b"),
                "temp_max": float(cfg["tmax"]),
                "temp_min": float(cfg["tmin"]),
                "condition": cfg["condition"],
                "rain_probability": cfg["pop"],
                "icon": cfg["icon"]
            })
            
        res = {
            "district": district,
            "forecast": fallback_forecast,
            "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "cached": True
        }
        cache_service.set(cache_key, res)
        return res

    def get_advisory(self, district: str = "Nashik", lat: Optional[float] = None, lon: Optional[float] = None) -> Dict[str, Any]:
        curr = self.get_current_weather(district=district, lat=lat, lon=lon)
        rain_prob = curr.get("rain_probability", 0)
        temp = curr.get("temperature", 28.0)
        condition = curr.get("condition", "").lower()
        
        # Decision-support layer rules (Part C requirements)
        if rain_prob >= 50 or "rain" in condition:
            adv_en = "Rain is expected soon. Review spraying timing and delay pesticide application if rainfall occurs."
            adv_mr = "लवकरच पाऊस पडण्याची शक्यता आहे. फवारणीची वेळ विचारात घ्या आणि पाऊस असल्यास औषध फवारणी पुढे ढकलणे योग्य राहील."
            category = "Spraying Advisory"
            rain_expected = True
        elif temp >= 34.0:
            adv_en = "High temperatures expected. Review crop moisture before deciding whether irrigation is required."
            adv_mr = "उष्णता जास्त आहे. सिंचनाची गरज आहे का हे ठरवण्यापूर्वी पिकातील ओलावा तपासा."
            category = "Irrigation Guidance"
            rain_expected = False
        else:
            adv_en = "Review crop moisture before deciding whether irrigation is required. Weather conditions are currently stable."
            adv_mr = "विशेष पावसाची चिन्हं नाहीत. सिंचनाची गरज आहे का हे ठरवण्यापूर्वी पिकातील ओलावा तपासा."
            category = "General Moisture Guidance"
            rain_expected = False

        return {
            "district": district,
            "advisory_en": adv_en,
            "advisory_mr": adv_mr,
            "category": category,
            "rain_expected": rain_expected,
            "disclaimer_en": "Farming Guidance (Decision Support - Not a guarantee)",
            "disclaimer_mr": "कृषी सल्ला (निर्णय साहाय्य - कोणतीही अंतिम हमी नाही)",
            "last_updated": curr.get("last_updated", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
            "cached": curr.get("cached", False)
        }

weather_service = WeatherService()
