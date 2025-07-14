// Hat geometry generation for 3D Hat Configurator
class HatGeometry {
    constructor() {
        this.geometries = {};
    }
    
    // Generate fedora hat geometry
    generateFedora(crownHeight, brimSize) {
        const group = new THREE.Group();
        
        // Crown geometry
        const crownGeometry = new THREE.CylinderGeometry(
            0.8, 0.9, crownHeight, CONFIG.GEOMETRY.segments
        );
        const crown = new THREE.Mesh(crownGeometry);
        crown.position.y = crownHeight / 2;
        group.add(crown);
        
        // Crown top
        const crownTopGeometry = new THREE.CylinderGeometry(
            0.8, 0.8, 0.1, CONFIG.GEOMETRY.segments
        );
        const crownTop = new THREE.Mesh(crownTopGeometry);
        crownTop.position.y = crownHeight + 0.05;
        group.add(crownTop);
        
        // Brim geometry
        const brimGeometry = new THREE.RingGeometry(
            0.9, 0.9 + brimSize, CONFIG.GEOMETRY.brimSegments
        );
        const brim = new THREE.Mesh(brimGeometry);
        brim.rotation.x = -Math.PI / 2;
        brim.position.y = -0.05;
        group.add(brim);
        
        // Add slight curve to brim
        const brimCurve = new THREE.CylinderGeometry(
            0.9 + brimSize, 0.9 + brimSize, 0.02, CONFIG.GEOMETRY.brimSegments
        );
        const brimCurveTop = new THREE.Mesh(brimCurve);
        brimCurveTop.position.y = -0.04;
        group.add(brimCurveTop);
        
        return group;
    }
    
    // Generate bowler hat geometry
    generateBowler(crownHeight, brimSize) {
        const group = new THREE.Group();
        
        // Crown geometry (dome-shaped)
        const crownGeometry = new THREE.SphereGeometry(
            0.8, CONFIG.GEOMETRY.segments, CONFIG.GEOMETRY.crownSegments, 0, Math.PI * 2, 0, Math.PI / 2
        );
        const crown = new THREE.Mesh(crownGeometry);
        crown.scale.y = crownHeight;
        crown.position.y = crownHeight * 0.4;
        group.add(crown);
        
        // Brim geometry (curved)
        const brimGeometry = new THREE.TorusGeometry(
            0.9 + brimSize / 2, 0.05, 8, CONFIG.GEOMETRY.brimSegments
        );
        const brim = new THREE.Mesh(brimGeometry);
        brim.position.y = -0.05;
        group.add(brim);
        
        // Create curved brim surface
        const brimCurveGeometry = new THREE.RingGeometry(
            0.8, 0.9 + brimSize, CONFIG.GEOMETRY.brimSegments
        );
        const brimCurve = new THREE.Mesh(brimCurveGeometry);
        brimCurve.rotation.x = -Math.PI / 2;
        brimCurve.position.y = -0.02;
        
        // Apply curve to brim
        const positions = brimCurve.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2];
            const distance = Math.sqrt(x * x + z * z);
            const curveAmount = Math.max(0, distance - 0.8) * 0.3;
            positions[i + 1] = -curveAmount;
        }
        brimCurve.geometry.attributes.position.needsUpdate = true;
        brimCurve.geometry.computeVertexNormals();
        
        group.add(brimCurve);
        
        return group;
    }
    
    // Generate baseball cap geometry
    generateBaseball(crownHeight, brimSize) {
        const group = new THREE.Group();
        
        // Crown geometry (rounded)
        const crownGeometry = new THREE.SphereGeometry(
            0.8, CONFIG.GEOMETRY.segments, CONFIG.GEOMETRY.crownSegments, 0, Math.PI * 2, 0, Math.PI / 2
        );
        const crown = new THREE.Mesh(crownGeometry);
        crown.scale.y = crownHeight;
        crown.position.y = crownHeight * 0.4;
        group.add(crown);
        
        // Visor geometry
        const visorGeometry = new THREE.CylinderGeometry(
            0.02, 0.05, brimSize, CONFIG.GEOMETRY.segments, 1, false, 0, Math.PI
        );
        const visor = new THREE.Mesh(visorGeometry);
        visor.rotation.x = Math.PI / 2;
        visor.rotation.z = Math.PI / 2;
        visor.position.set(0, 0, 0.8 + brimSize / 2);
        group.add(visor);
        
        // Visor surface
        const visorSurfaceGeometry = new THREE.PlaneGeometry(1.6, brimSize);
        const visorSurface = new THREE.Mesh(visorSurfaceGeometry);
        visorSurface.rotation.x = -Math.PI / 2;
        visorSurface.rotation.z = Math.PI / 2;
        visorSurface.position.set(0, -0.02, 0.8 + brimSize / 2);
        
        // Apply curve to visor
        const positions = visorSurface.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const curveAmount = Math.abs(x) * 0.1;
            positions[i + 1] = -curveAmount;
        }
        visorSurface.geometry.attributes.position.needsUpdate = true;
        visorSurface.geometry.computeVertexNormals();
        
        group.add(visorSurface);
        
        return group;
    }
    
    // Generate beanie geometry
    generateBeanie(crownHeight, brimSize) {
        const group = new THREE.Group();
        
        // Crown geometry (soft, slouchy)
        const crownGeometry = new THREE.SphereGeometry(
            0.8, CONFIG.GEOMETRY.segments, CONFIG.GEOMETRY.crownSegments
        );
        const crown = new THREE.Mesh(crownGeometry);
        crown.scale.y = crownHeight;
        crown.position.y = crownHeight * 0.4;
        
        // Add some deformation for soft look
        const positions = crown.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];
            const noise = (Math.sin(x * 5) + Math.cos(z * 5)) * 0.02;
            positions[i] += noise;
            positions[i + 1] += noise;
            positions[i + 2] += noise;
        }
        crown.geometry.attributes.position.needsUpdate = true;
        crown.geometry.computeVertexNormals();
        
        group.add(crown);
        
        // Small fold at bottom (if brimSize > 0)
        if (brimSize > 0) {
            const foldGeometry = new THREE.TorusGeometry(
                0.8, 0.05, 8, CONFIG.GEOMETRY.segments
            );
            const fold = new THREE.Mesh(foldGeometry);
            fold.position.y = -0.05;
            fold.scale.x = 1 + brimSize;
            fold.scale.z = 1 + brimSize;
            group.add(fold);
        }
        
        return group;
    }
    
    // Generate top hat geometry
    generateTopHat(crownHeight, brimSize) {
        const group = new THREE.Group();
        
        // Crown geometry (tall cylinder)
        const crownGeometry = new THREE.CylinderGeometry(
            0.7, 0.8, crownHeight, CONFIG.GEOMETRY.segments
        );
        const crown = new THREE.Mesh(crownGeometry);
        crown.position.y = crownHeight / 2;
        group.add(crown);
        
        // Crown top
        const crownTopGeometry = new THREE.CylinderGeometry(
            0.7, 0.7, 0.05, CONFIG.GEOMETRY.segments
        );
        const crownTop = new THREE.Mesh(crownTopGeometry);
        crownTop.position.y = crownHeight + 0.025;
        group.add(crownTop);
        
        // Brim geometry (flat, wide)
        const brimGeometry = new THREE.CylinderGeometry(
            0.8 + brimSize, 0.8 + brimSize, 0.05, CONFIG.GEOMETRY.brimSegments
        );
        const brim = new THREE.Mesh(brimGeometry);
        brim.position.y = -0.025;
        group.add(brim);
        
        // Brim edge
        const brimEdgeGeometry = new THREE.TorusGeometry(
            0.8 + brimSize, 0.02, 8, CONFIG.GEOMETRY.brimSegments
        );
        const brimEdge = new THREE.Mesh(brimEdgeGeometry);
        brimEdge.position.y = -0.025;
        group.add(brimEdge);
        
        return group;
    }
    
    // Main function to generate hat geometry
    generateHat(type, crownHeight, brimSize) {
        let hatGroup;
        
        switch (type) {
            case 'fedora':
                hatGroup = this.generateFedora(crownHeight, brimSize);
                break;
            case 'bowler':
                hatGroup = this.generateBowler(crownHeight, brimSize);
                break;
            case 'baseball':
                hatGroup = this.generateBaseball(crownHeight, brimSize);
                break;
            case 'beanie':
                hatGroup = this.generateBeanie(crownHeight, brimSize);
                break;
            case 'tophat':
                hatGroup = this.generateTopHat(crownHeight, brimSize);
                break;
            default:
                hatGroup = this.generateFedora(crownHeight, brimSize);
        }
        
        return hatGroup;
    }
    
    // Apply material to all hat meshes
    applyMaterial(hatGroup, material) {
        hatGroup.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = material;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }
    
    // Create hat material
    createHatMaterial(color, type = 'hat') {
        const materialConfig = CONFIG.MATERIALS[type] || CONFIG.MATERIALS.hat;
        
        return new THREE.MeshStandardMaterial({
            color: color,
            roughness: materialConfig.roughness,
            metalness: materialConfig.metalness,
            envMapIntensity: materialConfig.envMapIntensity
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HatGeometry;
}