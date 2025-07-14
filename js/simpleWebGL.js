// Simplified Three.js implementation for Hat Configurator
// This is a minimal WebGL implementation without external dependencies

class SimpleWebGL {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        this.scene = {};
        this.camera = {};
        this.renderer = {};
        this.meshes = [];
        this.materials = [];
        this.rotation = 0;
        
        if (!this.gl) {
            throw new Error('WebGL not supported');
        }
        
        this.init();
    }
    
    init() {
        const gl = this.gl;
        
        console.log('WebGL context initialized');
        console.log('Canvas dimensions:', this.canvas.width, 'x', this.canvas.height);
        console.log('WebGL version:', gl.getParameter(gl.VERSION));
        console.log('WebGL vendor:', gl.getParameter(gl.VENDOR));
        console.log('WebGL renderer:', gl.getParameter(gl.RENDERER));
        
        // Basic vertex shader
        const vertexShaderSource = `
            attribute vec4 a_position;
            attribute vec3 a_normal;
            
            uniform mat4 u_matrix;
            uniform mat4 u_normalMatrix;
            uniform vec3 u_lightDirection;
            
            varying vec3 v_normal;
            varying float v_lighting;
            
            void main() {
                gl_Position = u_matrix * a_position;
                v_normal = normalize((u_normalMatrix * vec4(a_normal, 0.0)).xyz);
                v_lighting = max(dot(v_normal, normalize(u_lightDirection)), 0.0);
            }
        `;
        
        // Basic fragment shader
        const fragmentShaderSource = `
            precision mediump float;
            
            uniform vec3 u_color;
            varying float v_lighting;
            
            void main() {
                vec3 color = u_color * (v_lighting * 0.8 + 0.2);
                gl_FragColor = vec4(color, 1.0);
            }
        `;
        
        this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);
        
        if (!this.program) {
            throw new Error('Failed to create shader program');
        }
        
        // Set up viewport
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);  // Disable face culling to see if that's the issue
        
        console.log('WebGL viewport set to:', this.canvas.width, 'x', this.canvas.height);
        
        this.setupUniforms();
    }
    
    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    createProgram(vertexShaderSource, fragmentShaderSource) {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program linking error:', this.gl.getProgramInfoLog(program));
            return null;
        }
        
        return program;
    }
    
    setupUniforms() {
        this.uniforms = {
            matrix: this.gl.getUniformLocation(this.program, 'u_matrix'),
            normalMatrix: this.gl.getUniformLocation(this.program, 'u_normalMatrix'),
            lightDirection: this.gl.getUniformLocation(this.program, 'u_lightDirection'),
            color: this.gl.getUniformLocation(this.program, 'u_color')
        };
        
        this.attributes = {
            position: this.gl.getAttribLocation(this.program, 'a_position'),
            normal: this.gl.getAttribLocation(this.program, 'a_normal'),
            texCoord: this.gl.getAttribLocation(this.program, 'a_texCoord')
        };
    }
    
    createHatGeometry(type, crownHeight, brimSize, color) {
        console.log('Creating hat geometry:', type, crownHeight, brimSize);
        
        // Create a simple test triangle to debug rendering
        const testGeometry = {
            vertices: [
                0.0, 0.5, 0.0,   // Top vertex
                -0.5, -0.5, 0.0, // Bottom left
                0.5, -0.5, 0.0   // Bottom right
            ],
            normals: [
                0.0, 0.0, 1.0,   // Top vertex normal
                0.0, 0.0, 1.0,   // Bottom left normal
                0.0, 0.0, 1.0    // Bottom right normal
            ],
            indices: [
                0, 1, 2  // Single triangle
            ]
        };
        
        console.log('Using test triangle geometry for debugging');
        const mesh = this.createMesh(testGeometry, color);
        console.log('Created test triangle mesh with', testGeometry.vertices.length / 3, 'vertices and', testGeometry.indices.length, 'indices');
        return mesh;
    }
    
    generateHatVertices(type, crownHeight, brimSize) {
        const vertices = [];
        const normals = [];
        const indices = [];
        
        // Generate vertices based on hat type
        switch (type) {
            case 'fedora':
                return this.generateFedoraVertices(crownHeight, brimSize);
            case 'bowler':
                return this.generateBowlerVertices(crownHeight, brimSize);
            case 'baseball':
                return this.generateBaseballVertices(crownHeight, brimSize);
            case 'beanie':
                return this.generateBeanieVertices(crownHeight, brimSize);
            case 'tophat':
                return this.generateTopHatVertices(crownHeight, brimSize);
            default:
                return this.generateFedoraVertices(crownHeight, brimSize);
        }
    }
    
    generateFedoraVertices(crownHeight, brimSize) {
        console.log('Generating fedora vertices:', crownHeight, brimSize);
        
        const vertices = [];
        const normals = [];
        const indices = [];
        
        const segments = 32;
        const crownRadius = 0.8;
        const brimRadius = crownRadius + brimSize;
        
        let vertexIndex = 0;
        
        // Crown center vertices
        // Bottom crown center
        vertices.push(0, 0, 0);
        normals.push(0, -1, 0);
        const bottomCenterIndex = vertexIndex++;
        
        // Top crown center  
        vertices.push(0, crownHeight, 0);
        normals.push(0, 1, 0);
        const topCenterIndex = vertexIndex++;
        
        // Crown edge vertices (bottom and top)
        const crownBottomStart = vertexIndex;
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * crownRadius;
            const z = Math.sin(angle) * crownRadius;
            
            // Bottom crown edge
            vertices.push(x, 0, z);
            normals.push(0, -1, 0);
            vertexIndex++;
            
            // Top crown edge
            vertices.push(x, crownHeight, z);
            normals.push(0, 1, 0);
            vertexIndex++;
        }
        
        // Crown side vertices (for proper side normals)
        const crownSideStart = vertexIndex;
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * crownRadius;
            const z = Math.sin(angle) * crownRadius;
            const normalX = Math.cos(angle);
            const normalZ = Math.sin(angle);
            
            // Bottom crown side
            vertices.push(x, 0, z);
            normals.push(normalX, 0, normalZ);
            vertexIndex++;
            
            // Top crown side
            vertices.push(x, crownHeight, z);
            normals.push(normalX, 0, normalZ);
            vertexIndex++;
        }
        
        // Brim vertices (inner and outer edges)
        const brimInnerStart = vertexIndex;
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * crownRadius;
            const z = Math.sin(angle) * crownRadius;
            
            // Inner brim edge
            vertices.push(x, 0, z);
            normals.push(0, 1, 0);
            vertexIndex++;
        }
        
        const brimOuterStart = vertexIndex;
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * brimRadius;
            const z = Math.sin(angle) * brimRadius;
            
            // Outer brim edge
            vertices.push(x, 0, z);
            normals.push(0, 1, 0);
            vertexIndex++;
        }
        
        // Generate indices
        
        // Crown bottom faces (triangle fan from center)
        for (let i = 0; i < segments; i++) {
            const current = crownBottomStart + i * 2;
            const next = crownBottomStart + ((i + 1) % segments) * 2;
            
            indices.push(bottomCenterIndex, next, current);
        }
        
        // Crown top faces (triangle fan from center)
        for (let i = 0; i < segments; i++) {
            const current = crownBottomStart + i * 2 + 1;
            const next = crownBottomStart + ((i + 1) % segments) * 2 + 1;
            
            indices.push(topCenterIndex, current, next);
        }
        
        // Crown side faces
        for (let i = 0; i < segments; i++) {
            const currentBottom = crownSideStart + i * 2;
            const currentTop = crownSideStart + i * 2 + 1;
            const nextBottom = crownSideStart + ((i + 1) % segments) * 2;
            const nextTop = crownSideStart + ((i + 1) % segments) * 2 + 1;
            
            // Two triangles per side face
            indices.push(currentBottom, currentTop, nextBottom);
            indices.push(currentTop, nextTop, nextBottom);
        }
        
        // Brim faces
        for (let i = 0; i < segments; i++) {
            const currentInner = brimInnerStart + i;
            const currentOuter = brimOuterStart + i;
            const nextInner = brimInnerStart + ((i + 1) % segments);
            const nextOuter = brimOuterStart + ((i + 1) % segments);
            
            // Two triangles per brim segment
            indices.push(currentInner, currentOuter, nextInner);
            indices.push(currentOuter, nextOuter, nextInner);
        }
        
        console.log('Generated vertices:', vertices.length, 'normals:', normals.length, 'indices:', indices.length);
        
        return { vertices, normals, indices };
    }
    
    generateBowlerVertices(crownHeight, brimSize) {
        // Simplified bowler hat geometry
        return this.generateFedoraVertices(crownHeight * 0.8, brimSize * 0.8);
    }
    
    generateBaseballVertices(crownHeight, brimSize) {
        // Simplified baseball cap geometry
        return this.generateFedoraVertices(crownHeight * 0.9, brimSize * 0.6);
    }
    
    generateBeanieVertices(crownHeight, brimSize) {
        // Simplified beanie geometry
        return this.generateFedoraVertices(crownHeight * 1.2, brimSize * 0.1);
    }
    
    generateTopHatVertices(crownHeight, brimSize) {
        // Simplified top hat geometry
        return this.generateFedoraVertices(crownHeight * 1.5, brimSize * 1.2);
    }
    
    createMesh(geometry, color) {
        const gl = this.gl;
        
        // Debug: Log vertex bounds
        const vertices = geometry.vertices;
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];
            const z = vertices[i + 2];
            
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            minZ = Math.min(minZ, z);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
            maxZ = Math.max(maxZ, z);
        }
        
        console.log('Geometry bounds:', {
            x: [minX, maxX],
            y: [minY, maxY],
            z: [minZ, maxZ]
        });
        
        // Debug: Check if geometry is reasonable size
        const sizeX = maxX - minX;
        const sizeY = maxY - minY;
        const sizeZ = maxZ - minZ;
        console.log('Geometry size:', { x: sizeX, y: sizeY, z: sizeZ });
        
        // Check if geometry is centered around origin
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const centerZ = (minZ + maxZ) / 2;
        console.log('Geometry center:', { x: centerX, y: centerY, z: centerZ });
        
        // Create buffers
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.vertices), gl.STATIC_DRAW);
        
        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.normals), gl.STATIC_DRAW);
        
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry.indices), gl.STATIC_DRAW);
        
        return {
            positionBuffer,
            normalBuffer,
            indexBuffer,
            indexCount: geometry.indices.length,
            color: color || [0.5, 0.3, 0.1]
        };
    }
    
    render(mesh, time) {
        const gl = this.gl;
        
        // Clear canvas
        gl.clearColor(0.94, 0.94, 0.94, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        if (!mesh) {
            console.log('No mesh to render');
            return;
        }
        
        // Use shader program
        gl.useProgram(this.program);
        
        // Set up matrices
        const aspect = this.canvas.width / this.canvas.height;
        const fieldOfView = Math.PI / 4;
        const near = 0.1;
        const far = 100.0;
        
        const projectionMatrix = this.createPerspectiveMatrix(fieldOfView, aspect, near, far);
        const modelViewMatrix = this.createModelViewMatrix(time);
        const normalMatrix = this.createNormalMatrix(modelViewMatrix);
        
        const mvpMatrix = this.multiplyMatrices(projectionMatrix, modelViewMatrix);
        
        // Debug: Log matrices occasionally
        if (Math.floor(time) % 3 === 0 && Math.floor(time * 10) % 10 === 0) {
            console.log('Projection Matrix:', Array.from(projectionMatrix));
            console.log('ModelView Matrix:', Array.from(modelViewMatrix));
            console.log('MVP Matrix:', Array.from(mvpMatrix));
            console.log('Mesh index count:', mesh.indexCount);
            console.log('Mesh color:', mesh.color);
            console.log('Canvas dimensions:', this.canvas.width, 'x', this.canvas.height);
            console.log('Viewport:', gl.getParameter(gl.VIEWPORT));
        }
        
        // Set uniforms
        gl.uniformMatrix4fv(this.uniforms.matrix, false, mvpMatrix);
        gl.uniformMatrix4fv(this.uniforms.normalMatrix, false, normalMatrix);
        gl.uniform3fv(this.uniforms.lightDirection, [0.5, 0.7, 0.5]);
        gl.uniform3fv(this.uniforms.color, mesh.color);
        
        // Check for errors after setting uniforms
        let error = gl.getError();
        if (error !== gl.NO_ERROR) {
            console.error('WebGL error after setting uniforms:', error);
        }
        
        // Bind position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.positionBuffer);
        gl.vertexAttribPointer(this.attributes.position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.attributes.position);
        
        // Bind normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
        gl.vertexAttribPointer(this.attributes.normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.attributes.normal);
        
        // Check for errors after binding attributes
        error = gl.getError();
        if (error !== gl.NO_ERROR) {
            console.error('WebGL error after binding attributes:', error);
        }
        
        // Bind index buffer and draw
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
        gl.drawElements(gl.TRIANGLES, mesh.indexCount, gl.UNSIGNED_SHORT, 0);
        
        // Check for errors after drawing
        error = gl.getError();
        if (error !== gl.NO_ERROR) {
            console.error('WebGL error after drawing:', error);
            if (error === gl.INVALID_OPERATION) {
                console.error('INVALID_OPERATION: Check if uniforms are set correctly');
            } else if (error === gl.INVALID_VALUE) {
                console.error('INVALID_VALUE: Check buffer sizes and attribute locations');
            }
        } else {
            // Success - log occasionally for debugging
            if (Math.floor(time) % 5 === 0 && Math.floor(time * 10) % 10 === 0) {
                console.log('Drawing successful - rendered', mesh.indexCount, 'triangles');
            }
        }
    }
    
    createPerspectiveMatrix(fieldOfView, aspect, near, far) {
        const f = 1.0 / Math.tan(fieldOfView / 2);
        const rangeInv = 1.0 / (near - far);
        
        return new Float32Array([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ]);
    }
    
    createModelViewMatrix(time) {
        // Very simple camera - just move back on Z axis
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, -3, 1  // Camera positioned at z=-3 looking towards origin
        ]);
    }
    
    createLookAtMatrix(cameraPos, target, up) {
        const [eyeX, eyeY, eyeZ] = cameraPos;
        const [centerX, centerY, centerZ] = target;
        const [upX, upY, upZ] = up;
        
        // Calculate forward vector (from eye to target)
        const fx = centerX - eyeX;
        const fy = centerY - eyeY;
        const fz = centerZ - eyeZ;
        
        // Normalize forward vector
        const fLength = Math.sqrt(fx * fx + fy * fy + fz * fz);
        const forwardX = fx / fLength;
        const forwardY = fy / fLength;
        const forwardZ = fz / fLength;
        
        // Calculate right vector (cross product of forward and up)
        const rightX = forwardY * upZ - forwardZ * upY;
        const rightY = forwardZ * upX - forwardX * upZ;
        const rightZ = forwardX * upY - forwardY * upX;
        
        // Normalize right vector
        const rLength = Math.sqrt(rightX * rightX + rightY * rightY + rightZ * rightZ);
        const normalizedRightX = rightX / rLength;
        const normalizedRightY = rightY / rLength;
        const normalizedRightZ = rightZ / rLength;
        
        // Calculate up vector (cross product of right and forward)
        const upNewX = normalizedRightY * forwardZ - normalizedRightZ * forwardY;
        const upNewY = normalizedRightZ * forwardX - normalizedRightX * forwardZ;
        const upNewZ = normalizedRightX * forwardY - normalizedRightY * forwardX;
        
        // Create look-at matrix
        return new Float32Array([
            normalizedRightX, upNewX, -forwardX, 0,
            normalizedRightY, upNewY, -forwardY, 0,
            normalizedRightZ, upNewZ, -forwardZ, 0,
            -(normalizedRightX * eyeX + normalizedRightY * eyeY + normalizedRightZ * eyeZ),
            -(upNewX * eyeX + upNewY * eyeY + upNewZ * eyeZ),
            -(-forwardX * eyeX + -forwardY * eyeY + -forwardZ * eyeZ),
            1
        ]);
    }

    createRotationMatrix(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        return new Float32Array([
            cos, 0, sin, 0,
            0, 1, 0, 0,
            -sin, 0, cos, 0,
            0, 0, 0, 1
        ]);
    }
    
    createNormalMatrix(modelViewMatrix) {
        // Extract the 3x3 rotation part and transpose it for normal transformation
        const m = modelViewMatrix;
        return new Float32Array([
            m[0], m[4], m[8], 0,
            m[1], m[5], m[9], 0,
            m[2], m[6], m[10], 0,
            0, 0, 0, 1
        ]);
    }
    
    multiplyMatrices(a, b) {
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
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255
        ] : [0.5, 0.3, 0.1];
    }
    
    updateRotation(delta) {
        this.rotation += delta;
    }
    
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.gl.viewport(0, 0, width, height);
    }
}