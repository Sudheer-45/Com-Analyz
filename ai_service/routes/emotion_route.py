from flask import Blueprint, request, jsonify
import numpy as np
import tensorflow as tf
from utils.preprocess import preprocess_frame

# Use TensorFlow Lite interpreter
tflite = tf.lite

emotion_blueprint = Blueprint('emotion', __name__)

# Emotion labels (FER2013)
emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

# Load the .tflite model
interpreter = tf.lite.Interpreter(model_path="model/emotion_model.tflite")
interpreter.allocate_tensors()

# Get input/output tensor details
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()



@emotion_blueprint.route("/", methods=["POST"])
def detect_emotion():
    file = request.files.get("frame")
    if not file:
        return jsonify({"error": "No image uploaded"}), 400

    # Preprocess image to (1, 48, 48, 1)
    img = preprocess_frame(file.read())
    if img is None:
        return jsonify({"error": "Invalid image"}), 400

    # Set input tensor and invoke model
    interpreter.set_tensor(input_details[0]['index'], img)
    interpreter.invoke()
    prediction = interpreter.get_tensor(output_details[0]['index'])[0]

    # Get highest prediction
    emotion_idx = int(np.argmax(prediction))
    confidence = float(np.max(prediction))

    return jsonify({
        "emotion": emotion_labels[emotion_idx],
        "confidence": round(confidence, 4)
    })

