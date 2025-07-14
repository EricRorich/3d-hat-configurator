// Main application file for 3D Hat Configurator
class HatConfigurator {
    constructor() {
        this.webgl = null;
        this.canvas = null;
        this.uiController = null;
        this.currentHat = null;
        this.currentConfig = { ...CONFIG.DEFAULT_HAT };
        this.animationId = null;
        this.isInitialized = false;
        this.time = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.isDragging = false;
        
        this.init();
    }
    
    // Initialize the application
    async init() {
        try {
            this.setupCanvas();
            this.setupWebGL();
            this.setupUI();
            this.setupEventListeners();
            this.createInitialHat();
            
            this.isInitialized = true;
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
        
        // Set canvas size
        this.resizeCanvas();
    }
    
    // Setup WebGL
    setupWebGL() {
        this.webgl = new SimpleWebGL(this.canvas);
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
        
        // Handle mouse events for rotation
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaX = e.clientX - this.mouseX;
                this.webgl.updateRotation(deltaX * 0.01);
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
        });
        
        // Handle touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.isDragging = true;
            this.mouseX = touch.clientX;
            this.mouseY = touch.clientY;
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isDragging && e.touches.length > 0) {
                const touch = e.touches[0];
                const deltaX = touch.clientX - this.mouseX;
                this.webgl.updateRotation(deltaX * 0.01);
                this.mouseX = touch.clientX;
                this.mouseY = touch.clientY;
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isDragging = false;
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
        if (this.webgl) {
            this.webgl.resize(this.canvas.width, this.canvas.height);
        }
    }
    
    // Resize canvas to fit container
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }
    
    // Create initial hat
    createInitialHat() {
        this.updateHat(this.currentConfig);
    }
    
    // Update hat with new configuration
    updateHat(config) {
        if (!this.isInitialized || !this.webgl) return;
        
        this.currentConfig = Utils.validateConfig(config);
        
        // Convert hex color to RGB
        const color = this.webgl.hexToRgb(this.currentConfig.color);
        
        // Create new hat mesh
        this.currentHat = this.webgl.createHatGeometry(
            this.currentConfig.type,
            this.currentConfig.crownHeight,
            this.currentConfig.brimSize,
            color
        );
    }
    
    // Animation loop
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        this.time += 0.016; // ~60fps
        
        // Auto-rotate the hat slowly
        if (!this.isDragging) {
            this.webgl.updateRotation(0.005);
        }
        
        if (this.webgl && this.currentHat) {
            this.webgl.render(this.currentHat, this.time);
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
        if (!this.canvas) return;
        
        try {
            // Create download link
            const link = document.createElement('a');
            link.download = `hat-configuration-${Date.now()}.png`;
            link.href = this.canvas.toDataURL('image/png');
            link.click();
            
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
        
        if (this.webgl) {
            // Clean up WebGL resources
            this.webgl = null;
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Show loading message
    const canvas = document.getElementById('hatCanvas');
    canvas.innerHTML = '<div class="loading">Loading 3D Hat Configurator...</div>';
    
    // Initialize app
    setTimeout(() => {
        try {
            window.hatConfigurator = new HatConfigurator();
        } catch (error) {
            console.error('Failed to start application:', error);
            canvas.innerHTML = '<div class="loading">Failed to load 3D engine. Please refresh the page.</div>';
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