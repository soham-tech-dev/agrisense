import re
import logging
from typing import Tuple, Set

logger = logging.getLogger(__name__)

# Intent Constants
INTENT_DISEASE = "DISEASE"
INTENT_WEATHER = "WEATHER"
INTENT_IRRIGATION = "IRRIGATION"
INTENT_SPRAYING = "SPRAYING"
INTENT_MANDI = "MANDI"
INTENT_CROP_CARE = "CROP_CARE"
INTENT_SOIL_NUTRITION = "SOIL_NUTRITION"
INTENT_GENERAL_AGRICULTURE = "GENERAL_AGRICULTURE"
INTENT_APP_HELP = "APP_HELP"
INTENT_UNKNOWN = "UNKNOWN"

VALID_INTENTS: Set[str] = {
    INTENT_DISEASE,
    INTENT_WEATHER,
    INTENT_IRRIGATION,
    INTENT_SPRAYING,
    INTENT_MANDI,
    INTENT_CROP_CARE,
    INTENT_SOIL_NUTRITION,
    INTENT_GENERAL_AGRICULTURE,
    INTENT_APP_HELP,
    INTENT_UNKNOWN
}

# Agricultural Crops & Terms for Domain Guardrails
MAHARASHTRA_CROPS = [
    "tomato", "tomatoes", "onion", "onions", "cotton", "soybean", "sugarcane",
    "wheat", "pomegranate", "turmeric", "gram", "chickpea", "maize", "chilli", "chili",
    "टोमॅटो", "कांदा", "कापूस", "सोयाबीन", "ऊस", "गहू", "डाळिंब", "हळद", "हरभरा", "मका", "मिरची"
]

class IntentDetectorService:
    @staticmethod
    def detect_language(text: str) -> str:
        """
        Detects if query is Marathi ('mr') or English ('en').
        Checks for Devanagari characters range (\u0900-\u097F) and Marathi keywords
        written in Latin script.
        """
        if not text or not text.strip():
            return "mr"

        normalized = text.strip()
        devanagari_count = len(re.findall(r'[\u0900-\u097F]', normalized))
        total_letters = len(re.findall(r'[a-zA-Z\u0900-\u097F]', normalized))

        # Mixed-language or Devanagari-heavy text should be treated as Marathi.
        if devanagari_count > 0:
            return "mr"

        if total_letters > 0 and (devanagari_count / total_letters) > 0.2:
            return "mr"

        # Check Marathi words written in Hinglish/Latin script if applicable
        mr_keywords_latin = [
            "paus", "sheti", "kanda", "bajar", "phavarni", "rog", "pani", "tumhi",
            "namaskar", "kheti", "mandi", "acha", "salla", "khatedny"
        ]
        text_lower = normalized.lower()
        if any(w in text_lower for w in mr_keywords_latin):
            return "mr"

        return "en"

    @staticmethod
    def detect_intent(text: str) -> str:
        """
        Detects user intent from query text using calibrated keyword patterns
        and domain categorization.
        """
        if not text or len(text.strip()) == 0:
            return INTENT_UNKNOWN

        query = text.lower().strip()

        # Non-agricultural off-topic check (strictly off-topic consumer electronics / software / entertainment)
        off_topic_keywords = [
            "smartphone", "screen", "laptop", "repair", "computer", "movie",
            "quantum", "code", "programming", "software", "car repair", "bike repair",
            "bitcoin", "crypto", "blockchain", "bollywood", "cricket match"
        ]
        if any(kw in query for kw in off_topic_keywords):
            return INTENT_UNKNOWN

        # 1. Irrigation / Water patterns (Priority check for daily water decisions)
        if any(kw in query for kw in [
            "irrigate", "irrigation", "water", "watering", "drip", "moisture",
            "flood irrigation", "water today", "should i irrigate", "need water",
            "पाणी", "ओलिता", "सिंचन", "ठिबक", "पाणी देणे", "पाणी देऊ", "ओलावा", "सुकी जमीन"
        ]):
            return INTENT_IRRIGATION

        # 2. Weather / Rain patterns
        if any(kw in query for kw in [
            "rain", "rainfall", "weather", "temperature", "humidity", "forecast", "climate", "storm", "hail",
            "पाऊस", "हवामान", "तापमान", "गारा", "वादळ", "ऊन", "ढगाळ", "आर्द्रता"
        ]):
            return INTENT_WEATHER

        # 3. Disease / Pest / Symptoms patterns
        if any(kw in query for kw in [
            "disease", "spot", "spots", "blight", "rot", "yellowing", "fungus", "infection",
            "pest", "caterpillar", "worm", "borer", "thrips", "aphid", "jassid", "whitefly",
            "blossom end rot", "powder", "powdery", "mildew", "rust", "curling", "wilt", "wilting",
            "कीड", "रोग", "ठिपके", "पिवळे", "किडा", "करपा", "सड", "मुळकुज", "मावा", "तुडतुडे",
            "पांढरी माशी", "फुलकिडे", "बोंडअळी", "तांबेरा", "भुरी", "पांढरी बुरशी", "चट्टे", "अळी"
        ]):
            return INTENT_DISEASE

        # 4. Mandi / Price / Market patterns
        if any(kw in query for kw in [
            "price", "mandi", "market", "rate", "bazar", "apmc", "cost", "quintal", "modal price",
            "दर", "भाव", "बाजार", "मंडी", "बाजारभाव", "क्विंटल", "एपीएमसी", "आवक"
        ]):
            return INTENT_MANDI

        # 5. Spraying / Pesticide / Chemical Safety patterns
        if any(kw in query for kw in [
            "spray", "spraying", "pesticide", "fungicide", "insecticide", "chemical", "dose",
            "mancozeb", "waiting period", "phi", "ppe", "protective", "sticker", "precaution",
            "फवारणी", "औषध", "कीटकनाशक", "बुरशीनाशक", "डोस", "प्रतीक्षा कालावधी", "सुरक्षा", "खबरदारी"
        ]):
            return INTENT_SPRAYING

        # 6. Soil / Fertilizer / Nutrient Management patterns
        if any(kw in query for kw in [
            "soil", "fertilizer", "nutrition", "npk", "urea", "dap", "fym", "manure", "vermicompost",
            "zinc", "boron", "compost", "micronutrient", "deficiency", "fertility", "organic matter",
            "माती", "खत", "खते", "युरिया", "शेणखत", "गांडूळ", "सुपीकता", "अन्नद्रव्य", "झिंक", "बोरॉन", "नत्र", "स्फुरद", "पालाश"
        ]):
            return INTENT_SOIL_NUTRITION

        # 7. Crop care, Growth stage, Ripening & Harvesting patterns
        # Note: Bright red tomatoes, fruit maturity, sowing, cultivation, spacing
        if any(kw in query for kw in [
            "bright red", "red tomato", "red tomatoes", "ripe", "ripening", "harvest", "harvesting",
            "pick", "picking", "grow", "growth", "cultivation", "sowing", "plantation", "yield",
            "pruning", "variety", "spacing", "mature", "maturity", "tomato", "tomatoes",
            "लाल टोमॅटो", "पक्व", "काढणी", "तोडणी", "लागवड", "वाढ", "उत्पादन", "छाटणी", "पेरणी"
        ]):
            return INTENT_CROP_CARE

        # 8. App Help / Usage patterns
        if any(kw in query for kw in [
            "app", "help", "how to use", "feature", "account", "settings",
            "ॲप", "मदत", "वापर", "प्रोफाइल"
        ]):
            return INTENT_APP_HELP

        # 9. General Agriculture / Farming patterns
        if any(kw in query for kw in [
            "farm", "farmer", "agriculture", "crop", "seed", "khedut", "krishi",
            "शेती", "शेतकरी", "पिक", "बियाणे", "कृषी"
        ] + MAHARASHTRA_CROPS):
            return INTENT_GENERAL_AGRICULTURE

        # Fallback for unrecognized queries
        return INTENT_UNKNOWN

intent_detector_service = IntentDetectorService()
