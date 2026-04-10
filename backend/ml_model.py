
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import joblib

print("🚀 Training KNN Health Prediction Model...")

def create_health_dataset(n_samples=3000):
    np.random.seed(42)

    data = {
        "age": np.random.randint(20, 80, n_samples),
        "glucose": np.random.normal(100, 20, n_samples),       # mg/dL
        "systolic": np.random.normal(120, 15, n_samples),      # mmHg
        "diastolic": np.random.normal(80, 10, n_samples),      # mmHg
        "hemoglobin": np.random.normal(14, 1.5, n_samples),    # g/dL
        "cholesterol": np.random.normal(190, 30, n_samples),   # mg/dL
        "bmi": np.random.normal(24, 3, n_samples),             # kg/m2
    }

    df = pd.DataFrame(data)

    # realistic clipping
    df["glucose"] = df["glucose"].clip(60, 250)
    df["systolic"] = df["systolic"].clip(90, 200)
    df["diastolic"] = df["diastolic"].clip(50, 120)
    df["hemoglobin"] = df["hemoglobin"].clip(9, 18)
    df["cholesterol"] = df["cholesterol"].clip(130, 300)
    df["bmi"] = df["bmi"].clip(17, 40)

    # gentler risk logic: need ≥2 clear risk factors
    risk_points = 0
    risk_points += (df["glucose"] > 140).astype(int)
    risk_points += (df["systolic"] > 140).astype(int)
    risk_points += (df["diastolic"] > 90).astype(int)
    risk_points += (df["cholesterol"] > 240).astype(int)
    risk_points += (df["bmi"] > 30).astype(int)
    risk_points += (df["hemoglobin"] < 12).astype(int)

    df["HeartDisease"] = (risk_points >= 2).astype(int)

    print("HeartDisease distribution:")
    print(df["HeartDisease"].value_counts())

    return df

data = create_health_dataset()
X = data.drop("HeartDisease", axis=1)
y = data["HeartDisease"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

knn = KNeighborsClassifier(n_neighbors=7, weights="distance")
knn.fit(X_train_scaled, y_train)

y_pred = knn.predict(X_test_scaled)
print("Accuracy:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred))

joblib.dump(knn, "health_model_knn.pkl")
joblib.dump(scaler, "scaler.pkl")
joblib.dump(X.columns.tolist(), "feature_names.pkl")

print("✅ Saved: health_model_knn.pkl, scaler.pkl, feature_names.pkl")
