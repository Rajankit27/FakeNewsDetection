# Fake News Detection Web Application

A Machine Learning powered web application to detect fake news.

## Project Structure
- `backend/`: Flask application and static assets
- `ml/`: Machine Learning training scripts
- `models/`: Trained models (generated)

## Prerequisites
- Python 3.8+
- pip

## Installation

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Train the Model** (Phase 1)
   Before running the app, you must train the model to generate the `.pkl` files.
   ```bash
   python ml/train_model.py
   ```
   *Note: This will download the dataset and save `model.pkl` and `vectorizer.pkl` to `backend/models/`.*

3. **Run the Application**
   ```bash
   python backend/app.py
   ```
   The application will start at `http://localhost:5000`.

## Features

### Phase 1: Core Fake News Detection
- Input any news text.
- Get a prediction (REAL vs FAKE) with a confidence score.
- Explains *why* the text might be fake/real (based on probabilistic reasoning).

### Phase 2: Global News Analysis
- Search for a topic (e.g., "Election 2024").
- Fetch news from simulated global sources.
- Analyze credibility of each headline automatically.

### Phase 3: URL Verification
- Paste a URL of a news article.
- The system scrapes the content, analyzes it, and provides a credibility report.

## Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Python, Flask
- **ML**: Scikit-Learn, NLTK, Pandas, TF-IDF, Logistic Regression
- **Utils**: BeautifulSoup4 (Scraping), Requests (API)

## Notes for Viva
- The ML model uses **Logistic Regression** on TF-IDF vectors.
- Phase 2 mocks the external API response to ensure it works without a paid API Key during demonstrations.
- Phase 3 requires internet access to scrape the URL.
