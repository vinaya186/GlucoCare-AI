"""
GlucoCare AI - Data Schemas (Pydantic)
Enforces clinical input validation boundaries and explicit non-diagnostic labeling.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class DiabetesAssessmentInput(BaseModel):
    """
    Patient diagnostic indicators.
    Enforces valid biological ranges to avoid erroneous inputs.
    """
    pregnancies: int = Field(
        default=0,
        ge=0,
        le=20,
        description="Number of pregnancies (0 for biological males or nulliparous individuals)",
    )
    glucose: float = Field(
        ...,
        ge=0.0,
        le=500.0,
        description="Plasma fasting or 2-hour post-load glucose level (mg/dL)",
    )
    blood_pressure: float = Field(
        ...,
        ge=0.0,
        le=250.0,
        description="Diastolic blood pressure (mmHg)",
    )
    skin_thickness: float = Field(
        default=0.0,
        ge=0.0,
        le=120.0,
        description="Triceps skin fold thickness (mm)",
    )
    insulin: float = Field(
        default=0.0,
        ge=0.0,
        le=900.0,
        description="2-Hour serum insulin (mu U/ml)",
    )
    bmi: float = Field(
        ...,
        ge=0.0,
        le=80.0,
        description="Body Mass Index (weight in kg / (height in meters)^2)",
    )
    diabetes_pedigree_function: float = Field(
        ...,
        ge=0.0,
        le=3.0,
        description="Diabetes pedigree function (genetic score)",
    )
    age: float = Field(
        ...,
        ge=1.0,
        le=120.0,
        description="Age in years",
    )
    model_name: Optional[str] = Field(
        default="best",
        description="Classifier to execute: 'best', 'Logistic Regression', 'K-Nearest Neighbors', or 'Random Forest'",
    )
    # Optional anonymous metadata (NO real names or phone numbers collected)
    demographic_tag: Optional[str] = Field(
        default=None,
        max_length=50,
        description="Optional anonymous assessment tag (e.g. 'Patient-A42', 'Adult Screening')",
    )


class InsightObservation(BaseModel):
    feature: str
    status: str
    severity: str
    note: str


class PredictionResponse(BaseModel):
    assessment_id: Optional[str] = None
    model_used: str
    prediction: int
    is_diabetic: bool
    probability: float
    probability_percentage: float
    risk_level: str
    risk_color: str
    recommendation: str
    insights: List[InsightObservation]
    disclaimer: str


class AssessmentRecord(BaseModel):
    id: str
    created_at: str
    demographic_tag: Optional[str] = None
    age: float
    glucose: float
    bmi: float
    blood_pressure: float
    model_used: str
    probability_percentage: float
    risk_level: str
    features: Dict[str, Any]
