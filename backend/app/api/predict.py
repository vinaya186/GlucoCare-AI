"""
GlucoCare AI - Prediction and Model Metrics Endpoints
"""

import json
import os
from fastapi import APIRouter, HTTPException
from app.models.schemas import DiabetesAssessmentInput, PredictionResponse
from app.ml.predictor import predict_diabetes_risk
from app.database import save_assessment

router = APIRouter(prefix="/api", tags=["Prediction & Models"])

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
SAVED_MODELS_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", "..", "saved_models"))
METRICS_PATH = os.path.join(SAVED_MODELS_DIR, "metrics.json")


@router.post("/predict", response_model=PredictionResponse)
def predict_endpoint(payload: DiabetesAssessmentInput):
    """
    Receives clinical inputs, passes through the calibrated preprocessing pipeline,
    computes probability estimate and risk tier, and stores an anonymous record.
    """
    feature_dict = {
        "Pregnancies": float(payload.pregnancies),
        "Glucose": float(payload.glucose),
        "BloodPressure": float(payload.blood_pressure),
        "SkinThickness": float(payload.skin_thickness),
        "Insulin": float(payload.insulin),
        "BMI": float(payload.bmi),
        "DiabetesPedigreeFunction": float(payload.diabetes_pedigree_function),
        "Age": float(payload.age),
    }

    try:
        result = predict_diabetes_risk(feature_dict, model_name=payload.model_name or "best")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction inference error: {str(e)}")

    # Store anonymous record in SQLite
    record_id = save_assessment(
        demographic_tag=payload.demographic_tag,
        age=payload.age,
        glucose=payload.glucose,
        bmi=payload.bmi,
        blood_pressure=payload.blood_pressure,
        model_used=result["model_used"],
        probability_percentage=result["probability_percentage"],
        risk_level=result["risk_level"],
        features=feature_dict,
    )

    result["assessment_id"] = record_id
    return result


@router.get("/metrics")
def get_model_metrics():
    """
    Returns actual training metrics, cross-validation scores,
    and confusion matrices comparing Logistic Regression, KNN, and Random Forest.
    """
    if not os.path.exists(METRICS_PATH):
        raise HTTPException(
            status_code=404,
            detail="Model metrics file not found. Please run backend/app/ml/train.py first.",
        )

    with open(METRICS_PATH, "r") as f:
        metrics = json.load(f)
    return metrics
