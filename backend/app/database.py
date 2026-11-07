"""
GlucoCare AI - Assessment History Database (SQLite)
Stores demo assessment records for the session/history UI.
Strictly does NOT record real names, phone numbers, or private healthcare identifiers (PHI).
"""

import json
import os
import sqlite3
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
DB_PATH = os.path.join(BACKEND_DIR, "gluco_assessments.db")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes the assessments table if it does not exist."""
    with get_db_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS assessment_history (
                id TEXT PRIMARY KEY,
                created_at TEXT NOT NULL,
                demographic_tag TEXT,
                age REAL NOT NULL,
                glucose REAL NOT NULL,
                bmi REAL NOT NULL,
                blood_pressure REAL NOT NULL,
                model_used TEXT NOT NULL,
                probability_percentage REAL NOT NULL,
                risk_level TEXT NOT NULL,
                features_json TEXT NOT NULL
            )
        """)
        conn.commit()


def save_assessment(
    demographic_tag: Optional[str],
    age: float,
    glucose: float,
    bmi: float,
    blood_pressure: float,
    model_used: str,
    probability_percentage: float,
    risk_level: str,
    features: Dict[str, Any],
) -> str:
    """Inserts an assessment record and returns its unique ID."""
    record_id = f"GLUCO-{uuid.uuid4().hex[:8].upper()}"
    timestamp = datetime.now(timezone.utc).isoformat()
    features_json = json.dumps(features)

    with get_db_connection() as conn:
        conn.execute(
            """
            INSERT INTO assessment_history (
                id, created_at, demographic_tag, age, glucose, bmi,
                blood_pressure, model_used, probability_percentage, risk_level, features_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                record_id,
                timestamp,
                demographic_tag or f"Anonymous-{record_id[-4:]}",
                age,
                glucose,
                bmi,
                blood_pressure,
                model_used,
                probability_percentage,
                risk_level,
                features_json,
            ),
        )
        conn.commit()
    return record_id


def list_assessments(limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieves recent assessment records."""
    init_db()
    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            SELECT id, created_at, demographic_tag, age, glucose, bmi,
                   blood_pressure, model_used, probability_percentage, risk_level, features_json
            FROM assessment_history
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (limit,),
        )
        rows = cursor.fetchall()
        results = []
        for r in rows:
            results.append({
                "id": r["id"],
                "created_at": r["created_at"],
                "demographic_tag": r["demographic_tag"],
                "age": r["age"],
                "glucose": r["glucose"],
                "bmi": r["bmi"],
                "blood_pressure": r["blood_pressure"],
                "model_used": r["model_used"],
                "probability_percentage": r["probability_percentage"],
                "risk_level": r["risk_level"],
                "features": json.loads(r["features_json"]),
            })
        return results


def delete_assessment(assessment_id: str) -> bool:
    """Deletes an assessment record by ID."""
    with get_db_connection() as conn:
        cursor = conn.execute("DELETE FROM assessment_history WHERE id = ?", (assessment_id,))
        conn.commit()
        return cursor.rowcount > 0


def clear_all_assessments():
    """Wipes demo history."""
    with get_db_connection() as conn:
        conn.execute("DELETE FROM assessment_history")
        conn.commit()


# Initialize database upon import
init_db()
