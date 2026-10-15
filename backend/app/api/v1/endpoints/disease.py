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

# Default local crop diseases catalog seed
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
    }
]

def seed_disease_catalog_if_empty(db: Session):
    count = db.query(DiseaseCatalog).count()
    if count == 0:
        for item in DEFAULT_DISEASES:
            obj = DiseaseCatalog(**item)
            db.add(obj)
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

    # 4. Execute ML Inference
    ml_service = DiseaseMLService()
    inference_result = ml_service.predict(img_bytes=contents, img_bgr=img_bgr)

    pred_label = inference_result["prediction"]
    confidence = inference_result["confidence"]
    model_version = inference_result["model_version"]
    is_low_confidence = inference_result["is_low_confidence"]
    warning = inference_result["warning"]

    # 5. Lookup catalog info
    disease_info = db.query(DiseaseCatalog).filter(DiseaseCatalog.id == pred_label).first()
    if not disease_info:
        # Fallback to first catalog entry if specific ID isn't mapped
        disease_info = db.query(DiseaseCatalog).first()

    # 6. Save Scan into database persistence table disease_scans
    scan = DiseaseScan(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        crop_id=crop_id,
        image_url=image_url,
        prediction=disease_info.name_en if disease_info else pred_label,
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
        # Match disease catalog info by prediction name or lookup
        disease_obj = db.query(DiseaseCatalog).filter(
            (DiseaseCatalog.name_en == s.prediction) | (DiseaseCatalog.id == s.prediction)
        ).first()
        if not disease_obj:
            disease_obj = db.query(DiseaseCatalog).first()

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

    disease_obj = db.query(DiseaseCatalog).filter(
        (DiseaseCatalog.name_en == scan.prediction) | (DiseaseCatalog.id == scan.prediction)
    ).first()
    if not disease_obj:
        disease_obj = db.query(DiseaseCatalog).first()

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
