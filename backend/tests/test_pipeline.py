"""
GlucoCare AI - Automated Integration and Regression Test Suite
Tests ML preprocessing, inference with all 5 models, calibration, threshold logic, and FastAPI endpoints.
"""

import os
import sys
import unittest

# Ensure backend root is on path
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, BACKEND_DIR)

from starlette.testclient import TestClient
from app.main import app
from app.ml.predictor import predict_diabetes_risk, get_models


class TestGlucoCareML(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.sample_patient = {
            "Pregnancies": 2,
            "Glucose": 138.0,
            "BloodPressure": 78.0,
            "SkinThickness": 24.0,
            "Insulin": 85.0,
            "BMI": 30.5,
            "DiabetesPedigreeFunction": 0.45,
            "Age": 42.0,
        }

    def test_health_endpoint(self):
        resp = self.client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "healthy")

    def test_metrics_endpoint(self):
        resp = self.client.get("/api/metrics")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["total_records"], 768)
        self.assertEqual(data["best_model"], "Logistic Regression (Balanced)")
        self.assertEqual(data["frozen_decision_threshold"], 0.35)
        self.assertIn("Logistic Regression (Balanced)", data["models"])
        self.assertIn("Gradient Boosting", data["models"])
        self.assertIn("Logistic Regression (Standard)", data["models"])
        self.assertIn("Random Forest", data["models"])
        self.assertIn("Support Vector Machine", data["models"])
        self.assertIn("K-Nearest Neighbors", data["models"])
        self.assertTrue(data["calibration_status"]["is_calibrated"])
        self.assertGreater(len(data["threshold_sweep"]), 0)

    def test_prediction_best_model(self):
        res = predict_diabetes_risk(self.sample_patient, model_name="best")
        self.assertIn("probability", res)
        self.assertIn("probability_percentage", res)
        self.assertIn("risk_level", res)
        self.assertIn(res["risk_level"], ["Low Risk", "Moderate Risk", "High Risk"])
        self.assertIn("Model-Estimated Probability", res["disclaimer"])

    def test_prediction_all_models(self):
        all_models, _ = get_models()
        for model_name in all_models.keys():
            res = predict_diabetes_risk(self.sample_patient, model_name=model_name)
            self.assertEqual(res["model_used"], model_name)
            self.assertGreaterEqual(res["probability"], 0.0)
            self.assertLessEqual(res["probability"], 1.0)

    def test_api_predict_and_history(self):
        payload = {
            "pregnancies": 3,
            "glucose": 150.0,
            "blood_pressure": 82.0,
            "skin_thickness": 30.0,
            "insulin": 120.0,
            "bmi": 33.4,
            "diabetes_pedigree_function": 0.62,
            "age": 48.0,
            "model_name": "best",
            "demographic_tag": "Integration-Test-01",
        }
        resp = self.client.post("/api/predict", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["assessment_id"].startswith("GLUCO-"))

        # Verify record appeared in history
        hist_resp = self.client.get("/api/history")
        self.assertEqual(hist_resp.status_code, 200)
        history = hist_resp.json()
        found = any(r["id"] == data["assessment_id"] for r in history)
        self.assertTrue(found, "Newly predicted assessment was not found in SQLite registry")

        # Clean up test record
        del_resp = self.client.delete(f"/api/history/{data['assessment_id']}")
        self.assertEqual(del_resp.status_code, 200)


if __name__ == "__main__":
    unittest.main()
