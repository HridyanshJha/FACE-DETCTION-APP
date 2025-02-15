class ResultsUI {
    constructor() {
        this.initializeCharts();
        this.loadData();
        this.bindEvents();
    }

    initializeCharts() {
        // Emotion Distribution Chart
        const emotionCtx = document.getElementById('emotionChart').getContext('2d');
        this.emotionChart = new Chart(emotionCtx, {
            type: 'doughnut',
            data: {
                labels: ['Happy', 'Neutral', 'Surprised', 'Thoughtful'],
                datasets: [{
                    data: [40, 30, 15, 15],
                    backgroundColor: [
                        'rgba(0, 255, 136, 0.8)',
                        'rgba(0, 102, 255, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(153, 102, 255, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff'
                        }
                    }
                }
            }
        });

        // Age Distribution Chart
        const ageCtx = document.getElementById('ageChart').getContext('2d');
        this.ageChart = new Chart(ageCtx, {
            type: 'bar',
            data: {
                labels: ['18-25', '26-35', '36-45', '46+'],
                datasets: [{
                    label: 'Age Distribution',
                    data: [25, 40, 20, 15],
                    backgroundColor: 'rgba(0, 255, 136, 0.5)',
                    borderColor: 'rgba(0, 255, 136, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    async loadData() {
        try {
            const response = await fetch('/api/stats');
            const data = await response.json();
            this.updateCharts(data);
            this.displayDetections(data.recent_detections || []);
            this.updateSummary(data);
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    }

    updateCharts(data) {
        // Update emotion chart
        if (this.emotionChart) {
            this.emotionChart.data.datasets[0].data = data.emotion_stats || [0, 0, 0, 0];
            this.emotionChart.update();
        }

        // Update age chart
        if (this.ageChart) {
            this.ageChart.data.datasets[0].data = data.age_stats || [0, 0, 0, 0];
            this.ageChart.update();
        }
    }

    displayDetections(detections) {
        const facesGrid = document.querySelector('.faces-grid');
        if (!facesGrid) return;

        facesGrid.innerHTML = detections.map((detection, index) => `
            <div class="face-card" style="animation-delay: ${index * 0.1}s">
                <div class="face-metadata">
                    <div class="metadata-item">
                        <span>Time:</span>
                        <span>${new Date(detection.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="metadata-item">
                        <span>Emotion:</span>
                        <span>${detection.emotion}</span>
                    </div>
                    <div class="metadata-item">
                        <span>Age Range:</span>
                        <span>${detection.age}</span>
                    </div>
                    <div class="metadata-item">
                        <span>Confidence:</span>
                        <span>${detection.confidence}%</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateSummary(data) {
        const totalFaces = document.getElementById('totalFaces');
        const avgConfidence = document.getElementById('avgConfidence');

        if (totalFaces) {
            totalFaces.textContent = data.total_detections || 0;
        }
        if (avgConfidence) {
            avgConfidence.textContent = `${Math.round(data.avg_confidence || 0)}%`;
        }
    }

    bindEvents() {
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadReport());
        }

        // Auto-refresh data every 30 seconds
        setInterval(() => this.loadData(), 30000);
    }

    async downloadReport() {
        try {
            const response = await fetch('/api/download-report');
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'face-detection-report.pdf';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            } else {
                throw new Error('Download failed');
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download report. Please try again.');
        }
    }
}

// Initialize the UI when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ResultsUI();
}); 