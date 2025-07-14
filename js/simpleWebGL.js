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
        
        // Basic vertex shader
        const vertexShaderSource = `
            attribute vec4 a_position;
            attribute vec3 a_normal;
            attribute vec2 a_texCoord;
            
            uniform mat4 u_matrix;
            uniform mat4 u_normalMatrix;
            uniform vec3 u_lightDirection;
            
            varying vec3 v_normal;
            varying vec2 v_texCoord;
            varying float v_lighting;
            
            void main() {
                gl_Position = u_matrix * a_position;
                v_normal = mat3(u_normalMatrix) * a_normal;
                v_texCoord = a_texCoord;
                v_lighting = max(dot(normalize(v_normal), u_lightDirection), 0.0);
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
        
        // Set up viewport
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        
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
        const geometry = this.generateHatVertices(type, crownHeight, brimSize);
        const mesh = this.createMesh(geometry, color);
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
        const vertices = [];
        const normals = [];
        const indices = [];
        
        const segments = 32;
        const crownRadius = 0.8;
        const brimRadius = crownRadius + brimSize;
        
        // Crown vertices
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * crownRadius;
            const z = Math.sin(angle) * crownRadius;
            
            // Bottom crown
            vertices.push(x, 0, z);
            normals.push(x, 0, z);
            
            // Top crown
            vertices.push(x, crownHeight, z);
            normals.push(x, 0, z);
        }
        
        // Brim vertices
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * brimRadius;
            const z = Math.sin(angle) * brimRadius;
            
            vertices.push(x, 0, z);
            normals.push(0, 1, 0);
        }
        
        // Generate indices
        for (let i = 0; i < segments; i++) {
            const base = i * 2;
            const next = ((i + 1) % segments) * 2;
            
            // Crown side faces
            indices.push(base, base + 1, next);
            indices.push(base + 1, next + 1, next);
        }
        
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
        
        // Set uniforms
        gl.uniformMatrix4fv(this.uniforms.matrix, false, mvpMatrix);
        gl.uniformMatrix4fv(this.uniforms.normalMatrix, false, normalMatrix);
        gl.uniform3fv(this.uniforms.lightDirection, [0.5, 0.7, 0.5]);
        gl.uniform3fv(this.uniforms.color, mesh.color);
        
        // Bind position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.positionBuffer);
        gl.vertexAttribPointer(this.attributes.position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.attributes.position);
        
        // Bind normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
        gl.vertexAttribPointer(this.attributes.normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.attributes.normal);
        
        // Bind index buffer and draw
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
        gl.drawElements(gl.TRIANGLES, mesh.indexCount, gl.UNSIGNED_SHORT, 0);
    }
    
    createPerspectiveMatrix(fieldOfView, aspect, near, far) {
        const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfView);
        const rangeInv = 1.0 / (near - far);
        
        return new Float32Array([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ]);
    }
    
    createModelViewMatrix(time) {
        const matrix = new Float32Array(16);
        
        // Identity matrix
        matrix[0] = 1; matrix[5] = 1; matrix[10] = 1; matrix[15] = 1;
        
        // Translate
        matrix[12] = 0; // x
        matrix[13] = -0.5; // y
        matrix[14] = -5; // z
        
        // Apply rotation
        const rotationMatrix = this.createRotationMatrix(this.rotation);
        return this.multiplyMatrices(matrix, rotationMatrix);
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
        // Simplified normal matrix (just return identity for now)
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
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