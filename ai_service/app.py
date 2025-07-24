"""
Comm-Analyz AI Service (app.py) - Multi-Turn JD Chatbot Version
"""
import os
import io
import json
import re
import uuid
import cv2
import numpy as np
import speech_recognition as sr
from deepface import DeepFace
from flask import Flask, jsonify, request
from flask_cors import CORS
from pydub import AudioSegment
import google.generativeai as genai
from dotenv import load_dotenv

# --- ENV LOADING ---
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

app = Flask(__name__)
CORS(app)

try:
    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        print("CRITICAL WARNING: GOOGLE_API_KEY not found. Check your .env file in the 'ai_service' directory.")
    genai.configure(api_key=api_key)
except Exception as e:
    print(f"CRITICAL ERROR: Could not configure Google AI. Details: {e}")

STABLE_GEMINI_MODEL = 'gemini-1.5-flash'

# ============== SECTION: Utility Helpers ==============
def analyze_filler_words(text):
    FILLER_WORDS = {
        "um", "uh", "er", "ah", "like", "okay", "right", "so", "you know",
        "actually", "basically", "literally", "well", "i mean"
    }
    words = text.lower().replace(",", "").replace(".", "").split()
    found_fillers = [word for word in words if word in FILLER_WORDS]
    return {"count": len(found_fillers), "words": list(set(found_fillers))}

def check_ai_config():
    try:
        genai.get_model(f'models/{STABLE_GEMINI_MODEL}')
        return True
    except Exception:
        return False

def extract_json_from_llm_response(llm_text):
    code_block = re.search(r"``````", llm_text)
    if code_block:
        return code_block.group(1)
    bracket_block = re.search(r"(\[[\s\S]+])", llm_text)
    if bracket_block:
        return bracket_block.group(1)
    return llm_text.strip()

# ============== SECTION: Interview Workflow ==============
@app.route('/generate-questions', methods=['POST'])
def generate_questions_route():
    if not check_ai_config():
        return jsonify({"error": "AI service is not configured correctly."}), 503
    if not request.json or 'prompt' not in request.json:
        return jsonify({"error": "Prompt required"}), 400

    user_prompt = request.json['prompt']
    full_prompt = (
        f'Based on the user request: "{user_prompt}", generate 8 interview questions. '
        'Your response MUST be a valid JSON array of objects. Each object must have THREE keys: '
        '"question", "keyPoints", and "modelAnswer".'
    )
    try:
        model = genai.GenerativeModel(STABLE_GEMINI_MODEL)
        response = model.generate_content(full_prompt)
        cleaned_text = extract_json_from_llm_response(response.text)
        questions = json.loads(cleaned_text)
        if not isinstance(questions, list) or not all("question" in q and "keyPoints" in q and "modelAnswer" in q for q in questions):
            raise ValueError("LLM response did not match the required format.")
        return jsonify(questions)
    except Exception as e:
        print(f"ERROR in /generate-questions: {e}")
        return jsonify({"error": "Failed to generate questions. The AI may be unavailable or the quota is exhausted.", "detail": str(e)}), 500

@app.route('/analyze', methods=['POST'])
def analyze_media_route():
    if 'image' not in request.files or 'audio' not in request.files:
        return jsonify({"error": "Missing image or audio file"}), 400
    image_file, audio_file = request.files['image'], request.files['audio']

    # ---- IMAGE/VIDEO EMOTION DETECTION ----
    emotion_result = "not_detected"
    try:
        image_bytes = image_file.read()
        if len(image_bytes) > 10:
            image_data = np.frombuffer(image_bytes, np.uint8)
            image_cv = cv2.imdecode(image_data, cv2.IMREAD_COLOR)
            if image_cv is not None:
                analysis = DeepFace.analyze(img_path=image_cv, actions=['emotion'], enforce_detection=False)
                if isinstance(analysis, list) and len(analysis) > 0:
                    emotion_result = analysis[0].get('dominant_emotion', 'not_detected')
                elif isinstance(analysis, dict):
                    emotion_result = analysis.get('dominant_emotion', 'not_detected')
    except Exception as e:
        print(f"Emotion detection error: {e}")

    # ---- AUDIO PROCESSING ----
    text_result, wpm_result, filler_words_result, sentiment_score = "error", 0, {}, 0.0
    try:
        audio_bytes = audio_file.read()
        if len(audio_bytes) < 100:
            raise ValueError("Audio data empty or too small to process.")
        audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes))
        duration = len(audio_segment) / 1000.0
        wav_io = io.BytesIO()
        audio_segment.export(wav_io, format="wav")
        wav_io.seek(0)
        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_io) as source:
            audio_data = recognizer.record(source)
            text_result = recognizer.recognize_google(audio_data)
            from textblob import TextBlob
            sentiment_score = TextBlob(text_result).sentiment.polarity
            filler_words_result = analyze_filler_words(text_result)
            if duration > 0:
                wpm_result = round((len(text_result.split()) / duration) * 60)
    except sr.UnknownValueError:
        text_result = "Could not understand audio"
    except Exception as e:
        print(f"Audio processing error: {e}")
        text_result = "ERROR: Could not process audio"

    return jsonify({
        "dominantEmotion": emotion_result,
        "transcribedText": text_result,
        "wordsPerMinute": wpm_result,
        "fillerWords": filler_words_result,
        "sentimentScore": sentiment_score
    })

@app.route('/expert-review', methods=['POST'])
def expert_review_route():
    if not check_ai_config():
        return jsonify({"error": "AI service is not configured correctly."}), 503
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

    feedback_prompt = (
        f"As an AI Interview Coach, analyze the following answer, for which I have already calculated a score of {answer_score}/100.\n"
        f"Question: \"{data['questionText']}\"\n"
        f"User's Answer: \"{data['transcribedText']}\"\n"
        f"Your task: Based on the score and the answer, write one single, constructive sentence of feedback."
    )
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
    if not check_ai_config():
        return jsonify({"error": "AI service is not configured correctly."}), 503
    if not request.json or 'sessionData' not in request.json:
        return jsonify({"error": "Missing sessionData"}), 400

    session_data = request.json['sessionData']
    if not session_data:
        return jsonify({"summary": "No data to analyze.", "overallScore": 0})

    try:
        scores = [item.get('answerScore', 50) for item in session_data if 'answerScore' in item]
        overall_score = round(sum(scores) / len(scores)) if scores else 70
        summary_prompt = (
            "Based on the following interview data, write a concise, encouraging summary of the performance "
            "(2-3 sentences), mentioning one key strength and one area for improvement.\n"
            f"Data: {json.dumps(session_data, indent=2)}"
        )
        model = genai.GenerativeModel(STABLE_GEMINI_MODEL)
        response = model.generate_content(summary_prompt)
        return jsonify({"summary": response.text.strip(), "overallScore": overall_score})
    except Exception as e:
        print(f"ERROR in /summarize-and-score: {e}")
        scores = [item.get('answerScore', 50) for item in session_data if 'answerScore' in item]
        overall_score = round(sum(scores) / len(scores)) if scores else 70
        return jsonify({"summary": "The AI summary could not be generated, but your results have been saved.", "overallScore": overall_score})

# ============== SECTION: AI Study Plan Chatbot - Multi Turn (JD Chat) ==============

# In-memory chat session store (use Redis for production!)
JD_CHAT_SESSIONS = {}

@app.route('/start-jd-chat', methods=['POST'])
def start_jd_chat_route():
    if not check_ai_config():
        return jsonify({"error": "AI service not configured."}), 503
    jd = request.json.get('job_description', '').strip()
    if not jd:
        return jsonify({"error": "Job description required."}), 400
    session_id = str(uuid.uuid4())
    JD_CHAT_SESSIONS[session_id] = {
        "job_description": jd,
        "history": []
    }
    # Compose AI greeting based on JD
    prompt = (
        f"You are an AI Interview Coach. Here is the job description:\n{jd}\n"
        "Introduce yourself, summarize the role, and tell the user how you can assist with skills, salary, and interview prep."
    )
    model = genai.GenerativeModel(STABLE_GEMINI_MODEL)
    response = model.generate_content(prompt)
    ai_message = response.text.strip()
    JD_CHAT_SESSIONS[session_id]["history"].append({"role": "assistant", "content": ai_message})
    return jsonify({"session_id": session_id, "ai_message": ai_message})

@app.route('/jd-chat', methods=['POST'])
def jd_chat_route():
    if not check_ai_config():
        return jsonify({"error": "AI service not configured."}), 503
    session_id = request.json.get('session_id')
    user_message = request.json.get('user_message', '').strip()
    if not session_id or not user_message or session_id not in JD_CHAT_SESSIONS:
        return jsonify({"error": "Valid session_id and user_message required."}), 400
    chat_session = JD_CHAT_SESSIONS[session_id]
    chat_session['history'].append({"role": "user", "content": user_message})

    # Compose prompt with context
    prompt = (
        f"You are an AI Interview Coach. Here is the job description:\n{chat_session['job_description']}\n"
        "Here is your conversation so far:\n"
    )
    for turn in chat_session['history']:
        prompt += f"{turn['role'].capitalize()}: {turn['content']}\n"
    prompt += "Please answer the user's last message clearly and helpfully."

    model = genai.GenerativeModel(STABLE_GEMINI_MODEL)
    response = model.generate_content(prompt)
    ai_message = response.text.strip()
    chat_session["history"].append({"role": "assistant", "content": ai_message})
    # Optionally: prune history to last N messages
    return jsonify({"ai_message": ai_message})

# ============== END OF FILE ==============
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
    