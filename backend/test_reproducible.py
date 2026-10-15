import sys
import json
import io

# Ensure UTF-8 output on Windows consoles
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from app.services.rag_advisor import rag_advisor_service

def run_tests():
    test_queries = [
        {
            "query": "Tomatoes are very bright red what should I do",
            "crop": "Tomato",
            "lang": "en"
        },
        {
            "query": "should I irrigate today",
            "crop": "Tomato",
            "lang": "en"
        },
        {
            "query": "How do I grow tomatoes successfully?",
            "crop": "Tomato",
            "lang": "en"
        },
        {
            "query": "कांद्यावरील जांभळा करपा कसा नियंत्रित करावा?",
            "crop": "Onion",
            "lang": "mr"
        },
        {
            "query": "What can cause white powder on crop leaves?",
            "crop": "General",
            "lang": "en"
        },
        {
            "query": "How can I improve soil health?",
            "crop": "General",
            "lang": "en"
        },
        {
            "query": "What precautions should I take before using a pesticide?",
            "crop": "General",
            "lang": "en"
        },
        {
            "query": "How to repair a smartphone screen using fertilizer?",
            "crop": None,
            "lang": "en"
        }
    ]

    print("=" * 80)
    print("AGRISENSE AI ADVISOR - REPRODUCIBLE EVALUATION RUN")
    print("=" * 80)

    for item in test_queries:
        q = item["query"]
        print(f"\nQUERY: '{q}'")
        res = rag_advisor_service.answer_query(
            query=q,
            crop_context=item["crop"],
            user_language=item["lang"]
        )
        print(f"Intent: {res.get('intent')}")
        print(f"Grounded: {res.get('grounded')}")
        print(f"Response State: {res.get('response_state')}")
        print(f"Trace ID: {res.get('trace_id')}")
        print(f"Sources Count: {len(res.get('sources', []))}")
        if res.get('sources'):
            for idx, s in enumerate(res['sources']):
                print(f"  [{idx+1}] {s['organization']} - {s['title']} ({s['crop']})")
        print(f"Answer Preview:\n{res.get('answer')[:350]}...")
        print("-" * 80)

if __name__ == "__main__":
    run_tests()
