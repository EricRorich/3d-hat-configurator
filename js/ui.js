// UI handling for 3D Hat Configurator
class UIController {
    constructor(app) {
        this.app = app;
        this.elements = {};
        this.currentConfig = { ...CONFIG.DEFAULT_HAT };
        this.isInitialized = false;
        
        this.initializeElements();
        this.bindEvents();
        this.updateUI();
    }
    
    // Initialize UI elements
    initializeElements() {
        this.elements = {
            hatType: document.getElementById('hatType'),
            hatColor: document.getElementById('hatColor'),
            crownHeight: document.getElementById('crownHeight'),
            crownHeightValue: document.getElementById('crownHeightValue'),
            brimSize: document.getElementById('brimSize'),
            brimSizeValue: document.getElementById('brimSizeValue'),
            resetBtn: document.getElementById('resetBtn'),
            saveBtn: document.getElementById('saveBtn'),
            exportBtn: document.getElementById('exportBtn'),
            colorButtons: document.querySelectorAll('.color-btn')
        };
        
        // Check if all elements are found
        for (const [key, element] of Object.entries(this.elements)) {
            if (!element && key !== 'colorButtons') {
                console.error(`Element not found: ${key}`);
            }
        }
    }
    
    // Bind event listeners
    bindEvents() {
        // Hat type selection
        this.elements.hatType.addEventListener('change', (e) => {
            this.currentConfig.type = e.target.value;
            this.updateSliderRanges();
            this.updateHat();
        });
        
        // Color picker
        this.elements.hatColor.addEventListener('input', (e) => {
            this.currentConfig.color = e.target.value;
            this.updateColorButtons();
            this.updateHat();
        });
        
        // Crown height slider
        this.elements.crownHeight.addEventListener('input', (e) => {
            this.currentConfig.crownHeight = parseFloat(e.target.value);
            this.elements.crownHeightValue.textContent = e.target.value;
            this.updateHat();
        });
        
        // Brim size slider
        this.elements.brimSize.addEventListener('input', (e) => {
            this.currentConfig.brimSize = parseFloat(e.target.value);
            this.elements.brimSizeValue.textContent = e.target.value;
            this.updateHat();
        });
        
        // Color preset buttons
        this.elements.colorButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                this.currentConfig.color = color;
                this.elements.hatColor.value = color;
                this.updateColorButtons();
                this.updateHat();
            });
        });
        
        // Action buttons
        this.elements.resetBtn.addEventListener('click', () => {
            this.resetToDefault();
        });
        
        this.elements.saveBtn.addEventListener('click', () => {
            this.saveConfiguration();
        });
        
        this.elements.exportBtn.addEventListener('click', () => {
            this.exportImage();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'r':
                        e.preventDefault();
                        this.resetToDefault();
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveConfiguration();
                        break;
                    case 'e':
                        e.preventDefault();
                        this.exportImage();
                        break;
                }
            }
        });
    }
    
    // Update slider ranges based on hat type
    updateSliderRanges() {
        const hatConfig = Utils.getHatConfig(this.currentConfig.type);
        
        // Update crown height slider
        this.elements.crownHeight.min = hatConfig.crownHeight.min;
        this.elements.crownHeight.max = hatConfig.crownHeight.max;
        this.elements.crownHeight.value = hatConfig.crownHeight.default;
        this.elements.crownHeightValue.textContent = hatConfig.crownHeight.default;
        this.currentConfig.crownHeight = hatConfig.crownHeight.default;
        
        // Update brim size slider
        this.elements.brimSize.min = hatConfig.brimSize.min;
        this.elements.brimSize.max = hatConfig.brimSize.max;
        this.elements.brimSize.value = hatConfig.brimSize.default;
        this.elements.brimSizeValue.textContent = hatConfig.brimSize.default;
        this.currentConfig.brimSize = hatConfig.brimSize.default;
    }
    
    // Update color button states
    updateColorButtons() {
        this.elements.colorButtons.forEach(button => {
            if (button.dataset.color === this.currentConfig.color) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
    
    // Update the 3D hat
    updateHat() {
        if (this.app && this.app.updateHat) {
            this.app.updateHat(this.currentConfig);
        }
    }
    
    // Update UI elements to match current config
    updateUI() {
        this.elements.hatType.value = this.currentConfig.type;
        this.elements.hatColor.value = this.currentConfig.color;
        this.elements.crownHeight.value = this.currentConfig.crownHeight;
        this.elements.crownHeightValue.textContent = this.currentConfig.crownHeight;
        this.elements.brimSize.value = this.currentConfig.brimSize;
        this.elements.brimSizeValue.textContent = this.currentConfig.brimSize;
        
        this.updateSliderRanges();
        this.updateColorButtons();
    }
    
    // Reset to default configuration
    resetToDefault() {
        this.currentConfig = { ...CONFIG.DEFAULT_HAT };
        this.updateUI();
        this.updateHat();
        this.showNotification('Configuration reset to default', 'success');
    }
    
    // Save configuration to localStorage
    saveConfiguration() {
        try {
            localStorage.setItem('hatConfig', JSON.stringify(this.currentConfig));
            this.showNotification('Configuration saved successfully', 'success');
        } catch (error) {
            this.showNotification('Failed to save configuration', 'error');
            console.error('Save error:', error);
        }
    }
    
    // Load configuration from localStorage
    loadConfiguration() {
        try {
            const saved = localStorage.getItem('hatConfig');
            if (saved) {
                const config = JSON.parse(saved);
                this.currentConfig = Utils.validateConfig(config);
                this.updateUI();
                this.updateHat();
                this.showNotification('Configuration loaded successfully', 'success');
                return true;
            }
        } catch (error) {
            this.showNotification('Failed to load configuration', 'error');
            console.error('Load error:', error);
        }
        return false;
    }
    
    // Export current view as image
    exportImage() {
        if (this.app && this.app.exportImage) {
            this.app.exportImage();
            this.showNotification('Image exported successfully', 'success');
        } else {
            this.showNotification('Export not available', 'error');
        }
    }
    
    // Show notification message
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        
        if (!document.getElementById('notification-styles')) {
            style.id = 'notification-styles';
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Get current configuration
    getCurrentConfig() {
        return { ...this.currentConfig };
    }
    
    // Set configuration
    setConfiguration(config) {
        this.currentConfig = Utils.validateConfig(config);
        this.updateUI();
        this.updateHat();
    }
    
    // Initialize UI with app reference
    initialize(app) {
        this.app = app;
        this.isInitialized = true;
        
        // Try to load saved configuration
        if (!this.loadConfiguration()) {
            // If no saved config, use default
            this.updateHat();
        }
    }
    
    // Handle window resize
    handleResize() {
        // Update responsive elements if needed
        if (window.innerWidth <= 768) {
            // Mobile layout adjustments
            this.elements.colorButtons.forEach(button => {
                button.style.width = '35px';
                button.style.height = '35px';
            });
        } else {
            // Desktop layout
            this.elements.colorButtons.forEach(button => {
                button.style.width = '40px';
                button.style.height = '40px';
            });
        }
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    if (window.uiController) {
        window.uiController.handleResize();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
}