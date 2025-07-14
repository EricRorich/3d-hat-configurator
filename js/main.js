// Main application file for 3D Hat Configurator using THREE.js
class HatConfigurator {
    constructor() {
        this.canvas = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.uiController = null;
        this.currentHat = null;
        this.currentConfig = { ...CONFIG.DEFAULT_HAT };
        this.animationId = null;
        this.isInitialized = false;
        this.hatGeometry = null;
        
        this.init();
    }
    
    // Initialize the application
    async init() {
        try {
            this.setupCanvas();
            this.setupThreeJS();
            this.setupLighting();
            this.setupControls();
            this.setupUI();
            this.setupEventListeners();
            
            this.isInitialized = true;
            this.createInitialHat();
            
            this.animate();
            
            console.log('3D Hat Configurator initialized successfully');
        } catch (error) {
            console.error('Failed to initialize 3D Hat Configurator:', error);
            this.showError('Failed to initialize 3D engine. Please refresh the page.');
        }
    }
    
    // Setup canvas
    setupCanvas() {
        this.canvas = document.getElementById('hatCanvas');
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }
        
        // Set initial canvas size
        this.resizeCanvas();
    }
    
    // Setup THREE.js components
    setupThreeJS() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.SCENE.backgroundColor);
        
        // Add GridHelper for floor reference
        const gridHelper = new THREE.GridHelper(10, 20);
        gridHelper.position.set(0, -1, 0);
        this.scene.add(gridHelper);
        
        // Create camera
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(
            CONFIG.SCENE.cameraPosition.x,
            CONFIG.SCENE.cameraPosition.y,
            CONFIG.SCENE.cameraPosition.z
        );
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Initialize hat geometry helper
        this.hatGeometry = new HatGeometry();
        
        console.log('THREE.js scene, camera, and renderer initialized');
    }
    
    // Setup lighting
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(
            CONFIG.SCENE.ambientLightColor,
            CONFIG.SCENE.ambientLightIntensity
        );
        this.scene.add(ambientLight);
        
        // Directional light
        const directionalLight = new THREE.DirectionalLight(
            CONFIG.SCENE.directionalLightColor,
            CONFIG.SCENE.directionalLightIntensity
        );
        directionalLight.position.set(
            CONFIG.SCENE.directionalLightPosition.x,
            CONFIG.SCENE.directionalLightPosition.y,
            CONFIG.SCENE.directionalLightPosition.z
        );
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        this.scene.add(directionalLight);
        
        // Add a subtle fill light
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-5, 2, -5);
        this.scene.add(fillLight);
        
        console.log('Lighting setup complete');
    }
    
    // Setup controls
    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = false;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 10;
        this.controls.maxPolarAngle = Math.PI / 2;
        
        // Set target to look at the hat
        this.controls.target.set(
            CONFIG.SCENE.cameraLookAt.x,
            CONFIG.SCENE.cameraLookAt.y,
            CONFIG.SCENE.cameraLookAt.z
        );
        
        console.log('Orbit controls initialized');
    }
    
    // Setup UI controller
    setupUI() {
        this.uiController = new UIController(this);
        this.uiController.initialize(this);
        
        // Make UI controller globally accessible
        window.uiController = this.uiController;
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimation();
            } else {
                this.resumeAnimation();
            }
        });
    }
    
    // Handle window resize
    handleResize() {
        this.resizeCanvas();
        
        if (this.camera && this.renderer) {
            this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        }
    }
    
    // Resize canvas to fit container
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Update canvas size
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        console.log('Canvas resized to:', rect.width, 'x', rect.height);
    }
    
    // Create initial hat
    createInitialHat() {
        console.log('Creating initial hat with config:', this.currentConfig);
        this.updateHat(this.currentConfig);
    }
    
    // Update hat with new configuration
    updateHat(config) {
        if (!this.isInitialized || !this.scene || !this.hatGeometry) return;
        
        this.currentConfig = Utils.validateConfig(config);
        
        // Remove existing hat
        if (this.currentHat) {
            this.scene.remove(this.currentHat);
            this.currentHat = null;
        }
        
        console.log('Creating hat with config:', this.currentConfig);
        
        // Create new hat geometry
        const hatGroup = this.hatGeometry.generateHat(
            this.currentConfig.type,
            this.currentConfig.crownHeight,
            this.currentConfig.brimSize
        );
        
        // Create material
        const material = this.hatGeometry.createHatMaterial(
            this.currentConfig.color,
            'hat'
        );
        
        // Apply material to all meshes in the hat group
        this.hatGeometry.applyMaterial(hatGroup, material);
        
        // Position the hat
        hatGroup.position.set(0, 0, 0);
        
        // Add to scene
        this.scene.add(hatGroup);
        this.currentHat = hatGroup;
        
        console.log('Hat created and added to scene');
    }
    
    // Animation loop
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Render scene
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    // Pause animation
    pauseAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    // Resume animation
    resumeAnimation() {
        if (!this.animationId) {
            this.animate();
        }
    }
    
    // Export current view as image
    exportImage() {
        if (!this.renderer) return;
        
        try {
            // Render the current frame
            this.renderer.render(this.scene, this.camera);
            
            // Create download link
            const link = document.createElement('a');
            link.download = `hat-configuration-${Date.now()}.png`;
            link.href = this.renderer.domElement.toDataURL('image/png');
            link.click();
            
            console.log('Image exported successfully');
            
        } catch (error) {
            console.error('Export failed:', error);
            this.showError('Failed to export image. Please try again.');
        }
    }
    
    // Show error message
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #f44336;
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 1000;
            text-align: center;
            max-width: 400px;
        `;
        errorDiv.innerHTML = `
            <h3>Error</h3>
            <p>${message}</p>
            <button onclick="this.parentElement.remove()" style="
                background: white;
                color: #f44336;
                border: none;
                padding: 8px 16px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            ">Close</button>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
    
    // Get current configuration
    getCurrentConfig() {
        return this.uiController ? this.uiController.getCurrentConfig() : CONFIG.DEFAULT_HAT;
    }
    
    // Cleanup
    destroy() {
        this.pauseAnimation();
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.controls) {
            this.controls.dispose();
        }
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Show loading message
    const canvas = document.getElementById('hatCanvas');
    if (canvas) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading';
        loadingDiv.textContent = 'Loading 3D Hat Configurator...';
        canvas.parentElement.appendChild(loadingDiv);
    }
    
    // Initialize app
    setTimeout(() => {
        try {
            window.hatConfigurator = new HatConfigurator();
            
            // Remove loading message
            const loadingDiv = document.querySelector('.loading');
            if (loadingDiv) {
                loadingDiv.remove();
            }
        } catch (error) {
            console.error('Failed to start application:', error);
            
            // Show error message
            const loadingDiv = document.querySelector('.loading');
            if (loadingDiv) {
                loadingDiv.textContent = 'Failed to load 3D engine. Please refresh the page.';
                loadingDiv.style.color = '#f44336';
            }
        }
    }, 100);
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.hatConfigurator) {
        window.hatConfigurator.destroy();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HatConfigurator;
}