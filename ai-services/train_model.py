from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import pickle
import json
import re

def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    return text.strip()

# Load data
with open("data.json", "r") as f:
    data = json.load(f)

texts = [clean_text(item["description"]) for item in data]
labels = [item["category"] for item in data]

# Create Pipeline
model_pipeline = Pipeline([
    ('vectorizer', TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True)),
    ('classifier', MultinomialNB(alpha=0.1))
])

# Train and Save
model_pipeline.fit(texts, labels)
with open("model.pkl", "wb") as f:
    pickle.dump(model_pipeline, f)

print(f"✅ Model trained on {len(texts)} samples.")