import pandas as pd
import re
import pickle
import os
import nltk
import numpy as np
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.model_selection import train_test_split, StratifiedKFold, GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, f1_score

# --- Configuration ---
DATASET_URL = "https://raw.githubusercontent.com/lutzhamel/fake-news/master/data/fake_or_real_news.csv"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Versioning for scalability
MODEL_PATH = os.path.join(BASE_DIR, "../backend/models/model_v1.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "../backend/models/vectorizer_v1.pkl")
RANDOM_SEED = 42

print(f"Using Random Seed: {RANDOM_SEED} for reproducibility.")

# --- 1. Download & Load Dataset ---
print("Downloading dataset...")
try:
    df = pd.read_csv(DATASET_URL)
    print(f"Dataset loaded. Shape: {df.shape}")
    print("Class Distribution:")
    print(df['label'].value_counts())
    
    # Check for imbalance
    real_count = df['label'].value_counts().get('REAL', 0)
    fake_count = df['label'].value_counts().get('FAKE', 0)
    imbalance_ratio = max(real_count, fake_count) / min(real_count, fake_count)
    
    class_weight = None
    if imbalance_ratio > 1.5:
        print(f"Dataset is imbalanced (ratio {imbalance_ratio:.2f}). Using class_weight='balanced'.")
        class_weight = 'balanced'
    else:
        print("Dataset is fairly balanced. No class weighting needed.")

except Exception as e:
    print(f"Error downloading dataset: {e}")
    exit(1)

# --- 2. Preprocessing ---
print("\nPreprocessing text...")
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('omw-1.4')

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

def preprocess_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    words = text.split()
    cleaned_words = [lemmatizer.lemmatize(word) for word in words if word not in stop_words]
    return " ".join(cleaned_words)

if 'text' not in df.columns:
    print("Error: 'text' column not found")
    exit(1)

df['clean_text'] = df['text'].apply(preprocess_text)
X = df['clean_text']
y = df['label']

# --- 3. Split Data (Hold-out method) ---
# 80% for Development (CV), 20% for Final Unseen Test
print("\nSplitting data: 80% Development, 20% Final Test...")
X_dev, X_test, y_dev, y_test = train_test_split(X, y, test_size=0.2, random_state=RANDOM_SEED, stratify=y)

# --- 4. Pipeline & GridSearch ---
# Pipeline ensures TF-IDF is fit ONLY on training folds during CV (Anti-Leakage)
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(stop_words='english')),
    ('clf', LogisticRegression(random_state=RANDOM_SEED, solver='liblinear', class_weight=class_weight))
])

# Hyperparameters to tune
param_grid = {
    'tfidf__max_features': [5000, 10000],
    'tfidf__ngram_range': [(1, 1), (1, 2)], # Unigrams and Bigrams
    'clf__C': [0.1, 1, 10] # Regularization strength
}

print("\nStarting GridSearchCV with StratifiedKFold (5-fold)...")
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)
grid_search = GridSearchCV(pipeline, param_grid, cv=cv, scoring='f1_macro', n_jobs=-1, verbose=1)

grid_search.fit(X_dev, y_dev)

print(f"\nBest Parameters: {grid_search.best_params_}")
print(f"Best CV F1-Score: {grid_search.best_score_:.4f}")

# --- 5. Final Evaluation on Unseen Test Set ---
print("\nEvaluating on UNSEEN Test Set (20%)...")
best_model = grid_search.best_estimator_
y_pred = best_model.predict(X_test)

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Stability Check
test_f1 = f1_score(y_test, y_pred, average='macro')
gap = abs(grid_search.best_score_ - test_f1)
print(f"CV vs Test F1 Gap: {gap:.4f}")
if gap > 0.05:
    print("WARNING: Significant gap between CV and Test performance. Potential Overfitting.")
else:
    print("SUCCESS: Model generalizes well (Gap < 5%).")

# --- 6. Feature Interpretation ---
print("\nTop 20 Features contributing to class prediction:")
vectorizer = best_model.named_steps['tfidf']
classifier = best_model.named_steps['clf']
feature_names = vectorizer.get_feature_names_out()
coefs = classifier.coef_[0]

# Zip and sort
features_with_weights = sorted(zip(coefs, feature_names), key=lambda x: x[0])

print("\nTop 10 predictors for 'FAKE' (Negative Coefs):")
for weight, feat in features_with_weights[:10]:
    print(f"{feat}: {weight:.4f}")

print("\nTop 10 predictors for 'REAL' (Positive Coefs):")
for weight, feat in features_with_weights[-10:]:
    print(f"{feat}: {weight:.4f}")

# --- 7. Save Model & Vectorizer ---
# We need to save the vectorizer and the classifier separately if we want to keep the app logic simple,
# or save the whole pipeline. To match existing app logic, we save vectorizer and classifier separately.
# However, the pipeline fitted the vectorizer.
# Best practice: Save the whole pipeline. But let's stick to separate files for app compatibility
# OR update app to load one pipeline object. 
# Decision: Save separate to minimize app refactoring risk, as requested "Minor Tweaks".

print(f"\nSaving artifacts to {os.path.dirname(MODEL_PATH)}...")
os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

# Extract fitted steps
final_vectorizer = best_model.named_steps['tfidf']
final_clf = best_model.named_steps['clf']

with open(MODEL_PATH, 'wb') as f:
    pickle.dump(final_clf, f)

with open(VECTORIZER_PATH, 'wb') as f:
    pickle.dump(final_vectorizer, f)

print(f"Model saved to {MODEL_PATH}")
print(f"Vectorizer saved to {VECTORIZER_PATH}")
print("\nDone! Expert ML Pipeline complete.")
