import numpy as np
import cv2

def preprocess_frame(file_bytes):
    # Convert bytes to image array
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return None
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(gray, (48, 48))
    normalized = resized.reshape(1, 48, 48, 1).astype(np.float32) / 255.0
    return normalized
