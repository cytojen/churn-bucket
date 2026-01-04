# Churn Bucket - B2B SaaS Customer Churn Prediction

A full-stack application for predicting and preventing customer churn using machine learning, built with Next.js, FastAPI, and Supabase.

## Overview

This application helps B2B SaaS companies identify at-risk customers and take proactive retention actions. It features:

- **ML-Powered Predictions**: XGBoost model analyzes customer behavior
- **Real-Time Dashboard**: Interactive charts and KPIs
- **Customer Segmentation**: Champion, At-Risk, and Critical classifications
- **Smart Alerts**: Automated notifications for high-risk accounts
- **Revenue Tracking**: Monitor ARR at risk by customer tier
- **Data Export**: Download filtered customer data as CSV

## Architecture

```
churn-bucket/
├── backend/              # Python FastAPI backend
│   ├── api.py           # REST API endpoints
│   ├── predict_churn.py # ML prediction pipeline
│   ├── xgb_model.pkl    # Trained XGBoost model
│   └── .env             # Backend configuration
└── frontend/            # Next.js React frontend
    ├── app/             # App router pages
    ├── components/      # React components
    ├── lib/             # Utilities & Supabase client
    └── .env.local       # Frontend configuration
```

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- Supabase account

### Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment (copy and update .env)
# Add your Supabase credentials

# Start API
python api.py
```

API runs on `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment (copy and update .env.local)
# Add your Supabase credentials and API URL

# Start development server
npm run dev
```

Frontend runs on `http://localhost:3000`

## Configuration

### Backend Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# API
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=*

# Model
MODEL_PATH=xgb_model.pkl

# Automation
ENABLE_AUTO_PREDICTIONS=true
AUTO_PREDICTION_INTERVAL=21600
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Required Files

### Backend
- `.env` - Environment configuration
- `xgb_model.pkl` - Trained machine learning model
- `requirements.txt` - Python dependencies

### Frontend
- `.env.local` - Environment configuration
- `package.json` - Node dependencies

**Important**: Both environment files must have correct Supabase credentials.

## Features

### Dashboard (Insights Tab)
- KPI cards: Champions, At-Risk, Critical customers, Revenue at Risk
- Revenue at Risk by Customer Tier (bar chart)
- Partner Distribution by Plan (horizontal bar chart)
- Recent Alerts panel with auto-refresh
- Top 7 partners table with filtering and export

### Partners Tab
- Complete customer list with risk scores
- Filter by status classification
- Sort and search functionality
- Export to CSV

### Alerts Tab
- All customer alerts in one place
- Critical, Warning, and Info categories
- Real-time alert generation

## ML Pipeline

The prediction pipeline:

1. **Data Fetching**: Retrieves customer data from Supabase
2. **Feature Engineering**: Creates 50+ features from raw data
3. **Prediction**: XGBoost model predicts churn probability
4. **Classification**: Categorizes customers (Champion/At-Risk/Critical)
5. **Database Update**: Saves predictions back to Supabase

### Automatic Predictions

- Runs every 6 hours by default
- Can be triggered manually via API
- Processes new customers automatically
- Updates existing predictions

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL)
- **Language**: TypeScript

### Backend
- **Framework**: FastAPI
- **ML**: XGBoost, scikit-learn, pandas
- **Database**: Supabase (PostgreSQL)
- **Language**: Python 3.9+

## Deployment

### Quick Deployment Steps

1. **Backend (Railway/Render/Heroku)**
   ```bash
   # Deploy backend folder
   # Set environment variables:
   # - NEXT_PUBLIC_SUPABASE_URL
   # - NEXT_PUBLIC_SUPABASE_ANON_KEY
   # - CORS_ORIGINS=*
   # - ENABLE_AUTO_PREDICTIONS=true
   
   # Start command:
   python api.py
   ```

2. **Frontend (Vercel/Netlify)**
   ```bash
   # Deploy frontend folder
   # Set environment variables:
   # - NEXT_PUBLIC_SUPABASE_URL
   # - NEXT_PUBLIC_SUPABASE_ANON_KEY
   # - NEXT_PUBLIC_API_URL=https://your-api.railway.app
   
   # Build command:
   npm run build
   ```

3. **Auto-Predictions**
   - Enabled by default with `ENABLE_AUTO_PREDICTIONS=true`
   - Runs every 6 hours automatically
   - No manual intervention needed
   - Frontend can trigger immediate predictions if null data detected

### Platform-Specific Notes

**Railway/Render/Heroku**
- Automatically provides `PORT` environment variable
- Set `CORS_ORIGINS=*` for easy setup
- Backend binds to platform's assigned port automatically

**Vercel (Frontend)**: `pip install -r requirements.txt`
- Check API logs for errors

### Frontend Issues
- Ensure backend API is running on correct port
- Check Supabase credentials in `.env.local`
- Verify `NEXT_PUBLIC_API_URL` points to correct backend
- Clear `.next` cache if needed: `rm -rf .next && npm run dev`

### Database Issues
- Ensure `status_classification` column exists in Supabase table
- Check Supabase connection from backend
- Verify table permissions and RLS policies
- Run `python predict_churn.py` manually to test pipeline

### Deployment Issues
- **CORS errors**: Set `CORS_ORIGINS=*` in backend environment
- **Port binding**: Platforms like Railway/Render provide `PORT` automatically
- **Model not found**: Ensure `xgb_model.pkl` is included in deployment
- **Auto-predictions not running**: Verify `ENABLE_AUTO_PREDICTIONS=true`

## Project Structure & Conventions

### Code Organization
- **Backend**: Modularized with `config.py` for centralized configuration
- **Frontend**: Constants in `lib/constants.ts`, types in `lib/types.ts`
- **Components**: Single-purpose, reusable React components
- **No hardcoded values**: All config imported from central modules

### Development Best Practices
- TypeScript for type safety
- Comprehensive error handling
- Proper separation of concerns
- Documented functions with docstrings
- Consistent naming convent

- Environment variables for sensitive data
- CORS configuration for API access
- Supabase Row Level Security (RLS)
- No hardcoded credentials

## API Endpoints

- `GET /` - Health check
- `POST /predict` - Trigger manual predictions
- `GET /predict/status` - Check prediction status
- `GET /api/summary` - Get customer statistics
- `GET /health` - Detailed health check

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes.

## Troubleshooting

### Backend Issues
- Ensure `xgb_model.pkl` is in the backend directory
- Check Supabase credentials in `.env`
- Verify Python dependencies are installed

### Frontend Issues
- Ensure API is running on correct port
- Check Supabase credentials in `.env.local`
- Clear `.next` cache if needed: `rm -rf .next`

### Database Issues
- Ensure `status_classification` column exists in database
- Check Supabase connection from backend
- Verify table permissions

## Support

For issues and questions, please open a GitHub issue.

---

Built for better customer retention
