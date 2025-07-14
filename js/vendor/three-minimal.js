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
            
            if (!gl) {
                console.error('WebGL not supported');
                return;
            }
            
            // Clear canvas
            gl.clearColor(0.94, 0.94, 0.94, 1.0); // Light gray background
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.enable(gl.DEPTH_TEST);
            
            // Set viewport
            gl.viewport(0, 0, canvas.width, canvas.height);
            
            // Update hat color and configuration from scene
            this.updateHatFromScene(scene);
            
            // Render grid floor
            this.renderGridHelper(gl, scene, camera);
            
            // Render hat
            this.renderSimpleHat(gl, scene, camera);
        };
        
        this.updateHatConfiguration = function() {
            // Force buffer update on next render
            this.needsUpdateBuffers = true;
        };
        
        this.updateHatFromScene = function(scene) {
            // Update hat color and configuration from scene
            if (scene && scene.children && scene.children.length > 0) {
                const hatGroup = scene.children[scene.children.length - 1];
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
        };
        
        this.renderGridHelper = function(gl, scene, camera) {
            // Create a simple grid floor for better orientation
            if (!this.gridProgram) {
                this.gridProgram = this.createGridProgram(gl);
            }
            
            if (!this.gridBuffers) {
                this.gridBuffers = this.setupGridBuffers(gl);
            }
            
            this.drawGrid(gl, this.gridProgram, this.gridBuffers, camera);
        };
        
        this.createGridProgram = function(gl) {
            const vertexShaderSource = `
                attribute vec3 a_position;
                uniform mat4 u_matrix;
                void main() {
                    gl_Position = u_matrix * vec4(a_position, 1.0);
                }
            `;
            
            const fragmentShaderSource = `
                precision mediump float;
                void main() {
                    gl_FragColor = vec4(0.5, 0.5, 0.5, 0.3);
                }
            `;
            
            const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
            const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
            
            if (!vertexShader || !fragmentShader) {
                return null;
            }
            
            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error('Failed to link grid program:', gl.getProgramInfoLog(program));
                return null;
            }
            
            return program;
        };
        
        this.setupGridBuffers = function(gl) {
            const gridVertices = [];
            const gridSize = 10;
            const gridSpacing = 0.5;
            
            // Create grid lines
            for (let i = -gridSize; i <= gridSize; i++) {
                const pos = i * gridSpacing;
                // Horizontal lines
                gridVertices.push(-gridSize * gridSpacing, -1, pos);
                gridVertices.push(gridSize * gridSpacing, -1, pos);
                // Vertical lines
                gridVertices.push(pos, -1, -gridSize * gridSpacing);
                gridVertices.push(pos, -1, gridSize * gridSpacing);
            }
            
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gridVertices), gl.STATIC_DRAW);
            
            return { position: positionBuffer, count: gridVertices.length / 3 };
        };
        
        this.drawGrid = function(gl, program, buffers, camera) {
            if (!program) return;
            
            gl.useProgram(program);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            
            // Create perspective and view matrices
            const matrices = this.createViewMatrices(camera);
            const mvpMatrix = this.multiplyMatrices(matrices.perspective, matrices.view);
            
            const matrixLocation = gl.getUniformLocation(program, 'u_matrix');
            gl.uniformMatrix4fv(matrixLocation, false, new Float32Array(mvpMatrix));
            
            // Set up position attribute
            const positionLocation = gl.getAttribLocation(program, 'a_position');
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(positionLocation);
            
            // Draw grid lines
            gl.drawArrays(gl.LINES, 0, buffers.count);
            
            gl.disable(gl.BLEND);
        };
        
        this.createViewMatrices = function(camera) {
            const canvas = this.domElement;
            const aspect = canvas.width / canvas.height;
            const fov = 75 * Math.PI / 180; // Match the camera FOV from main.js
            const near = 0.1;
            const far = 100.0;
            const f = 1.0 / Math.tan(fov / 2);
            
            // Perspective matrix
            const perspective = [
                f / aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (far + near) / (near - far), -1,
                0, 0, (2 * far * near) / (near - far), 0
            ];
            
            // Use camera position from OrbitControls
            const cameraX = (camera && camera.position) ? camera.position.x : 0;
            const cameraY = (camera && camera.position) ? camera.position.y : 2;
            const cameraZ = (camera && camera.position) ? camera.position.z : 5;
            
            // Create look-at view matrix
            const eye = [cameraX, cameraY, cameraZ];
            const target = [0, 0, 0];
            const up = [0, 1, 0];
            
            // Calculate view matrix
            const zAxis = this.normalize(this.subtract(eye, target));
            const xAxis = this.normalize(this.cross(up, zAxis));
            const yAxis = this.cross(zAxis, xAxis);
            
            const view = [
                xAxis[0], yAxis[0], zAxis[0], 0,
                xAxis[1], yAxis[1], zAxis[1], 0,
                xAxis[2], yAxis[2], zAxis[2], 0,
                -this.dot(xAxis, eye), -this.dot(yAxis, eye), -this.dot(zAxis, eye), 1
            ];
            
            return { perspective, view };
        };
        
        this.normalize = function(v) {
            const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
            return length > 0 ? [v[0] / length, v[1] / length, v[2] / length] : [0, 0, 0];
        };
        
        this.subtract = function(a, b) {
            return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
        };
        
        this.cross = function(a, b) {
            return [
                a[1] * b[2] - a[2] * b[1],
                a[2] * b[0] - a[0] * b[2],
                a[0] * b[1] - a[1] * b[0]
            ];
        };
        
        this.dot = function(a, b) {
            return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        };
        
        this.renderSimpleHat = function(gl, scene, camera) {
            // Render actual hat geometry based on the scene
            if (!scene || !scene.children || scene.children.length === 0) {
                console.log('No scene or children');
                return;
            }
            
            // Find the hat group (typically the last child)
            const hatGroup = scene.children[scene.children.length - 1];
            if (!hatGroup || !hatGroup.children || hatGroup.children.length === 0) {
                console.log('No hat group or hat children');
                return;
            }
            
            // Get current hat configuration
            const currentConfig = this.getCurrentHatConfig(scene);
            console.log('Rendering hat with config:', currentConfig);
            
            // Create or update hat geometry
            if (!this.hatProgram) {
                this.hatProgram = this.createHatProgram(gl);
                console.log('Created hat program');
            }
            
            if (!this.hatBuffers || this.needsUpdateBuffers) {
                this.hatBuffers = this.createHatGeometry(gl, currentConfig);
                this.needsUpdateBuffers = false;
                console.log('Created hat buffers');
            }
            
            if (this.hatProgram && this.hatBuffers) {
                this.drawHat(gl, this.hatProgram, this.hatBuffers, camera, currentConfig);
            } else {
                console.log('Missing hat program or buffers');
            }
        };
        
        this.getCurrentHatConfig = function(scene) {
            // Extract configuration from scene hierarchy
            const config = {
                type: 'fedora',
                color: '#8B4513',
                crownHeight: 1.0,
                brimSize: 1.0
            };
            
            // Try to get config from the hat group
            if (scene && scene.children && scene.children.length > 0) {
                const hatGroup = scene.children[scene.children.length - 1];
                if (hatGroup && hatGroup.children && hatGroup.children.length > 0) {
                    const hatMesh = hatGroup.children[0];
                    if (hatMesh && hatMesh.material) {
                        config.color = hatMesh.material.color || config.color;
                    }
                }
            }
            
            return config;
        };
        
        this.createHatGeometry = function(gl, config) {
            // Create geometry based on hat type
            const geometry = this.generateHatVertices(config);
            
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.STATIC_DRAW);
            
            const indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);
            
            return {
                position: positionBuffer,
                indices: indexBuffer,
                count: geometry.indices.length
            };
        };
        
        this.generateHatVertices = function(config) {
            // Generate vertices based on hat type - simplified for testing
            const vertices = [];
            const indices = [];
            
            const crownHeight = config.crownHeight || 1.0;
            const brimSize = config.brimSize || 1.0;
            const segments = 8; // Reduced for simplicity
            
            // Create a simple cylindrical crown
            const crownRadius = 0.5;
            
            // Crown vertices - bottom circle
            for (let i = 0; i < segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const x = Math.cos(angle) * crownRadius;
                const z = Math.sin(angle) * crownRadius;
                vertices.push(x, 0, z);
            }
            
            // Crown vertices - top circle
            for (let i = 0; i < segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const x = Math.cos(angle) * crownRadius;
                const z = Math.sin(angle) * crownRadius;
                vertices.push(x, crownHeight, z);
            }
            
            // Crown side faces
            for (let i = 0; i < segments; i++) {
                const current = i;
                const next = (i + 1) % segments;
                const currentTop = i + segments;
                const nextTop = next + segments;
                
                // Two triangles per face
                indices.push(current, next, currentTop);
                indices.push(next, nextTop, currentTop);
            }
            
            // Crown top - center vertex
            const topCenter = vertices.length / 3;
            vertices.push(0, crownHeight, 0);
            
            // Crown top faces
            for (let i = 0; i < segments; i++) {
                const current = i + segments;
                const next = ((i + 1) % segments) + segments;
                indices.push(topCenter, current, next);
            }
            
            // Simple brim
            const brimRadius = crownRadius + brimSize * 0.5;
            const brimY = -0.1;
            
            // Brim vertices - inner circle
            for (let i = 0; i < segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const x = Math.cos(angle) * crownRadius;
                const z = Math.sin(angle) * crownRadius;
                vertices.push(x, brimY, z);
            }
            
            // Brim vertices - outer circle
            for (let i = 0; i < segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const x = Math.cos(angle) * brimRadius;
                const z = Math.sin(angle) * brimRadius;
                vertices.push(x, brimY, z);
            }
            
            // Brim faces
            const brimInnerStart = topCenter + 1;
            const brimOuterStart = brimInnerStart + segments;
            
            for (let i = 0; i < segments; i++) {
                const innerCurrent = brimInnerStart + i;
                const innerNext = brimInnerStart + ((i + 1) % segments);
                const outerCurrent = brimOuterStart + i;
                const outerNext = brimOuterStart + ((i + 1) % segments);
                
                // Two triangles per brim segment
                indices.push(innerCurrent, outerCurrent, innerNext);
                indices.push(innerNext, outerCurrent, outerNext);
            }
            
            console.log('Generated hat vertices:', vertices.length / 3, 'indices:', indices.length);
            
            return {
                vertices: new Float32Array(vertices),
                indices: new Uint16Array(indices)
            };
        };
        
        this.createHatProgram = function(gl) {
            const vertexShaderSource = `
                attribute vec3 a_position;
                uniform mat4 u_matrix;
                varying vec3 v_position;
                varying vec3 v_normal;
                void main() {
                    v_position = a_position;
                    // Calculate normal approximation
                    v_normal = normalize(vec3(a_position.x, 0.0, a_position.z));
                    gl_Position = u_matrix * vec4(a_position, 1.0);
                }
            `;
            
            const fragmentShaderSource = `
                precision mediump float;
                uniform vec3 u_color;
                varying vec3 v_position;
                varying vec3 v_normal;
                void main() {
                    // Lighting calculation
                    vec3 lightDirection = normalize(vec3(0.5, 0.8, 0.6));
                    vec3 ambient = vec3(0.3, 0.3, 0.3);
                    
                    float diffuse = max(dot(v_normal, lightDirection), 0.0);
                    vec3 finalColor = u_color * (ambient + diffuse * 0.7);
                    
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `;
            
            const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
            const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
            
            if (!vertexShader || !fragmentShader) {
                return null;
            }
            
            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error('Failed to link hat program:', gl.getProgramInfoLog(program));
                return null;
            }
            
            return program;
        };
        
        this.setupHatBuffers = function(gl, vertices, indices) {
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            
            const indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
            
            return { position: positionBuffer, indices: indexBuffer };
        };
        
        this.drawHat = function(gl, program, buffers, camera, config) {
            gl.useProgram(program);
            
            // Set up matrices for 3D rendering
            const matrices = this.createViewMatrices(camera);
            const mvpMatrix = this.multiplyMatrices(matrices.perspective, matrices.view);
            
            // Set uniforms
            const matrixLocation = gl.getUniformLocation(program, 'u_matrix');
            gl.uniformMatrix4fv(matrixLocation, false, new Float32Array(mvpMatrix));
            
            // Set color
            const colorLocation = gl.getUniformLocation(program, 'u_color');
            const hatColor = this.hexToRgb(config.color || '#8B4513');
            gl.uniform3fv(colorLocation, [hatColor.r, hatColor.g, hatColor.b]);
            
            // Set up vertex attributes
            const positionLocation = gl.getAttribLocation(program, 'a_position');
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(positionLocation);
            
            // Draw
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
            gl.drawElements(gl.TRIANGLES, buffers.count, gl.UNSIGNED_SHORT, 0);
        };
        
        this.hexToRgb = function(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16) / 255,
                g: parseInt(result[2], 16) / 255,
                b: parseInt(result[3], 16) / 255
            } : { r: 0.5, g: 0.3, b: 0.1 };
        };
        
        this.setupHatBuffers = function(gl, vertices, indices) {
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            
            const indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
            
            return { position: positionBuffer, indices: indexBuffer };
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
        
        // Mouse state
        this.isMouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.rotationX = 0;
        this.rotationY = 0;
        this.distance = 3; // Reduce distance to get closer to the hat
        
        // Add mouse event listeners
        this.domElement.addEventListener('mousedown', (e) => {
            this.isMouseDown = true;
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        this.domElement.addEventListener('mousemove', (e) => {
            if (!this.isMouseDown) return;
            
            const deltaX = e.clientX - this.mouseX;
            const deltaY = e.clientY - this.mouseY;
            
            this.rotationY += deltaX * 0.01;
            this.rotationX += deltaY * 0.01;
            
            // Clamp vertical rotation
            this.rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotationX));
            
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        this.domElement.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });
        
        this.domElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY * 0.01;
            this.distance += delta;
            this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance));
        });
        
        this.update = function() {
            // Update camera position based on rotation and distance
            const x = Math.sin(this.rotationY) * Math.cos(this.rotationX) * this.distance;
            const y = Math.sin(this.rotationX) * this.distance + 1; // Lower the camera Y offset
            const z = Math.cos(this.rotationY) * Math.cos(this.rotationX) * this.distance;
            
            this.camera.position.set(x, y, z);
        };
        
        this.dispose = function() {
            // Remove event listeners
            this.domElement.removeEventListener('mousedown', this.onMouseDown);
            this.domElement.removeEventListener('mousemove', this.onMouseMove);
            this.domElement.removeEventListener('mouseup', this.onMouseUp);
            this.domElement.removeEventListener('wheel', this.onWheel);
        };
    },
    
    // GridHelper class for floor reference
    GridHelper: function(size, divisions) {
        this.size = size || 10;
        this.divisions = divisions || 10;
        this.position = { x: 0, y: 0, z: 0, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; } };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.scale = { x: 1, y: 1, z: 1 };
        this.isGridHelper = true;
    }
};

console.log('Minimal THREE.js implementation loaded');