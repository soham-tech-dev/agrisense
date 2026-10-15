"""
AgriSense Phase 3 - ML Evaluation Framework
Calculates model metrics:
- Overall Accuracy
- Precision
- Recall
- F1 Score
- Confusion Matrix
- Per-class Accuracy
"""

import json
import numpy as np
from typing import Dict, List, Any

class ModelEvaluator:
    def __init__(self, class_names: List[str]):
        self.class_names = class_names
        self.num_classes = len(class_names)

    def calculate_metrics(self, y_true: List[int], y_pred: List[int]) -> Dict[str, Any]:
        """
        Calculates accuracy, precision, recall, F1 score, confusion matrix, and per-class accuracy.
        """
        y_true = np.array(y_true)
        y_pred = np.array(y_pred)

        # Confusion Matrix
        cm = np.zeros((self.num_classes, self.num_classes), dtype=int)
        for t, p in zip(y_true, y_pred):
            cm[t, p] += 1

        # Accuracy
        total_samples = len(y_true)
        correct_predictions = np.trace(cm)
        accuracy = float(correct_predictions / total_samples) if total_samples > 0 else 0.0

        # Per-class metrics
        per_class_accuracy = {}
        precision_list = []
        recall_list = []
        f1_list = []

        for i, class_name in enumerate(self.class_names):
            tp = cm[i, i]
            fp = np.sum(cm[:, i]) - tp
            fn = np.sum(cm[i, :]) - tp
            tn = total_samples - (tp + fp + fn)

            class_total = np.sum(cm[i, :])
            class_acc = float(tp / class_total) if class_total > 0 else 0.0
            per_class_accuracy[class_name] = round(class_acc, 4)

            precision = float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0
            recall = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0
            f1 = float(2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0

            precision_list.append(precision)
            recall_list.append(recall)
            f1_list.append(f1)

        macro_precision = float(np.mean(precision_list))
        macro_recall = float(np.mean(recall_list))
        macro_f1 = float(np.mean(f1_list))

        return {
            "accuracy": round(accuracy, 4),
            "precision": round(macro_precision, 4),
            "recall": round(macro_recall, 4),
            "f1": round(macro_f1, 4),
            "per_class_accuracy": per_class_accuracy,
            "confusion_matrix": cm.tolist(),
            "class_names": self.class_names
        }

if __name__ == "__main__":
    classes = ["tomato_early_blight", "tomato_late_blight", "cotton_bacterial_blight"]
    evaluator = ModelEvaluator(classes)

    # Simulated evaluation run demonstration
    y_true = [0, 0, 0, 1, 1, 1, 2, 2, 2, 0, 1, 2]
    y_pred = [0, 0, 1, 1, 1, 1, 2, 2, 2, 0, 1, 2]

    metrics = evaluator.calculate_metrics(y_true, y_pred)
    print("--- Model Evaluation Metrics ---")
    print(json.dumps(metrics, indent=2))
