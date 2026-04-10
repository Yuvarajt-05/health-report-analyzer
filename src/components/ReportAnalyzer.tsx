// src/components/ReportAnalyzer.tsx
import { useState, useEffect } from "react";
import { ArrowLeft, Upload, Loader, FileText } from "lucide-react";
import { AnalysisResult } from "../types/health";
import { ResultsDisplay } from "./ResultsDisplay";
import { uploadAndAnalyzeReport, loadReportContext } from "../utils/reportUpload";

interface ReportAnalyzerProps {
  onNavigate: (page: "home" | "chatbot" | "analyzer") => void;
}

export const ReportAnalyzer = ({ onNavigate }: ReportAnalyzerProps) => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // If opened from chatbot, preload last report
  useEffect(() => {
    const ctx = loadReportContext();
    if (ctx) {
      setAnalysisResult(ctx.analysis);
      setUploadedFileName(ctx.fileName);
    }
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadedFileName(file.name);
    setError(null);

    try {
      const ctx = await uploadAndAnalyzeReport(file);
      setAnalysisResult(ctx.analysis);
      setUploadedFileName(ctx.fileName);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(
        err.message || "Failed to process file. Please try another file."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setUploadedFileName("");
    setError(null);
    setIsProcessing(false);
  };

  if (analysisResult) {
    return (
      <ResultsDisplay
        result={analysisResult}
        onReset={handleReset}
        onNavigate={onNavigate}
        uploadedFileName={uploadedFileName}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => onNavigate("chatbot")}
              className="mr-4 hover:bg-gray-100 p-2 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Detailed Report Analysis
              </h2>
              <p className="text-gray-600 mt-1 text-sm">
                View card-wise explanation of your last uploaded report, or upload a
                new report.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {isProcessing ? (
            <div className="text-center py-12">
              <Loader className="w-12 h-12 text-cyan-600 animate-spin mx-auto mb-2" />
              <p className="text-lg text-gray-700 mb-1">Processing your report...</p>
              <p className="text-sm text-gray-500">
                {uploadedFileName && `Analyzing ${uploadedFileName}`}
              </p>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-cyan-500 transition">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                Upload Medical Report
              </h3>
              <p className="text-gray-500 mb-4 text-sm">Supported: PDF, DOC, DOCX</p>
              <label className="inline-block">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
                <span className="bg-cyan-600 text-white px-6 py-2 rounded-lg font-semibold cursor-pointer hover:bg-cyan-700 transition inline-flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Medical Report
                </span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
