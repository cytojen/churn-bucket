# Backend Module Structure

This document describes the modular structure of the churn prediction backend.

## File Organization

### Core Modules

#### `config.py`
Central configuration module that manages:
- Environment variable loading
- Supabase configuration
- Model paths and settings
- Classification thresholds
- Feature definitions
- API configuration
- CORS settings

**Best Practice**: All configuration values should be imported from this module rather than reading directly from environment variables.

#### `predict_churn.py`
Machine learning pipeline module containing:
- Model loading and caching
- Data fetching from Supabase
- Data cleaning and validation
- Feature engineering
- Prediction generation
- Database updates

**Functions**:
- `load_model()` - Load the trained ML model
- `fetch_customers_from_supabase()` - Retrieve customer data
- `clean_data()` - Clean and validate raw data
- `feature_engineering()` - Create ML features
- `prepare_features()` - Prepare feature matrix for prediction
- `make_predictions()` - Generate churn predictions
- `classify_status()` - Classify customers (Champion/At-Risk/Critical)
- `update_supabase()` - Save predictions to database
- `run_prediction_pipeline()` - Execute the complete pipeline

#### `api.py`
FastAPI REST API module providing:
- Prediction triggering endpoints
- Status checking endpoints
- Health check endpoints
- Background task management
- Automatic scheduling (optional)

**Endpoints**:
- `GET /` - API health check
- `POST /predict` - Trigger prediction job
- `GET /predict/status` - Check prediction status
- `GET /predict/results` - Get last prediction results
- `GET /health` - Detailed health check

## Environment Variables

Required variables (set in `.env`):
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Model
MODEL_PATH=xgb_model.pkl

# API Server
API_HOST=0.0.0.0
API_PORT=8000
PORT=8000  # Alternative for cloud platforms
API_RELOAD=false

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Optional: Auto Predictions
ENABLE_AUTO_PREDICTIONS=false
```

## Dependencies

Install with:
```bash
pip install -r requirements.txt
```

Required packages:
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `pandas` - Data manipulation
- `supabase` - Database client
- `python-dotenv` - Environment management
- `scikit-learn` - ML utilities
- `xgboost` - ML model
- `pydantic` - Data validation

## Running the API

Development:
```bash
python api.py
```

Production:
```bash
uvicorn api:app --host 0.0.0.0 --port 8000
```

## Code Conventions

1. **Imports**: All configuration values imported from `config.py`
2. **Type Hints**: All functions use Python type hints
3. **Docstrings**: All public functions have docstrings
4. **Error Handling**: Comprehensive try-except blocks
5. **Logging**: Print statements for debugging and monitoring
6. **Constants**: All magic numbers defined in `config.py`

## Testing

Run standalone prediction:
```bash
python predict_churn.py
```

Check API health:
```bash
curl http://localhost:8000/health
```

Trigger prediction:
```bash
curl -X POST http://localhost:8000/predict
```

## Maintenance

When adding new features:
1. Add configuration to `config.py`
2. Add ML features to `MODEL_FEATURES` in config
3. Update thresholds in config if needed
4. Keep functions focused and single-purpose
5. Document all new endpoints in API
