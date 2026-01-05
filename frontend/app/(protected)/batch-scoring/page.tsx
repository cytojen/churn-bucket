"use client";

import { useState } from "react";

interface ScoringResult {
  customer_id: string;
  customer_name: string;
  churn_risk_score: number;
  status_classification: string;
  prediction: boolean;
}

export default function BatchScoringPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ScoringResult[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please select a valid CSV file");
      setFile(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "text/csv") {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("Please drop a valid CSV file");
      setFile(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a CSV file first");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/predict/batch", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file");
      console.error("Error processing batch scoring:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadResults = () => {
    if (results.length === 0) return;

    const csvContent = [
      ["Customer ID", "Customer Name", "Churn Risk Score", "Status", "Predicted Churn"].join(","),
      ...results.map(r => [
        r.customer_id,
        r.customer_name,
        (r.churn_risk_score * 100).toFixed(2) + "%",
        r.status_classification,
        r.prediction ? "Yes" : "No"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `churn_scores_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getRiskColor = (score: number) => {
    if (score >= 0.7) return "text-red-500";
    if (score >= 0.4) return "text-yellow-500";
    return "text-green-500";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Critical":
        return "bg-red-500/15 text-red-500 border border-red-500/20";
      case "At-Risk":
        return "bg-yellow-500/15 text-yellow-500 border border-yellow-500/20";
      case "Champion":
        return "bg-green-500/15 text-green-500 border border-green-500/20";
      default:
        return "bg-white/10 text-white/60 border border-white/10";
    }
  };

  return (
    <main className="mt-10 p-6 space-y-8 w-full text-white">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-xl font-bold mb-1">Batch Scoring</h1>
        <p className="text-sm text-gray-400">Upload a CSV file to score multiple partners for churn risk</p>
      </div>

      {/* UPLOAD SECTION */}
      <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/10">
        <h2 className="text-base font-semibold text-white mb-4">Upload CSV File</h2>
        
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
            isDragging 
              ? "border-emerald-400 bg-emerald-400/5" 
              : "border-white/20 bg-white/[0.02]"
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            <div>
              <p className="text-white mb-1">
                {file ? file.name : "Drag and drop your CSV file here"}
              </p>
              <p className="text-sm text-gray-500">or</p>
            </div>
            
            <label className="px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 transition cursor-pointer text-sm font-medium">
              Browse Files
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            
            <p className="text-xs text-gray-500 mt-2">
              CSV file should include: customer_id, customer_name, subscription_start_date, last_login_date, user_count, monthly_active_users, etc.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!file || loading}
          className="mt-4 w-full px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed transition font-medium"
        >
          {loading ? "Processing..." : "Score Partners"}
        </button>
      </div>

      {/* RESULTS SECTION */}
      {results.length > 0 && (
        <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-white">Scoring Results</h2>
            <button
              onClick={downloadResults}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 transition text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download CSV
            </button>
          </div>

          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-xs text-gray-400 mb-1">Total Scored</div>
              <div className="text-2xl font-bold text-white">{results.length}</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-xs text-gray-400 mb-1">High Risk</div>
              <div className="text-2xl font-bold text-red-500">
                {results.filter(r => r.churn_risk_score >= 0.7).length}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-xs text-gray-400 mb-1">Medium Risk</div>
              <div className="text-2xl font-bold text-yellow-500">
                {results.filter(r => r.churn_risk_score >= 0.4 && r.churn_risk_score < 0.7).length}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="pb-3 text-xs font-medium text-gray-400">Partner ID</th>
                  <th className="pb-3 text-xs font-medium text-gray-400">Partner Name</th>
                  <th className="pb-3 text-xs font-medium text-gray-400">Risk Score</th>
                  <th className="pb-3 text-xs font-medium text-gray-400">Status</th>
                  <th className="pb-3 text-xs font-medium text-gray-400">Predicted Churn</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                    <td className="py-3 text-sm text-gray-300">{result.customer_id}</td>
                    <td className="py-3 text-sm font-medium text-white">{result.customer_name}</td>
                    <td className={`py-3 text-sm font-bold ${getRiskColor(result.churn_risk_score)}`}>
                      {(result.churn_risk_score * 100).toFixed(1)}%
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${getStatusBadge(result.status_classification)}`}>
                        {result.status_classification}
                      </span>
                    </td>
                    <td className="py-3 text-sm">
                      <span className={`px-2 py-1 rounded ${result.prediction ? "bg-red-500/15 text-red-500" : "bg-green-500/15 text-green-500"}`}>
                        {result.prediction ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
