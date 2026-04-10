// src/types/health.ts

export interface HealthParameter {
  name: string;
  value: number;
  unit: string;
  status: "Normal" | "Risk";
  reason: string;
  suggestion: string;
}

export interface HealthData {
  glucose?: number;
  systolic?: number;
  diastolic?: number;
  hemoglobin?: number;
  rbc?: number;
  wbc?: number;
  platelets?: number;
  cholesterol?: number;
  hdl?: number;
  ldl?: number;
  triglycerides?: number;
  temperature?: number;
  height?: number;
  weight?: number;
}

export interface AnalysisResult {
  parameters: HealthParameter[];
  overallStatus: string;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  type: "user" | "bot";
  message: string;
  timestamp: Date;
}

/** Shared shape for last analyzed report stored in localStorage */
export interface ReportContext {
  fileName: string;
  analysis: AnalysisResult;
}
