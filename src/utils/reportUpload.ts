// src/utils/reportUpload.ts
import { AnalysisResult, HealthData, HealthParameter, ReportContext } from "../types/health";
import { generateSessionId } from "./api";
import { analyzeHealthParameters } from "./healthAnalyzer";

const REPORT_CONTEXT_KEY = "lastReportContext";

export const saveReportContext = (ctx: ReportContext) => {
  try {
    localStorage.setItem(
      REPORT_CONTEXT_KEY,
      JSON.stringify({
        ...ctx,
        analysis: {
          ...ctx.analysis,
          timestamp: ctx.analysis.timestamp.toISOString(),
        },
      })
    );
  } catch (e) {
    console.error("Failed to save report context:", e);
  }
};

export const loadReportContext = (): ReportContext | null => {
  try {
    const raw = localStorage.getItem(REPORT_CONTEXT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.analysis?.timestamp) {
      parsed.analysis.timestamp = new Date(parsed.analysis.timestamp);
    }
    return parsed as ReportContext;
  } catch (e) {
    console.error("Failed to load report context:", e);
    return null;
  }
};

/**
 * Uploads a report file to backend, runs healthAnalyzer,
 * builds AnalysisResult, and stores it as lastReportContext.
 */
export const uploadAndAnalyzeReport = async (file: File): Promise<ReportContext> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("session_id", generateSessionId());

  const response = await fetch("http://localhost:5000/upload_report", {
    method: "POST",
    body: formData,
  });

  const result: {
    status?: string;
    prediction?: string;
    extracted_data?: HealthData;
    error?: string;
  } = await response.json();

  if (!response.ok || result.status !== "success") {
    throw new Error(result.error || "Report processing failed");
  }

  const extracted: HealthData = result.extracted_data || {};

  const analysed = await analyzeHealthParameters(extracted);

  const withReasons: HealthParameter[] = analysed.parameters.map((p) => ({
    ...p,
    reason: `${p.reason} (Extracted from medical report)`,
  }));

  const anyRisk = withReasons.some((p) => p.status === "Risk");

  const finalResult: AnalysisResult = {
    parameters: withReasons,
    overallStatus: anyRisk ? "Requires Medical Attention" : "Patient appears Healthy",
    timestamp: new Date(),
  };

  const ctx: ReportContext = {
    fileName: file.name,
    analysis: finalResult,
  };

  saveReportContext(ctx);
  return ctx;
};
