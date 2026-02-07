# Software Requirements Specification (SRS)
## TruthLens Intelligence - Fake News Detection System

**Version:** 3.1 (Enhanced Release)  
**Date:** 2026-01-31  
**Status:** Deployed & Operational  

---

## 1. Introduction

### 1.1 Purpose
This document defines the complete functional and non-functional requirements for "TruthLens Intelligence", an enterprise-grade fake news detection platform. It details the system architecture, user roles (Agent vs Admin), security protocols, and deployment status.

### 1.2 Scope
TruthLens Intelligence is a secure, full-stack web application that allows authorized agents to verification the credibility of text, URLs, and global news trends using advanced machine learning.
**Key Modules:**
- **Secure Authentication**: JWT-based Login/Registration.
- **Command Center Dashboard**: Real-time analysis with "Bento Grid" layout.
- **Feedback Loop**: User-driven reinforcement learning (Agree/Disagree ratings).
- **Admin Console**: System oversight, model retraining triggers, and dispute management.
- **Intelligence Log**: History tracking for all investigations.

---

## 2. System Overview

### 2.1 Technology Stack
- **Frontend**: HTML5, Vanilla JavaScript, CSS3 (Tailwind CSS for utility classes), Chart.js (Visuals).
- **Backend**: Python 3.11 (Flask Framework).
- **Database**: MongoDB Atlas (User data, Logs).
- **ML Core**: Scikit-Learn (Logistic Regression), NLTK (NLP Preprocessing).
- **Deployment**: Render (PaaS) with Gunicorn WSGI Server.

### 2.2 User Roles
1.  **Agent (Standard User)**:
    - Authenticate securely.
    - Run Text, URL, and Global API analysis.
    - View personal history logs.
2.  **Admin (Superuser)**:
    - View global system telemetry (Total Scans, Fake News Rate).
    - Manage disputes and accuracy reports.

---

## 3. Specific Requirements

### 3.1 Functional Requirements (FR)

#### FR-01: Authentication & Security
- **Login/Register**: Users must Authenticate to access the dashboard.
- **Session Management**: Uses JSON Web Tokens (JWT) stored in LocalStorage.
- **Role-Based Access Control (RBAC)**: Protections on `/admin` routes.

#### FR-02: Dashboard Interface
- **Application Shell**: Viewport-fitted "Bento Grid" layout (1366x768 optimized).
- **Live Ticker**: Real-time scrolling news feed (Simulated).
- **Internal Scrolling**: Content cards scroll independently without expanding the page.

#### FR-03: Analysis Engine
- **Text Analysis**: Direct input processing via ML Pipeline (TF-IDF -> LogReg).
- **URL Analysis**: Web scraping module extracts text from a given URL.
- **Global Search**: Fetches recent news metadata from external News APIs.
- **Feedback Mechanism**: Users can rate analysis results (Agree/Disagree) to improve model accuracy.
- **XAI (Explainable AI)**: Highlights contributing words (e.g., "shocking", "breaking") that influenced the prediction.

#### FR-04: Admin Console
- **Telemetry**: Displays aggregate statistics (Active Users, API Latency).
- **Model Retraining**: Pipeline to re-vectorize data and update model weights based on new feedback.
- **Dispute Queue**: Lists user-reported misclassifications for future model retraining.

### 3.2 Non-Functional Requirements (NFR)

#### NFR-01: Compatibility & Performance
- **Cross-Environment**: Training script (`train_model.py`) runs during build to resolve Python version discrepancies (3.13 vs 3.11).
- **Wait Time**: Gunicorn worker threads ensure concurrent request handling.

#### NFR-02: Deployment Architecture
- **Platform**: Render.com.
- **Build Command**: `pip install -r requirements.txt && python ml/train_model.py`.
- **WSGI Server**: Gunicorn binds automatically to the injected `$PORT`.
- **Static Serving**: Backend serves frontend assets directly from the root URL.

---

## 4. System Architecture Flow

1.  **User Request** -> **Render Load Balancer** -> **Gunicorn Server**.
2.  **Flask App**:
    - Validation: Checks JWT Token.
    - Routing: Serves static HTML or processes API JSON.
3.  **ML Pipeline**:
    - Input -> Preprocessing (Lemmatization) -> Vectorization (TF-IDF) -> Prediction.
4.  **Database**:
    - Logs results to `analysis_logs` collection in MongoDB.
    - Updates user history.

---

## 5. Deployment Guide (Summary)

- **Repository**: GitHub (Synced).
- **Configuration**:
    - `render.yaml`: Defines Python runtime and build steps.
    - `requirements.txt`: Includes `gunicorn`, `pandas`, `flask`, `nltk`.
- **Live URL**: `https://fake-news-detector.onrender.com` (Example).

---
**End of Document**
