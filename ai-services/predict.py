from flask import Flask, request, jsonify
import pickle
import re

# Load the saved pipeline (which includes the vectorizer)
with open("model.pkl", "rb") as f:
    model_pipeline = pickle.load(f)

app = Flask(__name__)

def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    return text.strip()

@app.route("/predict-category", methods=["POST"])
def predict_category():
    data = request.json
    description = data.get("description", "")
    
    if not description:
        return jsonify({"error": "No description"}), 400

    # 🤖 ML PREDICTION
    cleaned = clean_text(description)
    prediction = model_pipeline.predict([cleaned])[0]
    
    return jsonify({
        "description": description,
        "predictedCategory": prediction,
        "source": "pure_ml"
    })

if __name__ == "__main__":
    app.run(port=8000, debug=True)