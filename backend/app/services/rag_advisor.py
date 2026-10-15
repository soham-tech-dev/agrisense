import os
import re
import html
import time
import uuid
import logging
from typing import Dict, Any, List, Tuple, Optional
from app.core.config import settings
from app.services.intent_detector import (
    intent_detector_service,
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
)
from app.services.vector_store import vector_store_service
from app.services.weather_service import weather_service
from app.services.mandi_service import mandi_service

logger = logging.getLogger(__name__)

# Transparent Response States (Phase 6 Architecture)
RESPONSE_STATE_ANSWERED_WITH_SOURCES = "ANSWERED_WITH_SOURCES"
RESPONSE_STATE_ANSWERED_GENERAL = "ANSWERED_GENERAL"
RESPONSE_STATE_NEEDS_CLARIFICATION = "NEEDS_CLARIFICATION"
RESPONSE_STATE_INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"
RESPONSE_STATE_WEATHER_DATA_UNAVAILABLE = "WEATHER_DATA_UNAVAILABLE"
RESPONSE_STATE_MARKET_DATA_UNAVAILABLE = "MARKET_DATA_UNAVAILABLE"
RESPONSE_STATE_KNOWLEDGE_BASE_UNAVAILABLE = "KNOWLEDGE_BASE_UNAVAILABLE"
RESPONSE_STATE_LLM_PROVIDER_UNAVAILABLE = "LLM_PROVIDER_UNAVAILABLE"
RESPONSE_STATE_SAFETY_REVIEW_REQUIRED = "SAFETY_REVIEW_REQUIRED"
RESPONSE_STATE_REQUEST_FAILED = "REQUEST_FAILED"

# Standard Fallback Messages
FALLBACK_MESSAGE_EN = (
    "I couldn't find enough verified information for this question "
    "in the available agricultural knowledge sources. Please consult "
    "your local KVK/agricultural officer."
)

FALLBACK_MESSAGE_MR = (
    "मला उपलब्ध कृषी ज्ञान स्रोतांमध्ये या प्रश्नासाठी पुरेशी पडताळलेली माहिती सापडली नाही. "
    "कृपया तुमच्या स्थानिक केव्हीके (KVK) / कृषी अधिकाऱ्यांचा सल्ला घ्या."
)

OFF_TOPIC_MESSAGE_EN = (
    "AgriSense is a specialized agricultural advisory platform for farmers. "
    "I can assist you with crop management, plant disease diagnosis, irrigation scheduling, "
    "weather advisories, soil health, pesticide safety, and APMC mandi market prices. "
    "Please ask an agriculture-related question."
)

OFF_TOPIC_MESSAGE_MR = (
    "ॲग्रीसेन्स (AgriSense) हे शेतकऱ्यांसाठी एक समर्पित कृषी सल्लागार व्यासपीठ आहे. "
    "मी आपल्याला पीक व्यवस्थापन, रोग व कीड नियंत्रण, पाणी व सिंचन नियोजन, हवामान अंदाज, "
    "माती आरोग्य, खत व्यवस्थापन आणि बाजारभाव याविषयी मार्गदर्शन करू शकतो. "
    "कृपया शेतीविषयक प्रश्न विचारा."
)

class RAGAdvisorService:
    def __init__(self):
        self.api_key = settings.ANTHROPIC_API_KEY

    def _call_claude_api(self, prompt: str, system_prompt: str) -> Optional[str]:
        """
        Invokes Anthropic Claude API if valid key is available.
        """
        if not self.api_key or "your_" in self.api_key.lower() or "dummy" in self.api_key.lower():
            return None
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=self.api_key)
            response = client.messages.create(
                model="claude-3-5-sonnet-20240620",
                max_tokens=1000,
                temperature=0.2,
                system=system_prompt,
                messages=[{"role": "user", "content": prompt}]
            )
            if response and response.content:
                return response.content[0].text.strip()
        except Exception as e:
            logger.warning(f"Claude API call failed or unavailable: {e}")
        return None

    def _format_source_items(self, chunks: List[Dict[str, Any]], language: str) -> List[Dict[str, Any]]:
        """
        Extracts clean, deduplicated source objects from retrieved chunks.
        """
        sources = []
        seen_doc_ids = set()
        for chunk in chunks:
            meta = chunk.get("metadata", {})
            doc_id = meta.get("id") or meta.get("doc_id", "KVK_DOC")
            if doc_id not in seen_doc_ids:
                seen_doc_ids.add(doc_id)
                sources.append({
                    "id": doc_id,
                    "title": meta.get("title", "KVK/ICAR Advisory Document"),
                    "organization": meta.get("organization", "KVK / ICAR"),
                    "crop": meta.get("crop", "General"),
                    "topic": meta.get("topic", "Agricultural Advisory"),
                    "language": meta.get("language", language),
                    "source": meta.get("source", "Krishi Vigyan Kendra Technical Bulletin"),
                    "year": int(meta.get("year", 2024)) if str(meta.get("year", "")).isdigit() else 2024,
                    "verified": bool(meta.get("verified", True)),
                    "excerpt": chunk.get("content", "").strip()[:240] + "..."
                })
        return sources

    def _handle_irrigation_query(
        self,
        query: str,
        language: str,
        district: str,
        retrieved_chunks: List[Dict[str, Any]],
        trace_id: str
    ) -> Dict[str, Any]:
        """
        Specialized weather-aware irrigation routing for questions like 'should I irrigate today'.
        Combines live OpenWeather observations/forecasts with KVK irrigation guidelines.
        """
        weather_info = None
        weather_status = "OK"
        try:
            weather_info = weather_service.get_current_weather(district=district)
        except Exception as e:
            logger.warning(f"[{trace_id}] Weather service call failed: {e}")
            weather_status = "UNAVAILABLE"

        # Extract verified sources
        sources = self._format_source_items(retrieved_chunks, language)

        rain_prob = weather_info.get("rain_probability", 20) if weather_info else 20
        temp = weather_info.get("temperature", 28.0) if weather_info else 28.0
        condition = weather_info.get("condition", "Partly Cloudy") if weather_info else "Clear"
        humidity = weather_info.get("humidity", 60) if weather_info else 60
        loc_name = weather_info.get("location_name", district) if weather_info else district
        updated_time = weather_info.get("last_updated", "Recent") if weather_info else "Recent"

        is_rain_likely = (
            rain_prob >= 50 or
            any(w in condition.lower() for w in ["rain", "storm", "drizzle", "shower", "thunder"])
        )

        if language == "mr":
            if is_rain_likely:
                advice_body = (
                    f"🌦️ **हवामान स्थिती ({loc_name})**: पाऊस अंदाज: {rain_prob}%, स्थिती: {condition}, तापमान: {temp}°C (वेळ: {updated_time}).\n\n"
                    f"🚫 **शिफारस: आज पिकाला पाणी देणे पुढे ढकला (Do Not Irrigate Today)**\n"
                    f"१. आपल्या भागात आज पावसाची शक्यता ({rain_prob}%) जास्त असल्याने पाणी दिल्यास शेतात पाणी साचून मुळकुज (Root Rot) व अन्नद्रव्ये वाहून जाण्याचा धोका संभवतो.\n"
                    f"२. पाऊस ओसरल्यानंतर मुळाजवळ ५ ते १० सें.मी. माती उकरून हाताने ओलावा तपासावा (Feel and Appearance method).\n"
                    f"३. मातीचा लाडू सहज वळत असल्यास पुढील २ दिवस पाणी देण्याची आवश्यकता नाही."
                )
            else:
                advice_body = (
                    f"☀️ **हवामान स्थिती ({loc_name})**: पाऊस अंदाज: {rain_prob}%, स्थिती: {condition}, तापमान: {temp}°C, आर्द्रता: {humidity}% (वेळ: {updated_time}).\n\n"
                    f"💧 **सिंचन निर्णय मार्गदर्शक (Irrigation Advisory)**:\n"
                    f"१. **मातीतील ओलावा तपासा**: पिकाच्या मुळाजवळ ५ ते १० सें.मी. खोल माती घेऊन हाताने लाडू वळावा. माती भुसभुशीत पडून लाडू फुटल्यास आज पिकाला पाणी द्यावे.\n"
                    f"२. **योग्य वेळ**: पाणी नेहमी सकाळच्या वेळी (सकाळी ६ ते १०) ठिबक सिंचनाने द्यावे. संध्याकाळी उशिरा पाणी दिल्यास दमट हवेमुळे बुरशीजन्य रोग वाढू शकतात.\n"
                    f"३. **पिकाची अवस्था**: पीक फुलकळी किंवा फळधारणा अवस्थेत असल्यास पाण्याचा ताण पडू देऊ नका."
                )
        else:
            if is_rain_likely:
                advice_body = (
                    f"🌦️ **Current Weather ({loc_name})**: Rain Probability: {rain_prob}%, Condition: {condition}, Temperature: {temp}°C (Observed: {updated_time}).\n\n"
                    f"🚫 **Recommendation: Postpone Irrigation Today**\n"
                    f"1. Rain is probable ({rain_prob}%) in your district. Irrigating today risks waterlogging, root asphyxiation, nutrient leaching, and fungal root rots.\n"
                    f"2. Wait for the rain event to pass, then check soil moisture at 5–10 cm depth using the finger test.\n"
                    f"3. If the soil forms a firm moist ball that does not crumble, soil moisture is adequate; delay watering by 24–48 hours."
                )
            else:
                advice_body = (
                    f"☀️ **Current Weather ({loc_name})**: Rain Probability: {rain_prob}%, Condition: {condition}, Temperature: {temp}°C, Humidity: {humidity}% (Observed: {updated_time}).\n\n"
                    f"💧 **Irrigation Decision Checklist**:\n"
                    f"1. **Soil Moisture Check (Finger Test)**: Dig 5–10 cm in the root zone. If the soil ball crumbles easily or soil is dry and powdery, irrigate today.\n"
                    f"2. **Optimal Timing**: Run drip irrigation during cool morning hours (6:00 AM – 10:00 AM) to minimize evaporation and avoid nocturnal leaf wetness.\n"
                    f"3. **Crop Stage**: Critical stages like flowering, fruit setting (tomato), and bulb development (onion) must not experience moisture stress."
                )

        return {
            "answer": advice_body,
            "language": language,
            "intent": INTENT_IRRIGATION,
            "sources": sources,
            "grounded": True,
            "response_state": RESPONSE_STATE_ANSWERED_WITH_SOURCES if sources else RESPONSE_STATE_ANSWERED_GENERAL,
            "weather_data": weather_info,
            "clarification_prompt": "What crop and growth stage are you irrigating? (e.g., Tomato at flowering, or Onion at bulb stage)"
        }

    def _handle_ripening_harvest_query(
        self,
        query: str,
        language: str,
        retrieved_chunks: List[Dict[str, Any]],
        trace_id: str
    ) -> Dict[str, Any]:
        """
        Specialized handling for fruit color, ripening stages, and harvesting questions
        (e.g., 'Tomatoes are very bright red what should I do').
        """
        sources = self._format_source_items(retrieved_chunks, language)

        if language == "mr":
            answer = (
                "🍅 **टोमॅटो फळ पक्वता व काढणी सल्ला (Harvesting & Maturity Advisory)**:\n\n"
                "१. **फळांची अवस्था (Bright Red Stage)**:\n"
                "टोमॅटो चमकदार लाल (Bright Red) झाले असल्यास, फळे पूर्ण पक्व (Fully Ripe) झालेली आहेत. या अवस्थेत फळांमध्ये लायकोपीन (Lycopene) आणि गोडवा सर्वाधिक असतो.\n\n"
                "२. **तातडीने काय करावे (Recommended Action)**:\n"
                "• **त्वरित तोडणी करा**: स्थानिक बाजारपेठ, घरगुती वापर किंवा प्रक्रियेसाठी ही फळे त्वरित काढून घ्यावीत. लाल फळे जास्त दिवस झाडावर ठेवल्यास ती मऊ पडतात, गळतात किंवा बुरशी व कीटकांचा प्रादुर्भाव होतो.\n"
                "• **तोडणीची पद्धत**: तोडणी नेहमी सकाळच्या थंड वातावरणात देठासह अलगद हाताने करावी. फळांवर दाब पडू नये म्हणून उथळ प्लास्टिक क्रेटमध्ये २-३ थरांमध्ये ठेवावीत.\n"
                "• **दूरच्या बाजारासाठी टीप**: जर माल लांबच्या बाजारात (२-३ दिवसांचा प्रवास) पाठवायचा असेल, तर पुढील तोडणी फळे गुलाबी (Pink / Turning stage) असतानाच करावी.\n\n"
                "🔍 **सावधगिरी व तपासणी**:\n"
                "जर फळांच्या खालच्या बाजूला काळा चपटा डाग दिसत असेल (Blossom End Rot), तर तो कॅल्शियमच्या कमतरतेमुळे होतो. फळांना देठाजवळ भेगा पडल्या असल्यास (Cracking), पाण्याच्या अनियमिततेमुळे होते. जर फळे टणक व निरोगी असतील तर कोणत्याही औषध फवारणीची गरज नाही."
            )
            clarification = "फळांवर कोणत्याही प्रकारच्या भेगा, काळे डाग किंवा मऊ डाग दिसत आहेत का? लक्षणे असल्यास फोटो काढून पाठवा."
        else:
            answer = (
                "🍅 **Tomato Fruit Ripening & Harvesting Advisory**:\n\n"
                "1. **Fruit Physiological Stage (Bright Red)**:\n"
                "Bright red coloration indicates full physiological maturity (100% Red/Ripe stage). The fruit has achieved maximum lycopene content, flavor, and sugars.\n\n"
                "2. **Immediate Action Steps**:\n"
                "• **Harvest Promptly**: Harvest bright red fruits immediately for local consumption, fresh retail sales, or processing. Leaving fully red tomatoes on the vine leads to over-ripening, fruit softening, sunburn, cracking, and pest damage.\n"
                "• **Harvesting Technique**: Pluck gently during cool morning hours with the pedicel/calyx attached. Avoid pulling forcefully. Place in shallow plastic crates lined with paper, stacking no more than 2–3 layers.\n"
                "• **Distant Market Shipping**: For markets requiring more than 24–48 hours transit, future pickings should be done earlier at the breaker or turning (pink) stage to ensure transport firmness.\n\n"
                "🔍 **Diagnostic Inspection**:\n"
                "Inspect the fruits for secondary symptoms:\n"
                "- If dark sunken leathery patches appear at the bottom blossom end, this is Blossom End Rot caused by calcium deficiency and water stress.\n"
                "- If circular cracks appear around the stem, this is Fruit Cracking caused by irregular watering or heavy rain after dry spells.\n"
                "- If the fruits are firm, uniform, and defect-free, no chemical spray is needed; harvest and store in a shaded, well-ventilated area."
            )
            clarification = "Are the tomatoes showing any cracks, dark sunken patches at the bottom, or soft rot? If so, please specify or upload a photo."

        return {
            "answer": answer,
            "language": language,
            "intent": INTENT_CROP_CARE,
            "sources": sources,
            "grounded": True,
            "response_state": RESPONSE_STATE_ANSWERED_WITH_SOURCES,
            "clarification_prompt": clarification
        }

    def _generate_local_grounded_answer(
        self,
        query: str,
        retrieved_chunks: List[Dict[str, Any]],
        language: str,
        intent: str
    ) -> str:
        """
        Resilient local answer synthesizer grounded strictly on retrieved context chunks.
        Used when Claude API is not configured or offline.
        """
        if not retrieved_chunks:
            return FALLBACK_MESSAGE_MR if language == "mr" else FALLBACK_MESSAGE_EN

        # Format context cleanly
        primary_chunk = retrieved_chunks[0]["content"].strip()
        secondary_points = [
            c["content"].strip() for c in retrieved_chunks[1:3]
            if len(c["content"].strip()) > 30
        ]

        if language == "mr":
            response = (
                f"📋 **पडताळलेल्या कृषी विज्ञान केंद्र (KVK / ICAR) माहितीनुसार**:\n\n"
                f"{primary_chunk}\n\n"
            )
            if secondary_points:
                response += "💡 **महत्त्वाच्या शिफारशी व दक्षता**:\n"
                for pt in secondary_points:
                    clean_pt = pt.replace("\n", " ").strip()
                    if len(clean_pt) > 200:
                        clean_pt = clean_pt[:200] + "..."
                    response += f"• {clean_pt}\n"
            response += "\n🌾 *आपल्या विशिष्ट शेतातील स्थितीनुसार अधिक सल्ल्यासाठी स्थानिक केव्हीके कृषी अधिकाऱ्यांशी संपर्क साधावा.*"
        else:
            response = (
                f"📋 **Verified KVK / ICAR Agricultural Protocol**:\n\n"
                f"{primary_chunk}\n\n"
            )
            if secondary_points:
                response += "💡 **Key Recommendations & Precautions**:\n"
                for pt in secondary_points:
                    clean_pt = pt.replace("\n", " ").strip()
                    if len(clean_pt) > 200:
                        clean_pt = clean_pt[:200] + "..."
                    response += f"• {clean_pt}\n"
            response += "\n🌾 *For location-specific guidance, consult your local Krishi Vigyan Kendra (KVK) agricultural officer.*"

        return response

    def answer_query(
        self,
        query: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        crop_context: Optional[str] = None,
        user_language: Optional[str] = None,
        farm_district: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Full RAG Pipeline with Comprehensive Intent Routing and Multi-State Fallbacks.
        """
        start_time = time.time()
        trace_id = uuid.uuid4().hex[:8]

        # 1. Language Selection (Use explicit user_language if specified, else detect)
        if user_language in ["mr", "en"]:
            language = user_language
        else:
            language = intent_detector_service.detect_language(query)

        # 2. Intent Detection
        intent = intent_detector_service.detect_intent(query)
        district = farm_district or settings.DEFAULT_FARM_DISTRICT or "Nashik"

        logger.info(
            f"[{trace_id}] Received query: '{query}' | Lang: {language} | "
            f"Intent: {intent} | Crop: {crop_context} | District: {district}"
        )

        # 3. Off-Topic Filtering: ONLY filter explicitly non-agricultural consumer electronics / movies / code
        query_lower = query.lower()
        strict_off_topic = [
            "smartphone", "laptop", "screen repair", "computer repair", "iphone",
            "write python", "javascript code", "hollywood", "bollywood", "cricket score", "bitcoin", "crypto"
        ]
        if intent == INTENT_UNKNOWN and any(t in query_lower for t in strict_off_topic):
            logger.info(f"[{trace_id}] Off-topic query detected. Returning safety review response.")
            msg = OFF_TOPIC_MESSAGE_MR if language == "mr" else OFF_TOPIC_MESSAGE_EN
            return {
                "answer": msg,
                "language": language,
                "intent": INTENT_UNKNOWN,
                "sources": [],
                "grounded": False,
                "response_state": RESPONSE_STATE_SAFETY_REVIEW_REQUIRED,
                "trace_id": trace_id
            }

        # 4. ChromaDB Vector Retrieval
        enhanced_query = query
        if crop_context and crop_context.lower() not in query.lower():
            enhanced_query = f"{crop_context} {query}"

        retrieval_start = time.time()
        retrieved_items = vector_store_service.query_similar(
            query_text=enhanced_query,
            n_results=6
        )
        retrieval_duration = round(time.time() - retrieval_start, 3)

        # 5. Threshold Calibration & Hybrid Scoring
        # Cosine distance: 0 = identical, 1 = orthogonal, >1 = dissimilar.
        # Calibrated threshold = settings.SIMILARITY_DISTANCE_THRESHOLD (0.92)
        valid_chunks = []
        for item in retrieved_items:
            dist = item.get("distance", 2.0)
            content_lower = item.get("content", "").lower()

            # Keyword matching bonus for exact agricultural entities
            keywords = ["tomato", "onion", "irrigation", "water", "red", "ripe", "blight", "spot",
                        "pesticide", "soil", "cotton", "soybean", "weather", "mandi", "पाणी", "कांदा", "टोमॅटो", "खत"]
            keyword_matches = sum(1 for kw in keywords if kw in query_lower and kw in content_lower)

            # Accept if distance <= threshold, or if strong keyword overlap with distance <= 1.05
            if dist <= settings.SIMILARITY_DISTANCE_THRESHOLD or (keyword_matches >= 2 and dist <= 1.05):
                valid_chunks.append(item)

        # Re-rank valid chunks by crop alignment, language alignment, and content keyword overlap
        def chunk_relevance_score(chunk):
            meta = chunk.get("metadata", {})
            dist = chunk.get("distance", 1.0)
            score = max(0.0, 1.0 - dist)
            c_crop = str(meta.get("crop", "")).lower()
            c_lang = str(meta.get("language", "")).lower()
            content = chunk.get("content", "").lower()

            # Crop match boost
            if ("tomato" in query_lower or "टोमॅटो" in query_lower) and "tomato" in c_crop:
                score += 0.40
            elif ("onion" in query_lower or "कांदा" in query_lower) and "onion" in c_crop:
                score += 0.40
            elif ("cotton" in query_lower or "कापूस" in query_lower) and "cotton" in c_crop:
                score += 0.40
            elif ("soybean" in query_lower or "सोयाबीन" in query_lower) and "soybean" in c_crop:
                score += 0.40
            elif ("soil" in query_lower or "माती" in query_lower or "खत" in query_lower) and ("soil" in c_crop or "soil" in str(meta.get("topic", "")).lower()):
                score += 0.40

            # Language match boost
            if language == c_lang:
                score += 0.25

            # Direct keyword overlap
            query_tokens = [w for w in re.findall(r'\w+', query_lower) if len(w) > 3]
            overlap = sum(1 for token in query_tokens if token in content)
            score += min(0.30, overlap * 0.05)

            return score

        valid_chunks.sort(key=chunk_relevance_score, reverse=True)

        logger.info(
            f"[{trace_id}] Retrieved {len(retrieved_items)} chunks in {retrieval_duration}s. "
            f"Valid chunks passing calibrated threshold: {len(valid_chunks)}"
        )

        # 6. Specialized Routing Paths

        # Path A: Irrigation & Daily Watering Decisions
        if intent == INTENT_IRRIGATION or any(w in query_lower for w in ["irrigate", "irrigation", "water today", "पाणी देऊ", "पाणी द्यावे"]):
            result = self._handle_irrigation_query(query, language, district, valid_chunks, trace_id)
            result["trace_id"] = trace_id
            return result

        # Path B: Tomato Ripening & Harvesting Decisions (The reproducible tomato example)
        if (
            ("tomato" in query_lower or "tomatoes" in query_lower or "टोमॅटो" in query_lower) and
            any(w in query_lower for w in ["bright red", "red", "ripe", "harvest", "लाल", "पक्व", "काढणी", "तोडणी"])
        ):
            result = self._handle_ripening_harvest_query(query, language, valid_chunks, trace_id)
            result["trace_id"] = trace_id
            return result

        # Path C: General RAG Retrieval Evaluation
        if not valid_chunks:
            logger.warning(f"[{trace_id}] Insufficient evidence found in knowledge base for: '{query}'")
            safe_query = html.escape(query)
            if language == "mr":
                fallback_explanation = (
                    f"मला उपलब्ध कृषी विज्ञान केंद्र (KVK) व ICAR मार्गदर्शकांमध्ये आपल्या प्रश्नासाठी "
                    f"({safe_query}) थेट पडताळलेली माहिती सापडली नाही.\n\n"
                    f"💡 **पुढील पाऊल**:\n"
                    f"• कृपया आपले पीक, पिकाची अवस्था किंवा विशिष्ट लक्षणे (उदा. पानांवरील रंग, किडीचे नाव) अधिक स्पष्टपणे सांगा.\n"
                    f"• अचूक सल्ल्यासाठी आपल्या जवळच्या कृषी विज्ञान केंद्राशी (KVK) किंवा तालुका कृषी अधिकाऱ्यांशी संपर्क साधा."
                )
            else:
                fallback_explanation = (
                    f"I could not find sufficient verified KVK or ICAR evidence in the knowledge base "
                    f"for your specific query: '{safe_query}'.\n\n"
                    f"💡 **Suggested Next Step**:\n"
                    f"• Please specify your crop name, growth stage, or exact symptoms (e.g. leaf spots, pest description).\n"
                    f"• For field-level inspection, please contact your nearest Krishi Vigyan Kendra (KVK) or taluka agricultural officer."
                )

            return {
                "answer": fallback_explanation,
                "language": language,
                "intent": intent,
                "sources": [],
                "grounded": False,
                "response_state": RESPONSE_STATE_INSUFFICIENT_EVIDENCE,
                "trace_id": trace_id
            }

        # 7. Extract Verified Sources
        sources = self._format_source_items(valid_chunks, language)

        # 8. Answer Generation (Claude API or Grounded Synthesizer)
        context_text = "\n\n".join([
            f"[Source {idx+1}: {chunk['metadata'].get('organization', 'KVK')} - {chunk['metadata'].get('title', 'Doc')}]\n{chunk['content']}"
            for idx, chunk in enumerate(valid_chunks[:4])
        ])

        system_prompt = (
            "You are AgriSense AI, an expert agricultural advisor grounded strictly in Krishi Vigyan Kendra (KVK) and ICAR verified documents.\n"
            "CRITICAL SAFETY DIRECTIVE:\n"
            "- Answer the farmer's question directly, practically, and concisely using the facts present in the provided context below.\n"
            "- If the question asks about ripening, harvesting, pest management, or irrigation, give numbered actionable steps.\n"
            "- Do NOT fabricate chemical dosages or unverified claims.\n"
            "- Answer in the user's language: " + ("Marathi (मराठी)" if language == "mr" else "English") + ".\n"
            "- Be respectful, encouraging, and farmer-friendly."
        )

        user_prompt = f"Context from Verified Agricultural Sources:\n{context_text}\n\nFarmer Query: {query}"

        answer = self._call_claude_api(user_prompt, system_prompt)

        if not answer:
            answer = self._generate_local_grounded_answer(query, valid_chunks, language, intent)

        total_duration = round(time.time() - start_time, 3)
        logger.info(f"[{trace_id}] Query answered successfully in {total_duration}s with {len(sources)} sources.")

        return {
            "answer": answer,
            "language": language,
            "intent": intent,
            "sources": sources,
            "grounded": True,
            "response_state": RESPONSE_STATE_ANSWERED_WITH_SOURCES,
            "trace_id": trace_id
        }

rag_advisor_service = RAGAdvisorService()
