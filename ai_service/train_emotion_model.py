import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.optimizers import Adam
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelBinarizer
import os

# --- Configuration ---
DATASET_PATH = './datasets/fer2013.csv'
MODEL_SAVE_DIR = 'models' # Directory to save models
MODEL_SAVE_NAME = 'custom_emotion_model.h5'
FULL_MODEL_SAVE_PATH = os.path.join(MODEL_SAVE_DIR, MODEL_SAVE_NAME)

IMAGE_SIZE = 48 
NUM_CLASSES = 7 
BATCH_SIZE = 64
EPOCHS = 30 # Adjust based on your computational resources and desired accuracy

# Emotion labels mapping (ensure this order matches what LabelBinarizer learns, or explicitly define)
# LabelBinarizer maps alphabetically if integers are used as labels (0,1,2,3,4,5,6)
# Standard FER-2013 mapping: 0:Angry, 1:Disgust, 2:Fear, 3:Happy, 4:Sad, 5:Surprise, 6:Neutral
EMOTION_LABELS_MAP = {0: 'Angry', 1: 'Disgust', 2: 'Fear', 3: 'Happy', 4: 'Sad', 5: 'Surprise', 6: 'Neutral'}

# Ensure the model save directory exists
os.makedirs(MODEL_SAVE_DIR, exist_ok=True)

# --- 1. Load Data ---
print(f"Loading dataset from {DATASET_PATH}...")
try:
    data = pd.read_csv(DATASET_PATH)
except FileNotFoundError:
    print(f"ERROR: {DATASET_PATH} not found. Please download fer2013.csv and place it in the '{DATASET_PATH.split('/')[0]}' folder inside 'ai_service'.")
    exit()

train_data = data[data['Usage'] == 'Training']
# You can use 'PublicTest' for final evaluation if needed, but for training/validation, 'Training' is split.
# test_data = data[data['Usage'] == 'PublicTest']

# --- 2. Prepare Data ---
print("Preprocessing data...")
pixels = train_data['pixels'].tolist()
emotions = train_data['emotion'].tolist()

X = np.array([np.fromstring(pixel, dtype=int, sep=' ').reshape((IMAGE_SIZE, IMAGE_SIZE, 1)) for pixel in pixels])
y = np.array(emotions)

X = X / 255.0 # Normalize pixel values

# One-hot encode emotions
label_binarizer = LabelBinarizer()
y_one_hot = label_binarizer.fit_transform(y)
# Verify the order of classes learned by the binarizer
print("Classes learned by LabelBinarizer (order might differ from numerical 0-6):", label_binarizer.classes_)
# Important: Ensure the order matches EMOTION_LABELS_MAP if your labels are numerical.
# If your labels in CSV are strings ('Happy', 'Sad'), LabelBinarizer will sort them alphabetically.
# You might need to adjust EMOTION_LABELS_MAP based on label_binarizer.classes_

# Split data into training and validation sets
X_train, X_val, y_train, y_val = train_test_split(X, y_one_hot, test_size=0.2, random_state=42)

print(f"Data prepared: X_train shape {X_train.shape}, y_train shape {y_train.shape}")
print(f"Data prepared: X_val shape {X_val.shape}, y_val shape {y_val.shape}")

# --- 3. Build the CNN Model ---
print("Building CNN model...")
model = Sequential([
    Conv2D(32, (3, 3), activation='relu', input_shape=(IMAGE_SIZE, IMAGE_SIZE, 1)),
    MaxPooling2D((2, 2)),
    Conv2D(64, (3, 3), activation='relu'),
    MaxPooling2D((2, 2)),
    Conv2D(128, (3, 3), activation='relu'),
    MaxPooling2D((2, 2)),
    Flatten(),
    Dense(256, activation='relu'),
    Dropout(0.5),
    Dense(NUM_CLASSES, activation='softmax')
])

optimizer = Adam(learning_rate=0.001)
model.compile(optimizer=optimizer, loss='categorical_crossentropy', metrics=['accuracy'])
model.summary()

# --- 4. Train the Model ---
print("Starting model training...")
history = model.fit(
    X_train, y_train,
    batch_size=BATCH_SIZE,
    epochs=EPOCHS,
    validation_data=(X_val, y_val)
)
print("Model training complete.")

# --- 5. Save the Trained Model ---
print(f"Saving model to {FULL_MODEL_SAVE_PATH}...")
model.save(FULL_MODEL_SAVE_PATH)
print("Model saved successfully!")

print("\nTraining script finished.")