"use client";

import { useState, useEffect } from "react";
import { API_URL, API_ENDPOINTS, TIMEOUTS } from "@/lib/constants";

interface PredictionStatus {
  is_running: boolean;
  last_run: string | null;
  last_result: {
    total_customers: number;
    champions: number;
    at_risk: number;
    critical: number;
    predicted_churn: number;
    predicted_retain: number;
    mean_risk_score: number;
    timestamp: string;
  } | null;
  last_error: string | null;
}

export default function PredictionTrigger() {
  const [status, setStatus] = useState<PredictionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);

  // Check if API is available on mount
  useEffect(() => {
    checkApiAvailability();
  }, []);

  const checkApiAvailability = async () => {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.HEALTH}`, {
        method: 'GET',
        signal: AbortSignal.timeout(TIMEOUTS.API_HEALTH_CHECK),
      });
      setApiAvailable(response.ok);
      if (!response.ok) {
        setError("API is not responding correctly");
      }
    } catch (err) {
      setApiAvailable(false);
      setError("Prediction API is not available. Ensure the API server is running.");
    }
  };

  const triggerPrediction = async () => {
    if (!apiAvailable) {
      setError("Cannot trigger prediction: API is not available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.PREDICT}`, {
        method: "POST",
        signal: AbortSignal.timeout(TIMEOUTS.TRIGGER_PREDICTION),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to trigger prediction");
      }

      const data = await response.json();
      console.log("Prediction triggered:", data);

      // Start polling for status
      pollStatus();
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError' || err.message.includes('fetch')) {
          setError("Cannot connect to API server. Is it running?");
          setApiAvailable(false);
        } else {
          setError(err.message);
        }
      } else {
        setError("Unknown error occurred");
      }
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.PREDICT_STATUS}`, {
        signal: AbortSignal.timeout(TIMEOUTS.STATUS_CHECK),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch status');
      }
      
      const data = await response.json();
      setStatus(data);
      setApiAvailable(true);
      return data;
    } catch (err) {
      console.error("Error checking status:", err);
      setApiAvailable(false);
      setError("Cannot connect to API. Ensure the API server is running at " + API_URL);
      return null;
    }
  };

  const pollStatus = async () => {
    const interval = setInterval(async () => {
      const data = await checkStatus();

      if (data && !data.is_running) {
        clearInterval(interval);
        setLoading(false);

        // Reload the page to show updated data
        if (data.last_result) {
          window.location.reload();
        }
      }
    }, 2000); // Check every 2 seconds
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-4">
      {/* API Status Indicator */}
      {apiAvailable === false && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-red-400 font-medium text-sm">API Not Available</span>
          </div>
          <p className="text-red-400/80 text-xs">
            The prediction API is not running. Start it with: <code className="bg-black/40 px-1 rounded">python api.py</code>
          </p>
          <p className="text-red-400/60 text-xs mt-1">
            Looking for API at: {API_URL}
          </p>
          <button
            onClick={checkApiAvailability}
            className="mt-2 px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs transition"
          >
            Retry Connection
          </button>
        </div>
      )}

      {apiAvailable === true && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-green-400 text-xs">API Connected</span>
        </div>
      )}

      {/* Trigger Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={triggerPrediction}
          disabled={loading || status?.is_running || apiAvailable === false}
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600
                     text-white font-medium transition disabled:opacity-50
                     disabled:cursor-not-allowed"
        >
          {loading || status?.is_running
            ? "Updating Predictions..."
            : apiAvailable === false
            ? "API Unavailable"
            : "Run Predictions"}
        </button>

        <button
          onClick={checkStatus}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20
                     text-white text-sm transition"
        >
          Check Status
        </button>
      </div>

      {/* Status Display */}
      {status && (
        <div className="p-4 rounded-lg bg-black/40 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Status:</span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                status.is_running
                  ? "bg-yellow-500/20 text-yellow-400"
                  : status.last_error
                  ? "bg-red-500/20 text-red-400"
                  : "bg-green-500/20 text-green-400"
              }`}
            >
              {status.is_running
                ? "Running"
                : status.last_error
                ? "Error"
                : "Idle"}
            </span>
          </div>

          {status.last_run && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Last Run:</span>
              <span className="text-white">{formatDate(status.last_run)}</span>
            </div>
          )}

          {status.last_error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm">{status.last_error}</p>
            </div>
          )}

          {status.last_result && (
            <div className="pt-3 border-t border-white/10 space-y-2">
              <h4 className="text-white font-medium text-sm">Last Results:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/60">Total Customers:</span>
                  <span className="text-white font-medium">
                    {status.last_result.total_customers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Champions:</span>
                  <span className="text-green-400 font-medium">
                    {status.last_result.champions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">At-Risk:</span>
                  <span className="text-yellow-400 font-medium">
                    {status.last_result.at_risk}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Critical:</span>
                  <span className="text-red-400 font-medium">
                    {status.last_result.critical}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Mean Risk:</span>
                  <span className="text-white font-medium">
                    {(status.last_result.mean_risk_score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Updated:</span>
                  <span className="text-white font-medium">
                    {formatDate(status.last_result.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
