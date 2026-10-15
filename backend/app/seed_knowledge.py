import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.database.session import SessionLocal, engine
from app.database.base import Base
from app.models.knowledge import KnowledgeDocument
from app.services.document_ingestion import document_ingestion_service
from app.services.vector_store import vector_store_service

logger = logging.getLogger(__name__)

SEED_DOCUMENTS: List[Dict[str, Any]] = [
    {
        "id": "icar_tomato_ripening_harvest_001",
        "title": "ICAR Tomato Fruit Ripening Stages, Harvesting & Quality Protocol",
        "organization": "ICAR - Indian Institute of Horticultural Research (IIHR)",
        "crop": "Tomato",
        "topic": "Harvesting & Post-Harvest",
        "language": "en",
        "source": "ICAR Extension Bulletin IIHR/TB/2023-11",
        "year": 2023,
        "version": "2.1",
        "verified": True,
        "content": """
Tomato Ripening Stages and Harvesting Decision Guide:
1. Ripening Stages: Tomatoes progress through distinct physiological stages:
   - Mature Green: Fruit fully developed, jelly formation in seed cavity, no pink coloration.
   - Breaker Stage: First noticeable break in color, showing pink or red on not more than 10% of the surface.
   - Turning Stage: 10% to 30% of surface shows pink or reddish color.
   - Pink Stage: 30% to 60% of surface shows pinkish-red color.
   - Light Red: 60% to 90% of surface shows pinkish-red or red.
   - Red / Fully Ripe: More than 90% of surface is bright red. Fruit has attained maximum lycopene, sugars, and aroma.
2. What to do when tomatoes are very bright red:
   - A bright red tomato is at its full physiological maturity (ripe stage) and must be harvested promptly.
   - For immediate local consumption, retail sales, or culinary processing (puree, sauce), harvest bright red fruits immediately. Leaving bright red tomatoes on the vine leads to over-ripening, fruit softening, pest infestation, and skin cracking.
   - Harvesting Technique: Pluck fruits gently with the pedicel/calyx attached during cool morning hours. Avoid pulling forcefully to prevent bruising or stem tearing. Place in shallow plastic crates lined with paper, stacking no more than 2-3 layers.
   - If shipping to distant markets (more than 24-48 hours transit), future pickings should be done earlier at the breaker or turning stage.
3. Diagnostic Fruit Symptom Inspection:
   - If bright red tomatoes have dark sunken leathery spots at the blossom end (opposite the stem), this is Blossom End Rot caused by calcium deficiency and irregular soil moisture, not an infectious disease.
   - If radial or concentric cracks occur around the stem on bright red fruit, this is Fruit Cracking caused by heavy watering or rainfall following a dry spell. Maintain consistent soil moisture.
   - If pale white or yellow paper-like patches appear on the sun-exposed side of the fruit, this is Sunscald. Maintain adequate leaf canopy foliage.
   - If uniform healthy red skin with firm texture, the fruit is perfectly ripe and ready for picking.
        """
    },
    {
        "id": "kvk_tomato_harvesting_mr_002",
        "title": "टोमॅटो फळ पक्वता, योग्य काढणी व हाताळणी मार्गदर्शक",
        "organization": "केव्हीके नारायणगाव (पुणे) / म.फु.कृ.वि. राहुरी",
        "crop": "Tomato",
        "topic": "काढणी व फळ व्यवस्थापन",
        "language": "mr",
        "source": "केव्हीके तंत्रज्ञान पत्रिका २०२४-०८",
        "year": 2024,
        "version": "1.5",
        "verified": True,
        "content": """
टोमॅटो फळांची पक्वता अवस्था आणि काढणी व्यवस्थापन:
१. टोमॅटो फळे चमकदार लाल (Bright Red) असल्यास काय करावे?
   - टोमॅटो चमकदार लाल रंगाचे झाले असतील, तर फळे पूर्ण पक्व (Fully Ripe) झालेली आहेत. ही फळे तातडीने काढणीस (हार्वेस्टिंग) तयार आहेत.
   - स्थानिक बाजारपेठ, घरगुती वापर किंवा प्रक्रियेसाठी ही फळे उत्तम असतात. अशी फळे जास्त दिवस झाडावर ठेवल्यास फळे मऊ पडतात, गळतात किंवा बुरशी लागून नुकसान होते.
   - काढणीची योग्य पद्धत: टोमॅटोची तोडणी सकाळच्या थंड वातावरणात किंवा संध्याकाळी करावी. देठासह फळे अलगद हाताने तोडावीत. फळांवर दाब पडणार नाही अशा प्लास्टिक क्रेटमध्ये २-३ थरांमध्ये ठेवावीत.
   - दूरच्या बाजारात किंवा लांबच्या प्रवासासाठी पाठवायचे असल्यास, पुढील तोडणी फळे गुलाबी किंवा ब्रेकर (Breaker stage) अवस्थेत असतानाच करावी.
२. फळांवरील लक्षणांची तपासणी:
   - फळांच्या खालच्या बाजूला काळा किंवा चपटा डाग पडला असल्यास, तो कॅल्शियमची कमतरता आणि पाण्याच्या ताणामुळे होणारा 'ब्लॉसम एंड रॉट' (Blossom End Rot) विकार आहे.
   - फळांवर देठाजवळ भेगा पडल्या असल्यास (Cracking), पाण्याचा ताण पडल्यानंतर अचानक जास्त पाणी किंवा पाऊस यामुळे होते. नियमित व समान पाणी द्यावे.
   - जर फळ सर्व बाजूंनी टणक आणि चमकदार लाल असेल, तर कोणतेही औषध फवारण्याची गरज नाही; केवळ योग्य वेळी तोडणी करावी.
        """
    },
    {
        "id": "kvk_irrigation_management_001",
        "title": "KVK Irrigation Scheduling, Soil Moisture Check & Water Management Protocol",
        "organization": "KVK Baramati Agricultural Engineering Division",
        "crop": "All",
        "topic": "Irrigation & Water Management",
        "language": "en",
        "source": "KVK Technical Bulletin 2024-IRR-02",
        "year": 2024,
        "version": "2.0",
        "verified": True,
        "content": """
KVK Comprehensive Irrigation Management & Daily Decision Protocol:
1. Daily Decision: 'Should I irrigate today?'
   Follow the 4-step field checklist before turning on irrigation:
   Step A - Weather Forecast Check:
   - Check local rainfall forecast. If rainfall probability exceeds 50% or forecasted rainfall is greater than 10-15 mm today, postpone irrigation immediately to prevent waterlogging, nutrient leaching, and root asphyxiation.
   - If weather is overcast, cool, or humid (>80% RH), crop evapotranspiration is low; delay watering by 24-48 hours.
   - If hot, windy, and clear (temperatures >32°C), water demand is high; irrigation is likely required.
   Step B - Soil Moisture Finger Test ('Feel and Appearance Method'):
   - Dig 5 to 10 cm deep in the root zone between plants.
   - Squeeze a handful of soil into a ball:
     * If the soil forms a firm moist ball that does not crumble and leaves moisture sheen on fingers, soil moisture is adequate (60-80% field capacity). DO NOT irrigate today.
     * If the soil ball crumbles easily upon slight touch or soil is powdery and dry, moisture is below 50% field capacity. Irrigate today.
   Step C - Critical Crop Growth Stages:
   - Tomato: Flowering and fruit set stages cannot tolerate water stress (causes flower drop and blossom end rot). Provide 25-30 mm water every 4-6 days via drip.
   - Onion: Bulb enlargement is critical. Irrigate every 6-8 days. Stop irrigation 15 days before harvesting to prevent neck rot and improve shelf life.
   - Cotton: Flowering and boll formation stages require optimum moisture. Avoid water stagnation.
   - Soybean: Pod filling stage requires adequate moisture; avoid flood irrigation.
   Step D - Best Irrigation Practices:
   - Always run drip irrigation during early morning hours (6:00 AM to 10:00 AM). Avoid evening watering under humid conditions as wet foliage promotes fungal blights.
        """
    },
    {
        "id": "kvk_irrigation_management_mr_002",
        "title": "कृषी विज्ञान केंद्र सिंचन नियोजन व पाणी व्यवस्थापन मार्गदर्शक",
        "organization": "केव्हीके बारामती / म.फु.कृ.वि. राहुरी",
        "crop": "All",
        "topic": "पाणी व सिंचन व्यवस्थापन",
        "language": "mr",
        "source": "केव्हीके सिंचन पुस्तिका २०२४",
        "year": 2024,
        "version": "2.0",
        "verified": True,
        "content": """
पिकांना पाणी कधी द्यावे? दैनंदिन सिंचन निर्णय मार्गदर्शक:
१. 'आज पिकाला पाणी द्यावे का?' हे ठरवण्यासाठी खालील ४ तपासण्या करा:
   पायरी १ - हवामान आणि पावसाचा अंदाज:
   - जर आज ५०% पेक्षा जास्त पावसाची शक्यता असेल किंवा पाऊस पडण्याची चिन्हे असतील, तर आज पाणी देणे तातडीने पुढे ढकलावे. जास्त पाण्यामुळे मुळे कुजतात (Root Rot) आणि अन्नद्रव्ये वाहून जातात.
   - हवा दमट आणि ढगाळ असल्यास पिकाचे बाष्पीभवन कमी होते, त्यामुळे पाणी देण्याची गरज नसते.
   पायरी २ - मातीतील ओलावा तपासणी (आंगठा व बोटांची पद्धत):
   - पिकाच्या मुळाजवळ ५ ते १० सें.मी. खोल माती हाताने उकरावी.
   - मूठभर माती घेऊन लाडू वळावा:
     * जर मातीचा लाडू सहज बनत असेल आणि बोटांना ओलावा लागत असेल, तर जमिनीत पुरेसा ओलावा आहे. आज पाणी देऊ नका.
     * जर लाडू बनत नसेल, माती भुसभुशीत पडून सुकत असेल, तर आज ठिबक सिंचनाने पाणी द्यावे.
   पायरी ३ - पिकांची संवेदनशील अवस्था:
   - टोमॅटो: फुलकळी आणि फळधारणा अवस्थेत पाण्याचा ताण पडू देऊ नये. ४ ते ६ दिवसांच्या अंतराने ठिबकद्वारे पाणी द्यावे.
   - कांदा: कांदा पोसण्याच्या काळात नियमित पाणी द्यावे. काढणीच्या १५ दिवस आधी पाणी पूर्णपणे बंद करावे.
   - कापूस: पाते लागणे आणि बोंडे भरण्याच्या काळात ओलावा आवश्यक असतो.
   पायरी ४ - योग्य वेळ:
   - पाणी नेहमी सकाळच्या वेळी (सकाळी ६ ते १०) द्यावे. संध्याकाळी उशिरा पाणी दिल्यास जमिनीत दमटपणा वाढून बुरशीजन्य रोगांचा प्रादुर्भाव वाढतो.
        """
    },
    {
        "id": "icar_tomato_001",
        "title": "ICAR Tomato Early Blight, Late Blight & Leaf Spot Protocol",
        "organization": "ICAR Indian Institute of Horticultural Research",
        "crop": "Tomato",
        "topic": "Disease & Pest Management",
        "language": "en",
        "source": "ICAR Technical Monograph 2023",
        "year": 2023,
        "version": "1.0",
        "verified": True,
        "content": """
Tomato Leaf Spot and Blight Diagnosis & Fungicide Protocol:
1. Early Blight (Alternaria solani):
   - Symptoms: Dark brown to black concentric target-board ring spots on older lower leaves, surrounded by yellow halos. Leads to defoliation and sunken stem lesions.
   - Control: Spray Mancozeb 75% WP @ 2.5g/liter or Chlorothalonil 75% WP @ 2g/liter of water at initial appearance. In severe cases, apply Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/liter.
2. Late Blight (Phytophthora infestans):
   - Symptoms: Rapidly enlarging water-soaked pale green to dark brown lesions on leaves and stems. White fluffy fungal down appears on leaf undersides in cool, foggy or rainy weather.
   - Control: Spray Metalaxyl 8% + Mancozeb 64% WP @ 2g/liter or Cymoxanil 8% + Mancozeb 64% WP @ 2g/liter.
3. Cultural Prevention:
   - Avoid overhead sprinkler irrigation to reduce leaf wetness duration. Maintain 60 cm row spacing and stake plants to keep foliage off the soil.
        """
    },
    {
        "id": "kvk_onion_001",
        "title": "KVK Pune Advisory: Onion Leaf Spot & Purple Blotch Management",
        "organization": "KVK Narayangaon (Pune)",
        "crop": "Onion",
        "topic": "Disease & Pest Management",
        "language": "mr",
        "source": "KVK Technical Bulletin 2024-05",
        "year": 2024,
        "version": "1.2",
        "verified": True,
        "content": """
कांदा पिकावरील जांभळा करपा (Purple Blotch) व पिवळेपणा नियंत्रण मार्गदर्शक:
१. जांभळा करपा (Alternaria porri): पानांवर सुरुवातीला लहान, खोलगट, जांभळट रंगाचे ठिपके दिसतात. रोगाचा प्रादुर्भाव वाढल्यास पाने सुकतात आणि कांद्याचा आकार लहान राहतो.
२. उपाययोजना: शेतात पाण्याचा योग्य निचरा ठेवावा. गरजेपेक्षा जास्त नत्रयुक्त (युरिया) खतांचा वापर टाळावा.
३. फवारणी मार्गदर्शन: रोगाची चिन्हे दिसताच मॅन्कोझेब (Mancozeb 75% WP) २.५ ग्रॅम प्रति लिटर पाण्यात मिसळून फवारणी करावी. तीव्र प्रादुर्भावात टेब्युकोनॅझोल (Tebuconazole 25.9% EC) १ मिली प्रति लिटर पाणी या प्रमाणात फवारणी करावी.
४. कांदा पाणी व्यवस्थापन: कांदा वाढीच्या काळात ७ ते १० दिवसांच्या अंतराने पाणी द्यावे. काढणीपूर्वी १५ दिवस आधी पाणी बंद करावे.
        """
    },
    {
        "id": "kvk_onion_002_en",
        "title": "ICAR-DOGR Onion Integrated Disease, Irrigation & Storage Care Guide",
        "organization": "ICAR-DOGR Rajgurunagar (Pune)",
        "crop": "Onion",
        "topic": "Crop Care & Disease",
        "language": "en",
        "source": "ICAR Extension Leaflet No. 42",
        "year": 2024,
        "version": "2.0",
        "verified": True,
        "content": """
Onion Crop Care, Disease Management & Post-Harvest by ICAR-DOGR:
1. Purple Blotch and Stemphylium Blight: Causes small purplish spots on leaves, leading to foliage drying and yield reduction in humid rainy weather.
2. Thrips (Thrips tabaci): Tiny slender insects rasping leaf surface causing silvery patches and curling. Controlled with Profenofos 50% EC @ 1 ml/L or Fipronil 5% SC @ 1.5 ml/L.
3. Soil and Irrigation: Onion requires light to medium well-drained fertile loam soil. Waterlogging leads to basal rot (Fusarium). Irrigate at 7-10 day intervals. Discontinue irrigation 10-15 days prior to harvesting.
4. Curing & Storage: After harvesting, foliage curing under partial shade for 10-15 days is essential to dry the neck completely and prevent fungal rotting during storage.
        """
    },
    {
        "id": "kvk_mandi_weather_001",
        "title": "KVK Agromet Weather & APMC Mandi Price Advisory Guide",
        "organization": "KVK Agromet Advisory Services",
        "crop": "All",
        "topic": "Weather & Mandi",
        "language": "en",
        "source": "District Agromet Bulletin 2024",
        "year": 2024,
        "version": "1.0",
        "verified": True,
        "content": """
KVK Weather & Market Advisory Protocol:
1. Rain & Irrigation Strategy: If rain forecast is above 50% probability or >15mm rain expected today, postpone irrigation and pesticide spraying immediately.
2. Rainy Season Spraying: Always use non-ionic sticker/spreader (0.5 ml/L) when spraying fungicides during cloudy monsoon weather. Do not spray within 3-4 hours of anticipated rain.
3. Mandi Price Discovery: Check daily modal prices at nearest APMC market (Nashik, Lasalgaon, Pune, Solapur, Ahmednagar) before selling produce to private traders.
4. Grading: Grade produce into A, B, and C grades at the farm level to secure premium mandi prices.
        """
    },
    {
        "id": "kvk_mandi_weather_mr_002",
        "title": "कृषी हवामान सल्ला आणि कृषी उत्पन्न बाजार समिती (APMC) बाजारभाव मार्गदर्शक",
        "organization": "केव्हीके कृषी हवामान विभाग / पणन मंडळ महाराष्ट्र",
        "crop": "All",
        "topic": "हवामान व बाजारभाव",
        "language": "mr",
        "source": "महाराष्ट्र कृषी पणन मंडळ बुलेटिन २०२४",
        "year": 2024,
        "version": "1.0",
        "verified": True,
        "content": """
हवामान सल्ला आणि बाजारभाव मार्गदर्शन:
१. पाऊस व फवारणी नियोजन: आज ५०% पेक्षा जास्त पावसाची शक्यता असल्यास कोणत्याही पिकावर महागडी औषधे फवारू नका आणि पिकाला पाणी देणे टाळा.
२. फवारणीत स्टिकरचा वापर: पावसाळी हवेत किंवा ढगाळ वातावरणात बुरशीनाशक फवारताना नेहमी ०.५ मिली प्रति लिटर चांगल्या दर्जाचे स्टिकर (चिकटणारा द्रव) वापरावे.
३. कृषी उत्पन्न बाजार समिती (APMC) भाव: लासलगाव, पिंपळगाव, नाशिक किंवा पुणे बाजार समित्यांमधील दैनिक आवक आणि सरासरी (Modal) बाजारभाव तपासूनच शेतमाल विक्रीचा निर्णय घ्यावा.
४. प्रतवारी (Grading): शेतातच शेतमालाची गुणवत्ता व आकारानुसार प्रतवारी करून बाजारात नेल्यास १५ ते २० टक्के जास्त दर मिळतो.
        """
    },
    {
        "id": "icar_cotton_ipm_001",
        "title": "ICAR-CICR Cotton IPM, Sucking Pests & Pink Bollworm Advisory",
        "organization": "ICAR-Central Institute for Cotton Research (CICR) Nagpur",
        "crop": "Cotton",
        "topic": "Pest & Disease Management",
        "language": "en",
        "source": "CICR Technical Bulletin No. 58",
        "year": 2024,
        "version": "2.0",
        "verified": True,
        "content": """
Cotton Integrated Pest Management (IPM) by ICAR-CICR Nagpur:
1. Sucking Pests (Aphids, Jassids, Thrips, Whitefly):
   - Jassid symptoms: Marginal yellowing, downward curling of leaves ('hopper burn').
   - Whitefly symptoms: Chlorotic patches and sooty mold growth due to honeydew excretion.
   - Management: Install yellow sticky traps (10 per acre). Spray 5% Neem Seed Kernel Extract (NSKE) or Azadirachtin 1500 ppm @ 5 ml/liter. If pest crosses Economic Threshold Level (ETL: 2 jassids/leaf or 6-8 whiteflies/leaf), apply Flonicamid 50 WG @ 0.3g/L or Diafenthiuron 50 WP @ 1.2g/L.
2. Pink Bollworm (Pectinophora gossypiella):
   - Monitoring: Install pheromone traps with gossyplure @ 5 traps/acre at 45 days after sowing.
   - ETL: Catch of 8 moths per trap per day for 3 consecutive days or 10% rosette flowers.
   - Control: Release Trichogramma bactrae egg parasitoid @ 60,000/acre. Spray Profenofos 50% EC @ 2 ml/L or Chlorantraniliprole 18.5% SC @ 0.3 ml/L during squaring to boll formation.
3. Moisture Management: Cotton requires well-drained black soil. Waterlogging induces square and flower drop.
        """
    },
    {
        "id": "kvk_cotton_ipm_mr_002",
        "title": "कापूस रसशोषक किडी आणि गुलाबी बोंडअळी एकात्मिक व्यवस्थापन",
        "organization": "केव्हीके जळगाव / केंद्रीय कापूस संशोधन संस्था (CICR) नागपूर",
        "crop": "Cotton",
        "topic": "कीड व्यवस्थापन",
        "language": "mr",
        "source": "कापूस कीड सल्ला २०२४",
        "year": 2024,
        "version": "2.0",
        "verified": True,
        "content": """
कापूस पिकावरील किडींचे एकात्मिक व्यवस्थापन:
१. रसशोषक किडी (मावा, तुडतुडे, पांढरी माशी, फुलकिडे):
   - लक्षणे: तुडतुड्यांमुळे पाने कडेने पिवळी पडून खालच्या बाजूस वाकतात (हॉपर बर्न). पांढऱ्या माशीमुळे पानांवर चिकटा पडून काळी बुरशी वाढते.
   - नियंत्रण: एकरी १० पिवळे व निळे चिकट सापळे लावावेत. सुरुवातीला निंबोळी अर्क ५% किंवा अझाडिरॅक्टिन १५०० पीपीएम ५ मिली/लिटर फवारावे. प्रादुर्भाव वाढल्यास फ्लोनिकॅमिड ५० डब्ल्यूजी ०.३ ग्रॅम किंवा डायाफेन्थिरॉन १.२ ग्रॅम प्रति लिटर पाणी फवारावे.
२. गुलाबी बोंडअळी नियंत्रण:
   - शेतात एकरी ५ कामगंध सापळे (Pheromone Traps) लावावेत.
   - सलग ३ दिवस सापळ्यात प्रति सापळा ८ पतंग आढळल्यास किंवा १०% फुले प्रादुर्भावग्रस्त असल्यास फवारणी करावी.
   - उपाय: प्रोफेनोफॉस ५०% ईसी २ मिली किंवा क्लोरॅन्ट्रीनिलीप्रोल ०.३ मिली प्रति लिटर पाण्यात मिसळून फवारणी करावी.
        """
    },
    {
        "id": "icar_soybean_practices_001",
        "title": "ICAR-IISR Soybean Cultivation, Rust & Yellow Mosaic Management",
        "organization": "ICAR - Indian Institute of Soybean Research (IISR) Indore",
        "crop": "Soybean",
        "topic": "Disease & Pest Management",
        "language": "en",
        "source": "IISR Extension Bulletin 2024",
        "year": 2024,
        "version": "1.8",
        "verified": True,
        "content": """
Soybean Disease and Crop Management by ICAR-IISR:
1. Soybean Rust (Phakopsora pachyrhizi):
   - Symptoms: Minute brown to dark brown pustules on the lower surface of leaves. Rapid foliage yellowing and premature leaf fall.
   - Control: Spray Hexaconazole 5% EC @ 1 ml/liter or Tebuconazole 25.9% EC @ 1.25 ml/liter or Propiconazole 25% EC @ 1 ml/liter of water at first symptom notice.
2. Yellow Mosaic Virus:
   - Transmitted by whitefly vector (Bemisia tabaci). Leaves display irregular bright yellow and green mosaic patches.
   - Control: Rogue out and destroy early infected plants. Control whiteflies by spraying Thiamethoxam 25% WG @ 0.3g/L or Acetamiprid 20% SP @ 0.2g/L.
3. Pod Borer / Spodoptera:
   - Spray Chlorantraniliprole 18.5% SC @ 0.3 ml/L or Emamectin Benzoate 5% SG @ 0.4g/L at flowering to pod filling stage.
4. Drainage: Soybean cannot tolerate water stagnation for more than 48 hours. Ensure surface drainage furrows (broad bed furrow system).
        """
    },
    {
        "id": "kvk_soybean_mr_002",
        "title": "सोयाबीन पिवळा मोझॅक, तांबेरा व कीड व्यवस्थापन मार्गदर्शक",
        "organization": "केव्हीके धुळे / व.ना.म.कृ.वि. परभणी",
        "crop": "Soybean",
        "topic": "रोग व कीड व्यवस्थापन",
        "language": "mr",
        "source": "सोयाबीन पीक सल्ला २०२४",
        "year": 2024,
        "version": "1.4",
        "verified": True,
        "content": """
सोयाबीन पिकावरील रोग व कीड नियंत्रण:
१. तांबेरा रोग (Soybean Rust):
   - लक्षणे: पानांच्या खालच्या बाजूला बारीक तपकिरी रंगाचे पुरळ (ठिपके) दिसतात. पाने पिवळी पडून अकाली गळतात.
   - उपाय: हेक्झाकोनॅझोल ५% ईसी १ मिली किंवा टेब्युकोनॅझोल १.२५ मिली प्रति लिटर पाण्यात मिसळून तात्काळ फवारणी करावी.
२. पिवळा मोझॅक (Yellow Mosaic Virus):
   - लक्षणे: पानांवर पिवळे व हिरवे चट्टे दिसतात. हा विषाणू पांढऱ्या माशीमुळे पसरतो.
   - उपाय: बाधित रोपे उपटून नष्ट करावीत. पांढऱ्या माशीच्या नियंत्रणासाठी थायामेथोक्झाम २५% डब्ल्यूजी ०.३ ग्रॅम किंवा ॲसिटामिप्रीड ०.२ ग्रॅम/लिटर फवारावे.
३. पाणी निचरा: सोयाबीन पिकात पाणी साचून राहिल्यास मुळे सडतात, त्यामुळे शेतात पाण्याचा योग्य निचरा ठेवावा.
        """
    },
    {
        "id": "kvk_soil_fertility_nutrition_001",
        "title": "KVK Soil Health, Organic Matter, Balanced NPK & Micronutrient Management",
        "organization": "KVK Narayangaon Soil Science Technical Division",
        "crop": "All",
        "topic": "Soil Health & Nutrient Management",
        "language": "en",
        "source": "KVK Soil Management Series 2024",
        "year": 2024,
        "version": "1.0",
        "verified": True,
        "content": """
Soil Health, Fertility and Balanced Crop Nutrition by KVK:
1. Soil Health Improvement:
   - Add well-decomposed Farm Yard Manure (FYM) @ 10-12 tonnes/hectare or Vermicompost @ 2.5-3 tonnes/hectare before sowing to build organic carbon.
   - Practice green manuring with Sunn hemp or Dhaincha once every 3 years.
   - Soil testing should be performed every 2-3 years to determine soil pH, electrical conductivity, and available N-P-K.
2. Balanced Fertilizer Strategy:
   - Avoid excessive urea (nitrogen) application as it promotes succulent vegetative growth vulnerable to fungal diseases and sucking pests.
   - Apply Phosphatic and Potassic fertilizers as basal doses at planting.
3. Micronutrient Deficiency Diagnosis and Remedies:
   - Zinc Deficiency: Whitish-yellow bands on leaves, interveinal chlorosis, stunted bushy nodes. Remedy: Soil application of Zinc Sulphate @ 25 kg/ha or foliar spray of ZnSO4 @ 5g/liter.
   - Boron Deficiency: Brittle curled leaves, internal browning in cauliflower, hollow stem, fruit cracking in tomato. Remedy: Foliar spray of Solubor (Boron 20%) @ 1g/liter.
   - Iron Deficiency: Complete yellowing/bleaching of young emergent leaves in calcareous soils (high lime). Remedy: Foliar spray of Ferrous Sulphate @ 5g/L + Citric acid @ 1g/L.
        """
    },
    {
        "id": "kvk_soil_fertility_mr_002",
        "title": "माती आरोग्य, सेंद्रिय खते आणि सूक्ष्म अन्नद्रव्य व्यवस्थापन",
        "organization": "केव्हीके नारायणगाव माती विज्ञान विभाग",
        "crop": "All",
        "topic": "माती व खत व्यवस्थापन",
        "language": "mr",
        "source": "केव्हीके माती परीक्षण मार्गदर्शक २०२४",
        "year": 2024,
        "version": "1.0",
        "verified": True,
        "content": """
माती आरोग्य आणि संतुलित खत व्यवस्थापन:
१. जमिनीची सुपीकता कशी वाढवावी?
   - पेरणीपूर्वी एकरी ४ ते ५ टन चांगले कुजलेले शेणखत किंवा १ ते १.५ टन गांडूळ खत जमिनीत मिसळावे.
   - ताग किंवा धैंचा यासारखी हिरवळीची खते जमिनीत गाडल्याने सेंद्रिय कर्ब (Organic Carbon) वाढतो.
   - दर २ ते ३ वर्षांनी माती परीक्षण करून त्यानुसारच रासायनिक खतांची मात्रा ठरवावी.
२. खतांचा संतुलित वापर:
   - केवळ युरिया खताचा अतिरेकी वापर टाळावा. युरिया जास्त दिल्यास पिकाची फक्त पाने वाढतात आणि किडी-रोगांचा प्रादुर्भाव वाढतो.
   - स्फुरद (Phosphorus) आणि पालाश (Potash) खते पायाभूत खत म्हणून पेरणीवेळी द्यावीत.
३. सूक्ष्म अन्नद्रव्ये कमतरता व उपाय:
   - जस्त (Zinc) कमतरता: पानांच्या शिरांमधील भाग पिवळा पडतो. उपाय: झिंक सल्फेट ५ ग्रॅम प्रति लिटर पाण्यात मिसळून फवारावे.
   - बोरॉन (Boron) कमतरता: फळांना तडे जाणे (Fruit Cracking), फुले गळणे. उपाय: बोरॉन (२०%) १ ग्रॅम प्रति लिटर पाणी फवारावे.
        """
    },
    {
        "id": "cibrc_pesticide_safety_001",
        "title": "CIBRC Statutory Pesticide Safety, PPE & Pre-Harvest Interval (PHI) Regulations",
        "organization": "Central Insecticides Board & Registration Committee (CIBRC), Govt of India",
        "crop": "All",
        "topic": "Safety & Chemical Advisory",
        "language": "en",
        "source": "CIBRC Safe Use Manual 2024",
        "year": 2024,
        "version": "3.0",
        "verified": True,
        "content": """
CIBRC Statutory Safe Pesticide Handling and Pre-Harvest Interval (PHI) Protocols:
1. Personal Protective Equipment (PPE):
   - Mandatory PPE: Wear full-sleeve overalls, rubber gloves, protective face mask/respirator, eye goggles, and gumboots when mixing and spraying agrochemicals.
   - Never eat, drink, or smoke during pesticide preparation or spraying.
   - Wash hands and face thoroughly with soap and water after application.
2. Safe Spraying Techniques:
   - Never spray against the wind direction to avoid chemical inhalation and skin drift.
   - Do not spray during the heat of midday (11:00 AM to 3:00 PM) or when wind speed exceeds 15 km/h.
   - Calibrate spray nozzles to ensure uniform droplet delivery without runoff.
3. Pre-Harvest Interval (PHI / Waiting Period):
   - PHI is the statutory minimum number of days that must elapse between the last pesticide spray and harvest of the crop.
   - Harvesting crops before the PHI expires results in toxic pesticide residues exceeding Maximum Residue Limits (MRL), endangering consumer safety and leading to APMC mandi rejections.
   - Typical PHI examples: Mancozeb (7-10 days on vegetables), Chlorantraniliprole (3 days on tomato), Emamectin Benzoate (3-5 days), Propiconazole (15-20 days on cereals).
4. Container Disposal:
   - Perform triple rinsing of empty pesticide containers into the spray tank, puncture the container bottom to prevent reuse, and bury safely in designated pits away from water sources.
        """
    },
    {
        "id": "cibrc_pesticide_safety_mr_002",
        "title": "कीटकनाशक सुरक्षित वापर, सुरक्षा साधने आणि काढणी पूर्व प्रतीक्षा कालावधी",
        "organization": "केंद्रीय कीटकनाशक मंडळ आणि नोंदणी समिती (CIBRC) / कृषी विभाग महाराष्ट्र",
        "crop": "All",
        "topic": "सुरक्षा व फवारणी नियम",
        "language": "mr",
        "source": "कीटकनाशक सुरक्षित वापर नियमावली २०२४",
        "year": 2024,
        "version": "3.0",
        "verified": True,
        "content": """
कीटकनाशके व बुरशीनाशके फवारताना घ्यावयाची सुरक्षा खबरदारी:
१. वैयक्तिक सुरक्षा साधने (PPE):
   - फवारणी करताना तोंडाला मास्क, डोळ्यांवर चष्मा, रबरी हातमोजे आणि पायात गमबूट घालणे अत्यंत आवश्यक आहे.
   - फवारणी करताना किंवा औषध तयार करताना तंबाखू, विडी ओढू नये किंवा अन्न खाऊ नये.
   - फवारणी पूर्ण झाल्यावर अंगावरील कपडे धुवावेत आणि साबणाने स्वच्छ आंघोळ करावी.
२. फवारणीची योग्य दिशा व वेळ:
   - वाऱ्याच्या विरुद्ध दिशेने कधीही फवारणी करू नका. वारा ज्या दिशेला वाहत आहे, त्याच दिशेने पुढे जात फवारणी करावी.
   - भर उन्हात (दुपारी १२ ते ३) फवारणी करू नका. सकाळच्या वेळी किंवा शांत हवेत संध्याकाळी फवारणी करावी.
३. काढणी पूर्व प्रतीक्षा कालावधी (Pre-Harvest Interval - PHI):
   - औषध फवारल्यापासून शेतमालाची तोडणी करेपर्यंत ठराविक दिवस थांबावे लागते, त्याला 'प्रतीक्षा कालावधी' (Waiting Period) म्हणतात.
   - प्रतीक्षा कालावधी संपण्यापूर्वी भाजीपाला किंवा फळे तोडल्यास त्यावर घातक रासायनिक अंश राहतात, ज्यामुळे ग्राहकांच्या आरोग्यास धोका होतो आणि बाजारात माल नाकारला जाऊ शकतो.
   - टोमॅटो आणि भाजीपाल्यावर कमी प्रतीक्षा कालावधी (३ ते ५ दिवस) असणारी शिफारशीत औषधेच वापरावीत.
        """
    },
    {
        "id": "icar_wheat_sugarcane_practices_001",
        "title": "ICAR Wheat Rust Management and Sugarcane Trash Mulching Advisory",
        "organization": "ICAR - Indian Institute of Sugarcane Research & IIWBR",
        "crop": "Wheat / Sugarcane",
        "topic": "Cultivation & Crop Care",
        "language": "en",
        "source": "ICAR Package of Practices 2024",
        "year": 2024,
        "version": "1.0",
        "verified": True,
        "content": """
Wheat and Sugarcane Crop Practices by ICAR:
1. Wheat Rust Management:
   - Brown / Leaf Rust (Puccinia triticina) and Yellow / Stripe Rust (Puccinia striiformis).
   - Control: Spray Propiconazole 25% EC @ 1 ml/liter of water at first symptom appearance. Ensure timely sowing in November to escape high temperature rust pressure.
   - Critical Irrigation: Crown Root Initiation (CRI) stage at 20-25 days after sowing is the most critical stage for wheat watering.
2. Sugarcane Trash Mulching & Moisture Conservation:
   - Retain sugarcane trash (5 tonnes/ha) in alternate rows as mulch to conserve soil moisture, suppress weeds, and regulate soil temperature.
   - Stem Borer control: Release Trichogramma chilonis egg parasitoids @ 50,000 per hectare at 10-day intervals from 45 to 120 days of crop age.
        """
    }
]

def seed_knowledge_base(force_reseed: bool = False) -> Dict[str, Any]:
    """
    Seeds initial and comprehensive KVK and ICAR documents into SQLite and ChromaDB vector store.
    If force_reseed is True, updates existing document records and reindexes vector chunks.
    """
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    total_docs = len(SEED_DOCUMENTS)
    indexed_docs = 0
    total_chunks = 0
    errors = []

    try:
        for doc_info in SEED_DOCUMENTS:
            doc_id = doc_info["id"]
            existing = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == doc_id).first()

            if existing and not force_reseed:
                logger.info(f"Document {doc_id} already exists in DB. Skipping.")
                continue

            metadata = {
                "id": doc_id,
                "title": doc_info["title"],
                "organization": doc_info["organization"],
                "crop": doc_info["crop"],
                "topic": doc_info["topic"],
                "language": doc_info["language"],
                "source": doc_info["source"],
                "year": doc_info["year"],
                "version": doc_info["version"],
                "verified": doc_info["verified"]
            }

            if not existing:
                doc = KnowledgeDocument(
                    id=doc_id,
                    title=doc_info["title"],
                    organization=doc_info["organization"],
                    crop=doc_info["crop"],
                    topic=doc_info["topic"],
                    language=doc_info["language"],
                    source=doc_info["source"],
                    year=doc_info["year"],
                    version=doc_info["version"],
                    verified=doc_info["verified"]
                )
                db.add(doc)
            else:
                doc = existing
                doc.title = doc_info["title"]
                doc.organization = doc_info["organization"]
                doc.crop = doc_info["crop"]
                doc.topic = doc_info["topic"]
                doc.language = doc_info["language"]
                doc.source = doc_info["source"]
                doc.year = doc_info["year"]
                doc.version = doc_info["version"]
                doc.verified = doc_info["verified"]
                # Delete old chunks from ChromaDB before reindexing
                vector_store_service.delete_document_chunks(doc_id)

            db.commit()

            # Process & Index into ChromaDB
            try:
                chunk_count, summary = document_ingestion_service.process_and_index_document(
                    doc_id=doc.id,
                    file_path=None,
                    doc_metadata=metadata,
                    raw_text_content=doc_info["content"]
                )
                doc.chunk_count = chunk_count
                doc.content_summary = summary
                db.commit()
                indexed_docs += 1
                total_chunks += chunk_count
                logger.info(f"Indexed document {doc.title} ({doc.id}) with {chunk_count} chunks.")
            except Exception as e:
                err_msg = f"Failed to index document {doc_id}: {str(e)}"
                logger.error(err_msg)
                errors.append(err_msg)

    except Exception as e:
        logger.error(f"Error seeding knowledge base: {e}")
        db.rollback()
        errors.append(str(e))
    finally:
        db.close()

    summary_result = {
        "total_seed_documents": total_docs,
        "indexed_or_updated": indexed_docs,
        "total_chunks_added": total_chunks,
        "errors": errors
    }
    logger.info(f"Knowledge Base seeding complete: {summary_result}")
    return summary_result

if __name__ == "__main__":
    import sys
    force = "--force" in sys.argv
    res = seed_knowledge_base(force_reseed=force)
    print(res)
