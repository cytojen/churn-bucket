"""
Configuration module for churn prediction pipeline.
Contains constants, thresholds, and environment variable management.
"""

import os
from typing import List
from dotenv import load_dotenv

# Load environment variables
def load_environment():
    """Load environment variables from .env file."""
    if os.path.exists('.env'):
        load_dotenv('.env')
    elif os.path.exists('../.env'):
        load_dotenv('../.env')
    else:
        load_dotenv()

# Load environment on module import
load_environment()

# Supabase Configuration
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

# Model Configuration
MODEL_PATH = os.getenv('MODEL_PATH', 'xgb_model.pkl')

# Classification Thresholds
CHAMPION_THRESHOLD = 0.50  # Risk score < 50% = Champion
AT_RISK_THRESHOLD = 0.75   # Risk score 50-75% = At-Risk
# Risk score >= 75% = Critical

# Feature Engineering Constants
DEFAULT_REFERENCE_DATE = None  # None means use current date

# Core columns that should not have missing values
CORE_COLUMNS: List[str] = ['monthly_fee', 'user_count', 'monthly_active_users']

# Date columns to convert to datetime
DATE_COLUMNS: List[str] = [
    'subscription_start_date', 
    'last_login_date', 
    'last_success_touch_date'
]

# Model Features
MODEL_FEATURES: List[str] = [
    # Temporal
    'account_age_months', 'days_since_last_login', 'days_since_last_touch',
    'is_recent_login',
    # Usage & Engagement
    'user_count', 'monthly_active_users', 'usage_ratio', 'inactive_users',
    'is_high_activity',
    # Financial
    'monthly_fee', 'revenue_per_user', 'is_high_value',
    # Plan type dummies
    'plan_Basic', 'plan_Enterprise', 'plan_Pro', 'plan_Trial',
    # Risk indicators
    'zero_active_users', 'declining_usage', 'stale_account',
    'very_stale_account',
    # Retention
    'has_6m_retention', 'has_12m_retention', 'retention_rate_6m',
    'retention_rate_12m', 'retention_trend',
    # Interactions
    'high_value_low_engagement', 'new_account_low_usage'
]

# API Configuration
API_HOST = os.getenv('API_HOST', '0.0.0.0')
API_PORT = int(os.getenv('PORT', os.getenv('API_PORT', '8000')))
API_RELOAD = os.getenv('API_RELOAD', 'false').lower() == 'true'

# CORS Configuration
def get_cors_origins() -> List[str]:
    """Get allowed CORS origins from environment."""
    allowed_origins_str = os.getenv(
        'CORS_ORIGINS',
        'http://localhost:3000,http://localhost:3001'
    )
    
    if allowed_origins_str == '*':
        return ['*']
    
    return [origin.strip() for origin in allowed_origins_str.split(',')]

# Auto prediction schedule
ENABLE_AUTO_PREDICTIONS = os.getenv('ENABLE_AUTO_PREDICTIONS', 'false').lower() == 'true'
AUTO_PREDICTION_INTERVAL = 21600  # 6 hours in seconds

# Validation
def validate_config():
    """Validate that required configuration is present."""
    if not SUPABASE_URL:
        raise ValueError("NEXT_PUBLIC_SUPABASE_URL environment variable is required")
    if not SUPABASE_KEY:
        raise ValueError("NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is required")
    if not os.path.exists(MODEL_PATH):
        print(f"Warning: Model file not found at {MODEL_PATH}")
    
    return True
