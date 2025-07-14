// Minimal THREE.js implementation for the 3D Hat Configurator
// This provides the essential THREE.js API needed for the application

window.THREE = {
    // Constants
    PCFSoftShadowMap: 'pcf_soft',
    
    // Scene class
    Scene: function() {
        this.children = [];
        this.background = null;
        this.add = function(object) {
            this.children.push(object);
        };
        this.remove = function(object) {
            const index = this.children.indexOf(object);
            if (index > -1) {
                this.children.splice(index, 1);
            }
        };
    },
    
    // Color class
    Color: function(color) {
        this.r = 1;
        this.g = 1;
        this.b = 1;
        
        this.setHex = function(hex) {
            this.r = ((hex >> 16) & 255) / 255;
            this.g = ((hex >> 8) & 255) / 255;
            this.b = (hex & 255) / 255;
        };
        
        if (typeof color === 'number') {
            this.setHex(color);
        }
    },
    
    // PerspectiveCamera class
    PerspectiveCamera: function(fov, aspect, near, far) {
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.position = { x: 0, y: 0, z: 0, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; } };
        this.updateProjectionMatrix = function() {};
    },
    
    // WebGLRenderer class
    WebGLRenderer: function(options) {
        this.domElement = options.canvas;
        this.shadowMap = { enabled: false, type: null };
        this.currentHatColor = [0.5, 0.3, 0.1];
        
        this.multiplyMatrices = function(a, b) {
            const result = new Float32Array(16);
            
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    result[i * 4 + j] = 
                        a[i * 4 + 0] * b[0 * 4 + j] +
                        a[i * 4 + 1] * b[1 * 4 + j] +
                        a[i * 4 + 2] * b[2 * 4 + j] +
                        a[i * 4 + 3] * b[3 * 4 + j];
                }
            }
            
            return result;
        };
        
        this.setSize = function(width, height) {
            if (this.domElement) {
                this.domElement.width = width;
                this.domElement.height = height;
            }
        };
        
        this.setPixelRatio = function(ratio) {};
        
        this.render = function(scene, camera) {
            // Simple WebGL rendering
            const canvas = this.domElement;
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) return;
            
            // Clear canvas
            gl.clearColor(0.94, 0.94, 0.94, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.enable(gl.DEPTH_TEST);
            
            // Update hat color if scene has children (hat objects)
            if (scene && scene.children && scene.children.length > 0) {
                const hatGroup = scene.children[scene.children.length - 1]; // Get the last added object (the hat)
                if (hatGroup && hatGroup.children && hatGroup.children.length > 0) {
                    const hatMesh = hatGroup.children[0];
                    if (hatMesh && hatMesh.material && hatMesh.material.color) {
                        const color = hatMesh.material.color;
                        if (typeof color === 'string') {
                            // Convert hex string to RGB
                            const hex = color.replace('#', '');
                            this.currentHatColor = [
                                parseInt(hex.substr(0, 2), 16) / 255,
                                parseInt(hex.substr(2, 2), 16) / 255,
                                parseInt(hex.substr(4, 2), 16) / 255
                            ];
                        }
                    }
                }
            }
            
            // Simple rendering for demonstration
            this.renderSimpleHat(gl, scene, camera);
        };
        
        this.renderSimpleHat = function(gl, scene, camera) {
            // Create a simple hat-like shape using basic WebGL
            const vertices = [
                // Crown (octagonal cylinder)
                0.0, 0.0, 0.0,    // 0: Center bottom
                0.0, 1.0, 0.0,    // 1: Center top
                
                // Bottom ring (8 vertices)
                0.8, 0.0, 0.0,    // 2: E
                0.57, 0.0, 0.57,  // 3: SE
                0.0, 0.0, 0.8,    // 4: S
                -0.57, 0.0, 0.57, // 5: SW
                -0.8, 0.0, 0.0,   // 6: W
                -0.57, 0.0, -0.57,// 7: NW
                0.0, 0.0, -0.8,   // 8: N
                0.57, 0.0, -0.57, // 9: NE
                
                // Top ring (8 vertices)
                0.8, 1.0, 0.0,    // 10: E
                0.57, 1.0, 0.57,  // 11: SE
                0.0, 1.0, 0.8,    // 12: S
                -0.57, 1.0, 0.57, // 13: SW
                -0.8, 1.0, 0.0,   // 14: W
                -0.57, 1.0, -0.57,// 15: NW
                0.0, 1.0, -0.8,   // 16: N
                0.57, 1.0, -0.57, // 17: NE
                
                // Brim ring (8 vertices)
                1.5, 0.0, 0.0,    // 18: E
                1.06, 0.0, 1.06,  // 19: SE
                0.0, 0.0, 1.5,    // 20: S
                -1.06, 0.0, 1.06, // 21: SW
                -1.5, 0.0, 0.0,   // 22: W
                -1.06, 0.0, -1.06,// 23: NW
                0.0, 0.0, -1.5,   // 24: N
                1.06, 0.0, -1.06, // 25: NE
            ];
            
            const indices = [
                // Crown bottom face (octagon)
                0, 2, 3,  0, 3, 4,  0, 4, 5,  0, 5, 6,
                0, 6, 7,  0, 7, 8,  0, 8, 9,  0, 9, 2,
                
                // Crown top face (octagon)
                1, 11, 10,  1, 12, 11,  1, 13, 12,  1, 14, 13,
                1, 15, 14,  1, 16, 15,  1, 17, 16,  1, 10, 17,
                
                // Crown sides (8 rectangular faces)
                2, 10, 3,   3, 10, 11,  // E-SE
                3, 11, 4,   4, 11, 12,  // SE-S
                4, 12, 5,   5, 12, 13,  // S-SW
                5, 13, 6,   6, 13, 14,  // SW-W
                6, 14, 7,   7, 14, 15,  // W-NW
                7, 15, 8,   8, 15, 16,  // NW-N
                8, 16, 9,   9, 16, 17,  // N-NE
                9, 17, 2,   2, 17, 10,  // NE-E
                
                // Brim (8 segments)
                2, 18, 3,   3, 18, 19,  // E-SE
                3, 19, 4,   4, 19, 20,  // SE-S
                4, 20, 5,   5, 20, 21,  // S-SW
                5, 21, 6,   6, 21, 22,  // SW-W
                6, 22, 7,   7, 22, 23,  // W-NW
                7, 23, 8,   8, 23, 24,  // NW-N
                8, 24, 9,   9, 24, 25,  // N-NE
                9, 25, 2,   2, 25, 18,  // NE-E
            ];
            
            if (!this.program) {
                this.program = this.createShaderProgram(gl);
            }
            
            if (!this.buffers) {
                this.buffers = this.createBuffers(gl, vertices, indices);
            }
            
            this.drawHat(gl, this.program, this.buffers, indices.length);
        };
        
        this.createShaderProgram = function(gl) {
            const vertexShaderSource = `
                attribute vec3 a_position;
                uniform mat4 u_matrix;
                uniform mat4 u_rotation;
                varying vec3 v_position;
                void main() {
                    vec4 rotatedPos = u_rotation * vec4(a_position, 1.0);
                    gl_Position = u_matrix * rotatedPos;
                    v_position = rotatedPos.xyz;
                }
            `;
            
            const fragmentShaderSource = `
                precision mediump float;
                uniform vec3 u_color;
                varying vec3 v_position;
                void main() {
                    // Simple shading based on position
                    vec3 normal = normalize(v_position);
                    vec3 light = normalize(vec3(0.5, 0.8, 0.6));
                    float diffuse = max(dot(normal, light), 0.0);
                    vec3 finalColor = u_color * (diffuse * 0.7 + 0.3);
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `;
            
            const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
            const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
            
            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error('Shader program failed to link:', gl.getProgramInfoLog(program));
                return null;
            }
            
            return program;
        };
        
        this.createShader = function(gl, type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            
            return shader;
        };
        
        this.createBuffers = function(gl, vertices, indices) {
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
            
            const indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
            
            return { position: positionBuffer, indices: indexBuffer };
        };
        
        this.drawHat = function(gl, program, buffers, indexCount) {
            gl.useProgram(program);
            
            // Set up perspective matrix
            const aspect = gl.canvas.width / gl.canvas.height;
            const fov = Math.PI / 4;
            const near = 0.1;
            const far = 100.0;
            const f = 1.0 / Math.tan(fov / 2);
            const rangeInv = 1.0 / (near - far);
            
            const perspectiveMatrix = new Float32Array([
                f / aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (near + far) * rangeInv, -1,
                0, 0, near * far * rangeInv * 2, 0
            ]);
            
            // Set up rotation matrix (auto-rotate)
            const time = performance.now() * 0.001;
            const rotY = time * 0.3;
            const cos = Math.cos(rotY);
            const sin = Math.sin(rotY);
            
            const rotationMatrix = new Float32Array([
                cos, 0, sin, 0,
                0, 1, 0, 0,
                -sin, 0, cos, 0,
                0, 0, 0, 1
            ]);
            
            // Set up view matrix (camera positioned back)
            const viewMatrix = new Float32Array([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, -0.5, -4, 1
            ]);
            
            // Combine matrices
            const mvpMatrix = this.multiplyMatrices(perspectiveMatrix, viewMatrix);
            
            const matrixLocation = gl.getUniformLocation(program, 'u_matrix');
            gl.uniformMatrix4fv(matrixLocation, false, mvpMatrix);
            
            const rotationLocation = gl.getUniformLocation(program, 'u_rotation');
            gl.uniformMatrix4fv(rotationLocation, false, rotationMatrix);
            
            // Set color (use the current hat color from the scene)
            const colorLocation = gl.getUniformLocation(program, 'u_color');
            const hatColor = this.currentHatColor || [0.5, 0.3, 0.1];
            gl.uniform3fv(colorLocation, hatColor);
            
            // Set up position attribute
            const positionLocation = gl.getAttribLocation(program, 'a_position');
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(positionLocation);
            
            // Draw
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
            gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
        };
        
        this.dispose = function() {};
    },
    
    // Group class
    Group: function() {
        this.children = [];
        this.position = { x: 0, y: 0, z: 0, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; } };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.scale = { x: 1, y: 1, z: 1 };
        
        this.add = function(object) {
            this.children.push(object);
        };
        
        this.traverse = function(callback) {
            callback(this);
            this.children.forEach(child => {
                if (child.traverse) {
                    child.traverse(callback);
                } else {
                    callback(child);
                }
            });
        };
    },
    
    // Mesh class
    Mesh: function(geometry, material) {
        this.geometry = geometry;
        this.material = material;
        this.position = { x: 0, y: 0, z: 0, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; } };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.scale = { x: 1, y: 1, z: 1 };
        this.castShadow = false;
        this.receiveShadow = false;
    },
    
    // Basic geometry classes
    CylinderGeometry: function(radiusTop, radiusBottom, height, segments) {
        this.radiusTop = radiusTop;
        this.radiusBottom = radiusBottom;
        this.height = height;
        this.segments = segments;
    },
    
    SphereGeometry: function(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength) {
        this.radius = radius;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
    },
    
    RingGeometry: function(innerRadius, outerRadius, thetaSegments) {
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.thetaSegments = thetaSegments;
    },
    
    TorusGeometry: function(radius, tube, radialSegments, tubularSegments) {
        this.radius = radius;
        this.tube = tube;
        this.radialSegments = radialSegments;
        this.tubularSegments = tubularSegments;
    },
    
    PlaneGeometry: function(width, height) {
        this.width = width;
        this.height = height;
    },
    
    // Material class
    MeshStandardMaterial: function(options) {
        this.color = options.color || '#ffffff';
        this.roughness = options.roughness || 0.5;
        this.metalness = options.metalness || 0.0;
        this.envMapIntensity = options.envMapIntensity || 1.0;
    },
    
    // Light classes
    AmbientLight: function(color, intensity) {
        this.color = color;
        this.intensity = intensity;
    },
    
    DirectionalLight: function(color, intensity) {
        this.color = color;
        this.intensity = intensity;
        this.position = { x: 0, y: 0, z: 0, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; } };
        this.castShadow = false;
        this.shadow = {
            mapSize: { width: 2048, height: 2048 },
            camera: { near: 0.5, far: 500 }
        };
    },
    
    // OrbitControls (simplified)
    OrbitControls: function(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        this.enableDamping = true;
        this.dampingFactor = 0.05;
        this.enableZoom = true;
        this.enablePan = false;
        this.minDistance = 2;
        this.maxDistance = 10;
        this.maxPolarAngle = Math.PI / 2;
        this.target = { x: 0, y: 0, z: 0, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; } };
        
        this.update = function() {
            // Simple orbit controls simulation
        };
        
        this.dispose = function() {};
    }
};

console.log('Minimal THREE.js implementation loaded');