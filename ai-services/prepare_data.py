import json
import re

def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text) # Remove numbers and special chars
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def load_data():
    with open("data.json", "r") as f:
        data = json.load(f)

    texts = [clean_text(item["description"]) for item in data]
    labels = [item["category"] for item in data]

    return texts, labels