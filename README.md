# GlucoCare AI — Clinical Diabetes Risk Intelligence Platform

GlucoCare AI is an end-to-end full-stack healthcare screening web application that upgrades the classic Pima Indians Diabetes machine learning benchmark into a modern, transparent clinical SaaS dashboard.

Built with **FastAPI** (Python 3.13), **scikit-learn**, **React 19**, **Vite**, **Tailwind CSS**, and **Recharts**.

---

## ⚠️ Clinical & Educational Disclaimer
> **Non-Diagnostic Screening Notice:** GlucoCare AI generates statistical probability estimates based on empirical patterns in the 768-record Pima Indians Diabetes research cohort. It is **not** an FDA/CE cleared diagnostic medical device and does not substitute for licensed clinical judgment, patient history, or laboratory testing (e.g., HbA1c, Oral Glucose Tolerance Test, fasting blood glucose). All outputs are algorithmic screening estimates.

---

## Architecture Overview

```text
Project Diabetes/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app instance, CORS middleware, routes
│   │   ├── database.py          # SQLite repository for anonymous demo assessment history (no PHI)
│   │   ├── api/
│   │   │   ├── predict.py       # POST /api/predict, GET /api/metrics
│   │   │   └── history.py       # GET /api/history, DELETE /api/history/{id}
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic boundary validation & non-PHI schemas
│   │   └── ml/
│   │       ├── train.py         # 5-Fold Stratified CV, training-only calibration & threshold sweeps
│   │       └── predictor.py     # Probability estimation, risk tiers & physiological observations
│   ├── data/
│   │   └── diabetes.csv         # Pima Indians Diabetes Dataset (768 records, 8 features)
│   ├── saved_models/            # Serialized models (best_model.joblib, all_models.joblib, metrics.json)
│   ├── tests/
│   │   └── test_pipeline.py     # Automated unittest test suite
│   └── requirements.txt         # FastAPI, scikit-learn, pandas, joblib, uvicorn
│
├── frontend/                    # React 19 + Vite + Tailwind CSS + Recharts
│   ├── src/
│   │   ├── components/          # Sidebar, Topbar, ProbabilityGauge, DisclaimerBanner
│   │   ├── views/               # Dashboard, NewAssessment, PredictionResult, ModelAnalytics, History, About
│   │   ├── services/api.js      # Centralized API service with network resilience
│   │   ├── App.jsx              # Application router and state management
│   │   └── index.css            # Tailwind directives
│   ├── package.json
│   ├── vite.config.js           # Reverse-proxy to FastAPI on port 8000
│   └── vercel.json              # Vercel SPA routing
├── render.yaml                  # Render cloud backend deployment blueprint
└── README.md
```

---

## Machine Learning Pipeline & Methodology

### 1. Dataset & Zero-Leakage Preprocessing
The application utilizes the benchmark **Pima Indians Diabetes Database** (768 records, 8 physiological features, binary `Outcome`).

In metabolic surveys, recorded zero values for physiological parameters are biological impossibilities for living subjects. The pipeline handles these missing indicators without data leakage:
* **Insulin:** 374 missing entries (48.7%)
* **Skin Thickness:** 227 missing entries (29.6%)
* **Blood Pressure:** 35 missing entries (4.6%)
* **BMI:** 11 missing entries (1.4%)
* **Glucose:** 5 missing entries (0.7%)

**Zero-Leakage Guarantee:** Documented zeros are converted to `NaN`. Imputation (`SimpleImputer(strategy='median')`) and standardization (`StandardScaler()`) are enclosed strictly inside scikit-learn `Pipeline` objects. Imputation medians and scaling parameters ($\mu, \sigma$) are computed **solely from training folds**, ensuring zero information spills over into validation folds or the holdout test set.

---

### 2. Primary Model Selection Justification

The system implements a rigorous model comparison across 6 tuned algorithms using an 80/20 stratified split (614 training samples, 154 untouched holdout test samples):

| Classifier | 5-Fold CV ROC-AUC | 5-Fold CV Recall | 5-Fold CV F1 | Holdout Acc (th=0.50) | Holdout Brier |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Balanced Logistic Regression (`C=0.1`)** *(Primary)* | **0.8450** | **71.98%** | **0.6823** | 70.78% | 0.1811 |
| **Gradient Boosting Classifier** | 0.8394 | 61.22% | 0.6489 | **74.03%** | **0.1698** |
| **Support Vector Machine (RBF/Linear)** | **0.8450** | 57.01% | 0.6524 | 69.48% | 0.1737 |
| **Standard Logistic Regression** | 0.8444 | 56.08% | 0.6404 | 68.83% | 0.1737 |
| **Random Forest (100 trees, max_depth=5)** | 0.8402 | 52.82% | 0.6145 | 72.73% | 0.1714 |
| **K-Nearest Neighbors (k=15, distance)** | 0.8328 | 57.07% | 0.6285 | 73.38% | 0.1697 |

#### Why Balanced Logistic Regression was Selected:
1. **Highest Discrimination:** Balanced Logistic Regression tied for the highest cross-validation ROC-AUC (**0.8450** $\pm$ 0.013).
2. **Clinical Sensitivity (Recall):** In disease screening, false negatives carry significant clinical risk (undiagnosed diabetes). Balanced Logistic Regression achieved **71.98% CV Recall**, outperforming Gradient Boosting (61.22%) by +10.76% and Random Forest (52.82%) by +19.16%.
3. **Harmonic Balance:** Achieved the highest cross-validation F1-score (**0.6823**).
4. **Low Overfitting Gap:** Exhibited a modest 5.44% train/test accuracy gap, compared to 14.73% for Gradient Boosting.
5. **Linear Interpretability:** Directly provides standardized log-odds effect sizes for transparent review.

*All 5 alternative candidate models are preserved in `all_models.joblib` and remain fully accessible via the UI and API.*

---

### 3. Decision Threshold Optimization: Recall-Prioritizing Decision

Threshold optimization was conducted **strictly on out-of-fold cross-validation probabilities** on $X_{\text{train}}$ ($N=614$) prior to holdout evaluation:

| Threshold ($th$) | Train CV Accuracy | Train CV Precision | Train CV Recall | Train CV F1-Score | Train CV Missed Cases (FN) | Train CV False Alarms (FP) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 0.25 | 71.01% | 55.52% | 84.58% | 0.6704 | 33 | 145 |
| 0.30 | 73.78% | 59.17% | 79.91% | 0.6799 | 43 | 118 |
| **0.35 (Frozen)** | **76.38%** | **64.44%** | **71.96%** | **0.6799** | **60** | **85** |
| 0.40 | 78.01% | 68.72% | 67.76% | **0.6824** | 69 | 66 |
| 0.45 | 78.99% | 72.73% | 63.55% | 0.6783 | 78 | 51 |
| 0.50 (Standard) | 77.85% | 73.78% | 56.54% | 0.6402 | 93 | 43 |
| 0.55 | 78.34% | 76.82% | 54.21% | 0.6356 | 98 | 35 |
| 0.60 | 77.69% | 78.10% | 50.00% | 0.6097 | 107 | 30 |

#### Threshold Selection Protocol:
* **The F1 Peak:** Threshold $0.40$ achieves the highest training CV F1-score (**0.6824** with Recall: $67.76\%$, $69$ FN).
* **The Sensitivity Decision:** For clinical triage, missing a true diabetic case carries a severe penalty. Lowering the threshold to **$0.35$** increases training recall to **$71.96\%$** (reducing missed cases from $69$ to $60$) while preserving a strong F1-score of **$0.6799$** and precision of **$64.44\%$**.
* **Methodological Distinction:** Threshold $0.35$ was explicitly selected as a **recall-prioritizing / sensitivity-prioritizing decision**, not an F1-maximizing decision.
* **Freezing:** The cut-off was frozen at $th^* = 0.35$ **before** running evaluation on the holdout test set.

---

### 4. Probability Calibration (Platt Sigmoid Scaling)
Logistic Regression probabilities were calibrated using Platt Sigmoid Scaling (`CalibratedClassifierCV(..., method='sigmoid', cv=5)`), fitted strictly on $X_{\text{train}}$:
* **Raw Holdout Brier Score:** `0.1811`
* **Calibrated Holdout Brier Score:** `0.1739`
* **Empirical Error Drop:** $-0.0072$ ($7.2$ milliBriers improvement)
* Probability calibration was verified on untouched test data without data leakage.

---

### 5. Final Holdout Test Set Evaluation ($N=154$)
Evaluated on the untouched holdout test set at the frozen threshold $th^* = 0.35$:

* **Test Accuracy:** **$71.43\%$** ($(72 + 38) / 154$)
* **Test Sensitivity (Recall):** **$70.37\%$** ($38 / 54$)
* **Test Precision:** **$57.58\%$** ($38 / 66$)
* **Test F1-Score:** **$0.6333$**
* **Test ROC-AUC:** **$0.8087$**
* **Calibrated Test Brier Score:** **$0.1739$**

#### Verified Holdout Confusion Matrix:
| | Predicted Negative ($<0.35$) | Predicted Positive ($\ge 0.35$) | Total |
| :--- | :---: | :---: | :---: |
| **Actual Non-Diabetic ($0$)** | **$TN = 72$** | **$FP = 28$** | 100 |
| **Actual Diabetic ($1$)** | **$FN = 16$** | **$TP = 38$** | 54 |
| **Total** | 88 | 66 | **154** |

*(Notice: Standard $th=0.50$ would produce $27$ false negatives; the $th=0.35$ threshold successfully cuts missed cases down to $16$).*

---

### 6. Standardized Logistic Regression Coefficients & Interpretability

The primary model's standardized coefficients ($\beta$) quantify the estimated change in the model's log-odds of a positive prediction per one standard deviation increase in each normalized feature:

| Biomarker | Standardized Coefficient ($\beta$) | Effect Direction |
| :--- | :---: | :--- |
| **Glucose** | `+1.0238` | Strongest positive contributor to model risk log-odds |
| **BMI** | `+0.5988` | Strong secondary positive contributor |
| **Pregnancies** | `+0.3206` | Moderate positive contribution |
| **Diabetes Pedigree Function** | `+0.2557` | Familial/genetic risk weighting |
| **Age** | `+0.1891` | Positive age-associated weighting |
| **Skin Thickness** | `+0.0590` | Slight positive contribution |
| **Blood Pressure** | `+0.0174` | Minimal linear contribution |
| **Insulin** | `+0.0162` | Minimal linear contribution (due to median imputation & covariance with Glucose) |

#### Critical Methodological Note on Causation:
Standardized coefficients represent estimated changes in model log-odds per standard deviation unit within this statistical sample. **They reflect linear associations and do NOT establish biological causation, etiology, or prove standalone clinical importance.**

---

### 7. Clinical & Demographic Limitations
1. **Homogeneous Study Population:** The dataset is restricted to female patients of Pima Indian heritage aged $\ge 21$. Performance may not generalize to diverse multi-ethnic populations or male cohorts without local recalibration.
2. **Missing Physiological Data:** Insulin and Skin Thickness had $48.7\%$ and $29.6\%$ missing values, imputed via training medians. Real-world laboratory measurements will provide higher physiological signal.
3. **Screening vs Diagnostic Utility:** High sensitivity screening identifies subjects requiring confirmatory diagnostics (HbA1c); it does not establish definitive diagnosis.

---

## How to Run Locally

### Prerequisites
* Python 3.10+ (Python 3.13 confirmed)
* Node.js v18+ (Node v22 confirmed)

### Step 1: Start the FastAPI Backend
Open a terminal in `E:\Project Diabetes`:

```powershell
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# (Optional) Re-run ML training and verify serialization
python app/ml/train.py

# Launch FastAPI server on port 8000
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

* Interactive API Docs (Swagger UI): `http://127.0.0.1:8000/docs`
* Health Check: `http://127.0.0.1:8000/api/health`
* Model Metrics Endpoint: `http://127.0.0.1:8000/api/metrics`

### Step 2: Start the React + Vite Frontend
Open a second terminal in `E:\Project Diabetes`:

```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite dev server on port 5173
npm run dev
```

* Open browser at: `http://localhost:5173`

### Step 3: Run Automated Test Suite
From the project root:

```powershell
# Run backend regression and integration tests
python -m unittest backend/tests/test_pipeline.py

# Run frontend production build
cd frontend
npm run build
```

---

## Deployment & Environment Configuration

### Environment Variables
* **Frontend (`frontend/.env`):**
  * `VITE_API_URL`: Base URL of the backend API.
    * For local development: `http://localhost:8000` (or leave empty to use Vite proxy).
    * For production: `https://your-backend.onrender.com`.
* **Backend (`backend/.env`):**
  * `ALLOWED_ORIGINS`: Comma-separated list of allowed frontend origins for CORS.
    * For local development: `*` (or omitted).
    * For production: `https://your-frontend.vercel.app,http://localhost:5173`.
  * `PORT`: Port for uvicorn (defaults to 8000 or `$PORT` set by cloud provider).

### Cloud Deployment (Render + Vercel)
* **Backend on Render (Web Service):**
  1. Connect GitHub repository and select `backend` as root.
  2. Build Command: `pip install -r backend/requirements.txt && python backend/app/ml/train.py`
  3. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --app-dir backend`
  4. Environment Variable: `ALLOWED_ORIGINS` = `https://your-frontend.vercel.app` (or `*`).
* **Frontend on Vercel:**
  1. Connect GitHub repository and select `frontend` as root.
  2. Framework Preset: `Vite`.
  3. Environment Variable: `VITE_API_URL` = `https://your-backend.onrender.com`.
  4. Client-side SPA routing is handled automatically via `frontend/vercel.json`.
