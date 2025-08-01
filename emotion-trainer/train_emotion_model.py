import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from keras.models import Sequential
from keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization
from keras.utils import to_categorical
import os

# Load the FER2013 dataset
df = pd.read_csv("fer2013.csv")

# Prepare image data
X = []
y = []

for i in range(len(df)):
    pixels = list(map(int, df['pixels'][i].split()))
    emotion = df['emotion'][i]
    X.append(np.array(pixels).reshape(48, 48, 1))
    y.append(emotion)

X = np.array(X) / 255.0  # normalize
y = to_categorical(y, num_classes=7)

# Split into training and validation sets
X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)

# Build the CNN model
model = Sequential()

model.add(Conv2D(64, (3, 3), activation='relu', input_shape=(48, 48, 1)))
model.add(BatchNormalization())
model.add(MaxPooling2D(2, 2))

model.add(Conv2D(128, (3, 3), activation='relu'))
model.add(BatchNormalization())
model.add(MaxPooling2D(2, 2))

model.add(Conv2D(256, (3, 3), activation='relu'))
model.add(BatchNormalization())
model.add(MaxPooling2D(2, 2))

model.add(Flatten())
model.add(Dense(512, activation='relu'))
model.add(Dropout(0.4))
model.add(Dense(7, activation='softmax'))  # 7 emotions in FER2013

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# Train the model
model.fit(X_train, y_train, validation_data=(X_val, y_val), epochs=30, batch_size=64)

# Save the model
os.makedirs("model", exist_ok=True)
model.save("model/emotion_model.h5")

print("✅ Model trained and saved as model/emotion_model.h5")
