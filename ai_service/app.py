"""
Comm-Analyz AI Service (app.py) - Final Corrected and Optimized Version
"""
import os
import io
import json
import re
import cv2
import numpy as np
import speech_recognition as sr
from deepface import DeepFace
from flask import Flask, jsonify, request
from flask_cors import CORS
from pydub import AudioSegment
import google.generativeai as genai
from dotenv import load_dotenv
from routes.emotion_route import emotion_blueprint


# --- ROBUST .ENV LOADING ---
# This is the definitive fix for API key issues. It finds the .env file
# relative to this script's location, no matter where you run it from.
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

# --- APP AND AI CONFIGURATION ---
app = Flask(__name__)
CORS(app)

app.register_blueprint(emotion_blueprint, url_prefix="/emotion")

try:
    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        print("CRITICAL WARNING: GOOGLE_API_KEY not found. Check your .env file in the 'ai_service' directory.")
    genai.configure(api_key=api_key)
except Exception as e:
    print(f"CRITICAL ERROR: Could not configure Google AI. Details: {e}")

STABLE_GEMINI_MODEL = 'gemini-1.5-flash-latest'

# --- HELPER FUNCTIONS ---
def analyze_filler_words(text):
    FILLER_WORDS = {"um", "uh", "er", "ah", "like", "okay", "right", "so", "you know", "actually", "basically", "literally", "well", "i mean"}
    words = text.lower().replace(",", "").replace(".", "").split()
    found_fillers = [word for word in words if word in FILLER_WORDS]
    return {"count": len(found_fillers), "words": list(set(found_fillers))}

def check_ai_config():
    """Checks if the Gemini API is configured by trying a lightweight call."""
    try:
        genai.get_model(f'models/{STABLE_GEMINI_MODEL}')
        return True
    except Exception:
        return False

# --- API ENDPOINTS ---
from flask import request, jsonify
import json
import re
import google.generativeai as genai

@app.route('/generate-questions', methods=['POST'])
def generate_questions_route():
    if not check_ai_config(): 
        return jsonify({"error": "AI service is not configured correctly."}), 503

    if not request.json or 'prompt' not in request.json: 
        return jsonify({"error": "Prompt required"}), 400

    user_prompt = request.json['prompt']
    
    try:
        generation_config = genai.types.GenerationConfig(
            temperature=0.7,
            top_p=0.9,
            top_k=40,
            max_output_tokens=1024
        )

        model = genai.GenerativeModel(
            model_name=STABLE_GEMINI_MODEL,
            generation_config=generation_config
        )

        collected_questions = []
        attempts = 0
        used_questions_set = set()

        while len(collected_questions) < 8 and attempts < 3:
            remaining = 8 - len(collected_questions)

            prompt = f"""
Based on the user request: \"{user_prompt}\", generate {remaining} interview questions.
Only generate questions that are DIFFERENT from the ones already listed below:
{[q["question"] for q in collected_questions]}

Respond strictly as a JSON array. Each item must have these three fields:
"question", "keyPoints", and "modelAnswer".
"""

            response = model.generate_content(prompt)
            raw_text = response.text.strip().replace("```json", "").replace("```", "")
            json_objects = re.findall(r'{.*?}', raw_text, re.DOTALL)

            for obj in json_objects:
                try:
                    parsed = json.loads(obj)
                    if all(k in parsed for k in ["question", "keyPoints", "modelAnswer"]):
                        q_text = parsed["question"].strip()
                        if q_text not in used_questions_set:
                            collected_questions.append(parsed)
                            used_questions_set.add(q_text)
                except Exception:
                    continue

            attempts += 1

        if len(collected_questions) < 8:
            return jsonify({"error": f"Only {len(collected_questions)} questions could be generated after retries."}), 500

        return jsonify(collected_questions)

    except Exception as e:
        print(f"ERROR in /generate-questions: {e}")
        return jsonify({"error": "Failed to generate 8 complete questions."}), 500

@app.route('/analyze', methods=['POST'])
def analyze_media_route():
    if 'image' not in request.files or 'audio' not in request.files: return jsonify({"error": "Missing image or audio file"}), 400
    image_file, audio_file = request.files['image'], request.files['audio']

    emotion_result = "not_detected"
    try:
        image_data = np.frombuffer(image_file.read(), np.uint8)
        if image_data.size > 0:
            image_cv = cv2.imdecode(image_data, cv2.IMREAD_COLOR)
            if image_cv is not None:
                analysis = DeepFace.analyze(img_path=image_cv, actions=['emotion'], enforce_detection=False)
                if isinstance(analysis, list) and len(analysis) > 0:
                    emotion_result = analysis[0]['dominant_emotion']
    except Exception as e: print(f"Emotion detection error: {e}")

    text_result, wpm_result, filler_words_result, sentiment_score = "error", 0, {}, 0.0
    try:
        audio_segment = AudioSegment.from_file(audio_file)
        duration = len(audio_segment) / 1000.0
        wav_io = io.BytesIO()
        audio_segment.export(wav_io, format="wav")
        wav_io.seek(0)
        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_io) as source:
            audio_data = recognizer.record(source)
            text_result = recognizer.recognize_google(audio_data)
            # We need to import TextBlob for sentiment analysis
            
            sentiment_score = TextBlob(text_result).sentiment.polarity
            filler_words_result = analyze_filler_words(text_result)
            if duration > 0: wpm_result = round((len(text_result.split()) / duration) * 60)
    except sr.UnknownValueError: text_result = "Could not understand audio"
    except Exception as e: print(f"Audio processing error: {e}")
    
    return jsonify({
        "dominantEmotion": emotion_result, "transcribedText": text_result,
        "wordsPerMinute": wpm_result, "fillerWords": filler_words_result,
        "sentimentScore": sentiment_score
    })

@app.route('/expert-review', methods=['POST'])
def expert_review_route():
    if not check_ai_config(): return jsonify({"error": "AI service is not configured correctly."}), 503
    required_fields = ['questionText', 'transcribedText', 'keyPoints']
    if not request.json or not all(field in request.json for field in required_fields):
        return jsonify({"error": "Missing required fields."}), 400

    data = request.json
    transcribed_text_lower = data['transcribedText'].lower()
    key_points = data['keyPoints']

    mentioned_points = 0
    if key_points:
        for point in key_points:
            if re.search(r'\b' + re.escape(point.lower()) + r'\b', transcribed_text_lower):
                mentioned_points += 1
        answer_score = round((mentioned_points / len(key_points)) * 100)
    else:
        answer_score = 75

    feedback_prompt = f"""
    As an AI Interview Coach, analyze the following answer, for which I have already calculated a score of {answer_score}/100.
    Question: "{data['questionText']}"
    User's Answer: "{data['transcribedText']}"
    Your task: Based on the score and the answer, write one single, constructive sentence of feedback.
    """
    try:
        model = genai.GenerativeModel(STABLE_GEMINI_MODEL)
        response = model.generate_content(feedback_prompt)
        feedback_text = response.text.strip()
        analysis_result = {
            "relevance": f"{mentioned_points} of {len(key_points)} key points covered.",
            "clarity": "Assessed in feedback.",
            "feedback": feedback_text,
            "answerScore": answer_score
        }
        return jsonify(analysis_result)
    except Exception as e:
        print(f"ERROR during expert review: {e}")
        return jsonify({"error": "AI failed to generate feedback."}), 500

@app.route('/summarize-and-score', methods=['POST'])
def summarize_and_score_route():
    if not check_ai_config(): return jsonify({"error": "AI service is not configured correctly."}), 503
    if not request.json or 'sessionData' not in request.json: return jsonify({"error": "Missing sessionData"}), 400
    
    session_data = request.json['sessionData']
    if not session_data: return jsonify({"summary": "No data to analyze.", "overallScore": 0})
    
    try:
        scores = [item.get('answerScore', 50) for item in session_data if 'answerScore' in item]
        overall_score = round(sum(scores) / len(scores)) if scores else 70
        summary_prompt = f"Based on the following interview data, write a concise, encouraging summary of the performance (2-3 sentences), mentioning one key strength and one area for improvement.\nData: {json.dumps(session_data, indent=2)}"
        model = genai.GenerativeModel(STABLE_GEMINI_MODEL)
        response = model.generate_content(summary_prompt)
        return jsonify({"summary": response.text.strip(), "overallScore": overall_score})
    except Exception as e:
        print(f"ERROR in /summarize-and-score: {e}")
        scores = [item.get('answerScore', 50) for item in session_data if 'answerScore' in item]
        overall_score = round(sum(scores) / len(scores)) if scores else 70
        return jsonify({"summary": "The AI summary could not be generated, but your results have been saved.", "overallScore": overall_score})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)