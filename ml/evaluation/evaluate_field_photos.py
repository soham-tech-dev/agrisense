"""
AgriSense Phase 3 - Local Field Photograph Evaluation Mechanism
Evaluates real farmer/field photographs against the disease classifier and image quality validator.
"""

import os
import json
from typing import List, Dict, Any
from app.services.image_validation_service import ImageValidationService, ImageValidationError
from app.services.disease_ml_service import DiseaseMLService

class FieldPhotoEvaluator:
    def __init__(self, field_photos_dir: str = "ml/dataset/field_photos"):
        self.field_photos_dir = field_photos_dir
        self.ml_service = DiseaseMLService()

    def evaluate_directory(self) -> Dict[str, Any]:
        """
        Scans field photograph directory, validates each photo with OpenCV,
        runs ML inference, and compiles validation/prediction report.
        """
        results = []
        total_photos = 0
        passed_validation = 0
        failed_validation = 0
        high_confidence_predictions = 0

        if not os.path.exists(self.field_photos_dir):
            return {
                "status": "directory_not_found",
                "message": f"Field photos directory '{self.field_photos_dir}' does not exist yet.",
                "total_photos": 0
            }

        for filename in os.listdir(self.field_photos_dir):
            if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                total_photos += 1
                filepath = os.path.join(self.field_photos_dir, filename)

                with open(filepath, 'rb') as f:
                    img_bytes = f.read()

                # Step 1: Validate
                try:
                    ImageValidationService.validate_image_bytes(img_bytes, filename=filename)
                    is_valid = True
                    val_message = "OK"
                    passed_validation += 1
                except ImageValidationError as e:
                    is_valid = False
                    val_message = str(e)
                    failed_validation += 1

                # Step 2: Prediction if valid
                pred_data = None
                if is_valid:
                    pred_data = self.ml_service.predict(img_bytes)
                    if not pred_data.get("is_low_confidence", False):
                        high_confidence_predictions += 1

                results.append({
                    "filename": filename,
                    "is_valid": is_valid,
                    "validation_message": val_message,
                    "prediction": pred_data.get("prediction") if pred_data else None,
                    "confidence": pred_data.get("confidence") if pred_data else None,
                    "is_low_confidence": pred_data.get("is_low_confidence") if pred_data else None
                })

        return {
            "total_photos": total_photos,
            "passed_validation": passed_validation,
            "failed_validation": failed_validation,
            "high_confidence_predictions": high_confidence_predictions,
            "validation_pass_rate": round(passed_validation / total_photos, 4) if total_photos > 0 else 0.0,
            "details": results
        }

if __name__ == "__main__":
    evaluator = FieldPhotoEvaluator()
    report = evaluator.evaluate_directory()
    print("--- Local Field Photograph Evaluation Report ---")
    print(json.dumps(report, indent=2))
