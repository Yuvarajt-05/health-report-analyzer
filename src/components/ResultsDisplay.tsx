import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Download,
  Home,
  Heart,
} from "lucide-react";
import { AnalysisResult, HealthParameter } from "../types/health";

interface ResultsDisplayProps {
  result: AnalysisResult;
  onReset: () => void;
  onNavigate: (page: "home" | "chatbot" | "analyzer") => void;
  uploadedFileName?: string;
}

export const ResultsDisplay = ({
  result,
  onReset,
  onNavigate,
  uploadedFileName,
}: ResultsDisplayProps) => {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Normal":
        return "text-green-800 bg-green-50 border-green-200";
      case "Risk":
        return "text-red-800 bg-red-50 border-red-200";
      default:
        return "text-gray-800 bg-white border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Normal":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getOverallStatusColor = (): string => {
    return result.overallStatus.toLowerCase().includes("healthy")
      ? getStatusColor("Normal")
      : getStatusColor("Risk");
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      <div className="container mx-auto px-3 py-6 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={onReset}
                className="mr-3 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>

              <div>
                <h2 className="text-2xl font-bold text-gray-800">Analysis Results</h2>
                {uploadedFileName && (
                  <p className="text-xs text-gray-500 mt-1">{uploadedFileName}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => onNavigate("home")}
              className="hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
              title="Go to Home"
            >
              <Home className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Overall Status */}
          <div className={`border-2 rounded-xl p-6 mb-6 ${getOverallStatusColor()}`}>
            <div className="flex items-center">
              <Heart
                className={`w-8 h-8 mr-3 ${
                  result.overallStatus.toLowerCase().includes("healthy")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              />
              <div>
                <h3 className="text-xl font-bold mb-1 text-gray-800">
                  Overall Health Status
                </h3>
                <p
                  className={`text-3xl font-black ${
                    result.overallStatus.toLowerCase().includes("healthy")
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >
                  {result.overallStatus}
                </p>
              </div>
            </div>
          </div>

          {/* Parameter Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {result.parameters.map((param: HealthParameter, index: number) => (
              <div
                key={index}
                className={`border-2 rounded-xl p-4 hover:shadow-lg transition-all duration-300 ${getStatusColor(
                  param.status
                )}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <h4 className="text-lg font-bold text-gray-800 mr-2 flex-1 truncate">
                        {param.name}
                      </h4>
                      <span
                        className={`flex items-center font-bold px-2 py-0.5 rounded-full text-xs ${
                          param.status === "Normal"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {getStatusIcon(param.status)}
                        <span className="ml-1">{param.status}</span>
                      </span>
                    </div>

                    <p className="text-xl font-black text-gray-900">
                      {param.value} {param.unit}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-1 border-t border-gray-200">
                  <div>
                    <p className="font-semibold text-xs uppercase text-gray-500">
                      Reason
                    </p>
                    <p className="text-sm text-gray-700 leading-snug">
                      {param.reason}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-xs uppercase text-gray-500">
                      Recommendation
                    </p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg leading-snug">
                      {param.suggestion}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Buttons (Explain My Report removed) */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-xl font-bold text-md shadow-md hover:shadow-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Download/Print Report
            </button>

            <button
              onClick={onReset}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-bold text-md hover:bg-gray-300 transition-all duration-300 border-2 border-gray-300"
            >
              Analyze New Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
