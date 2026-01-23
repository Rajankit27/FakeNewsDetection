# Software Requirements Specification (SRS)
## Fake News Detection System

**Version:** 2.0 (Final)  
**Date:** 2026-01-23  
**Status:** Deployment Ready

---

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to define the comprehensive requirements for the "Fake News Detection System". This covers the entire lifecycle from initial data collection and model training to final deployment on the Render cloud platform.

### 1.2 Scope
The system is a full-stack web application designed to:
- **Analyze Text:** Predict if a news article is Real or Fake using Natural Language Processing.
- **Verify URLs:** Scrape and check external websites.
- **Search Topics:** Fetch global news trends via API.
- **Auto-Deploy:** Automatically build and train models on the cloud (Render).

### 1.3 Definitions and Acronyms
- **SRS**: Software Requirements Specification
- **TF-IDF**: Term Frequency-Inverse Document Frequency
- **NLP**: Natural Language Processing
- **CI/CD**: Continuous Integration/Continuous Deployment
- **Render**: The cloud Platform-as-a-Service (PaaS) provider

---

## 2. Overall Description

### 2.1 Product Perspective
This system is an end-to-end solution:
1.  **Development Environment**: Windows (Python 3.13), VS Code.
2.  **Version Control**: Git & GitHub for source code management.
3.  **Production Environment**: Linux (Python 3.11) on Render.com.

### 2.2 Product Functions
- **Core Function:** Binary classification (REAL vs FAKE) with probability score.
- **Data Ingestion:** Accepts direct text, web URLs, or API search queries.
- **Self-Training:** The system retrains its own model during deployment to ensure version compatibility.

### 2.3 User Characteristics
- **End Users:** General public checking news credibility.
- **Admin/Developer:** Manages the GitHub repository to trigger updates.

---

## 3. Specific Requirements

### 3.1 Functional Requirements

#### FR-01: Data Collection & Training (Step 1)
- **Description**: The system must include a training script (`train_model.py`) that downloads the dataset.
- **Requirement**: Must handle 6000+ labeled news articles.
- **Algorithm**: Logistic Regression with TF-IDF Vectorizer.

#### FR-02: User Interaction (Step 2)
- **Description**: Web interface with 3 distinct tabs (Text, API, URL).
- **Requirement**: Must validate input (min 10 chars) and provide instant feedback.

#### FR-03: Backend Processing (Step 3)
- **Description**: Flask server exposes `/predict` endpoints.
- **Requirement**: Must load the `.pkl` model files into memory at startup.

#### FR-04: Cloud Deployment (Step Last)
- **Description**: The application must be hosted publicly.
- **Platform**: Render (Free Tier).
- **Configuration**: Uses `render.yaml` to define the build environment.
- **Build Step**: `pip install dependencies` AND `python train_model.py` (Server-side training).

### 3.2 Non-Functional Requirements

#### NFR-01: Compatibility check
- The system must resolve Python version mismatches (e.g., 3.13 local vs 3.11 server) by training on the target environment.

#### NFR-02: Performance
- API Response time < 500ms.
- Cold start time < 50 seconds (due to free tier constraints).

#### NFR-03: Maintainability
- Code must be modular (`app.py` separate from `train_model.py`).
- Automated deployment via GitHub push.

---

## 4. System Architecture (Step 1 to Step Last)

The project follows this sequential flow:

1.  **Data Phase**: `fake_or_real_news.csv` -> Preprocessing -> TF-IDF -> Model Training.
2.  **App Phase**: Flask App loads Model -> Serves HTML/JS Frontend.
3.  **Git Phase**: Local Code -> `git push` -> GitHub Repository.
4.  **Deploy Phase**: GitHub -> Render Webhook -> Build (Install + Train) -> Deploy.

---

## 5. Appendices
- **LIBRARIES USED**: Flask, Scikit-learn, Pandas, NLTK, Gunicorn.
- **HOSTING**: Render.com.
- **VERSION CONTROL**: GitHub.
