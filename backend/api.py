"""
FastAPI service for automated churn prediction pipeline.
Provides REST API endpoints to trigger predictions and check status.
"""

from fastapi import FastAPI, BackgroundTasks, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List
import uvicorn
from datetime import datetime
import asyncio
import os
import io
from predict_churn import run_prediction_pipeline, load_model, feature_engineering, classify_status
from config import (
    get_cors_origins, MODEL_PATH, API_HOST, API_PORT, API_RELOAD,
    ENABLE_AUTO_PREDICTIONS, AUTO_PREDICTION_INTERVAL, SUPABASE_URL
)
import pandas as pd

app = FastAPI(
    title="Churn Prediction API",
    description="API for running ML-based customer churn predictions",
    version="1.0.0"
)

# Enable CORS for frontend
allowed_origins = get_cors_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state for tracking prediction jobs
prediction_status = {
    "is_running": False,
    "last_run": None,
    "last_result": None,
    "last_error": None
}


class PredictionResponse(BaseModel):
    message: str
    status: str
    job_id: Optional[str] = None


class PredictionStatus(BaseModel):
    is_running: bool
    last_run: Optional[str]
    last_result: Optional[Dict]
    last_error: Optional[str]


class PredictionResult(BaseModel):
    total_customers: int
    champions: int
    at_risk: int
    critical: int
    predicted_churn: int
    predicted_retain: int
    mean_risk_score: float
    timestamp: str


def run_prediction_task():
    """Background task to run the prediction pipeline."""
    global prediction_status
    
    try:
        prediction_status["is_running"] = True
        prediction_status["last_error"] = None
        
        print(f"Starting prediction pipeline at {datetime.now()}")
        
        # Run the prediction pipeline
        results = run_prediction_pipeline()
        
        # Calculate statistics
        champions = (results['status_classification'] == 'Champion').sum()
        at_risk = (results['status_classification'] == 'At-Risk').sum()
        critical = (results['status_classification'] == 'Critical').sum()
        predicted_churn = results['prediction'].sum()
        predicted_retain = (~results['prediction']).sum()
        mean_risk_score = results['churn_risk_score'].mean()
        
        prediction_status["last_result"] = {
            "total_customers": len(results),
            "champions": int(champions),
            "at_risk": int(at_risk),
            "critical": int(critical),
            "predicted_churn": int(predicted_churn),
            "predicted_retain": int(predicted_retain),
            "mean_risk_score": float(mean_risk_score),
            "timestamp": datetime.now().isoformat()
        }
        
        prediction_status["last_run"] = datetime.now().isoformat()
        
        print(f"Prediction pipeline completed successfully at {datetime.now()}")
        
    except Exception as e:
        error_msg = f"Prediction pipeline failed: {str(e)}"
        print(error_msg)
        prediction_status["last_error"] = error_msg
        
    finally:
        prediction_status["is_running"] = False


@app.get("/")
async def root():
    """API health check endpoint."""
    return {
        "service": "Churn Prediction API",
        "status": "running",
        "version": "1.0.0"
    }


@app.post("/predict", response_model=PredictionResponse)
async def trigger_prediction(background_tasks: BackgroundTasks):
    """
    Trigger a new prediction job.
    Runs the complete ML pipeline: fetch data → engineer features → predict → update DB.
    """
    global prediction_status
    
    if prediction_status["is_running"]:
        raise HTTPException(
            status_code=409,
            detail="A prediction job is already running. Please wait for it to complete."
        )
    
    # Add the prediction task to background tasks
    background_tasks.add_task(run_prediction_task)
    
    return PredictionResponse(
        message="Prediction job started successfully",
        status="started",
        job_id=datetime.now().isoformat()
    )


@app.get("/predict/status", response_model=PredictionStatus)
async def get_prediction_status():
    """
    Get the current status of prediction jobs.
    Returns information about running jobs and last completed job.
    """
    return PredictionStatus(
        is_running=prediction_status["is_running"],
        last_run=prediction_status["last_run"],
        last_result=prediction_status["last_result"],
        last_error=prediction_status["last_error"]
    )


@app.get("/predict/results", response_model=Optional[PredictionResult])
async def get_last_results():
    """
    Get the results from the last completed prediction job.
    """
    if prediction_status["last_result"] is None:
        raise HTTPException(
            status_code=404,
            detail="No prediction results available. Run a prediction job first."
        )
    
    return PredictionResult(**prediction_status["last_result"])


@app.post("/predict/batch")
async def batch_score_customers(file: UploadFile = File(...)):
    """
    Score multiple customers from uploaded CSV file.
    Returns churn risk scores and classifications for each customer.
    """
    try:
        # Validate file type
        if not file.filename.endswith('.csv'):
            raise HTTPException(
                status_code=400,
                detail="Only CSV files are supported"
            )
        
        # Read CSV file
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        print(f"Received CSV with {len(df)} rows")
        print(f"Columns: {list(df.columns)}")
        
        # Validate required columns
        required_columns = ['customer_id', 'customer_name']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )
        
        # Load model
        model = load_model()
        
        # Engineer features
        df_features = feature_engineering(df)
        
        # Make predictions
        X = df_features.drop(['customer_id'], axis=1, errors='ignore')
        
        # Get risk scores and predictions
        risk_scores = model.predict_proba(X)[:, 1]
        predictions = model.predict(X)
        
        # Classify status
        status_classifications = [classify_status(score) for score in risk_scores]
        
        # Prepare results
        results = []
        for i in range(len(df)):
            results.append({
                "customer_id": str(df.iloc[i]['customer_id']),
                "customer_name": str(df.iloc[i]['customer_name']),
                "churn_risk_score": float(risk_scores[i]),
                "status_classification": status_classifications[i],
                "prediction": bool(predictions[i])
            })
        
        return {
            "message": "Batch scoring completed successfully",
            "total_customers": len(results),
            "results": results
        }
        
    except pd.errors.ParserError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid CSV file format: {str(e)}"
        )
    except Exception as e:
        print(f"Error in batch scoring: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing file: {str(e)}"
        )


@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring.
    """
    model_exists = os.path.exists(MODEL_PATH)
    
    return {
        "status": "healthy" if model_exists else "degraded",
        "model_loaded": model_exists,
        "model_path": MODEL_PATH,
        "timestamp": datetime.now().isoformat()
    }


# Background scheduler for automatic predictions
async def scheduled_predictions():
    """
    Run predictions on a schedule (every 6 hours).
    """
    while True:
        # Wait for configured interval
        await asyncio.sleep(AUTO_PREDICTION_INTERVAL)
        
        if not prediction_status["is_running"]:
            print(f"Running scheduled prediction at {datetime.now()}")
            run_prediction_task()


@app.on_event("startup")
async def startup_event():
    """
    Run on API startup.
    Optionally start the scheduler for automatic predictions.
    """
    print("Churn Prediction API started")
    print(f"Model path: {MODEL_PATH}")
    print(f"Model file exists: {os.path.exists(MODEL_PATH)}")
    print(f"Supabase URL: {SUPABASE_URL or 'Not set'}")
    print(f"CORS origins: {get_cors_origins()}")
    
    # Enable automatic scheduled predictions if environment variable is set
    if ENABLE_AUTO_PREDICTIONS:
        print(f"Auto predictions enabled (every {AUTO_PREDICTION_INTERVAL} seconds)")
        asyncio.create_task(scheduled_predictions())
    else:
        print("Auto predictions disabled (use ENABLE_AUTO_PREDICTIONS=true to enable)")


@app.on_event("shutdown")
async def shutdown_event():
    """
    Run on API shutdown.
    """
    print("Churn Prediction API shutting down")


if __name__ == "__main__":
    # Run the FastAPI server
    # Configuration from config module
    uvicorn.run(
        "api:app",
        host=API_HOST,
        port=API_PORT,
        reload=API_RELOAD,
        log_level="info"
    )
