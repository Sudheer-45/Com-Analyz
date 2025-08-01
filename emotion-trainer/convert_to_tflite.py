import tensorflow as tf
import os

# Replace keras load_model with tf.keras (better compatibility)
model = tf.keras.models.load_model("model/emotion_model.h5")

# Convert to TFLite
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

# Save .tflite model
os.makedirs("model", exist_ok=True)
with open("model/emotion_model.tflite", "wb") as f:
    f.write(tflite_model)

print("✅ .tflite model saved as model/emotion_model.tflite")
