# Deployment Guide (Render)

## Overview
This application is configured for deployment on [Render](https://render.com). It uses a Python Flask backend served by Gunicorn and a static frontend.

## Configuration Details
- **Build Command**: `pip install -r requirements.txt && python -m nltk.downloader stopwords wordnet omw-1.4 && python ml/train_model.py`
  - Installs dependencies.
  - Downloads necessary NLTK data.
  - Retrains the model during build to ensure it's fresh.
- **Start Command**: `gunicorn backend.app:app`
  - Uses Gunicorn (Green Unicorn) as the production WSGI server.
  - **Why Gunicorn?**: It handles concurrency much better than Flask’s built-in development server, essential for a production environment.
- **Port Binding**: Render automatically injects a `PORT` environment variable. Gunicorn automatically binds to this port, so no manual port configuration is required in the code.

## Steps to Deploy
1. **Push to GitHub**:
   Ensure all changes, including `requirements.txt` and `render.yaml`, are committed and pushed.
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Create Web Service on Render**:
   - Go to Dashboard -> New -> Web Service.
   - Connect your GitHub repository.
   - Render should automatically detect `render.yaml`.
   - Click **Deploy**.

3. **Environment Variables**:
   - Ensure `MONGO_URI` is set in the Render Dashboard (or `render.yaml` if not sensitive).
   - Currently, `render.yaml` handles basic setup.

## Verification
- Once deployed, visit the provided `.onrender.com` URL.
- Check the logs to ensure the server started successfully.
