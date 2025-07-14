// Configuration file for 3D Hat Configurator
const CONFIG = {
    // Default hat configuration
    DEFAULT_HAT: {
        type: 'fedora',
        color: '#8B4513',
        crownHeight: 1.0,
        brimSize: 1.0
    },
    
    // Hat type configurations
    HAT_TYPES: {
        fedora: {
            name: 'Fedora',
            crownHeight: { min: 0.5, max: 1.5, default: 1.0 },
            brimSize: { min: 0.8, max: 2.0, default: 1.2 },
            crownShape: 'cylindrical',
            brimShape: 'flat'
        },
        bowler: {
            name: 'Bowler',
            crownHeight: { min: 0.6, max: 1.2, default: 0.8 },
            brimSize: { min: 0.5, max: 1.2, default: 0.8 },
            crownShape: 'dome',
            brimShape: 'curved'
        },
        baseball: {
            name: 'Baseball Cap',
            crownHeight: { min: 0.5, max: 1.0, default: 0.7 },
            brimSize: { min: 0.8, max: 1.5, default: 1.0 },
            crownShape: 'rounded',
            brimShape: 'visor'
        },
        beanie: {
            name: 'Beanie',
            crownHeight: { min: 0.8, max: 1.8, default: 1.2 },
            brimSize: { min: 0.0, max: 0.3, default: 0.1 },
            crownShape: 'soft',
            brimShape: 'fold'
        },
        tophat: {
            name: 'Top Hat',
            crownHeight: { min: 1.5, max: 2.5, default: 2.0 },
            brimSize: { min: 0.8, max: 1.5, default: 1.0 },
            crownShape: 'tall',
            brimShape: 'flat'
        }
    },
    
    // Color presets
    COLOR_PRESETS: [
        '#8B4513', // Saddle Brown
        '#000000', // Black
        '#654321', // Dark Brown
        '#2F4F4F', // Dark Slate Gray
        '#800000', // Maroon
        '#191970'  // Midnight Blue
    ],
    
    // 3D Scene configuration
    SCENE: {
        backgroundColor: 0xf0f0f0,
        cameraPosition: { x: 0, y: 2, z: 5 },
        cameraLookAt: { x: 0, y: 0, z: 0 },
        ambientLightColor: 0x404040,
        ambientLightIntensity: 0.6,
        directionalLightColor: 0xffffff,
        directionalLightIntensity: 0.8,
        directionalLightPosition: { x: 5, y: 5, z: 5 }
    },
    
    // Material properties
    MATERIALS: {
        hat: {
            roughness: 0.8,
            metalness: 0.1,
            envMapIntensity: 0.5
        },
        fabric: {
            roughness: 0.9,
            metalness: 0.0,
            envMapIntensity: 0.3
        },
        leather: {
            roughness: 0.7,
            metalness: 0.2,
            envMapIntensity: 0.4
        }
    },
    
    // Geometry parameters
    GEOMETRY: {
        segments: 32,
        crownSegments: 16,
        brimSegments: 32,
        smoothness: 0.1
    },
    
    // Animation settings
    ANIMATION: {
        transitionDuration: 0.5,
        easingFunction: 'easeInOutQuad'
    },
    
    // Export settings
    EXPORT: {
        imageWidth: 800,
        imageHeight: 600,
        imageFormat: 'png',
        imageQuality: 0.9
    }
};

// Utility functions
const Utils = {
    // Clamp value between min and max
    clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
    
    // Linear interpolation
    lerp: (a, b, t) => a + (b - a) * t,
    
    // Convert hex color to RGB
    hexToRgb: (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        } : null;
    },
    
    // Convert RGB to hex
    rgbToHex: (r, g, b) => {
        return "#" + ((1 << 24) + (Math.round(r * 255) << 16) + (Math.round(g * 255) << 8) + Math.round(b * 255)).toString(16).slice(1);
    },
    
    // Get hat type configuration
    getHatConfig: (type) => {
        return CONFIG.HAT_TYPES[type] || CONFIG.HAT_TYPES.fedora;
    },
    
    // Validate configuration values
    validateConfig: (config) => {
        const hatConfig = Utils.getHatConfig(config.type);
        return {
            type: config.type || CONFIG.DEFAULT_HAT.type,
            color: config.color || CONFIG.DEFAULT_HAT.color,
            crownHeight: Utils.clamp(
                config.crownHeight || hatConfig.crownHeight.default,
                hatConfig.crownHeight.min,
                hatConfig.crownHeight.max
            ),
            brimSize: Utils.clamp(
                config.brimSize || hatConfig.brimSize.default,
                hatConfig.brimSize.min,
                hatConfig.brimSize.max
            )
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, Utils };
}