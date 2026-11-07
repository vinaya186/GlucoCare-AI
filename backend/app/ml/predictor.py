"""
GlucoCare AI - Prediction Engine
Loads serialized models and calibrated pipelines, executes inferences, computes estimated probability,
assigns risk stratification, and provides transparent non-clinical health insights.
Preserves 100% backward compatibility with all API endpoints.
"""

import os
import joblib
import numpy as np
import pandas as pd

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", ".."))
SAVED_MODELS_DIR = os.path.join(BACKEND_DIR, "saved_models")

FEATURE_COLUMNS = [
    "Pregnancies",
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
    "DiabetesPedigreeFunction",
    "Age",
]

ZERO_AS_MISSING_COLS = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]

# Load models at module level
_all_models = None
_best_model = None


def get_models():
    """Lazy loader for models to ensure fast module import."""
    global _all_models, _best_model
    if _all_models is None:
        all_models_file = os.path.join(SAVED_MODELS_DIR, "all_models.joblib")
        best_model_file = os.path.join(SAVED_MODELS_DIR, "best_model.joblib")
        if os.path.exists(all_models_file):
            _all_models = joblib.load(all_models_file)
        if os.path.exists(best_model_file):
            _best_model = joblib.load(best_model_file)
    return _all_models, _best_model


def assess_physiological_factors(data: dict) -> list:
    """Provides observational medical context based on standard clinical guidelines."""
    observations = []
    glucose = data.get("Glucose", 0)
    if glucose >= 126:
        observations.append({
            "feature": "Glucose",
            "status": "High (>= 126 mg/dL)",
            "severity": "high",
            "note": "Fasting glucose is in the diabetic reference range.",
        })
    elif glucose >= 100:
        observations.append({
            "feature": "Glucose",
            "status": "Elevated (100 - 125 mg/dL)",
            "severity": "moderate",
            "note": "Fasting glucose indicates impaired fasting glucose / pre-diabetes range.",
        })
    elif glucose > 0:
        observations.append({
            "feature": "Glucose",
            "status": "Normal (< 100 mg/dL)",
            "severity": "normal",
            "note": "Fasting blood sugar within typical healthy limits.",
        })

    bmi = data.get("BMI", 0)
    if bmi >= 30:
        observations.append({
            "feature": "BMI",
            "status": f"Obese ({bmi:.1f})",
            "severity": "high",
            "note": "BMI exceeds 30.0, a prominent factor in metabolic resistance.",
        })
    elif bmi >= 25:
        observations.append({
            "feature": "BMI",
            "status": f"Overweight ({bmi:.1f})",
            "severity": "moderate",
            "note": "BMI is between 25.0 and 29.9.",
        })
    elif bmi > 0:
        observations.append({
            "feature": "BMI",
            "status": f"Normal ({bmi:.1f})",
            "severity": "normal",
            "note": "BMI within standard healthy weight range (18.5 - 24.9).",
        })

    bp = data.get("BloodPressure", 0)
    if bp >= 90:
        observations.append({
            "feature": "Blood Pressure",
            "status": f"Stage 2 Diastolic ({bp:.0f} mmHg)",
            "severity": "high",
            "note": "Elevated diastolic pressure correlates with cardiovascular and metabolic load.",
        })
    elif bp >= 80:
        observations.append({
            "feature": "Blood Pressure",
            "status": f"Stage 1 Diastolic ({bp:.0f} mmHg)",
            "severity": "moderate",
            "note": "Slightly elevated diastolic blood pressure.",
        })

    dpf = data.get("DiabetesPedigreeFunction", 0)
    if dpf >= 0.7:
        observations.append({
            "feature": "Pedigree Function",
            "status": f"Strong Genetic Weight ({dpf:.3f})",
            "severity": "moderate",
            "note": "Elevated diabetes genetic pedigree score indicating higher familial predisposition.",
        })

    return observations


def predict_diabetes_risk(features: dict, model_name: str = "best"):
    """
    Executes inference with input sanitization, probability estimation,
    risk tier assignment, and medical disclaimers.
    """
    all_models, best_model = get_models()

    if all_models is None and best_model is None:
        raise RuntimeError("Machine learning models are not loaded. Please ensure training has completed.")

    # Select model
    if model_name != "best" and all_models and model_name in all_models:
        pipeline = all_models[model_name]
        selected_model_display = model_name
    elif best_model is not None:
        pipeline = best_model
        selected_model_display = "Logistic Regression (Balanced)"
    else:
        first_key = list(all_models.keys())[0]
        pipeline = all_models[first_key]
        selected_model_display = first_key

    # Build input DataFrame
    input_row = {col: features.get(col, 0.0) for col in FEATURE_COLUMNS}
    input_df = pd.DataFrame([input_row])

    # Convert documented zero values to NaN for median imputation
    for col in ZERO_AS_MISSING_COLS:
        if input_df.at[0, col] == 0:
            input_df.at[0, col] = np.nan

    # Predict probability and class
    prob = float(pipeline.predict_proba(input_df)[0][1])
    
    # Frozen decision threshold for Balanced Logistic Regression is 0.35 (optimized on X_train out-of-fold CV)
    if model_name in ["best", "Logistic Regression (Balanced)"]:
        pred_class = int(prob >= 0.35)
    else:
        pred_class = int(pipeline.predict(input_df)[0])
    risk_percentage = round(prob * 100, 1)

    # Risk tier classification based on probability
    if risk_percentage < 35.0:
        risk_level = "Low Risk"
        risk_color = "green"
        recommendation = "Maintain regular physical activity, balanced whole-food nutrition, and annual wellness screenings."
    elif risk_percentage < 60.0:
        risk_level = "Moderate Risk"
        risk_color = "amber"
        recommendation = "Consider lifestyle modifications including dietary sugar moderation, 150 mins weekly cardiovascular exercise, and an HbA1c test with a healthcare professional."
    else:
        risk_level = "High Risk"
        risk_color = "rose"
        recommendation = "Prompt clinical evaluation recommended: Consult a physician for diagnostic fasting blood glucose and HbA1c laboratory confirmation."

    insights = assess_physiological_factors(features)

    return {
        "model_used": selected_model_display,
        "prediction": pred_class,
        "is_diabetic": bool(pred_class == 1),
        "probability": prob,
        "probability_percentage": risk_percentage,
        "risk_level": risk_level,
        "risk_color": risk_color,
        "recommendation": recommendation,
        "insights": insights,
        "disclaimer": (
            "Model-Estimated Probability Notice: This prediction is an algorithmic probability estimate produced by "
            "a machine learning model trained on the Pima Indians Diabetes benchmark dataset (768 records). It is NOT "
            "a clinically calibrated diagnostic test. Healthcare decisions must be made in consultation with a qualified medical professional."
        ),
    }
