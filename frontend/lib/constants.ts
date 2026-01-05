/**
 * Frontend constants and configuration
 */

// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// API Endpoints
export const API_ENDPOINTS = {
  HEALTH: "/health",
  PREDICT: "/predict",
  PREDICT_STATUS: "/predict/status",
  PREDICT_RESULTS: "/predict/results",
} as const;

// Timeout configurations (in milliseconds)
export const TIMEOUTS = {
  API_HEALTH_CHECK: 5000,
  TRIGGER_PREDICTION: 30000,
  STATUS_CHECK: 5000,
  POLLING_INTERVAL: 2000,
} as const;

// Risk thresholds
export const RISK_THRESHOLDS = {
  CHAMPION: 50,
  AT_RISK: 75,
} as const;

// Customer status types
export const CUSTOMER_STATUS = {
  CHAMPION: "Champion",
  AT_RISK: "At-Risk",
  CRITICAL: "Critical",
} as const;

// Chart colors
export const CHART_COLORS = {
  PLAN_COLORS: [
    "#8b5cf6", // purple
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#ec4899", // pink
    "#14b8a6", // teal
  ],
  STATUS_COLORS: {
    CHAMPION: "#22c55e", // green
    AT_RISK: "#eab308", // yellow
    CRITICAL: "#ef4444", // red
  },
} as const;

// Alert types
export const ALERT_TYPES = {
  CRITICAL: "Critical",
  WARNING: "Warning",
  INFO: "Info",
} as const;

// Alert tag styles
export const ALERT_TAG_STYLES = {
  CRITICAL: "bg-red-500/10 text-red-400 border border-red-500/20",
  WARNING: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  INFO: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
} as const;

// Date format options
export const DATE_FORMATS = {
  SHORT: "MMM dd",
  LONG: "MMMM dd, yyyy",
  WITH_TIME: "MMM dd, yyyy HH:mm",
} as const;

// Usage thresholds
export const USAGE_THRESHOLDS = {
  HIGH: 0.7,
  MEDIUM: 0.4,
} as const;

// Login recency thresholds (in days)
export const LOGIN_THRESHOLDS = {
  RECENT: 7,
  MODERATE: 14,
  STALE: 30,
} as const;
