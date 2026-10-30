import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.auth.jwt import get_current_user
from app.models.user import User
from app.models.disease import DiseaseCatalog, DiseaseScan
from app.schemas.disease import (
    DiseaseCatalogOut,
    DiseasePredictResponse,
    DiseaseScanOut,
    DiseaseFeedbackCreate,
    DiseaseFeedbackOut
)
from app.services.image_validation_service import ImageValidationService, ImageValidationError
from app.services.disease_ml_service import DiseaseMLService

router = APIRouter()

# Directory for storing uploaded crop scan images
STATIC_SCANS_DIR = os.path.join("static", "scans")
os.makedirs(STATIC_SCANS_DIR, exist_ok=True)

# Full 17-class PlantVillage + local Maharashtra crops catalog
DEFAULT_DISEASES = [
    {
        "id": "tomato_early_blight",
        "crop": "Tomato",
        "name_en": "Tomato Early Blight (Alternaria solani)",
        "name_mr": "टोमॅटो अर्ली ब्लाइट (करपा)",
        "symptoms_en": "Dark brown spots with concentric rings target board pattern on mature leaves, leaf yellowing and premature leaf drop.",
        "symptoms_mr": "जुन्या पानांवर रिंगसारखे तपकिरी डाग, पाने पिवळी पडणे आणि गळणे.",
        "advisory_en": "Apply Copper Oxychloride or Mancozeb sprays at 7-10 day intervals. Remove and destroy infected lower leaves. Ensure adequate row spacing for ventilation.",
        "advisory_mr": "कॉपर ऑक्सिक्लोराईड किंवा मॅन्कोझेब २.५ ग्रॅम/लीटर फवारणी करा. संक्रमित खालची पाने काढून नष्ट करा.",
        "prevention_en": "Use certified disease-free seeds, follow crop rotation with non-solanaceous crops, avoid overhead irrigation.",
        "prevention_mr": "प्रमाणित बियाणे वापरा, पिकांची फेरपालट करा, वरून पाणी देणे टाळा.",
        "source": "PlantVillage",
        "active": True
    },
    {
        "id": "tomato_late_blight",
        "crop": "Tomato",
        "name_en": "Tomato Late Blight (Phytophthora infestans)",
        "name_mr": "टोमॅटो लेट ब्लाइट (तांबेरा / उशिरा येणारा करपा)",
        "symptoms_en": "Water-soaked dark lesions on leaf tips and margins, white fungal growth on leaf undersides in humid conditions.",
        "symptoms_mr": "पानांच्या कडांवर काळे डाग, दमट हवामानात पानांच्या खालच्या बाजूला पांढरी बुरशी.",
        "advisory_en": "Spray Metalaxyl + Mancozeb (Ridomil MZ) at 2g/L. Avoid high humidity around crop foliage. Improve field drainage immediately.",
        "advisory_mr": "मेटॅलॅक्सिल + मॅन्कोझेब २ ग्रॅम/लीटर फवारणी करा. शेतातील पाण्याचा निचरा सुधारा.",
        "prevention_en": "Plant resistant varieties, ensure wide spacing between plants, avoid sprinkler watering.",
        "prevention_mr": "प्रतिकारक्षम वाण वापरा, रोपांमध्ये योग्य अंतर ठेवा.",
        "source": "PlantVillage",
        "active": True
    },
    {
        "id": "cotton_bacterial_blight",
        "crop": "Cotton",
        "name_en": "Cotton Bacterial Blight (Xanthomonas citri pv. malvacearum)",
        "name_mr": "कापूस जिवाणूजन्य करपा / कोनीय ठिपके",
        "symptoms_en": "Angular water-soaked spots bounded by leaf veins, turning brown or dark red, dark sunken lesions on bolls.",
        "symptoms_mr": "पानांच्या शिरांमध्ये कोनीय काळे/तपकिरी डाग, बोंडांवर खोलगट काळे डाग.",
        "advisory_en": "Spray Streptocycline (0.1g/L) combined with Copper Oxychloride (2.5g/L). Remove and burn infected crop residues after harvest.",
        "advisory_mr": "स्ट्रॅप्टोसायक्लीन (०.१ ग्रॅम/लीटर) + कॉपर ऑक्सिक्लोराईड (२.५ ग्रॅम/लीटर) फवारणी करा.",
        "prevention_en": "Delint seeds with acid before sowing, use resistant hybrids, destroy previous season crop debris.",
        "prevention_mr": "बियाणे प्रक्रिया करा, लागवडीसाठी सुधारीत वाण वापरा.",
        "source": "PlantVillage",
        "active": True
    },
    {
        "id": "potato_early_blight",
        "crop": "Potato",
        "name_en": "Potato Early Blight (Alternaria solani)",
        "name_mr": "बटाटा अर्ली ब्लाइट (करपा)",
        "symptoms_en": "Dark brown circular spots with concentric target-like rings on older leaves, surrounded by yellow chlorotic halos.",
        "symptoms_mr": "जुन्या पानांवर रिंगसारखे तपकिरी-काळे डाग (टार्गेट बोर्ड पॅटर्न) आणि पिवळसर वलय.",
        "advisory_en": "Spray Mancozeb 75% WP @ 2.5 g/L or Chlorothalonil 75% WP @ 2 g/L at 10-14 day intervals. Remove infected lower leaves.",
        "advisory_mr": "मॅन्कोझेब ७५% WP २.५ ग्रॅम/लीटर किंवा क्लोरोथॅलोनिल २ ग्रॅम/लीटर फवारणी करा.",
        "prevention_en": "Use certified disease-free tubers, maintain proper plant spacing, avoid overhead irrigation, 3-year crop rotation.",
        "prevention_mr": "प्रमाणित रोगमुक्त बटाटा बेणे वापरा, पिकांची फेरपालट करा, वरून पाणी देणे टाळा.",
        "source": "PlantVillage",
        "active": True
    },
    {
        "id": "potato_late_blight",
        "crop": "Potato",
        "name_en": "Potato Late Blight (Phytophthora infestans)",
        "name_mr": "बटाटा लेट ब्लाइट (उशिरा येणारा करपा / तांबेरा)",
        "symptoms_en": "Water-soaked irregular black/brown lesions on leaf tips and margins with white fuzzy fungal growth on leaf undersides in high humidity.",
        "symptoms_mr": "पानांच्या कडांवर काळपट डाग आणि दमट हवेत पांढरी बुरशी.",
        "advisory_en": "Spray Metalaxyl + Mancozeb (Ridomil MZ) @ 2 g/L or Cymoxanil + Mancozeb @ 2 g/L immediately on first symptom appearance.",
        "advisory_mr": "मेटॅलॅक्सिल + मॅन्कोझेब (रिडोमिल) २ ग्रॅम/लीटर फवारणी करा. शेतात पाण्याचा निचरा ठेवा.",
        "prevention_en": "Plant resistant cultivars, avoid excess nitrogen, improve field drainage.",
        "prevention_mr": "प्रतिकारक्षम वाण वापरा, शेतात पाणी साचू देऊ नका.",
        "source": "PlantVillage",
        "active": True
    },
    {
        "id": "potato_healthy",
        "crop": "Potato",
        "name_en": "Potato Healthy",
        "name_mr": "निरोगी बटाटा पीक",
        "symptoms_en": "Vigorous green foliage with no fungal lesions, chlorosis, or pest damage visible.",
        "symptoms_mr": "पान निरोगी आणि टवटवीत असून कोणताही रोग नाही.",
        "advisory_en": "No chemical treatment required. Continue regular scouting and balanced fertilizer management.",
        "advisory_mr": "कोणत्याही औषध फवारणीची गरज नाही. नियमित पाणी व खत नियोजन ठेवा.",
        "prevention_en": "Maintain healthy crop nutrition and weed-free field conditions.",
        "prevention_mr": "नियमित पाहणी करा.",
        "source": "PlantVillage",
        "active": True
    },
    {
        "id": "corn_cercospora_leaf_spot",
        "crop": "Corn",
        "name_en": "Corn Cercospora Leaf Spot / Gray Leaf Spot",
        "name_mr": "मका करपा (ग्रे लीफ स्पॉट)",
        "symptoms_en": "Rectangular tan to gray lesions running parallel to leaf veins, eventually expanding and blighting entire leaves.",
        "symptoms_mr": "पानांच्या शिरांना समांतर लांबट करडे डाग.",
        "advisory_en": "Apply Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/L or Mancozeb 75% WP @ 2.5 g/L.",
        "advisory_mr": "अॅझॉक्सीस्ट्रोबिन + डिफेनोकोनाझोल १ मिली/लीटर किंवा मॅन्कोझेब २.५ ग्रॅम/लीटर फवारणी करा.",
        "prevention_en": "Rotate crops with non-grasses, shred crop residue after harvest, use resistant hybrids.",
        "prevention_mr": "पिकांची फेरपालट करा, सुधारित वाण वापरा.",
        "source": "PlantVillage",
        "active": True
    },
    {
        "id": "corn_common_rust",
        "crop": "Corn",
        "name_en": "Corn Common Rust (Puccinia sorghi)",
        "name_mr": "मका तांबेरा (रस्ट)",
        "symptoms_en": "Golden-brown to cinnamon-brown powdery pustules scattered over both upper and lower leaf surfaces.",
        "symptoms_mr": "पानांच्या दोन्ही बाजूंवर तांबूस तपकिरी रंगाचे लहान पुरळ किंवा ठिपके.",
        "advisory_en": "Spray Mancozeb 75% WP @ 2.5 g/L or Propiconazole 25% EC @ 1 ml/L at first sign of pustules.",
        "advisory_mr": "प्रोपिकोनाझोल १ मिली/लीटर किंवा मॅन्कोझेब २.५ ग्रॅम/लीटर फवारणी करा.",
        "prevention_en": "Plant resistant hybrids, early planting to avoid peak rust spore flights.",
        "prevention_mr": "प्रतिकारक्षम वाण वापरा, वेळेवर पेरणी करा.",
        "source": "PlantVillage",
        "active": True
    },
    {
        "id": "corn_northern_leaf_blight",
        "crop": "Corn",
        "name_en": "Corn Northern Leaf Blight (Exserohilum turcicum)",
        "name_mr": "मका नॉर्दर्न लीफ ब्लाइट",
        "symptoms_en": "Long elliptical cigar-shaped grayish-green to tan lesions on leaves, progressing from lower to upper canopy.",
        "symptoms_mr": "पानांवर सिगारच्या आकाराचे लांबट राखाडी-तपकिरी डाग.",
        "advisory_en": "Spray Azoxystrobin + Difenoconazole @ 1 ml/L or Carbendazim + Mancozeb @ 2 g/L.",
        "advisory_mr": "कार्बेन्डाझिम + मॅन्कोझेब २ ग्रॅम/लीटर फवारणी करा.",
        "prevention_en": "Deep plow infected crop residue, use disease-resistant maize hybrids.",
        "prevention_mr": "उन्हाळी खोल नांगरट करा, रोगप्रतिकारक बियाणे वापरा.",
        "source": "PlantVillage",
        "active": True
    },
    {
        "id": "corn_healthy",
        "crop": "Corn",
        "name_en": "Corn Healthy",
        "name_mr": "निरोगी मका पीक",
        "symptoms_en": "Strong green leaves with clear veins and no necrotic spots, rust pustules, or wilting.",
        "symptoms_mr": "मका पीक पूर्णपणे निरोगी आणि सशक्त आहे.",
        "advisory_en": "No chemical treatment required. Ensure timely top-dressing with nitrogen and weed control.",
        "advisory_mr": "औषध फवारणीची गरज नाही. वेळेवर खते व पाणी द्या.",
        "prevention_en": "Maintain balanced NPK fertilization and scheduled irrigation.",
        "prevention_mr": "नियमित शेत पाहणी करा.",
        "source": "PlantVillage",
        "active": True
    },
    {
        "id": "tomato_bacterial_spot",
        "crop": "Tomato",
        "name_en": "Tomato Bacterial Spot (Xanthomonas)",
        "name_mr": "टोमॅटो जिवाणूजन्य ठिपके",
        "symptoms_en": "Small circular water-soaked dark spots on leaves, becoming angular with greasy appearance and yellow halos.",
        "symptoms_mr": "पानांवर लहान तेलकट काळे ठिपके आणि पिवळसर कडा.",
        "advisory_en": "Spray Streptocycline @ 0.1 g/L combined with Copper Oxychloride 50% WP @ 2.5 g/L.",
        "advisory_mr": "स्ट्रॅप्टोसायक्लीन ०.१ ग्रॅम/लीटर + कॉपर ऑक्सिक्लोराईड २.५ ग्रॅम/लीटर फवारणी करा.",
        "prevention_en": "Use hot water treated seeds, avoid overhead sprinkler watering, clean farming tools.",
        "prevention_mr": "प्रक्रिया केलेले बियाणे वापरा, वरून पाणी देणे टाळा.",
        "source": "PlantVillage",
        "active": True
    },
    {
        "id": "tomato_leaf_mold",
        "crop": "Tomato",
        "name_en": "Tomato Leaf Mold (Passalora fulva)",
        "name_mr": "टोमॅटो पानांवरील बुरशी (लीफ मोल्ड)",
        "symptoms_en": "Pale yellow patches on upper leaf surface with olive-green to grayish velvety mold on leaf undersides.",
        "symptoms_mr": "पानांच्या वरच्या बाजूला पिवळे चट्टे आणि खालच्या बाजूला मखमली करडी बुरशी.",
        "advisory_en": "Spray Difenoconazole 25% EC @ 1 ml/L or Chlorothalonil 75% WP @ 2 g/L. Increase row ventilation.",
        "advisory_mr": "डिफेनोकोनाझोल १ मिली/लीटर किंवा क्लोरोथॅलोनिल २ ग्रॅम/लीटर फवारणी करा.",
        "prevention_en": "Improve air circulation through pruning lower suckers, reduce relative humidity below 85%.",
        "prevention_mr": "हवेचा वावर राहील असे अंतर ठेवा, दमटपणा कमी करा.",
        "source": "PlantVillage",
        "active": True
    },
    {
        "id": "tomato_septoria_leaf_spot",
        "crop": "Tomato",
        "name_en": "Tomato Septoria Leaf Spot",
        "name_mr": "टोमॅटो सेप्टोरिया पानावरील ठिपके",
        "symptoms_en": "Numerous small circular brown spots with gray or white centers and distinct dark brown margins.",
        "symptoms_mr": "पानांवर लहान वर्तुळाकार तपकिरी डाग ज्यांचा मधला भाग राखाडी असतो.",
        "advisory_en": "Apply Mancozeb 75% WP @ 2.5 g/L or Copper Hydroxide @ 2 g/L at weekly intervals.",
        "advisory_mr": "मॅन्कोझेब २.५ ग्रॅम/लीटर किंवा कॉपर हायड्रॉक्साईड २ ग्रॅम/लीटर फवारणी करा.",
        "prevention_en": "Mulch soil surface to prevent soil splash onto lower leaves, sanitize stakes.",
        "prevention_mr": "मल्चिंगचा वापर करा, जमिनीतून पाण्याचे थेंब उडणार नाहीत याची काळजी घ्या.",
        "source": "PlantVillage",
        "active": True
    },
    {
        "id": "tomato_spider_mites",
        "crop": "Tomato",
        "name_en": "Tomato Two-Spotted Spider Mite",
        "name_mr": "टोमॅटो लाल कोळी (स्पायडर माइट्स)",
        "symptoms_en": "Fine yellow stippling or bronzing on leaves, delicate fine webbing on leaf undersides, leaf drying.",
        "symptoms_mr": "पानांवर बारीक पिवळे ठिपके, पानांच्या खाली बारीक जाळे आणि पाने सुकणे.",
        "advisory_en": "Spray Spiromesifen 22.9% SC @ 1 ml/L or Propargite 57% EC @ 2 ml/L. Spray thoroughly under leaves.",
        "advisory_mr": "स्पायरोमेसिफेन १ मिली/लीटर किंवा प्रोपार्गाइट २ मिली/लीटर फवारणी करा.",
        "prevention_en": "Maintain field moisture to discourage dry mite conditions, remove infested weeds.",
        "prevention_mr": "शेतात ओलावा ठेवा, तण काढून टाका.",
        "source": "PlantVillage",
        "active": True
    },
    {
        "id": "tomato_target_spot",
        "crop": "Tomato",
        "name_en": "Tomato Target Spot (Corynespora cassiicola)",
        "name_mr": "टोमॅटो टार्गेट स्पॉट",
        "symptoms_en": "Small brown pinpoint lesions expanding into large circular brown necrotic spots with concentric zones.",
        "symptoms_mr": "पानांवर तपकिरी रंगाचे रिंगसारखे मोठे डाग.",
        "advisory_en": "Spray Azoxystrobin 23% SC @ 1 ml/L or Chlorothalonil 75% WP @ 2 g/L.",
        "advisory_mr": "अॅझॉक्सीस्ट्रोबिन १ मिली/लीटर किंवा क्लोरोथॅलोनिल २ ग्रॅम/लीटर फवारणी करा.",
        "prevention_en": "Ensure wide plant spacing, remove weed hosts, avoid sprinkler irrigation.",
        "prevention_mr": "रोपांमध्ये योग्य अंतर ठेवा, वरून पाणी देणे टाळा.",
        "source": "PlantVillage",
        "active": True
    },
    {
        "id": "tomato_yellow_leaf_curl_virus",
        "crop": "Tomato",
        "name_en": "Tomato Yellow Leaf Curl Virus (TYLCV)",
        "name_mr": "टोमॅटो पिवळा पर्णगुच्छ रोग (चूरा-बुरा / पांढरी माशी)",
        "symptoms_en": "Severe upward leaf curling, yellowing of leaf margins, stunted bushy plant growth, fruit drop.",
        "symptoms_mr": "पाने वरच्या बाजूला गोळा होणे (चूरा-बुरा), पाने पिवळी पडणे आणि झाडाची वाढ खुंटणे.",
        "advisory_en": "Control whitefly vector by spraying Diafenthiuron 50% WP @ 1.2 g/L or Thiamethoxam 25% WG @ 0.3 g/L. Rogue out heavily infected plants.",
        "advisory_mr": "पांढऱ्या माशीच्या नियंत्रणासाठी डायफेंथ्यूरॉन १.२ ग्रॅम किंवा थायामेथोक्साम ०.३ ग्रॅम/लीटर फवारणी करा. पिवळे चिकट सापळे लावा.",
        "prevention_en": "Install yellow sticky traps (15-20 traps/acre), use 40-mesh insect-proof netting in nurseries.",
        "prevention_mr": "पिवळे चिकट सापळे लावा, रोपवाटिकेत नेटचा वापर करा.",
        "source": "PlantVillage",
        "active": True
    },
    {
        "id": "tomato_mosaic_virus",
        "crop": "Tomato",
        "name_en": "Tomato Mosaic Virus (ToMV)",
        "name_mr": "टोमॅटो मोझॅक व्हायरस",
        "symptoms_en": "Mottled light and dark green mosaic patterns on leaves, leaf distortion, blister-like leaf puckering.",
        "symptoms_mr": "पानांवर फिकट व गर्द हिरव्या रंगाचे चट्टे (मोझॅक) आणि पाने आक्रसणे.",
        "advisory_en": "No chemical cure for viral infections. Spray skimmed milk (10%) during pruning to inhibit transmission; remove and burn infected plants.",
        "advisory_mr": "विषाणूवर थेट औषध नाही. बाधित झाडे उपटून नष्ट करा. काम करताना हात साबणाने धुवा.",
        "prevention_en": "Wash hands with soap before handling plants, use certified ToMV-resistant seeds, eliminate weeds.",
        "prevention_mr": "प्रतिकारक्षम वाण वापरा, शेतात स्वच्छता ठेवा.",
        "source": "PlantVillage",
        "active": True
    },
    {
        "id": "tomato_healthy",
        "crop": "Tomato",
        "name_en": "Tomato Healthy",
        "name_mr": "निरोगी टोमॅटो पीक",
        "symptoms_en": "Uniform vibrant green foliage, healthy branching, no fungal lesions, leaf curling, or pest symptoms.",
        "symptoms_mr": "टोमॅटो पीक पूर्णपणे निरोगी आणि टवटवीत आहे.",
        "advisory_en": "No chemical treatment needed. Maintain optimal drip irrigation schedule and fertigation.",
        "advisory_mr": "औषध फवारणीची गरज नाही. नियमित पाणी व खत व्यवस्थापन ठेवा.",
        "prevention_en": "Regular field monitoring and timely staking.",
        "prevention_mr": "नियमित पाहणी करा.",
        "source": "PlantVillage",
        "active": True
    }
]

# Normalization mapping for PlantVillage dataset names to catalog IDs
LABEL_NORM_MAP = {
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": "corn_cercospora_leaf_spot",
    "Corn_(maize)___Common_rust_": "corn_common_rust",
    "Corn_(maize)___Northern_Leaf_Blight": "corn_northern_leaf_blight",
    "Corn_(maize)___healthy": "corn_healthy",
    "Potato___Early_blight": "potato_early_blight",
    "Potato___Late_blight": "potato_late_blight",
    "Potato___healthy": "potato_healthy",
    "Tomato___Bacterial_spot": "tomato_bacterial_spot",
    "Tomato___Early_blight": "tomato_early_blight",
    "Tomato___Late_blight": "tomato_late_blight",
    "Tomato___Leaf_Mold": "tomato_leaf_mold",
    "Tomato___Septoria_leaf_spot": "tomato_septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite": "tomato_spider_mites",
    "Tomato___Target_Spot": "tomato_target_spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": "tomato_yellow_leaf_curl_virus",
    "Tomato___Tomato_mosaic_virus": "tomato_mosaic_virus",
    "Tomato___healthy": "tomato_healthy",
    "cotton_bacterial_blight": "cotton_bacterial_blight",
}

def normalize_disease_label(label: str) -> str:
    """Converts PlantVillage / Gemini labels into canonical catalog IDs."""
    if not label:
        return "unknown_disease"
    if label in LABEL_NORM_MAP:
        return LABEL_NORM_MAP[label]
    clean = label.lower().strip()
    clean = clean.replace("___", "_").replace("__", "_").replace(" ", "_").replace("-", "_")
    clean = clean.strip("_")
    return LABEL_NORM_MAP.get(clean, clean)

def seed_disease_catalog_if_empty(db: Session):
    """Ensures all standard diseases exist in the database catalog."""
    existing_ids = {row[0] for row in db.query(DiseaseCatalog.id).all()}
    added = False
    for item in DEFAULT_DISEASES:
        if item["id"] not in existing_ids:
            obj = DiseaseCatalog(**item)
            db.add(obj)
            existing_ids.add(item["id"])
            added = True
    if added:
        db.commit()

@router.get("/catalog", response_model=List[DiseaseCatalogOut])
def get_disease_catalog(db: Session = Depends(get_db)):
    seed_disease_catalog_if_empty(db)
    return db.query(DiseaseCatalog).filter(DiseaseCatalog.active == True).all()

@router.post("/predict", response_model=DiseasePredictResponse)
async def predict_crop_disease(
    file: UploadFile = File(...),
    crop_id: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seed_disease_catalog_if_empty(db)

    # 1. Read file bytes
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please take a clear photo of the affected leaf."
        )

    # 2. Image Quality & Format Validation via OpenCV
    try:
        img_bgr = ImageValidationService.validate_image_bytes(
            image_bytes=contents,
            filename=file.filename or "uploaded.jpg",
            content_type=file.content_type or ""
        )
    except ImageValidationError as val_err:
        # Standard rejection response requirement
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=val_err.message
        )

    # 3. Save photograph file to static storage
    file_ext = os.path.splitext(file.filename or "photo.jpg")[1] or ".jpg"
    if file_ext.lower() not in [".jpg", ".jpeg", ".png", ".webp"]:
        file_ext = ".jpg"
    
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    filepath = os.path.join(STATIC_SCANS_DIR, unique_filename)
    with open(filepath, "wb") as f:
        f.write(contents)
    
    image_url = f"/static/scans/{unique_filename}"

    # 4. Execute ML Inference (Hybrid: Tier1=Local CNN / Tier2=Gemini / Tier3=Mock)
    ml_service = DiseaseMLService()
    inference_result = ml_service.predict(img_bytes=contents, img_bgr=img_bgr, crop_hint=crop_id)

    pred_label = inference_result["prediction"]
    confidence = inference_result["confidence"]
    model_version = inference_result["model_version"]
    is_low_confidence = inference_result["is_low_confidence"]
    warning = inference_result["warning"]
    gemini_detail = inference_result.get("gemini_detail")  # Rich detail from Gemini (None for Tier 1/3)

    # 5. Lookup catalog info via normalized ID
    norm_id = normalize_disease_label(pred_label)
    disease_info = db.query(DiseaseCatalog).filter(
        (DiseaseCatalog.id == norm_id) |
        (DiseaseCatalog.id == pred_label) |
        (DiseaseCatalog.name_en == pred_label)
    ).first()

    if not disease_info and gemini_detail and not gemini_detail.get("is_healthy"):
        # Dynamically create a catalog entry from Gemini's rich response (not persisted — session only)
        sym_text = ". ".join(gemini_detail.get("symptoms", [])) if isinstance(gemini_detail.get("symptoms"), list) else str(gemini_detail.get("symptoms", ""))
        disease_info = DiseaseCatalog(
            id=norm_id,
            crop=gemini_detail.get("crop", "Unknown"),
            name_en=gemini_detail.get("disease_name", pred_label.replace("___", " ").replace("_", " ").title()),
            name_mr=gemini_detail.get("disease_name", pred_label.replace("___", " ").replace("_", " ").title()),
            symptoms_en=sym_text,
            symptoms_mr=sym_text,
            advisory_en=f"{gemini_detail.get('chemical_treatment', '')}",
            advisory_mr=f"{gemini_detail.get('organic_treatment', '')}",
            prevention_en=gemini_detail.get("prevention", "Consult your local KVK officer."),
            prevention_mr=gemini_detail.get("prevention", "स्थानिक KVK अधिकाऱ्यांचा सल्ला घ्या."),
            source="Gemini Vision AI (ICAR/KVK grounded)",
            active=True
        )
    elif not disease_info:
        # Fallback to a clean dynamic entry matching the predicted label - NEVER falsely overwrite to another crop!
        clean_name = pred_label.replace("___", " ").replace("_", " ").title()
        disease_info = DiseaseCatalog(
            id=norm_id,
            crop="Crop",
            name_en=clean_name,
            name_mr=clean_name,
            symptoms_en="Visible foliar symptoms detected on crop leaves.",
            symptoms_mr="पानांवर रोगाची लक्षणे दिसून येत आहेत.",
            advisory_en="Consult your local Krishi Vigyan Kendra (KVK) for recommended spray dosages.",
            advisory_mr="औषध फवारणीसाठी स्थानिक कृषी विज्ञान केंद्र (KVK) अधिकाऱ्यांचा सल्ला घ्या.",
            prevention_en="Maintain field sanitation and proper drainage.",
            prevention_mr="शेतात स्वच्छता आणि पाण्याचा निचरा ठेवा.",
            source="AgriSense Vision",
            active=True
        )

    # 6. Save Scan into database persistence table disease_scans
    scan = DiseaseScan(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        crop_id=crop_id,
        image_url=image_url,
        prediction=disease_info.name_en if disease_info else pred_label.replace("___", " ").replace("_", " ").title(),
        confidence=confidence,
        model_version=model_version
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)

    return DiseasePredictResponse(
        scan_id=scan.id,
        user_id=scan.user_id,
        crop_id=scan.crop_id,
        image_url=scan.image_url,
        prediction=scan.prediction,
        confidence=scan.confidence,
        model_version=scan.model_version,
        is_low_confidence=is_low_confidence,
        warning=warning,
        disease_info=DiseaseCatalogOut.model_validate(disease_info) if disease_info else None,
        created_at=scan.created_at
    )

@router.get("/history", response_model=List[DiseaseScanOut])
def get_disease_scan_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seed_disease_catalog_if_empty(db)
    scans = (
        db.query(DiseaseScan)
        .filter(DiseaseScan.user_id == current_user.id)
        .order_by(DiseaseScan.created_at.desc())
        .all()
    )
    
    output = []
    for s in scans:
        # Match disease catalog info by normalized prediction name or lookup
        norm_s = normalize_disease_label(s.prediction)
        disease_obj = db.query(DiseaseCatalog).filter(
            (DiseaseCatalog.id == norm_s) |
            (DiseaseCatalog.id == s.prediction) |
            (DiseaseCatalog.name_en == s.prediction)
        ).first()

        scan_out = DiseaseScanOut(
            id=s.id,
            user_id=s.user_id,
            crop_id=s.crop_id,
            image_url=s.image_url,
            prediction=s.prediction,
            confidence=s.confidence,
            model_version=s.model_version,
            created_at=s.created_at,
            feedback_accurate=s.feedback_accurate,
            feedback_text=s.feedback_text,
            disease_info=DiseaseCatalogOut.model_validate(disease_obj) if disease_obj else None
        )
        output.append(scan_out)

    return output

@router.get("/{scan_id}", response_model=DiseaseScanOut)
def get_disease_scan_by_id(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seed_disease_catalog_if_empty(db)
    scan = (
        db.query(DiseaseScan)
        .filter(DiseaseScan.id == scan_id, DiseaseScan.user_id == current_user.id)
        .first()
    )
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disease scan not found"
        )

    norm_scan = normalize_disease_label(scan.prediction)
    disease_obj = db.query(DiseaseCatalog).filter(
        (DiseaseCatalog.id == norm_scan) |
        (DiseaseCatalog.id == scan.prediction) |
        (DiseaseCatalog.name_en == scan.prediction)
    ).first()

    return DiseaseScanOut(
        id=scan.id,
        user_id=scan.user_id,
        crop_id=scan.crop_id,
        image_url=scan.image_url,
        prediction=scan.prediction,
        confidence=scan.confidence,
        model_version=scan.model_version,
        created_at=scan.created_at,
        feedback_accurate=scan.feedback_accurate,
        feedback_text=scan.feedback_text,
        disease_info=DiseaseCatalogOut.model_validate(disease_obj) if disease_obj else None
    )

@router.post("/{scan_id}/feedback", response_model=DiseaseFeedbackOut)
def submit_scan_feedback(
    scan_id: str,
    payload: DiseaseFeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = (
        db.query(DiseaseScan)
        .filter(DiseaseScan.id == scan_id, DiseaseScan.user_id == current_user.id)
        .first()
    )
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disease scan not found"
        )

    scan.feedback_accurate = payload.is_accurate
    scan.feedback_text = payload.feedback_text
    db.commit()

    return DiseaseFeedbackOut(
        id=scan.id,
        feedback_accurate=scan.feedback_accurate,
        feedback_text=scan.feedback_text,
        message="Feedback submitted successfully. Thank you for helping AgriSense learn!"
    )
