# backend/health_analyser.py
import joblib
import pandas as pd
import numpy as np

model = joblib.load("health_model_knn.pkl")
scaler = joblib.load("scaler.pkl")
feature_names = joblib.load("feature_names.pkl")

def analyse_report(data: dict) -> str:
    """
    Returns:
      "Healthy (Confidence: xx.x%)"
      or
      "At Risk (Confidence: xx.x%)"
    """
    df = pd.DataFrame([data])

    # ensure all expected features exist
    for f in feature_names:
        if f not in df.columns:
            df[f] = 0.0

    df = df[feature_names]

    df_scaled = scaler.transform(df)

    proba = model.predict_proba(df_scaled)[0]
    prob_healthy = float(proba[0])  # class 0
    prob_risk = float(proba[1])     # class 1

    # threshold: if model ≥0.6 confident healthy → Healthy
    if prob_healthy >= 0.6:
        label = "Healthy"
        conf = prob_healthy * 100
    else:
        label = "At Risk"
        conf = prob_risk * 100

    return f"{label} (Confidence: {conf:.1f}%)"
