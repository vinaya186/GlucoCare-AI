"""
GlucoCare AI - Assessment History API Routes
Manages anonymous demo assessment logs.
"""

from typing import List
from fastapi import APIRouter, HTTPException
from app.models.schemas import AssessmentRecord
from app.database import list_assessments, delete_assessment, clear_all_assessments

router = APIRouter(prefix="/api/history", tags=["Assessment History"])


@router.get("", response_model=List[AssessmentRecord])
def get_history(limit: int = 50):
    """Fetches recently evaluated assessment records."""
    return list_assessments(limit=limit)


@router.delete("/{assessment_id}")
def remove_record(assessment_id: str):
    """Deletes a specific assessment record."""
    success = delete_assessment(assessment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Assessment record not found")
    return {"status": "deleted", "id": assessment_id}


@router.delete("")
def clear_history():
    """Wipes all demo assessment history."""
    clear_all_assessments()
    return {"status": "all_cleared"}
