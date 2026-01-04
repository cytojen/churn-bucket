"use client";

import { useEffect, useState } from "react";

interface PredictionStatusIndicatorProps {
  isChecking: boolean;
  isRunning: boolean;
  error: string | null;
  recordsToPredict: number;
}

export default function PredictionStatusIndicator({
  isChecking,
  isRunning,
  error,
  recordsToPredict,
}: PredictionStatusIndicatorProps) {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    if (!isRunning && !isChecking) return;

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning, isChecking]);

  if (!isChecking && !isRunning && !error) return null;

  return (
    <div className="fixed top-4 right-4 z-50 min-w-[300px]">
      {isChecking && (
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <div>
              <p className="text-blue-400 font-medium text-sm">
                Checking for predictions{dots}
              </p>
              <p className="text-blue-400/60 text-xs mt-1">
                Scanning database for missing data
              </p>
            </div>
          </div>
        </div>
      )}

      {isRunning && (
        <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <p className="text-emerald-400 font-medium text-sm">
                Running predictions{dots}
              </p>
              <p className="text-emerald-400/60 text-xs mt-1">
                {recordsToPredict > 0
                  ? `Processing ${recordsToPredict} records`
                  : "Analyzing customer data"}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div>
              <p className="text-red-400 font-medium text-sm">Prediction Error</p>
              <p className="text-red-400/60 text-xs mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
