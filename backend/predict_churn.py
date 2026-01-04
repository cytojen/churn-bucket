"""
Churn Prediction Pipeline
Loads the trained model and makes predictions on customer data from Supabase.
"""

import pandas as pd
import pickle
import os
from supabase import create_client, Client
import warnings
from config import (
    SUPABASE_URL, SUPABASE_KEY, MODEL_PATH,
    CHAMPION_THRESHOLD, AT_RISK_THRESHOLD,
    CORE_COLUMNS, DATE_COLUMNS, MODEL_FEATURES
)

warnings.filterwarnings('ignore')

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def load_model(model_path=None):
    """Load the trained model from pickle file."""
    if model_path is None:
        model_path = MODEL_PATH
    
    print(f"Loading model from {model_path}...")
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")
    
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    print(f"Model loaded successfully: {type(model).__name__}")
    return model


def fetch_customers_from_supabase():
    """Fetch all customer data from Supabase."""
    print("\nFetching customer data from Supabase...")
    response = supabase.table('data').select('*').execute()
    df = pd.DataFrame(response.data)
    print(f"Fetched {len(df)} customers from Supabase")
    return df


def clean_data(raw_df):
    """Clean and prepare the raw dataset for feature engineering."""
    df = raw_df.copy()
    
    print(f"\nCleaning data...")
    print(f"Initial dataset shape: {df.shape}")
    
    # Converting date columns to datetime
    for col in DATE_COLUMNS:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce')
    
    # Handling missing values in core columns
    for col in CORE_COLUMNS:
        if col in df.columns:
            null_count = df[col].isna().sum()
            if null_count > 0:
                df[col] = df[col].fillna(df[col].median())
    
    # Validate data quality
    if 'user_count' in df.columns:
        df.loc[df['user_count'] < 0, 'user_count'] = 0
    
    if 'monthly_active_users' in df.columns:
        df.loc[df['monthly_active_users'] < 0, 'monthly_active_users'] = 0
        # Cap active users to total users
        df.loc[df['monthly_active_users'] > df['user_count'], 'monthly_active_users'] = \
            df.loc[df['monthly_active_users'] > df['user_count'], 'user_count']
    
    print(f"Data cleaning complete. Final shape: {df.shape}")
    return df


def feature_engineering(raw_df, reference_date=None):
    """Engineer features from raw B2B SaaS dataset."""
    df = raw_df.copy()
    
    # Keep customer_id for updating later
    customer_ids = df['customer_id'].copy()
    
    # Convert date columns to datetime
    df['subscription_start_date'] = pd.to_datetime(df['subscription_start_date'])
    df['last_login_date'] = pd.to_datetime(df['last_login_date'])
    df['last_success_touch_date'] = pd.to_datetime(df['last_success_touch_date'])
    
    # Set reference date
    if reference_date is None:
        reference_date = pd.Timestamp.now()
    else:
        reference_date = pd.to_datetime(reference_date)
    
    print(f"\nEngineering features (reference date: {reference_date.date()})...")
    
    # Temporal features
    df['account_age_days'] = (reference_date - df['subscription_start_date']).dt.days
    df['account_age_months'] = df['account_age_days'] / 30.0
    df['days_since_last_login'] = (reference_date - df['last_login_date']).dt.days
    df['days_since_last_touch'] = (reference_date - df['last_success_touch_date']).dt.days
    df['is_recent_login'] = (df['days_since_last_login'] <= 7).astype(int)
    
    # Usage features
    df['usage_ratio'] = df['monthly_active_users'] / df['user_count'].replace(0, 1)
    df['inactive_users'] = df['user_count'] - df['monthly_active_users']
    df['is_high_activity'] = (df['usage_ratio'] > 0.7).astype(int)
    
    # Financial features
    df['revenue_per_user'] = df['monthly_fee'] / df['user_count'].replace(0, 1)
    df['is_high_value'] = (df['monthly_fee'] > 1000).astype(int)
    
    # Plan type encoding
    plan_dummies = pd.get_dummies(df['plan_type'], prefix='plan')
    df = pd.concat([df, plan_dummies], axis=1)
    
    # Risk indicators
    df['zero_active_users'] = (df['monthly_active_users'] == 0).astype(int)
    df['declining_usage'] = (df['usage_ratio'] < 0.7).astype(int)
    df['stale_account'] = (df['days_since_last_login'] > 30).astype(int)
    df['very_stale_account'] = (df['days_since_last_login'] > 60).astype(int)
    
    # Retention features
    df['has_6m_retention'] = df['retention_rate_6m'].notna().astype(int)
    df['has_12m_retention'] = df['retention_rate_12m'].notna().astype(int)
    df['retention_trend'] = df['retention_rate_12m'] - df['retention_rate_6m']
    
    # Interaction features
    df['high_value_low_engagement'] = (
        (df['is_high_value'] == 1) & (df['usage_ratio'] < 0.5)
    ).astype(int)
    df['new_account_low_usage'] = (
        (df['account_age_months'] < 3) & (df['usage_ratio'] < 0.5)
    ).astype(int)
    
    # Add customer_id back
    df['customer_id'] = customer_ids
    
    print(f"Feature engineering complete. Total features: {len(df.columns)}")
    return df


def prepare_features(df):
    """Prepare feature matrix for prediction."""
    # Filter to only include columns that exist
    feature_cols = [col for col in MODEL_FEATURES if col in df.columns]
    
    X = df[feature_cols].copy()
    X = X.fillna(X.median())
    
    return X, feature_cols


def classify_status(risk_score):
    """Classify customer status based on churn risk score."""
    if risk_score < CHAMPION_THRESHOLD:
        return "Champion"
    elif risk_score < AT_RISK_THRESHOLD:
        return "At-Risk"
    else:
        return "Critical"


def make_predictions(model, df):
    """Make predictions using the trained model."""
    print("\nMaking predictions...")
    
    # Prepare features
    X, feature_cols = prepare_features(df)
    
    # Make binary predictions
    binary_predictions = model.predict(X)
    
    # Get probability scores (probability of churn class)
    probability_scores = model.predict_proba(X)[:, 1]  # Probability of class 1 (churn)
    
    # Create results dataframe
    results = pd.DataFrame({
        'customer_id': df['customer_id'],
        'prediction': binary_predictions.astype(bool),
        'churn_risk_score': probability_scores,
        'status_classification': [classify_status(score) for score in probability_scores]
    })
    
    print(f"\nPrediction Summary:")
    print(f"Total customers: {len(results)}")
    print(f"\nBinary Predictions:")
    print(f"  Predicted Churn: {binary_predictions.sum()} ({binary_predictions.mean():.1%})")
    print(f"  Predicted Retain: {(~binary_predictions.astype(bool)).sum()} ({(~binary_predictions.astype(bool)).mean():.1%})")
    print(f"\nRisk Score Distribution:")
    print(f"  Mean: {probability_scores.mean():.3f}")
    print(f"  Median: {pd.Series(probability_scores).median():.3f}")
    print(f"  Min: {probability_scores.min():.3f}")
    print(f"  Max: {probability_scores.max():.3f}")
    print(f"\nStatus Classification:")
    print(results['status_classification'].value_counts())
    
    return results


def update_supabase(results):
    """Update Supabase with predictions."""
    print("\n" + "=" * 70)
    print("UPDATING SUPABASE DATABASE")
    print("=" * 70)
    print(f"\nUpdating {len(results)} customer records...\n")
    
    updated_count = 0
    error_count = 0
    
    for idx, row in results.iterrows():
        try:
            # Get customer info for logging
            customer_id = row.get('customer_id', 'Unknown')
            customer_name = row.get('customer_name', customer_id)
            risk_score = float(row['churn_risk_score'])
            risk_pct = risk_score * 100
            status = row['status_classification']
            
            # Status indicator (no emojis)
            if status == "Champion":
                indicator = "[OK]"
            elif status == "At-Risk":
                indicator = "[WARN]"
            else:
                indicator = "[CRIT]"
            
            # Update database
            response = supabase.table('data').update({
                'prediction': row['prediction'],
                'churn_risk_score': risk_score,
                'status_classification': status
            }).eq('customer_id', customer_id).execute()
            
            updated_count += 1
            
            # Log each customer update with real-time flush
            print(f"{indicator} [{updated_count:3d}/{len(results)}] {str(customer_name)[:35]:<35} | Risk: {risk_pct:5.1f}% | {status:<12} | SAVED", flush=True)
            
        except Exception as e:
            error_count += 1
            customer_name = row.get('customer_name', row.get('customer_id', 'Unknown'))
            print(f"[ERR] [{updated_count + error_count:3d}/{len(results)}] {str(customer_name)[:35]:<35} | ERROR: {str(e)[:30]}", flush=True)
    
    print("\n" + "=" * 70)
    print(f"Successfully updated: {updated_count} customers")
    if error_count > 0:
        print(f"Failed updates: {error_count} customers")
    print("=" * 70 + "\n")
    
    return updated_count, error_count


def run_prediction_pipeline(model_path=None):
    """Run the complete prediction pipeline."""
    if model_path is None:
        model_path = MODEL_PATH
    
    print("=" * 60)
    print("CHURN PREDICTION PIPELINE")
    print("=" * 60)
    
    # Load model
    model = load_model(model_path)
    
    # Fetch data from Supabase
    raw_df = fetch_customers_from_supabase()
    
    # Clean data
    cleaned_df = clean_data(raw_df)
    
    # Engineer features
    featured_df = feature_engineering(cleaned_df)
    
    # Make predictions
    results = make_predictions(model, featured_df)
    
    # Update Supabase
    update_supabase(results)
    
    print("\n" + "=" * 60)
    print("PIPELINE COMPLETE")
    print("=" * 60)
    
    return results


if __name__ == "__main__":
    results = run_prediction_pipeline()
    
    # Save results to CSV for inspection
    results.to_csv('prediction_results.csv', index=False)
    print("\nResults saved to prediction_results.csv")
