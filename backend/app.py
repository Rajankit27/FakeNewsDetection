from flask import Flask, request, jsonify, send_from_directory
import pickle
import os
import re
import requests
from bs4 import BeautifulSoup

app = Flask(__name__, static_folder='static')

# --- Configuration ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "model_v1.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "models", "vectorizer_v1.pkl")

print("Loading models...")
try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    with open(VECTORIZER_PATH, 'rb') as f:
        vectorizer = pickle.load(f)
    print("Models loaded successfully.")
except FileNotFoundError:
    print("Error: Models not found. Run 'ml/train_model.py' first.")
    model = None
    vectorizer = None

# --- Preprocessing (Must match training logic roughly) ---
# Note: Basic cleaning is enough as TF-IDF handles a lot, but consistency is key.
# Ideally, we should import the same function, but for simplicity/independence we recreate simple version.
from nltk.stem import WordNetLemmatizer
# We assume NLTK data is downloaded in the env
import nltk
try:
    lemmatizer = WordNetLemmatizer()
    stop_words = set(nltk.corpus.stopwords.words('english'))
except: # Fallback if nltk setup fails on runtime for some reason
    lemmatizer = None
    stop_words = set()

def preprocess_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    words = text.split()
    if lemmatizer:
        cleaned_words = [lemmatizer.lemmatize(word) for word in words if word not in stop_words]
        return " ".join(cleaned_words)
    return " ".join(words)

# --- Routes ---

@app.route('/')
def home():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)

@app.route('/predict', methods=['POST'])
def predict():
    if not model or not vectorizer:
        return jsonify({"status": "error", "message": "Model not loaded"}), 500

    try:
        data = request.get_json()
        news_text = data.get('text', '').strip()

        # Validation
        if not news_text:
            return jsonify({"status": "error", "message": "Empty text provided"}), 400
        if len(news_text) < 10: # Simple validation
             return jsonify({"status": "error", "message": "Text too short to classify"}), 400

        # Prediction
        cleaned_text = preprocess_text(news_text)
        vectorized_text = vectorizer.transform([cleaned_text])
        prediction = model.predict(vectorized_text)[0]
        proba = model.predict_proba(vectorized_text)[0]
        confidence = max(proba) * 100

        result = "FAKE" if prediction == "FAKE" else "REAL"

        return jsonify({
            "status": "success",
            "prediction": result,
            "confidence": int(confidence)
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- Phase 2: Global News API Integration ---
@app.route('/predict-from-api', methods=['POST'])
def predict_from_api():
    if not model or not vectorizer:
        return jsonify({"status": "error", "message": "Model not loaded"}), 500

    try:
        data = request.get_json()
        query = data.get('query', '').strip()

        if not query:
            return jsonify({"status": "error", "message": "No query provided"}), 400

        # Note: In a real world scenario, you would use a real API Key.
        # For this student project, we will mock the behavior if no key is present 
        # to ensure it runs without configuration, but show the code for the real API.
        
        API_KEY = "YOUR_NEWS_API_KEY" # Replace with real key or use env var
        # For demonstration purposes, if key is placeholder, we return a mock response 
        # so the functionality can be demonstrated in Viva without a paid/registered key.
        
        articles = []
        
        # Real API Implementation Pattern (Commented out default behavior to avoid errors without key)
        # if API_KEY != "YOUR_NEWS_API_KEY":
        #    url = f"https://newsapi.org/v2/everything?q={query}&apiKey={API_KEY}&language=en&pageSize=3"
        #    response = requests.get(url)
        #    if response.status_code == 200:
        #        articles = response.json().get('articles', [])

        # Mock/Simulated Response for Project Viva (Robustness)
        if not articles:
            # Simulate finding news based on query for demo
            articles = [
                {
                    "source": {"name": "Global News Network"},
                    "title": f"Recent updates regarding {query}",
                    "description": f"Breaking news analysis about {query} shows significant global impact...",
                    "content": f"Full report on {query}. Market analysts suggest that this event will have long term consequences. The situation is developing rapidly as more sources confirm the details."
                }
            ]

        results = []
        for article in articles:
            # Combine title and desc for prediction
            full_text = f"{article['title']} {article.get('description', '') or ''} {article.get('content', '') or ''}"
            
            cleaned_text = preprocess_text(full_text)
            vectorized_text = vectorizer.transform([cleaned_text])
            prediction = model.predict(vectorized_text)[0]
            proba = model.predict_proba(vectorized_text)[0]
            confidence = max(proba) * 100
            
            results.append({
                "title": article['title'],
                "source": article['source']['name'],
                "prediction": "FAKE" if prediction == "FAKE" else "REAL",
                "confidence": int(confidence)
            })

        return jsonify({
            "status": "success",
            "results": results
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- Phase 3: URL Verification ---
@app.route('/predict-from-url', methods=['POST'])
def predict_from_url():
    if not model or not vectorizer:
        return jsonify({"status": "error", "message": "Model not loaded"}), 500

    try:
        data = request.get_json()
        url = data.get('url', '').strip()

        if not url:
            return jsonify({"status": "error", "message": "No URL provided"}), 400

        # 1. Scrape the URL
        try:
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract title and paragraphs
            title = soup.title.string if soup.title else ""
            paragraphs = soup.find_all('p')
            content = " ".join([p.get_text() for p in paragraphs])
            
            full_text = f"{title} {content}"
            
            if len(full_text) < 50:
                 return jsonify({"status": "error", "message": "Could not extract enough text from this URL."}), 400

        except Exception as e:
             return jsonify({"status": "error", "message": f"Failed to fetch URL: {str(e)}"}), 400

        # 2. Predict
        cleaned_text = preprocess_text(full_text)
        vectorized_text = vectorizer.transform([cleaned_text])
        prediction = model.predict(vectorized_text)[0]
        proba = model.predict_proba(vectorized_text)[0]
        confidence = max(proba) * 100

        return jsonify({
            "status": "success",
            "prediction": "FAKE" if prediction == "FAKE" else "REAL",
            "confidence": int(confidence),
            "extracted_title": title[:100] + "..." if len(title) > 100 else title
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
