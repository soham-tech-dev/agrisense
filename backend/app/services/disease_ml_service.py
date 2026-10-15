import os
import cv2
import numpy as np
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List, Tuple
from app.core.config import settings

# Default configurable confidence threshold (0.60 / 60%)
DEFAULT_CONFIDENCE_THRESHOLD = getattr(settings, "DISEASE_CONFIDENCE_THRESHOLD", 0.60)

LOW_CONFIDENCE_WARNING = (
    "The image is not clear enough for a reliable identification. "
    "Please upload a clearer photo or consult a KVK/agricultural officer."
)

class BaseDiseaseClassifier(ABC):
    """
    Clean, abstract model interface for crop disease classification.
    """
    @abstractmethod
    def predict(self, img_bgr: np.ndarray, image_bytes: bytes = None) -> Dict[str, Any]:
        """
        Executes prediction on OpenCV BGR image matrix.
        Returns dict with keys: prediction, confidence, model_version
        """
        pass

class MobileNetV2Classifier(BaseDiseaseClassifier):
    """
    MobileNetV2 Transfer Learning Real Classifier Implementation.
    Preprocesses image with OpenCV, normalizes, and passes through MobileNetV2 network.
    """
    def __init__(self, model_path: str = "ml/models/mobilenetv2_crop_disease.h5"):
        self.model_path = model_path
        self.model = None
        self.model_version = "v1.0.0-mobilenetv2"
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            try:
                import tensorflow as tf
                self.model = tf.keras.models.load_model(self.model_path)
                print(f"[ML Classifier] Loaded MobileNetV2 model weights from {self.model_path}")
            except Exception as e:
                print(f"[ML Classifier] Failed to load model weights: {e}")
                self.model = None

    def is_available(self) -> bool:
        return self.model is not None

    def predict(self, img_bgr: np.ndarray, image_bytes: bytes = None) -> Dict[str, Any]:
        if not self.is_available():
            raise RuntimeError("MobileNetV2 model weights not loaded")

        # OpenCV Preprocessing
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        img_resized = cv2.resize(img_rgb, (224, 224), interpolation=cv2.INTER_AREA)
        img_normalized = (img_resized.astype(np.float32) / 127.5) - 1.0
        input_tensor = np.expand_dims(img_normalized, axis=0)

        # Inference
        predictions = self.model.predict(input_tensor)[0]
        class_idx = int(np.argmax(predictions))
        confidence = float(predictions[class_idx])

        # Default class labels
        class_labels = ["tomato_early_blight", "tomato_late_blight", "cotton_bacterial_blight"]
        pred_label = class_labels[class_idx] if class_idx < len(class_labels) else "unknown_disease"

        return {
            "prediction": pred_label,
            "confidence": round(confidence, 4),
            "model_version": self.model_version
        }

class MockDiseaseClassifier(BaseDiseaseClassifier):
    """
    Development/Mock Adapter for Disease Classification.
    Used when real MobileNetV2 trained model weights are not present.
    Cleanly separated from the real inference implementation.
    Evaluates image features (color, texture variance, spots) to map to configured disease catalog classes.
    """
    def __init__(self):
        self.model_version = "v1.0.0-mobilenetv2-dev"
        self.target_diseases = [
            "tomato_early_blight",
            "tomato_late_blight",
            "cotton_bacterial_blight"
        ]

    def predict(self, img_bgr: np.ndarray, image_bytes: bytes = None) -> Dict[str, Any]:
        """
        Analyze image color and pattern statistics to deterministically select prediction & confidence score.
        """
        hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        
        # Color channels analysis
        mean_hue = np.mean(hsv[:, :, 0])
        mean_sat = np.mean(hsv[:, :, 1])
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

        # Deterministic feature-based class selection for mock adapter
        if laplacian_var < 50.0:
            # Low clarity image -> low confidence prediction test case
            prediction = "tomato_early_blight"
            confidence = 0.42
        elif mean_hue < 20 or mean_hue > 150:  # Reddish / Brownish lesions
            prediction = "tomato_early_blight"
            confidence = 0.88
        elif mean_sat > 100:  # Dark wet spots
            prediction = "tomato_late_blight"
            confidence = 0.82
        else:  # Angular green/dark spots
            prediction = "cotton_bacterial_blight"
            confidence = 0.79

        return {
            "prediction": prediction,
            "confidence": round(confidence, 4),
            "model_version": self.model_version
        }

class DiseaseMLService:
    """
    Facade Service managing inference execution, adapter selection, and confidence thresholding.
    """
    def __init__(self, confidence_threshold: float = DEFAULT_CONFIDENCE_THRESHOLD):
        self.confidence_threshold = confidence_threshold
        real_classifier = MobileNetV2Classifier()
        if real_classifier.is_available():
            self.classifier: BaseDiseaseClassifier = real_classifier
            print("[DiseaseMLService] Using MobileNetV2 real model classifier.")
        else:
            self.classifier: BaseDiseaseClassifier = MockDiseaseClassifier()
            print("[DiseaseMLService] Trained model weights missing. Using MockDiseaseClassifier development adapter.")

    def set_confidence_threshold(self, threshold: float):
        self.confidence_threshold = threshold

    def predict(self, img_bytes: bytes, img_bgr: Optional[np.ndarray] = None) -> Dict[str, Any]:
        if img_bgr is None:
            np_arr = np.frombuffer(img_bytes, np.uint8)
            img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        result = self.classifier.predict(img_bgr, image_bytes=img_bytes)
        
        prediction = result["prediction"]
        confidence = float(result["confidence"])
        model_version = result["model_version"]

        is_low_confidence = confidence < self.confidence_threshold
        warning = LOW_CONFIDENCE_WARNING if is_low_confidence else None

        return {
            "prediction": prediction,
            "confidence": confidence,
            "model_version": model_version,
            "is_low_confidence": is_low_confidence,
            "warning": warning,
            "threshold": self.confidence_threshold
        }
