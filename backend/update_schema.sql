-- Add new columns to the data table for predictions

-- Add prediction column (boolean) for binary churn prediction
ALTER TABLE public.data 
ADD COLUMN IF NOT EXISTS prediction boolean NULL;

-- Add status_classification column for Champion/At-Risk/Critical
ALTER TABLE public.data 
ADD COLUMN IF NOT EXISTS status_classification text NULL;

-- Add index on status_classification for faster filtering
CREATE INDEX IF NOT EXISTS idx_status_classification 
ON public.data(status_classification);

-- Add index on churn_risk_score for faster sorting
CREATE INDEX IF NOT EXISTS idx_churn_risk_score 
ON public.data(churn_risk_score);

-- Add index on prediction for faster filtering
CREATE INDEX IF NOT EXISTS idx_prediction 
ON public.data(prediction);

-- Add a comment to document the columns
COMMENT ON COLUMN public.data.prediction IS 
'Binary prediction from ML model: true = predicted churn, false = predicted retain';

COMMENT ON COLUMN public.data.churn_risk_score IS 
'Probability score (0-1) indicating likelihood of churn from ML model';

COMMENT ON COLUMN public.data.status_classification IS 
'Customer status based on churn risk score: Champion (<50%), At-Risk (50-75%), Critical (>=75%)';
