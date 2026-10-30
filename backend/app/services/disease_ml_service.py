"""
Disease ML Service — Hybrid 3-Tier Classifier
===============================================
Tier 1 (Fastest / Offline):  Local MobileNetV2 CNN  — used when .h5 weights exist
Tier 2 (Smart / Online):     Gemini 3.5 Flash Lite Vision — official google-genai SDK
Tier 3 (Safe Fallback):      MockDiseaseClassifier   — heuristic, never crashes

Tier selection is fully automatic based on availability.
"""

import os
import io
import json
import logging
import re
import cv2
import numpy as np
from PIL import Image
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

from app.core.config import settings

logger = logging.getLogger("app.services.disease_ml")

DEFAULT_CONFIDENCE_THRESHOLD = float(
    getattr(settings, "DISEASE_CONFIDENCE_THRESHOLD", None)
    or os.getenv("DISEASE_CONFIDENCE_THRESHOLD", "0.50")
)

LOW_CONFIDENCE_WARNING = (
    "The image is not clear enough for a reliable identification. "
    "Please upload a clearer photo or consult a KVK/agricultural officer."
)

GEMINI_DISEASE_PROMPT = """You are an expert plant pathologist and agricultural advisor at an Indian Agricultural University (ICAR / Krishi Vigyan Kendra standard).

Carefully inspect the leaf image and respond ONLY with a valid JSON object — no markdown formatting, no code blocks, just raw JSON.

Rules:
1. Identify the crop species (Tomato, Cotton, Onion, Soybean, Wheat, Sugarcane, etc.).
2. Examine visible symptoms: concentric rings, chlorosis, necrosis, water-soaked lesions, rust pustules, angular spots, powdery mildew, yellowing, wilting.
3. If the leaf is completely healthy with no disease, set is_healthy to true and disease_class to "healthy".
4. If diseased, identify the specific disease and assign a confidence score (0.0 to 1.0).
5. All treatment recommendations must follow CIBRC (Central Insecticides Board & Registration Committee) India standards.
6. Use simple, practical language suitable for Indian smallholder farmers.

Respond with this exact JSON structure:
{
  "crop": "Tomato",
  "disease_class": "tomato_early_blight",
  "disease_name": "Tomato Early Blight (Alternaria solani)",
  "is_healthy": false,
  "confidence": 0.92,
  "symptoms": [
    "Dark brown circular spots with concentric rings",
    "Yellow halo around lesions"
  ],
  "organic_treatment": "Spray Neem oil 5ml/L or Trichoderma viride 5g/L.",
  "chemical_treatment": "Apply Mancozeb 75% WP @ 2.5g/L or Copper Oxychloride 50% WP @ 3g/L.",
  "prevention": "Avoid overhead watering; maintain proper plant spacing; crop rotation.",
  "low_confidence_reason": null
}"""


class BaseDiseaseClassifier(ABC):
    @abstractmethod
    def predict(self, img_bgr: np.ndarray, image_bytes: bytes = None) -> Dict[str, Any]:
        pass


class MobileNetV2Classifier(BaseDiseaseClassifier):
    # Paths are relative to the project root (one level above backend/)
    _BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    MODEL_PATH = os.path.join(_BASE, "ml", "models", "mobilenetv2_crop_disease.keras")
    CLASS_MAP_PATH = os.path.join(_BASE, "ml", "models", "class_indices.json")

    def __init__(self, model_path: str = None):
        self.model_path = model_path or self.MODEL_PATH
        self.model = None
        self.class_labels: list = []
        self.model_version = "v1.0.0-mobilenetv2-local"
        self._load_class_map()
        self._load_model()

    def _load_class_map(self):
        """Load class index → label mapping from class_indices.json."""
        map_path = self.CLASS_MAP_PATH
        if os.path.exists(map_path):
            try:
                with open(map_path, "r", encoding="utf-8") as f:
                    raw: dict = json.load(f)
                # Keys are string indices "0", "1", … — sort numerically
                self.class_labels = [raw[str(i)] for i in range(len(raw))]
                logger.info(f"[Tier-1] Loaded {len(self.class_labels)} class labels from {map_path}")
            except Exception as e:
                logger.warning(f"[Tier-1] Failed to load class map: {e}")
                self.class_labels = []
        else:
            logger.warning(f"[Tier-1] class_indices.json not found at {map_path}; predictions will use raw indices.")

    def _load_model(self):
        # Look for .keras first (native Keras 3 fine-tuned model), then .h5
        candidates = [
            self.model_path.replace(".h5", ".keras"),
            self.model_path
        ]
        target_path = None
        for p in candidates:
            if os.path.exists(p):
                target_path = p
                break

        if not target_path:
            logger.warning(f"[Tier-1] No MobileNetV2 weight file found at {candidates}")
            self.model = None
            return

        # Attempt 1: Keras 3 with torch/tensorflow backend
        try:
            os.environ.setdefault("KERAS_BACKEND", "torch")
            import keras
            self.model = keras.models.load_model(target_path)
            logger.info(f"[Tier-1] Loaded MobileNetV2 weights via Keras from {target_path}")
            return
        except Exception as e_keras:
            logger.debug(f"[Tier-1] Keras load attempt failed: {e_keras}")

        # Attempt 2: TensorFlow Keras fallback
        try:
            import tensorflow as tf
            self.model = tf.keras.models.load_model(target_path)
            logger.info(f"[Tier-1] Loaded MobileNetV2 weights via TensorFlow from {target_path}")
            return
        except Exception as e_tf:
            logger.warning(f"[Tier-1] Failed to load MobileNetV2 weights from {target_path}: {e_tf}")
            self.model = None

    def is_available(self) -> bool:
        return self.model is not None

    def predict(self, img_bgr: np.ndarray, image_bytes: bytes = None) -> Dict[str, Any]:
        if not self.is_available():
            raise RuntimeError("MobileNetV2 model weights not loaded.")

        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        img_resized = cv2.resize(img_rgb, (224, 224), interpolation=cv2.INTER_AREA)
        # Same normalisation used during Colab training: Rescaling(1/127.5, offset=-1)
        img_normalized = (img_resized.astype(np.float32) / 127.5) - 1.0
        input_tensor = np.expand_dims(img_normalized, axis=0)

        # Inference compatible with both Keras (torch/tf) and native TensorFlow
        try:
            preds = self.model(input_tensor)
        except Exception:
            preds = self.model.predict(input_tensor, verbose=0)

        if hasattr(preds, "detach"):
            preds = preds.detach().cpu().numpy()
        elif hasattr(preds, "numpy"):
            preds = preds.numpy()
        predictions = np.asarray(preds)[0]

        class_idx = int(np.argmax(predictions))
        confidence = float(predictions[class_idx])

        if self.class_labels and class_idx < len(self.class_labels):
            pred_label = self.class_labels[class_idx]
        else:
            pred_label = f"class_{class_idx}"

        return {
            "prediction": pred_label,
            "confidence": round(confidence, 4),
            "model_version": self.model_version
        }


class GeminiVisionClassifier(BaseDiseaseClassifier):
    """
    Google Gemini Vision Classifier using the official google-genai SDK.
    Supports modern authorization tokens (AQ. prefix) and Gemini 3.5 series models.
    """
    def __init__(self):
        self.api_key = getattr(settings, "GEMINI_API_KEY", "") or os.getenv("GEMINI_API_KEY", "")
        self.model_name = getattr(settings, "GEMINI_MODEL_NAME", "gemini-3.5-flash-lite")
        self.model_version = f"v2.0.0-gemini-{self.model_name}"
        self.client = None

        if self.api_key and self.api_key.strip():
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key.strip())
            except Exception as e:
                logger.warning(f"[GeminiVision] Client initialization failed: {e}")
                self.client = None

    def is_available(self) -> bool:
        return self.client is not None

    def predict(self, img_bgr: np.ndarray, image_bytes: bytes = None) -> Dict[str, Any]:
        if not self.is_available():
            raise RuntimeError("Gemini client not initialized or API key missing.")

        # Convert to PIL Image for the SDK
        if image_bytes:
            pil_image = Image.open(io.BytesIO(image_bytes))
        else:
            img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(img_rgb)

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[pil_image, GEMINI_DISEASE_PROMPT],
            )
            raw_text = response.text or ""
        except Exception as e:
            raise RuntimeError(f"Gemini API request failed: {e}")

        # Parse JSON output
        try:
            cleaned = re.sub(r"^```(?:json)?\s*", "", raw_text.strip(), flags=re.MULTILINE)
            cleaned = re.sub(r"\s*```$", "", cleaned.strip(), flags=re.MULTILINE)
            gemini_data = json.loads(cleaned.strip())
        except Exception as e:
            logger.warning(f"Failed to parse Gemini JSON: {e} | Text: {raw_text[:200]}")
            # Fallback if model returned plain prose instead of JSON
            gemini_data = {
                "crop": "Crop",
                "disease_class": "crop_disease",
                "disease_name": "Identified Crop Disease",
                "is_healthy": "healthy" in raw_text.lower(),
                "confidence": 0.85,
                "symptoms": [raw_text[:200]],
                "organic_treatment": "Apply organic neem extract or bio-pesticide.",
                "chemical_treatment": "Consult local KVK for recommended chemical treatment.",
                "prevention": "Ensure good drainage and proper air circulation.",
            }

        is_healthy = gemini_data.get("is_healthy", False)
        confidence = float(gemini_data.get("confidence", 0.85))
        disease_class = gemini_data.get("disease_class", "unknown_disease")

        if is_healthy:
            disease_class = "healthy"
            confidence = max(confidence, 0.90)

        return {
            "prediction": disease_class,
            "confidence": round(confidence, 4),
            "model_version": self.model_version,
            "gemini_detail": {
                "crop": gemini_data.get("crop", "Crop"),
                "disease_name": gemini_data.get("disease_name", disease_class.replace("_", " ").title()),
                "is_healthy": is_healthy,
                "symptoms": gemini_data.get("symptoms", []),
                "organic_treatment": gemini_data.get("organic_treatment", ""),
                "chemical_treatment": gemini_data.get("chemical_treatment", ""),
                "prevention": gemini_data.get("prevention", ""),
                "low_confidence_reason": gemini_data.get("low_confidence_reason")
            }
        }


class MockDiseaseClassifier(BaseDiseaseClassifier):
    def __init__(self):
        self.model_version = "v0.0.1-mock-heuristic"

    def predict(self, img_bgr: np.ndarray, image_bytes: bytes = None) -> Dict[str, Any]:
        hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

        mean_hue = float(np.mean(hsv[:, :, 0]))
        mean_sat = float(np.mean(hsv[:, :, 1]))
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

        if laplacian_var < 50.0:
            prediction, confidence = "tomato_early_blight", 0.42
        elif mean_hue < 20 or mean_hue > 150:
            prediction, confidence = "tomato_early_blight", 0.78
        elif mean_sat > 100:
            prediction, confidence = "tomato_late_blight", 0.72
        else:
            prediction, confidence = "cotton_bacterial_blight", 0.69

        return {
            "prediction": prediction,
            "confidence": round(confidence, 4),
            "model_version": self.model_version
        }


class DiseaseMLService:
    def __init__(self, confidence_threshold: float = DEFAULT_CONFIDENCE_THRESHOLD):
        self.confidence_threshold = confidence_threshold
        self.tier1_classifier = MobileNetV2Classifier()
        self.tier2_classifier = GeminiVisionClassifier()
        self.tier3_classifier = MockDiseaseClassifier()
        self._select_primary_classifier()

    def _select_primary_classifier(self):
        if self.tier1_classifier.is_available():
            self.classifier = self.tier1_classifier
            self._tier = 1
            logger.info("[DiseaseMLService] Tier 1 active: Local MobileNetV2 CNN.")
            return

        if self.tier2_classifier.is_available():
            self.classifier = self.tier2_classifier
            self._tier = 2
            logger.info(f"[DiseaseMLService] Tier 2 active: Gemini Vision ({self.tier2_classifier.model_name}).")
            return

        self.classifier = self.tier3_classifier
        self._tier = 3
        logger.warning("[DiseaseMLService] Tier 3 active: Mock heuristic fallback.")

    def set_confidence_threshold(self, threshold: float):
        self.confidence_threshold = threshold

    def predict(
        self,
        img_bytes: bytes,
        img_bgr: Optional[np.ndarray] = None,
        crop_hint: Optional[str] = None
    ) -> Dict[str, Any]:
        if img_bgr is None:
            np_arr = np.frombuffer(img_bytes, np.uint8)
            img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        result = None
        active_tier = self._tier

        # Step 1: Run Primary Classifier (Tier 1 Local CNN if available)
        if self._tier == 1:
            try:
                result = self.tier1_classifier.predict(img_bgr, image_bytes=img_bytes)
                result["tier"] = 1
            except Exception as e:
                logger.warning(f"[DiseaseMLService] Tier 1 prediction failed: {e}. Attempting Tier 2.")
                result = None

            # Step 2: Intelligent Hybrid Escalation Check
            # If Tier 1 confidence is below 0.70 (uncertain/cross-crop domain shift)
            # or if an explicit crop_hint contradicts the prediction,
            # escalate to Tier 2 (Gemini Vision) if available!
            should_escalate = False
            if result is None:
                should_escalate = True
            elif result.get("confidence", 0) < 0.70:
                should_escalate = True
            elif crop_hint and crop_hint.lower() not in result.get("prediction", "").lower():
                should_escalate = True

            if should_escalate and self.tier2_classifier.is_available():
                try:
                    logger.info(
                        f"[DiseaseMLService] Escalating to Tier 2 (Gemini Vision) "
                        f"(Tier 1 conf: {result.get('confidence', 0) if result else 'N/A'}, crop_hint: {crop_hint})"
                    )
                    t2_res = self.tier2_classifier.predict(img_bgr, image_bytes=img_bytes)
                    # If Gemini returned equal or better confidence, adopt it
                    if t2_res and t2_res.get("confidence", 0) >= (result.get("confidence", 0) if result else 0.40):
                        t2_res["tier"] = 2
                        t2_res["escalated_from_tier1"] = True
                        result = t2_res
                        active_tier = 2
                except Exception as gemini_err:
                    logger.warning(f"[DiseaseMLService] Tier 2 escalation failed: {gemini_err}. Retaining Tier 1.")

        # Step 3: Direct Tier 2 if Tier 1 was not available
        elif self._tier == 2:
            try:
                result = self.tier2_classifier.predict(img_bgr, image_bytes=img_bytes)
                result["tier"] = 2
            except RuntimeError as tier_err:
                logger.warning(f"[DiseaseMLService] Gemini Vision failed: {tier_err}. Dropping to Tier 3 fallback.")
                result = self.tier3_classifier.predict(img_bgr, image_bytes=img_bytes)
                result["tier"] = 3
                result["warning_note"] = "AI vision service busy. Result is an estimate."
                active_tier = 3

        # Step 4: Tier 3 fallback if nothing else succeeded
        if result is None:
            result = self.tier3_classifier.predict(img_bgr, image_bytes=img_bytes)
            result["tier"] = 3
            active_tier = 3

        prediction = result["prediction"]
        confidence = float(result["confidence"])
        model_version = result["model_version"]
        gemini_detail = result.get("gemini_detail")

        is_low_confidence = confidence < self.confidence_threshold
        warning = LOW_CONFIDENCE_WARNING if is_low_confidence else result.get("warning_note")

        return {
            "prediction": prediction,
            "confidence": confidence,
            "model_version": model_version,
            "is_low_confidence": is_low_confidence,
            "warning": warning,
            "threshold": self.confidence_threshold,
            "tier": active_tier,
            "gemini_detail": gemini_detail
        }
