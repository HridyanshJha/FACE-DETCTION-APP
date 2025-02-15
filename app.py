from flask import Flask, render_template, Response, jsonify, request
import cv2
import numpy as np
from database import Database
from datetime import datetime
import time

app = Flask(__name__)
db = Database()

# Initialize camera and face detection
camera = cv2.VideoCapture(0)
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/face-detect')
def face_detect():
    return render_template('face_detect.html')

@app.route('/results')
def results():
    return render_template('results.html')

@app.route('/admin')
def admin():
    return render_template('admin.html')

def generate_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break
        
        # Enhance image quality
        frame = cv2.resize(frame, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_CUBIC)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray)  # Improve contrast
        
        # More accurate detection parameters
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30),
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
        
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), 
                   mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/capture', methods=['POST'])
def capture_face():
    try:
        # Get the frame from the video feed
        success, frame = camera.read()
        if not success:
            return jsonify({'error': 'Failed to capture frame'}), 400

        start_time = time.time()
        
        # Perform face detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        processing_time = time.time() - start_time
        
        # Log the detection
        db.log_detection(
            processing_time=processing_time,
            faces_detected=len(faces),
            success=bool(len(faces))
        )

        if len(faces) > 0:
            # For each detected face
            for (x, y, w, h) in faces:
                face_data = {
                    'x': int(x),
                    'y': int(y),
                    'width': int(w),
                    'height': int(h)
                }
                
                # Simulate AI analysis (replace with actual AI models)
                emotion = 'Happy'  # Replace with emotion detection
                age = '25-30'     # Replace with age detection
                gender = 'Male'    # Replace with gender detection
                confidence = 0.95  # Replace with actual confidence score

                # Save the detection
                db.save_detection(
                    face_data=face_data,
                    emotion=emotion,
                    age=age,
                    gender=gender,
                    confidence=confidence
                )

        return jsonify({
            'success': True,
            'faces_detected': len(faces),
            'processing_time': processing_time
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats')
def get_stats():
    try:
        stats = db.get_detection_stats()
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/settings', methods=['POST'])
def update_settings():
    try:
        settings = request.json
        db.update_settings(settings)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download-report')
def download_report():
    try:
        # Get detection data
        detections = db.get_recent_detections(limit=100)
        stats = db.get_detection_stats()
        
        # Create report file (implement your report generation logic)
        # For now, return a simple JSON file
        return jsonify({
            'detections': detections,
            'stats': stats
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 