# 3D Hat Configurator

A comprehensive 3D hat configurator built with WebGL that allows users to customize and visualize different hat types in real-time.

![3D Hat Configurator Desktop](https://github.com/user-attachments/assets/97209600-dd40-453b-8105-b0c096304aa6)

## Features

### Core Functionality
- **Real-time 3D Visualization**: Custom WebGL engine with realistic lighting and materials
- **Interactive Controls**: Mouse/touch rotation, zoom, and pan controls
- **Live Preview**: Instant updates as you modify hat parameters

### Hat Types (5 Available)
- **Fedora**: Classic fedora with adjustable crown and brim
- **Bowler**: Traditional bowler hat with curved brim
- **Baseball Cap**: Modern baseball cap with visor
- **Beanie**: Soft knit beanie with minimal brim
- **Top Hat**: Elegant top hat with tall crown

### Customization Options
- **Color Selection**: Color picker with 6 preset colors
- **Crown Height**: Dynamic slider with hat-specific ranges
- **Brim Size**: Adjustable brim dimensions
- **Real-time Updates**: All changes reflected instantly in 3D

### User Interface
- **Modern Design**: Clean, intuitive interface with gradient backgrounds
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Interactive Elements**: Smooth animations and hover effects
- **Accessibility**: Keyboard shortcuts and screen reader support

### Advanced Features
- **Configuration Save/Load**: Persistent storage using localStorage
- **Image Export**: Save your hat design as PNG image
- **Reset Functionality**: Quick return to default settings
- **Notifications**: User feedback for all actions

## Screenshots

### Desktop View
![Desktop Interface](https://github.com/user-attachments/assets/97209600-dd40-453b-8105-b0c096304aa6)

### Tablet View
![Tablet Interface](https://github.com/user-attachments/assets/350c988a-64dc-45f5-91aa-581fd9b44eec)

### Mobile View
![Mobile Interface](https://github.com/user-attachments/assets/f8681403-9507-4f87-b867-094aa84914a9)

## Technical Implementation

### Architecture
- **Frontend**: Pure HTML5, CSS3, and vanilla JavaScript
- **3D Engine**: Custom WebGL implementation with shaders
- **No Dependencies**: Self-contained, no external libraries required
- **Responsive**: CSS Grid and Flexbox for adaptive layouts

### WebGL Features
- **Custom Shaders**: Vertex and fragment shaders for realistic rendering
- **Lighting System**: Ambient, directional, and rim lighting
- **Material System**: Configurable roughness and metalness
- **Geometry Generation**: Parametric hat mesh generation

### Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **WebGL**: Requires WebGL 1.0 support
- **Mobile**: iOS Safari, Android Chrome
- **Fallback**: Graceful degradation for older browsers

## Getting Started

### Installation
1. Clone the repository
2. No build process required - pure HTML/CSS/JS
3. Open `index.html` in a web browser
4. Start customizing hats!

### Development
```bash
# Serve locally (optional)
python3 -m http.server 8000
# or
npx serve .
```

### File Structure
```
3d-hat-configurator/
├── index.html              # Main HTML file
├── style.css               # Styling and responsive design
├── js/
│   ├── main.js             # Main application logic
│   ├── simpleWebGL.js      # Custom WebGL engine
│   ├── ui.js               # User interface handling
│   └── config.js           # Configuration and utilities
└── README.md               # This file
```

## Usage

### Basic Operations
1. **Select Hat Type**: Choose from 5 different hat styles
2. **Adjust Color**: Use color picker or preset color buttons
3. **Modify Dimensions**: Use sliders to adjust crown height and brim size
4. **Rotate View**: Click and drag to rotate the 3D model
5. **Export**: Save your configuration or export as image

### Keyboard Shortcuts
- `Ctrl/Cmd + R`: Reset to default configuration
- `Ctrl/Cmd + S`: Save current configuration
- `Ctrl/Cmd + E`: Export current view as image

### Advanced Features
- **Auto-save**: Configurations automatically saved to localStorage
- **Responsive**: Adapts to screen size changes
- **Touch Support**: Full touch gesture support on mobile devices

## Configuration

### Hat Type Parameters
Each hat type has specific parameter ranges:

- **Fedora**: Crown 0.5-1.5, Brim 0.8-2.0
- **Bowler**: Crown 0.6-1.2, Brim 0.5-1.2
- **Baseball**: Crown 0.5-1.0, Brim 0.8-1.5
- **Beanie**: Crown 0.8-1.8, Brim 0.0-0.3
- **Top Hat**: Crown 1.5-2.5, Brim 0.8-1.5

### Color Presets
- Saddle Brown (#8B4513)
- Black (#000000)
- Dark Brown (#654321)
- Dark Slate Gray (#2F4F4F)
- Maroon (#800000)
- Midnight Blue (#191970)

## Contributing

This project is open source and welcomes contributions:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines
- Follow existing code style
- Test on multiple browsers
- Ensure responsive design works
- Add comments for complex logic
- Update README for new features

## License

MIT License - feel free to use and modify as needed.

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 50+ | ✅ Fully Supported |
| Firefox | 45+ | ✅ Fully Supported |
| Safari | 10+ | ✅ Fully Supported |
| Edge | 25+ | ✅ Fully Supported |
| Mobile Safari | 10+ | ✅ Fully Supported |
| Mobile Chrome | 50+ | ✅ Fully Supported |

## Performance

- **Rendering**: 60 FPS smooth animations
- **Memory**: Low memory footprint
- **Loading**: Instant loading, no external dependencies
- **Mobile**: Optimized for mobile devices

## Troubleshooting

### Common Issues

**Black canvas or no 3D display**
- Ensure WebGL is enabled in browser
- Check browser console for errors
- Try refreshing the page

**Poor performance on mobile**
- Reduce browser zoom level
- Close other tabs/applications
- Ensure good network connection

**Controls not responding**
- Check if JavaScript is enabled
- Clear browser cache
- Try different browser

### Support
For issues or questions, please open an issue on the GitHub repository.

---

Built with ❤️ using WebGL and modern web technologies.
