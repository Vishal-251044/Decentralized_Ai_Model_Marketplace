from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests
import json
from sentence_transformers import SentenceTransformer, util

# Disable tokenizer parallelism to avoid deadlocks
os.environ["TOKENIZERS_PARALLELISM"] = "false"

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()
PORT = int(os.getenv("PORT", 5000))

# Load FAQ data from JSON
faq_data = []
try:
    with open("dataset.json", "r", encoding="utf-8") as file:
        faq_data = json.load(file).get("faqs", [])
except (FileNotFoundError, json.JSONDecodeError) as e:
    print(f"Error loading dataset: {e}")

if not faq_data:
    print("Warning: FAQ data is empty. Check dataset.json file.")

# Use a lightweight semantic similarity model
model = SentenceTransformer("paraphrase-MiniLM-L3-v2")

faq_questions = [faq["question"] for faq in faq_data]
faq_embeddings = model.encode(
    faq_questions, convert_to_tensor=True, batch_size=4, normalize_embeddings=True
) if faq_questions else None

# Load Google Gemini API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is missing. Check your .env file.")

# Gemini API URL
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

# Debugging: Check if API key is loaded
print(f"Loaded GEMINI_API_KEY: {GEMINI_API_KEY[:5]}********")  # Print first 5 characters for security


def find_best_answer(user_question):
    """Finds the best matching answer using semantic similarity."""
    if not faq_data or faq_embeddings is None:
        return "FAQ data is unavailable. Please try again later."

    user_embedding = model.encode(user_question, convert_to_tensor=True, normalize_embeddings=True)
    similarities = util.pytorch_cos_sim(user_embedding, faq_embeddings)[0]
    best_match_idx = similarities.argmax().item()
    best_match_score = similarities[best_match_idx].item()

    if best_match_score > 0.7:
        return format_response(faq_data[best_match_idx]["answer"])

    return generate_gemini_response(user_question)


def format_response(text):
    """Formats response into a structured format."""
    return text.replace("*", "").strip()


def generate_gemini_response(user_question):
    """Uses Google Gemini API to generate a response."""
    headers = {"Content-Type": "application/json"}
    data = {"contents": [{"parts": [{"text": user_question}]}]}

    # Debugging: Print request payload
    print(f"Sending Request to Gemini API: {json.dumps(data, indent=2)}")

    try:
        response = requests.post(GEMINI_API_URL, headers=headers, json=data)
        
        # Debugging: Log response status and text
        print(f"Response Status Code: {response.status_code}")
        print(f"Response Text: {response.text}")

        response.raise_for_status()  # Raise error for 4xx or 5xx responses

        gemini_response = response.json()

        # Extract response text
        generated_text = (
            gemini_response.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
        )

        return format_response(generated_text) if generated_text else "I'm not sure. Please ask about this platform."

    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
        return "HTTP error with AI service. Please try again later."
    
    except requests.exceptions.RequestException as req_err:
        print(f"Error connecting to Gemini API: {req_err}")
        return "Error connecting to the AI service. Please try again later."


@app.route("/chatbot", methods=["POST"])
def chatbot():
    user_input = request.json.get("message", "").strip()
    if not user_input:
        return jsonify({"response": "Please provide a valid question."})

    answer = find_best_answer(user_input)
    return jsonify({"response": answer})


if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=PORT)
