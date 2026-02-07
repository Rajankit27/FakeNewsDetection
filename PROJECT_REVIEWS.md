# TruthLens Intelligence: Project Review Roadmap

This document outlines the suggested contents to present for each stage of your project review, mapping them to specific development phases.

> [!NOTE]
> Phases are derived from the Project Timeline in `SYNOPSIS.md`.

## Review 1: Core Functionality (50%)
**Phases Covered:** Phase 1, Phase 2, & Phase 3 (Partial)
**Work Done / To Show:**
-   **Dataset acquisition:** `fake_or_real_news.csv` downloaded and preprocessed.
-   **Model Training:** `train_model.py` executed successfully.
-   **Basic API:** `app.py` responding to `/api/predict`.

### 1. Project Structure & Setup
-   **Show:** The folder structure (`backend/`, `frontend/`, `ml/`).
-   **Explain:** How the project is organized (MVC pattern: Model-View-Controller).
-   **Run:** `pip install -r requirements.txt` to show dependencies are managed.

### 2. Machine Learning Model (Phase 2)
-   **Show:** `ml/train_model.py`.
-   **Action:** Run the training script in the terminal:
    ```bash
    python ml/train_model.py
    ```
-   **Highlight:**
    -   Dataset loading (Fake/Real news).
    -   Preprocessing (Text cleaning).
    -   **Accuracy Score:** Show the ~90%+ accuracy in the terminal output.
    -   **Model File:** Show `model_v1.pkl` being created.

### 3. Basic Backend API (Phase 3)
-   **Show:** `backend/app.py`.
-   **Action:** Start the Flask server.
-   **Test:** Use Postman or a simple curl command to hit the `/api/predict` endpoint with a sample text:
    ```json
    { "text": "Breaking news: Aliens land in New York!" }
    ```
-   **Result:** Show the JSON response containing `"prediction": "FAKE"`.

---

## Review 2: Integrated System (80%)
**Phases Covered:** Phase 3 (Complete), Phase 4, & Phase 5
**Work Done / To Show:**
-   **Frontend Integration:** Dashboard UI connected to Backend API.
-   **Authentication:** Login/Register flows working with JWT.
-   **Database:** MongoDB storing User profiles and History.
-   **Real-time Features:** News Ticker and URL fetching.

### 1. Authentication Flow (Phase 5)
-   **Action:** Open the Web Browser.
-   **Demo:**
    1.  Go to the **Register** page. Create a new user (e.g., `Reviewer1`).
    2.  Go to the **Login** page. Log in with the new credentials.
    3.  Show the **JWT Token** generation (in Application tab of DevTools).

### 2. Dashboard & Analysis (Phase 4)
-   **Show:** The **Bento Grid Dashboard**.
-   **Demo:**
    1.  **Text Analysis:** Copy-paste a news snippet. Click "Analyze". Show the result card appearing with "REAL" or "FAKE".
    2.  **URL Analysis:** Paste a link to a news article. Click "Fetch & Analyze". Show the scraped content and result.
    3.  **Real-Time Ticker:** Point out the scrolling news ticker at the bottom.

### 3. History & Persistence (Phase 3)
-   **Action:** Refresh the page.
-   **Show:** Go to the "History" or "Logs" section.
-   **Verify:** The analyses you just performed should be listed there (fetched from MongoDB).

### 4. Database Verification
-   **Show:** MongoDB Atlas Dashboard (optional, if asked).
-   **Verify:** Show the `users` and `analysis_logs` collections having new data.

---

## Review 3: Production Ready (100% + Documentation)
**Phases Covered:** Phase 6 (Final)
**Work Done / To Show:**
-   **Full System Polish:** UI refinements and bug fixes.
-   **Admin Tools:** RBAC implementation and dispute handling.
-   **XAI Implementation:** Explainable AI logic fully integrated.
-   **Deployment:** Live URL accessible on the public internet.
-   **Documentation:** All reports and diagrams finalized.

### 1. Advanced AI Features (XAI)
-   **Demo:** Analyze a complex fake news text.
-   **Highlight:** The **"Contributing Words"** section. Explain how the system highlights specific words (e.g., "shocking", "unbelievable") that triggered the Fake classification.

### 2. Admin Console & Feedback
-   **Action:** Login as an **Admin**.
-   **Show:**
    1.  **Statistics:** The charts showing "Total Scans" vs "Fake News Detected".
    2.  **User Management:** List of registered users.
    3.  **Dispute System:** If a normal user flagged a result as wrong, show it appearing here for review.
    4.  **Retraining:** Click the "Retrain Model" button to show the pipeline trigger.

### 3. Deployment (Phase 6)
-   **Show:** The **Live URL** on Render (e.g., `https://truthlens-ai.onrender.com`).
-   **Verify:** Run a live analysis on the deployed version (not localhost).

### 4. Documentation Suite
-   **Present:**
    1.  **SYNOPSIS.md:** Project overview and objective.
    2.  **SRS.md:** Detailed Requirements (Functional & Non-Functional).
    3.  **ARCHITECTURE.md:** System design.
    4.  **Diagrams:**
        -   **Flowchart:** `truthlens_flowchart_final.png`
        -   **Data Flow:** `truthlens_data_flow_visual.png`
        -   **ER Diagram:** `truthlens_er_diagram_simple.png`
        -   **Architecture:** `truthlens_architecture.png`
