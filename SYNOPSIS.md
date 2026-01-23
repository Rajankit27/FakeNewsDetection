# PROJECT SYNOPSIS
## Fake News Detection System Using Machine Learning

**Student Name:** [Your Name]  
**Course:** BCA (Final Year)  
**Date:** 2026-01-23

---

### 1. Introduction
In an era where information spreads instantly, the distinction between authentic news and fabricated stories has blurred. The **Fake News Detection System** is an AI-powered web application designed to automatically classify news articles as "REAL" or "FAKE". This project helps users verify the credibility of information using Natural Language Processing (NLP) techniques.

### 2. Problem Statement
The rapid spread of misinformation on social media can cause panic, damage reputations, and influence public opinion. Manual verification is slow and impractical for the volume of data users consume. There is a need for an automated, accessible tool that can instantly analyze and flag suspicious content.

### 3. Objectives
1.  **Develop a ML Model:** To train a Logistic Regression model on a dataset of 6,000+ news articles.
2.  **Create a Web Interface:** To build a user-friendly frontend where users can simply paste text or URLs.
3.  **Automate Classification:** To provide immediate "Real" vs "Fake" predictions with a confidence score.
4.  **End-to-End Deployment:** To host the application on the cloud (Render) to make it publicly accessible.

### 4. Methodology (Step-by-Step)

#### Step 1: Data Collection & Preprocessing
-   **Dataset:** We utilize a labeled dataset containing text and "FAKE/REAL" labels.
-   **Preprocessing:** The raw text is cleaned (removing punctuation, lowercasing) and Tokenized.
-   **Vectorization:** We use **TF-IDF (Term Frequency-Inverse Document Frequency)** to convert text into numerical vectors that the machine can understand.

#### Step 2: Model Training
-   **Algorithm:** **Logistic Regression** is used for its efficiency in binary text classification.
-   **Training:** The model learns patterns (e.g., sensationalist words found in fake news) from the training data.
-   **Output:** The trained model is saved as a pickle file (`.pkl`) for reuse.

#### Step 3: Web Application Development
-   **Backend:** **Flask (Python)** loads the saved model and exposes an API endpoint.
-   **Frontend:** **HTML/CSS/JavaScript** provides the user interface for Text Input, URL Scraping, and Topic Search.

#### Step 4: Testing & Validation
-   The system validates input length (min 10 chars).
-   It handles errors (e.g., invalid URLs) gracefully.
-   Accuracy is verified on unseen test data (achieving ~92%).

#### Step 5 (Final): Cloud Deployment
-   **Platform:** The project is deployed on **Render.com**.
-   **CI/CD:** The code is pushed to **GitHub**, which triggers an automatic build on Render.
-   **Server-Side Training:** To ensure compatibility, the model is retrained automatically on the cloud server during deployment.

### 5. Tools & Technologies Used
-   **Language:** Python 3.11
-   **Web Framework:** Flask
-   **Machine Learning:** Scikit-Learn, Pandas, NLTK
-   **Deployment:** Render (Cloud), Gunicorn (Server)
-   **Version Control:** Git & GitHub

### 6. Conclusion
The Fake News Detection System successfully bridges the gap between complex AI technology and everyday users. By following a structured development lifecycle from data analysis to cloud hosting, the project delivers a robust, real-time solution for combating misinformation.
