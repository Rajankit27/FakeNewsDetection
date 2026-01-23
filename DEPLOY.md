# Deploying to Render.com

This project is "Render-ready". Follow these steps to deploy it for free.

## 1. Prerequisites
- Push your code to a **GitHub** repository.
- Sign up for a free account at [render.com](https://render.com).

## 2. API & Keys
**Important:** The project currently uses a **Mock API** for the "Global News" feature so it works without payment.
- If you use the free **NewsAPI.org** key, it typically **only works on Localhost**.
- On Render (Cloud), the free key often gets blocked or fails.
- **Recommendation:** Stick to the Mock logic for the hosted demo.

## 3. Create New Web Service on Render
1.  Click **"New +"** -> **"Web Service"**.
2.  Connect your GitHub repository.
3.  Fill in the details:
    - **Name:** `fake-news-detector` (or any name)
    - **Region:** Any (e.g., Singapore, Frankfurt)
    - **Branch:** `main` (or your working branch)
    - **Runtime:** `Python 3`

## 4. Configure Commands (CRITICAL)

**Build Command:**
This installs dependencies AND downloads necessary NLTK data.
```bash
pip install -r requirements.txt && python -m nltk.downloader stopwords wordnet omw-1.4
```

**Start Command:**
This uses Gunicorn (production server) to run your Flask app.
```bash
gunicorn backend.app:app
```

## 5. Environment Variables (Optional)
If you decide to use a real API key later, add it here:
- Key: `NEWS_API_KEY`
- Value: `your_actual_key`

## 6. Deploy
- Click **"Create Web Service"**.
- Wait for the build to finish (about 2-3 minutes).
- Your URL will be `https://fake-news-detector-xxxx.onrender.com`.

## Troubleshooting
- **"Internal Server Error"**: Check the "Logs" tab. It often means a missing library or NLTK data passed.
- **"Model not found"**: Ensure you have pushed the `backend/models/*.pkl` files to GitHub. If they are in `.gitignore`, you need to remove them from there or run the training script as part of the build (not recommended for free tier due to RAM usage).
  - *Recommendation:* Push the `.pkl` files to GitHub for this project.
