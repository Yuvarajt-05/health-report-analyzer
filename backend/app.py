from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import re
import PyPDF2
import docx

from health_analyser import analyse_report
import db as db_module

app = Flask(__name__)
CORS(app)

db_module.init_db()

ALLOWED_EXTENSIONS = {"pdf", "doc", "docx"}
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def extract_text_from_file(file) -> str:
    filename = secure_filename(file.filename)
    ext = filename.rsplit(".", 1)[1].lower()

    if ext == "pdf":
        reader = PyPDF2.PdfReader(file)
        parts = []
        for page in reader.pages:
            parts.append(page.extract_text() or "")
        return "\n".join(parts)

    if ext in ["doc", "docx"]:
        d = docx.Document(file)
        return "\n".join(p.text for p in d.paragraphs)

    return ""


def extract_structured_data(text: str) -> dict:
    data: dict = {}

    # Glucose / Blood sugar
    m = re.search(r"(?:glucose|blood sugar)[:\s]+(\d+\.?\d*)", text, re.IGNORECASE)
    if m:
        data["glucose"] = float(m.group(1))

    # Blood pressure
    m = re.search(r"(?:bp|blood\s*pressure)[:\s]+(\d+)\s*/\s*(\d+)", text, re.IGNORECASE)
    if m:
        data["systolic"] = float(m.group(1))
        data["diastolic"] = float(m.group(2))

    # Hemoglobin
    m = re.search(r"(?:hemoglobin|hb|hgb)[:\s]+(\d+\.?\d*)", text, re.IGNORECASE)
    if m:
        data["hemoglobin"] = float(m.group(1))

    # RBC
    m = re.search(r"(?:rbc|red blood cell)[^\d]*?(\d+\.?\d*)", text, re.IGNORECASE)
    if m:
        data["rbc"] = float(m.group(1))

    # WBC / Total leucocyte count
    m = re.search(
        r"(?:wbc|white blood cell|total leucocyte)[^\d]*?(\d+\.?\d*)",
        text,
        re.IGNORECASE,
    )
    if m:
        data["wbc"] = float(m.group(1))

    # Platelets
    m = re.search(r"(?:platelet(?:s)?|plt)[^\d]*?(\d+\.?\d*)", text, re.IGNORECASE)
    if m:
        data["platelets"] = float(m.group(1))

    # Total Cholesterol
    m = re.search(
        r"(?:total\s+cholesterol|cholesterol)[:\s]+(\d+\.?\d*)",
        text,
        re.IGNORECASE,
    )
    if m:
        data["cholesterol"] = float(m.group(1))

    # HDL
    m = re.search(r"hdl[^\d]*?(\d+\.?\d*)", text, re.IGNORECASE)
    if m:
        data["hdl"] = float(m.group(1))

    # LDL
    m = re.search(r"ldl[^\d]*?(\d+\.?\d*)", text, re.IGNORECASE)
    if m:
        data["ldl"] = float(m.group(1))

    # Triglycerides
    m = re.search(r"(?:triglycerides?|tg)[^\d]*?(\d+\.?\d*)", text, re.IGNORECASE)
    if m:
        data["triglycerides"] = float(m.group(1))

    # Temperature
    m = re.search(r"(?:temperature|temp)[:\s]+(\d+\.?\d*)", text, re.IGNORECASE)
    if m:
        data["temperature"] = float(m.group(1))

    # Height and weight (for BMI)
    m = re.search(r"height[:\s]+(\d+\.?\d*)", text, re.IGNORECASE)
    if m:
        data["height"] = float(m.group(1))

    m = re.search(r"weight[:\s]+(\d+\.?\d*)", text, re.IGNORECASE)
    if m:
        data["weight"] = float(m.group(1))

    return data


def map_extracted_to_model_features(extracted: dict) -> dict:
    def get_or_default(key: str, default: float) -> float:
        val = extracted.get(key)
        return float(val) if isinstance(val, (int, float)) else default

    h = extracted.get("height")
    w = extracted.get("weight")
    if isinstance(h, (int, float)) and isinstance(w, (int, float)) and h > 0:
        h_m = h / 100.0
        bmi = round(w / (h_m * h_m), 1)
    else:
        bmi = 24.0

    return {
        "age": 35.0,
        "glucose": get_or_default("glucose", 95.0),
        "systolic": get_or_default("systolic", 118.0),
        "diastolic": get_or_default("diastolic", 76.0),
        "hemoglobin": get_or_default("hemoglobin", 14.5),
        "cholesterol": get_or_default("cholesterol", 185.0),
        "hdl": get_or_default("hdl", 45.0),
        "ldl": get_or_default("ldl", 110.0),
        "triglycerides": get_or_default("triglycerides", 150.0),
        "bmi": bmi,
    }


@app.route("/analyse", methods=["POST"])
def analyse():
    try:
        data = request.get_json() or {}
        model_input = map_extracted_to_model_features(data)
        prediction = analyse_report(model_input)
        return jsonify({"prediction": prediction})
    except Exception as e:
        print("Error in /analyse:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/upload_report", methods=["POST"])
def upload_report():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Unsupported file type"}), 400

        raw_text = extract_text_from_file(file)
        if not raw_text.strip():
            return jsonify({"error": "Could not read file content"}), 400

        extracted_data = extract_structured_data(raw_text)

        model_input = map_extracted_to_model_features(extracted_data)
        prediction = analyse_report(model_input)

        session_id = request.form.get("session_id", "demo-session")

        db_module.insert_medical_report(
            session_id=session_id,
            file_name=file.filename,
            file_type=file.content_type,
            extracted_data=extracted_data,
            analysis_results={"prediction": prediction},
        )

        return jsonify(
            {
                "status": "success",
                "extracted_data": extracted_data,
                "prediction": prediction,
            }
        )
    except Exception as e:
        print("Error in /upload_report:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
