from fastapi import APIRouter, Query
from typing import List, Optional, Dict, Any
from app.schemas.mandi import MandiPrice, MarketComparisonResponse, MandiHistoryResponse
from app.services.mandi_service import mandi_service

router = APIRouter()

@router.get("/prices", response_model=List[MandiPrice])
def get_mandi_prices(
    crop: Optional[str] = Query(None, description="Crop name e.g. Onion"),
    market: Optional[str] = Query(None, description="Market name e.g. Lasalgaon"),
    district: Optional[str] = Query(None, description="District e.g. Nashik")
):
    """
    Get live/cached mandi commodity prices from Agmarknet / Data.gov.in API.
    """
    return mandi_service.get_prices(crop=crop, market=market, district=district)

@router.get("/markets", response_model=List[Dict[str, Any]])
def get_mandi_markets():
    """
    Get available APMC markets list.
    """
    return mandi_service.get_markets()

@router.get("/crops", response_model=List[Dict[str, Any]])
def get_mandi_crops():
    """
    Get available agricultural commodities list.
    """
    return mandi_service.get_crops()

@router.get("/history", response_model=MandiHistoryResponse)
def get_mandi_history(
    crop: str = Query("Onion", description="Crop name"),
    market: str = Query("Lasalgaon", description="Market APMC name"),
    days: int = Query(7, description="Number of historical days")
):
    """
    Get price trends & historical prices for a crop and market.
    """
    return mandi_service.get_history(crop=crop, market=market, days=days)

@router.get("/compare", response_model=MarketComparisonResponse)
def compare_market_prices(
    crop: str = Query("Onion", description="Crop name to compare across markets")
):
    """
    Compare modal rates across multiple APMC markets for a selected crop.
    Includes explicit disclaimer that rates are non-guaranteed.
    """
    return mandi_service.get_market_comparison(crop=crop)
