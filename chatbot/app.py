from flask import Flask, request, jsonify 
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests
import json
from sentence_transformers import SentenceTransformer, util

# Disable tokenizers parallelism to avoid deadlocks
os.environ["TOKENIZERS_PARALLELISM"] = "false"

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()
PORT = int(os.getenv("PORT", 5000))  # Default to 5000 if not specified

# Load FAQ data from JSON
faq_data = []
try:
    with open("dataset.json", "r", encoding="utf-8") as file:
        faq_data = json.load(file).get("faqs", [])
except (FileNotFoundError, json.JSONDecodeError) as e:
    print(f"Error loading dataset: {e}")

if not faq_data:
    print("Warning: FAQ data is empty. Check your dataset.json file.")

# Initialize a lighter semantic similarity model
model = SentenceTransformer("paraphrase-MiniLM-L3-v2")

faq_questions = [faq["question"] for faq in faq_data]
faq_embeddings = model.encode(faq_questions, convert_to_tensor=True, batch_size=8) if faq_questions else None

# Google Gemini API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is missing. Check your .env file.")
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={GEMINI_API_KEY}"

def find_best_answer(user_question):
    """Finds the best matching answer using semantic similarity."""
    if not faq_data or faq_embeddings is None:
        return "FAQ data is unavailable. Please try again later."
    
    user_embedding = model.encode(user_question, convert_to_tensor=True)
    similarities = util.pytorch_cos_sim(user_embedding, faq_embeddings)[0]
    best_match_idx = similarities.argmax().item()
    best_match_score = similarities[best_match_idx].item()
    
    if best_match_score > 0.7:
        return format_response(faq_data[best_match_idx]["answer"])
    
    return generate_gemini_response(user_question)

def format_response(text):
    """Formats response into a short, structured format."""
    return text.replace("*", "").strip()

def generate_gemini_response(user_question):
    """Uses Google Gemini API to generate a response."""
    headers = {"Content-Type": "application/json"}
    data = {"contents": [{"parts": [{"text": user_question}]}]}
    
    try:
        response = requests.post(GEMINI_API_URL, headers=headers, json=data)
        response.raise_for_status()
        gemini_response = response.json()
        
        # Extract response safely
        generated_text = (
            gemini_response.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
        )
        
        return format_response(generated_text) if generated_text else "I'm not sure. Please ask about this platform."
    
    except requests.RequestException as e:
        print(f"Error connecting to Gemini API: {e}")
        return "Error connecting to the AI service. Please try again later."

@app.route("/chatbot", methods=["POST"])
def chatbot():
    user_input = request.json.get("message", "").strip()
    if not user_input:
        return jsonify({"response": "Please provide a valid question."})
    
    answer = find_best_answer(user_input)
    return jsonify({"response": answer})

if __name__ == "__main__":
    app.run(debug=True, port=PORT)
