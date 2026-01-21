# FashionDesignAI - One-Click Deployment Guide

This app uses **Docker** to ensure the backend and database work perfectly on any machine without complex installation.

## 🚀 Step-by-Step Launch

1. **Clone & Enter**:
   ```bash
   git clone <your-repo-url>
   cd fashion-design-ai
   ```

2. **Configure API Key**:
   Create a file named `.env` in the root folder and add your Gemini API Key:
   ```env
   API_KEY=AIzaSy...your_key_here
   ```

3. **Build & Start**:
   ```bash
   docker-compose up --build
   ```
   *Note: The first build takes 2-3 minutes as it downloads the database and builds the React frontend.*

4. **Access the App**:
   Open [http://localhost:3001](http://localhost:3001) in your browser.

## 🔑 Login Credentials
- **Designer (User)**: `designer@fashion.ai` / `designer123`
- **Administrator**: `admin@fashion.ai` / `admin123`

## 🛠 Troubleshooting
- **Port Conflict**: If port 3001 is busy, change the `ports` mapping in `docker-compose.yml` to `"3002:3001"`.
- **Database Logs**: Run `docker logs fashion-db` to see the MongoDB status.
- **Backend Logs**: Run `docker logs fashion-app` to see the Node.js status.