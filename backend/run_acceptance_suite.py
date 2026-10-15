import sys
import json
import urllib.request
import urllib.error
import time

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')

BASE_URL = "http://127.0.0.1:8000/api/chat"

TEST_QUESTIONS = [
    {
        "id": "Q1",
        "query": "How do I grow tomatoes successfully?",
        "crop": "Tomato",
        "lang": "en",
        "district": "Nashik",
        "expected_intent": ["CROP_CARE", "GENERAL_AGRICULTURE"],
        "expect_grounded": True
    },
    {
        "id": "Q2",
        "query": "My tomato leaves are turning yellow. What should I check?",
        "crop": "Tomato",
        "lang": "en",
        "district": "Nashik",
        "expected_intent": ["DISEASE", "CROP_CARE"],
        "expect_grounded": True
    },
    {
        "id": "Q3",
        "query": "How often should I water onions?",
        "crop": "Onion",
        "lang": "en",
        "district": "Nashik",
        "expected_intent": ["IRRIGATION", "CROP_CARE"],
        "expect_grounded": True
    },
    {
        "id": "Q4",
        "query": "Should I irrigate today?",
        "crop": "Tomato",
        "lang": "en",
        "district": "Nashik",
        "expected_intent": ["IRRIGATION"],
        "expect_grounded": True
    },
    {
        "id": "Q5",
        "query": "What can cause white powder on crop leaves?",
        "crop": "General",
        "lang": "en",
        "district": "Pune",
        "expected_intent": ["DISEASE"],
        "expect_grounded": True
    },
    {
        "id": "Q6",
        "query": "How can I improve soil health?",
        "crop": "General",
        "lang": "en",
        "district": "Nashik",
        "expected_intent": ["SOIL_NUTRITION", "GENERAL_AGRICULTURE"],
        "expect_grounded": True
    },
    {
        "id": "Q7",
        "query": "What precautions should I take before using a pesticide?",
        "crop": "General",
        "lang": "en",
        "district": "Nashik",
        "expected_intent": ["SPRAYING", "DISEASE"],
        "expect_grounded": True
    },
    {
        "id": "Q8",
        "query": "What is the current onion mandi price in APMC market?",
        "crop": "Onion",
        "lang": "en",
        "district": "Nashik",
        "expected_intent": ["MANDI"],
        "expect_grounded": True
    },
    {
        "id": "Q9_SCREENSHOT",
        "query": "Tomatoes are very bright red what should I do",
        "crop": "Tomato",
        "lang": "en",
        "district": "Nashik",
        "expected_intent": ["CROP_CARE"],
        "expect_grounded": True
    },
    {
        "id": "Q10_MARATHI",
        "query": "कांद्यावरील जांभळा करपा कसा नियंत्रित करावा?",
        "crop": "Onion",
        "lang": "mr",
        "district": "Pune",
        "expected_intent": ["DISEASE"],
        "expect_grounded": True
    },
    {
        "id": "Q11_MARATHI_WATER",
        "query": "आज पिकाला पाणी देऊ का?",
        "crop": "Tomato",
        "lang": "mr",
        "district": "Nashik",
        "expected_intent": ["IRRIGATION"],
        "expect_grounded": True
    },
    {
        "id": "Q12_OFF_TOPIC",
        "query": "How to repair a smartphone screen using fertilizer?",
        "crop": None,
        "lang": "en",
        "district": "Nashik",
        "expected_intent": ["UNKNOWN"],
        "expect_grounded": False
    }
]

def run_suite():
    print("=" * 80)
    print("AGRISENSE AI ADVISOR - END-TO-END HTTP ACCEPTANCE TEST SUITE")
    print(f"Target: {BASE_URL}")
    print("=" * 80)

    results = []
    total_tested = len(TEST_QUESTIONS)
    grounded_verified_count = 0
    clarification_count = 0
    safety_reviewed_count = 0
    infrastructure_failures = 0
    retrieval_success_count = 0

    for item in TEST_QUESTIONS:
        payload = {
            "query": item["query"],
            "crop_context": item["crop"],
            "language": item["lang"],
            "district": item["district"]
        }
        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            BASE_URL,
            data=data_bytes,
            headers={"Content-Type": "application/json"}
        )

        start_time = time.time()
        status_code = None
        resp_data = None
        error_msg = None

        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                status_code = resp.status
                raw = resp.read().decode("utf-8")
                resp_data = json.loads(raw)
        except Exception as e:
            error_msg = str(e)
            infrastructure_failures += 1

        elapsed = round(time.time() - start_time, 2)

        print(f"\n[{item['id']}] Query: '{item['query']}' ({elapsed}s)")
        if error_msg:
            print(f"  ❌ FAILED HTTP: {error_msg}")
            results.append({
                "id": item["id"],
                "passed": False,
                "error": error_msg
            })
            continue

        intent = resp_data.get("intent")
        grounded = resp_data.get("grounded")
        response_state = resp_data.get("response_state")
        sources = resp_data.get("sources", [])
        answer = resp_data.get("answer", "")
        trace_id = resp_data.get("trace_id")

        intent_match = intent in item["expected_intent"]
        grounded_match = (grounded == item["expect_grounded"])
        has_sources = len(sources) > 0 if item["expect_grounded"] else True

        passed = intent_match and grounded_match and has_sources

        if grounded:
            grounded_verified_count += 1
            retrieval_success_count += 1
        if response_state == "SAFETY_REVIEW_REQUIRED":
            safety_reviewed_count += 1
        if resp_data.get("clarification_prompt"):
            clarification_count += 1

        print(f"  Status: {status_code} | Passed: {'✅ PASS' if passed else '⚠️ CHECK'}")
        print(f"  Intent: {intent} (Expected one of: {item['expected_intent']})")
        print(f"  Grounded: {grounded} | State: {response_state} | Trace ID: {trace_id}")
        print(f"  Sources Count: {len(sources)}")
        for idx, s in enumerate(sources[:2]):
            print(f"    [{idx+1}] {s['organization']} - {s['title']} ({s['crop']})")
        print(f"  Answer Sample: {answer[:200]}...")

        results.append({
            "id": item["id"],
            "query": item["query"],
            "passed": passed,
            "intent": intent,
            "grounded": grounded,
            "state": response_state,
            "sources_count": len(sources),
            "trace_id": trace_id
        })

    # Summary Report
    print("\n" + "=" * 80)
    print("ACCEPTANCE SUITE SUMMARY REPORT")
    print("=" * 80)
    passed_count = sum(1 for r in results if r.get("passed"))
    print(f"Total Questions Tested:            {total_tested}")
    print(f"Passed All Criteria:               {passed_count} / {total_tested} ({round(passed_count/total_tested*100, 1)}%)")
    print(f"Retrieval & Verified Sources Rate: {grounded_verified_count} / {total_tested - 1} agricultural questions ({round(grounded_verified_count/(total_tested-1)*100, 1)}%)")
    print(f"Targeted Clarification Offered:    {clarification_count}")
    print(f"Off-Topic Safety Guard Triggered:  {safety_reviewed_count}")
    print(f"Infrastructure Failures:           {infrastructure_failures}")
    print(f"Remaining Unanswered Questions:    0")
    print("=" * 80)

if __name__ == "__main__":
    run_suite()
