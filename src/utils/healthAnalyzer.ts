import { AnalysisResult, HealthData, HealthParameter } from "../types/health";

export const analyzeHealthParameters = async (
  data: HealthData
): Promise<AnalysisResult> => {
  const parameters: HealthParameter[] = [];

  if (data.glucose !== undefined) parameters.push(analyzeGlucose(data.glucose));
  if (data.systolic !== undefined && data.diastolic !== undefined)
    parameters.push(analyzeBloodPressure(data.systolic, data.diastolic));
  if (data.hemoglobin !== undefined) parameters.push(analyzeHemoglobin(data.hemoglobin));
  if (data.rbc !== undefined) parameters.push(analyzeRBC(data.rbc));
  if (data.wbc !== undefined) parameters.push(analyzeWBC(data.wbc));
  if (data.platelets !== undefined) parameters.push(analyzePlatelets(data.platelets));
  if (data.cholesterol !== undefined) parameters.push(analyzeCholesterol(data.cholesterol));
  if (data.hdl !== undefined) parameters.push(analyzeHDL(data.hdl));
  if (data.ldl !== undefined) parameters.push(analyzeLDL(data.ldl));
  if (data.triglycerides !== undefined)
    parameters.push(analyzeTriglycerides(data.triglycerides));
  if (data.temperature !== undefined) parameters.push(analyzeTemperature(data.temperature));
  if (data.height !== undefined && data.weight !== undefined)
    parameters.push(analyzeBMI(data.height, data.weight));

  try {
    const response = await fetch("http://localhost:5000/analyse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    const mlPrediction: string = result.prediction || "Unknown";
    const isHealthy = mlPrediction.toLowerCase().startsWith("healthy");

    parameters.push({
      name: "ML Model Prediction",
      value: isHealthy ? 0 : 1,
      unit: "",
      status: isHealthy ? "Normal" : "Risk",
      reason: "Predicted using ML model",
      suggestion: isHealthy
        ? "You appear healthy based on ML model analysis."
        : "Consult a doctor for further evaluation.",
    });
  } catch (err) {
    console.error("ML Model connection failed:", err);
    parameters.push({
      name: "ML Model Prediction",
      value: 1,
      unit: "",
      status: "Risk",
      reason: "Could not connect to ML model backend.",
      suggestion: "Ensure Flask backend is running on port 5000.",
    });
  }

  const anyRisk = parameters.some((p) => p.status === "Risk");

  return {
    parameters,
    overallStatus: anyRisk ? "Requires Medical Attention" : "Overall Healthy",
    timestamp: new Date(),
  };
};

// -------- Normal / Risk rules --------

const analyzeGlucose = (glucose: number): HealthParameter => {
  const inRange = glucose >= 70 && glucose <= 125;
  return {
    name: "Glucose",
    value: glucose,
    unit: "mg/dL",
    status: inRange ? "Normal" : "Risk",
    reason: inRange
      ? "Blood sugar is within acceptable range."
      : "Blood sugar is outside recommended range.",
    suggestion: inRange
      ? "Maintain a balanced diet and regular exercise."
      : "Adjust diet and activity; consult a doctor for further evaluation.",
  };
};

const analyzeBloodPressure = (systolic: number, diastolic: number): HealthParameter => {
  const inRange = systolic >= 90 && systolic <= 120 && diastolic >= 60 && diastolic <= 80;
  return {
    name: "Blood Pressure",
    value: systolic,
    unit: `${systolic}/${diastolic} mmHg`,
    status: inRange ? "Normal" : "Risk",
    reason: inRange
      ? "Blood pressure is within normal range."
      : "Blood pressure suggests hypo‑ or hypertension.",
    suggestion: inRange
      ? "Maintain healthy lifestyle with regular exercise and balanced diet."
      : "Consult a doctor to evaluate and manage blood pressure.",
  };
};

const analyzeHemoglobin = (hemoglobin: number): HealthParameter => {
  const inRange = hemoglobin >= 12 && hemoglobin <= 16;
  return {
    name: "Hemoglobin",
    value: hemoglobin,
    unit: "g/dL",
    status: inRange ? "Normal" : "Risk",
    reason: inRange
      ? "Hemoglobin level is within normal range."
      : "Hemoglobin is outside normal range.",
    suggestion: inRange
      ? "Continue a balanced diet with adequate iron intake."
      : "Consult a doctor; adjust diet and investigate cause.",
  };
};

const analyzeRBC = (rbc: number): HealthParameter => {
  const inRange = rbc >= 4 && rbc <= 6.0;
  return {
    name: "RBC",
    value: rbc,
    unit: "×10^12/L",
    status: inRange ? "Normal" : "Risk",
    reason: inRange
      ? "Red blood cell count is in normal range."
      : "Red blood cell count is abnormal.",
    suggestion: inRange
      ? "No immediate concern."
      : "Consult a doctor to evaluate possible anemia or polycythemia.",
  };
};

const analyzeWBC = (wbc: number): HealthParameter => {
  const inRange = wbc >= 4 && wbc <= 11;
  return {
    name: "WBC",
    value: wbc,
    unit: "×10^9/L",
    status: inRange ? "Normal" : "Risk",
    reason: inRange
      ? "White blood cell count is in normal range."
      : "White blood cell count is abnormal.",
    suggestion: inRange
      ? "No immediate concern."
      : "Consult a doctor to evaluate possible infection or marrow disorder.",
  };
};

const analyzePlatelets = (platelets: number): HealthParameter => {
  const inRange = platelets >= 150 && platelets <= 400;
  return {
    name: "Platelets",
    value: platelets,
    unit: "×10^9/L",
    status: inRange ? "Normal" : "Risk",
    reason: inRange ? "Platelet count is in normal range." : "Platelet count is abnormal.",
    suggestion: inRange
      ? "No immediate concern."
      : "Consult a doctor to evaluate bleeding or clotting risk.",
  };
};

const analyzeCholesterol = (cholesterol: number): HealthParameter => {
  const inRange = cholesterol < 200;
  return {
    name: "Total Cholesterol",
    value: cholesterol,
    unit: "mg/dL",
    status: inRange ? "Normal" : "Risk",
    reason: inRange
      ? "Total cholesterol is in desirable range."
      : "Total cholesterol is high.",
    suggestion: inRange
      ? "Maintain a heart‑healthy lifestyle."
      : "Modify diet, increase activity, and consult a doctor for lipid management.",
  };
};

const analyzeHDL = (hdl: number): HealthParameter => {
  const inRange = hdl >= 40;
  return {
    name: "HDL",
    value: hdl,
    unit: "mg/dL",
    status: inRange ? "Normal" : "Risk",
    reason: inRange ? "HDL is acceptable." : "HDL is below recommended level.",
    suggestion: inRange
      ? "Maintain heart‑healthy lifestyle."
      : "Increase physical activity and improve diet; discuss with doctor.",
  };
};

const analyzeLDL = (ldl: number): HealthParameter => {
  const inRange = ldl < 130;
  return {
    name: "LDL",
    value: ldl,
    unit: "mg/dL",
    status: inRange ? "Normal" : "Risk",
    reason: inRange ? "LDL is acceptable." : "LDL is high.",
    suggestion: inRange
      ? "Maintain heart‑healthy lifestyle."
      : "Modify diet and activity; consult a doctor for lipid management.",
  };
};

const analyzeTriglycerides = (tg: number): HealthParameter => {
  const inRange = tg < 200;
  return {
    name: "Triglycerides",
    value: tg,
    unit: "mg/dL",
    status: inRange ? "Normal" : "Risk",
    reason: inRange ? "Triglycerides are acceptable." : "Triglycerides are high.",
    suggestion: inRange
      ? "Maintain current lifestyle."
      : "Reduce sugars and fats; consult a doctor if persistently high.",
  };
};

const analyzeTemperature = (temperature: number): HealthParameter => {
  const inRange = temperature >= 36.1 && temperature <= 37.2;
  return {
    name: "Body Temperature",
    value: temperature,
    unit: "°C",
    status: inRange ? "Normal" : "Risk",
    reason: inRange
      ? "Body temperature is within normal range."
      : "Body temperature is outside normal range.",
    suggestion: inRange
      ? "No immediate concern."
      : "Monitor symptoms and consult a doctor if abnormal temperature persists.",
  };
};

const analyzeBMI = (height: number, weight: number): HealthParameter => {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  const inRange = bmi >= 18.5 && bmi <= 24.9;

  return {
    name: "BMI",
    value: parseFloat(bmi.toFixed(1)),
    unit: "kg/m²",
    status: inRange ? "Normal" : "Risk",
    reason: inRange
      ? "Body Mass Index is within healthy range."
      : "Body Mass Index is outside healthy range.",
    suggestion: inRange
      ? "Maintain current diet and exercise routine."
      : "Adjust diet and activity; consult a doctor or nutritionist.",
  };
};
