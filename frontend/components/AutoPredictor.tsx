"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import PredictionStatusIndicator from "./PredictionStatusIndicator";
import { API_URL, API_ENDPOINTS, TIMEOUTS } from "@/lib/constants";

export default function AutoPredictor() {
  const hasChecked = useRef(false);
  
  const [isChecking, setIsChecking] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordsToPredict, setRecordsToPredict] = useState(0);

  useEffect(() => {
    // Only run once on mount
    if (hasChecked.current) return;
    hasChecked.current = true;

    checkAndRunPredictions();
  }, []);

  const checkAndRunPredictions = async () => {
    try {
      setIsChecking(true);
      setError(null);
      
      console.log("Checking if prediction API is available...");
      
      // First, check if API is available
      const apiAvailable = await checkApiHealth();
      if (!apiAvailable) {
        console.log("WARNING: Prediction API not available - skipping automatic predictions");
        setIsChecking(false);
        return;
      }
      
      console.log("API is available");
      console.log("Checking database for missing predictions...");

      // Check if any records have null prediction fields
      const { data, error, count } = await supabase
        .from("data")
        .select("customer_id, churn_risk_score, status_classification, prediction", { count: 'exact' })
        .or("churn_risk_score.is.null,status_classification.is.null,prediction.is.null");

      if (error) {
        console.error("ERROR: Error checking database:", error);
        setError("Database error: " + error.message);
        setIsChecking(false);
        return;
      }

      const recordCount = count || 0;
      console.log(`Found ${recordCount} records needing predictions`);

      // If we found any records with null values, run predictions
      if (data && data.length > 0) {
        setRecordsToPredict(recordCount);
        setIsChecking(false);
        console.log("Triggering prediction pipeline...");
        await triggerPredictions();
      } else {
        console.log("All predictions are up to date");
        setIsChecking(false);
      }
    } catch (err) {
      console.error("ERROR: Error in auto-predictor:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsChecking(false);
    }
  };

  const checkApiHealth = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.HEALTH}`, {
        method: 'GET',
        signal: AbortSignal.timeout(TIMEOUTS.API_HEALTH_CHECK),
      });
      return response.ok;
    } catch (err) {
      console.log("WARNING: API health check failed:", err instanceof Error ? err.message : "Unknown error");
      return false;
    }
  };

  const triggerPredictions = async () => {
    try {
      setIsRunning(true);
      setError(null);
      
      console.log("Sending prediction request to API...");
      
      const response = await fetch(`${API_URL}${API_ENDPOINTS.PREDICT}`, {
        method: "POST",
        signal: AbortSignal.timeout(TIMEOUTS.TRIGGER_PREDICTION),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("Prediction request accepted:", result);

      // Wait for completion and reload
      await pollForCompletion();
    } catch (err) {
      console.error("ERROR: Error triggering predictions:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsRunning(false);
    }
  };

  const pollForCompletion = async () => {
    const maxAttempts = 120; // 4 minutes max (2 second intervals)
    let attempts = 0;

    console.log("Polling for prediction completion...");

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`${API_URL}/predict/status`, {
          signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
          console.error("ERROR: Status check failed:", response.status);
          break;
        }

        const status = await response.json();
        console.log(`Status check ${attempts + 1}:`, status.status, status.is_running ? "(running)" : "(idle)");

        if (!status.is_running && status.last_run) {
          console.log("Predictions completed successfully! Reloading page...");
          // Predictions completed - reload page to show new data
          setTimeout(() => window.location.reload(), 1000);
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;
      } catch (err) {
        console.error("ERROR: Error polling status:", err);
        setError("Lost connection to API");
        setIsRunning(false);
        break;
      }
    }

    if (attempts >= maxAttempts) {
      console.error("ERROR: Prediction timeout - exceeded maximum wait time");
      setError("Prediction timeout");
      setIsRunning(false);
    }
  };

  // This component renders the status indicator
  return (
    <PredictionStatusIndicator
      isChecking={isChecking}
      isRunning={isRunning}
      error={error}
      recordsToPredict={recordsToPredict}
    />
  );
}
