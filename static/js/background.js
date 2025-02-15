class Background3D {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.particles = [];
        this.waves = [];
        
        this.init();
        this.animate();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('background').appendChild(this.renderer.domElement);
        
        // Create particle system
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 2000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 100;
            positions[i + 1] = (Math.random() - 0.5) * 100;
            positions[i + 2] = (Math.random() - 0.5) * 100;
            
            colors[i] = Math.random() * 0.5;
            colors[i + 1] = Math.random();
            colors[i + 2] = Math.random() * 0.5;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(this.particles);

        // Add wave effect
        const waveGeometry = new THREE.PlaneGeometry(100, 100, 32, 32);
        const waveMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.2,
            wireframe: true
        });

        this.waves = new THREE.Mesh(waveGeometry, waveMaterial);
        this.waves.rotation.x = -Math.PI / 2;
        this.scene.add(this.waves);

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Add point light
        const pointLight = new THREE.PointLight(0x00ff88, 1, 100);
        pointLight.position.set(10, 10, 10);
        this.scene.add(pointLight);

        this.camera.position.z = 50;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Rotate particles
        this.particles.rotation.x += 0.0005;
        this.particles.rotation.y += 0.001;

        // Animate waves
        const vertices = this.waves.geometry.vertices;
        for (let i = 0; i < vertices.length; i++) {
            vertices[i].z = Math.sin(Date.now() * 0.001 + i * 0.1) * 2;
        }
        this.waves.geometry.verticesNeedUpdate = true;

        // Mouse interaction
        if (this.mouseX) {
            this.particles.rotation.x += (this.mouseX - this.particles.rotation.x) * 0.05;
            this.particles.rotation.y += (this.mouseY - this.particles.rotation.y) * 0.05;
        }

        this.renderer.render(this.scene, this.camera);
    }

    handleMouseMove(event) {
        this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize
const bg = new Background3D();
window.addEventListener('resize', () => bg.handleResize());
window.addEventListener('mousemove', (e) => bg.handleMouseMove(e)); 