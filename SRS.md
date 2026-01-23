# Software Requirements Specification (SRS)
## Fake News Detection System

**Version:** 1.0  
**Date:** 2026-01-22  
**Status:** Initial Release

---

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to define the requirements for the "Fake News Detection System". This web-based application aims to identify potentially misleading or fake news articles using Machine Learning (ML) and Natural Language Processing (NLP) techniques.

### 1.2 Scope
The system will be a web application where users can:
- Input raw text to verify its authenticity.
- Search for topics to analyze global news trends (simulated or API-based).
- Input URLs to scrape and analyze specific articles.
The system uses a Logistic Regression model trained on a labeled dataset (Real v/s Fake) to provide a prediction with a confidence score.

### 1.3 Definitions, Acronyms, and Abbreviations
- **SRS**: Software Requirements Specification
- **ML**: Machine Learning
- **NLP**: Natural Language Processing
- **TF-IDF**: Term Frequency-Inverse Document Frequency (used for vectorization)
- **UI**: User Interface
- **API**: Application Programming Interface

---

## 2. Overall Description

### 2.1 Product Perspective
This is a standalone web application. It consists of:
- **Frontend**: A responsive web interface (HTML/CSS/JS).
- **Backend**: A Flask (Python) server handling requests.
- **ML Engine**: A pre-trained Python model for classification.

### 2.2 Product Functions
1.  **Text Analysis**: Users paste text; the system predicts "REAL" or "FAKE".
2.  **Confidence Scoring**: Displays a percentage indicating certainty.
3.  **Global News Search**: Fetches headlines for a topic and analyzes them.
4.  **URL Analysis**: Scrapes content from a given URL and analyzes it.

### 2.3 User Characteristics
- **General Public**: People wanting to verify news they read on social media.
- **Researchers/Journalists**: Users looking for a quick credibility check on sources.

---

## 3. Specific Requirements

### 3.1 Functional Requirements

#### FR-01: Text Input Analysis
- **Description**: The system shall accept a text string (min 10 characters) from the user.
- **Input**: User types/pastes text into a text area.
- **Process**: Preprocess text (clean, tokenize) -> Vectorize -> Predict using ML model.
- **Output**: Display "FAKE" or "REAL" label and a confidence percentage.

#### FR-02: Global News Analysis
- **Description**: The system shall allow users to search for a specific topic.
- **Input**: Keyword (e.g., "Election").
- **Process**: Fetch articles (via NewsAPI or mock simulation) -> Analyze each title/description.
- **Output**: A list of related articles with individual credibility scores.

#### FR-03: URL Verification
- **Description**: The system shall accept a valid URL.
- **Input**: A standard HTTP/HTTPS URL.
- **Process**: Fetch HTML -> Extract text content (paragraphs) -> Analyze text.
- **Output**: Prediction based on the scraped content.

#### FR-04: Model Training Interface
- **Description**: Scripts to retrain the model if dataset changes.
- **Input**: `train_model.py` execution.
- **Output**: updated `.pkl` files in `backend/models/`.

### 3.2 Non-Functional Requirements

#### NFR-01: Performance
- Prediction time should be under 2 seconds for standard text input.
- URL scraping limit set to 10 seconds timeout.

#### NFR-02: Reliability
- The system must handle failures gracefully (e.g., invalid URLs, empty inputs) with clear error messages.
- Fallback mechanisms for API limitations (mock data).

#### NFR-03: Portability
- The application should run on any system with Python installed (Windows/Linux/macOS).
- The web interface should be compatible with modern browsers (Chrome, Edge, Firefox).

#### NFR-04: Usability
- Clean, intuitive UI/UX with clear indicators (Red for Fake, Green for Real).
- Responsive design for mobile and desktop views.

---

## 4. System Interfaces

### 4.1 User Interface
- **Home Page**: Main dashboard with tabs for "Text", "Topic", and "URL" analysis.
- **Result Section**: Dynamic area updating via AJAX/Fetch API to show results without page reload.

### 4.2 Hardware Interfaces
- No specific hardware required beyond a standard computer capable of running Python.

### 4.3 Software Interfaces
- **OS**: Windows, Linux, or macOS.
- **Runtime**: Python 3.8+.
- **Libraries**: Flask, Scikit-learn, Pandas, NLTK.

---

## 5. Appendices
- **Dataset**: Using standard "Fake News" datasets (e.g., from Kaggle) containing title, text, and label.
- **Algorithm**: Logistic Regression with TF-IDF Vectorizer.
