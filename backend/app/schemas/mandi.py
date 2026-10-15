from pydantic import BaseModel
from typing import List, Optional

class MandiPrice(BaseModel):
    crop: str
    crop_mr: Optional[str] = None
    market: str
    market_mr: Optional[str] = None
    district: str
    date: str
    min_price: float
    max_price: float
    modal_price: float
    source: str = "Agmarknet / Data.gov.in"
    last_updated: str
    cached: bool = False

class MarketComparisonItem(BaseModel):
    market: str
    market_mr: Optional[str] = None
    district: str
    modal_price: float
    min_price: float
    max_price: float
    variance_from_highest: float
    is_highest: bool = False

class MarketComparisonResponse(BaseModel):
    crop: str
    crop_mr: Optional[str] = None
    date: str
    comparison: List[MarketComparisonItem]
    disclaimer_en: str = "Prices vary based on market arrival. Listed rates are indicative and not guaranteed."
    disclaimer_mr: str = "भाव बाजारातील आवकनुसार बदलू शकतात. दर्शविलेले दर अंतिम हमी नाहीत."
    last_updated: str
    cached: bool = False

class MandiHistoryPoint(BaseModel):
    date: str
    modal_price: float

class MandiHistoryResponse(BaseModel):
    crop: str
    market: str
    history: List[MandiHistoryPoint]
    last_updated: str
    cached: bool = False
