class AdminDashboard {
    constructor() {
        this.initializeCharts();
        this.loadMockData();
        this.bindEvents();
    }

    initializeCharts() {
        const ctx = document.getElementById('activityChart').getContext('2d');
        this.activityChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Detections',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    borderColor: 'rgb(0, 255, 136)',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    }
                }
            }
        });
    }

    loadMockData() {
        const tbody = document.getElementById('recentDetections');
        const mockData = this.generateMockData();
        
        tbody.innerHTML = mockData.map(detection => `
            <tr>
                <td>${detection.time}</td>
                <td>${detection.faces}</td>
                <td>${detection.confidence}%</td>
                <td><span class="status ${detection.status.toLowerCase()}">${detection.status}</span></td>
            </tr>
        `).join('');
    }

    generateMockData() {
        const data = [];
        const statuses = ['Success', 'Processing', 'Failed'];
        
        for (let i = 0; i < 10; i++) {
            data.push({
                time: new Date(Date.now() - i * 3600000).toLocaleTimeString(),
                faces: Math.floor(Math.random() * 5) + 1,
                confidence: Math.floor(Math.random() * 20 + 80),
                status: statuses[Math.floor(Math.random() * 3)]
            });
        }
        return data;
    }

    bindEvents() {
        // Navigation
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    this.handleNavigation(link);
                }
            });
        });

        // Settings Controls
        const confidenceSlider = document.getElementById('confidenceThreshold');
        const sliderValue = confidenceSlider.nextElementSibling;
        
        confidenceSlider.addEventListener('input', (e) => {
            sliderValue.textContent = `${e.target.value}%`;
        });

        // Toggle Buttons
        const toggleBtns = document.querySelectorAll('.toggle-btn');
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                toggleBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    handleNavigation(link) {
        // Update active state
        const navItems = document.querySelectorAll('.nav-links li');
        navItems.forEach(item => item.classList.remove('active'));
        link.parentElement.classList.add('active');

        // Show/hide sections
        const targetId = link.getAttribute('href').substring(1);
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            section.classList.add('hidden');
            if (section.id === targetId) {
                section.classList.remove('hidden');
            }
        });
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
}); 