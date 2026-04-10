import { HealthData } from "../types/health";

export const extractHealthDataFromText = (text: string): HealthData => {
  const data: HealthData = {};

  const glucoseMatch = text.match(/glucose[:\s]+(\d+\.?\d*)/i);
  if (glucoseMatch) data.glucose = parseFloat(glucoseMatch[1]);

  const bpMatch = text.match(/(?:bp|blood\s*pressure)[:\s]+(\d+)\s*\/\s*(\d+)/i);
  if (bpMatch) {
    data.systolic = parseInt(bpMatch[1]);
    data.diastolic = parseInt(bpMatch[2]);
  }

  const hemoglobinMatch = text.match(/(?:hemoglobin|hb|hgb)[:\s]+(\d+\.?\d*)/i);
  if (hemoglobinMatch) data.hemoglobin = parseFloat(hemoglobinMatch[1]);

  const cholesterolMatch = text.match(/cholesterol[:\s]+(\d+\.?\d*)/i);
  if (cholesterolMatch) data.cholesterol = parseFloat(cholesterolMatch[1]);

  const tempMatch = text.match(/(?:temperature|temp)[:\s]+(\d+\.?\d*)/i);
  if (tempMatch) data.temperature = parseFloat(tempMatch[1]);

  const heightMatch = text.match(/height[:\s]+(\d+\.?\d*)/i);
  if (heightMatch) data.height = parseFloat(heightMatch[1]);

  const weightMatch = text.match(/weight[:\s]+(\d+\.?\d*)/i);
  if (weightMatch) data.weight = parseFloat(weightMatch[1]);

  return data;
};
