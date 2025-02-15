class FaceDetectionUI {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.startAnalysis();
    }

    initializeElements() {
        this.captureBtn = document.getElementById('capture-btn');
        this.emotionValue = document.getElementById('emotion-value');
        this.ageValue = document.getElementById('age-value');
        this.genderValue = document.getElementById('gender-value');
        this.faceCount = document.getElementById('face-count');
        this.confidence = document.getElementById('confidence');
        this.overlay = document.querySelector('.detection-overlay');
    }

    bindEvents() {
        this.captureBtn.addEventListener('click', () => this.captureFace());
    }

    async captureFace() {
        try {
            this.captureBtn.disabled = true;
            this.captureBtn.textContent = 'Capturing...';

            const response = await fetch('/capture', {
                method: 'POST'
            });

            const data = await response.json();

            if (data.success) {
                this.showCaptureEffect();
                this.updateStats(data);
            } else {
                alert('Failed to capture face. Please try again.');
            }
        } catch (error) {
            console.error('Capture error:', error);
            alert('An error occurred during capture.');
        } finally {
            this.captureBtn.disabled = false;
            this.captureBtn.textContent = 'Capture';
        }
    }

    updateStats(data) {
        this.faceCount.textContent = data.faces_detected;
        this.confidence.textContent = `${Math.round(data.confidence * 100)}%`;
        
        // Update analysis data
        this.emotionValue.textContent = data.emotion || 'Unknown';
        this.ageValue.textContent = data.age || 'Unknown';
        this.genderValue.textContent = data.gender || 'Unknown';
    }

    showCaptureEffect() {
        const flash = document.createElement('div');
        flash.className = 'capture-flash';
        document.querySelector('.video-frame').appendChild(flash);
        setTimeout(() => flash.remove(), 500);
    }

    startAnalysis() {
        // Real-time face detection updates
        setInterval(async () => {
            try {
                const response = await fetch('/api/stats');
                const data = await response.json();
                this.updateStats(data);
            } catch (error) {
                console.error('Analysis update error:', error);
            }
        }, 2000);
    }
}

// Initialize the UI when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FaceDetectionUI();
});

// Add these styles to face_detect.css
const styles = `
.detection-box {
    position: absolute;
    width: 100px;
    height: 100px;
    border: 2px solid var(--primary-color);
    border-radius: 8px;
    animation: pulse 2s infinite;
}

.capture-flash {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: white;
    opacity: 0;
    animation: flash 0.5s ease-out;
}

@keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
}

@keyframes flash {
    0% { opacity: 0.8; }
    100% { opacity: 0; }
}

.capturing {
    animation: capturePress 0.5s ease-out;
}

@keyframes capturePress {
    0% { transform: scale(1); }
    50% { transform: scale(0.95); }
    100% { transform: scale(1); }
}
`; 