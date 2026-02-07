# Data Flow Diagram (DFD) - Level 1 Explanation

This document explains the flow of data through the **TruthLens Intelligence** system, corresponding to the Level 1 DFD.

## 1. External Entity: User / Admin
*   **Role:** The source of data.
*   **Action:** Submits a "News Text" or a "URL" via the Frontend Dashboard.

## 2. Process: Input Validation
*   **Input:** Raw Text or URL.
*   **Logic:**
    *   Checks if the input is empty.
    *   Verifies if the user is authenticated (JWT Token check).
    *   Determines if the input is a direct text or a link.
*   **Output:** Validated Input.

## 3. Process: Content Extraction (Web Scraper)
*   **Condition:** ONLY triggers if the input is a URL.
*   **Logic:**
    *   Connects to the external website.
    *   Removes ads, menus, and HTML tags using `BeautifulSoup`.
    *   Extracts the core article title and body.
*   **Output:** Extracted Plain Text.

## 4. Process: NLP Preprocessing
*   **Input:** Raw / Extracted Text.
*   **Logic:**
    *   **Lowercasing:** Converts "FAKE" to "fake".
    *   **Stopword Removal:** Removes common words like "the", "is", "at".
    *   **Lemmatization:** Converts words to base form (e.g., "running" -> "run").
*   **Output:** Cleaned, Normalized Text.

## 5. Process: ML Analysis Engine (The Core)
*   **Input:** Cleaned Text.
*   **Logic:**
    *   **Vectorization (TF-IDF):** Converts text into a numerical matrix.
    *   **Inference:** The Logistic Regression model calculates the probability of the news being Fake.
    *   **XAI:** Identifies significant keywords causing the decision.
*   **Output:** Prediction Label (REAL/FAKE) + Confidence Score (e.g., 92%).

## 6. Process: Result Generation & Storage
*   **Input:** Prediction Results.
*   **Logic:** Formats the final JSON response for the frontend.
*   **Data Store Actions:**
    *   **Logs DB:** Saves the query and result for user history.
    *   **Feedback DB:** (Optional) Stores disputed results if the user flags them.
*   **Final Output:** A JSON response sent back to the User's Dashboard.
