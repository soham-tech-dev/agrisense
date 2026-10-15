import pytest
from app.services.intent_detector import intent_detector_service
from app.services.rag_advisor import rag_advisor_service

def test_language_detection():
    # Devanagari text should be detected as Marathi ('mr')
    assert intent_detector_service.detect_language("माझ्या कांद्याला रोग झाला आहे") == "mr"
    assert intent_detector_service.detect_language("आज पाऊस पडेल का?") == "mr"
    
    # English text should be detected as English ('en')
    assert intent_detector_service.detect_language("Will it rain today in Nashik?") == "en"
    assert intent_detector_service.detect_language("What is the market price of onion?") == "en"

def test_rag_advisor_bilingual_marathi():
    # Marathi query with explicit user_language='mr'
    res = rag_advisor_service.answer_query(
        query="कांद्यावरील करपा रोगासाठी कोणती फवारणी करावी?",
        user_language="mr"
    )
    assert res["language"] == "mr"
    assert isinstance(res["answer"], str)
    assert len(res["answer"]) > 0

def test_rag_advisor_bilingual_english():
    # English query with explicit user_language='en'
    res = rag_advisor_service.answer_query(
        query="What spraying is recommended for purple blotch disease in onion?",
        user_language="en"
    )
    assert res["language"] == "en"
    assert isinstance(res["answer"], str)
    assert len(res["answer"]) > 0

def test_language_override():
    # Test user explicit language override
    res_mr = rag_advisor_service.answer_query(
        query="Should I irrigate today?",
        user_language="mr"
    )
    assert res_mr["language"] == "mr"

    res_en = rag_advisor_service.answer_query(
        query="माझ्या कांद्याला रोग झाला आहे",
        user_language="en"
    )
    assert res_en["language"] == "en"
