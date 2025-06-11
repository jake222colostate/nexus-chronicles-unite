
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Tree model URLs - Prioritize fastest loading models
export const TREE_MODELS = {
  // Use local assets for faster loading
  realistic: '/assets/realistic_tree.glb',
  stylized: '/assets/stylized_tree.glb',
  pine218: '/assets/pine_tree_218poly.glb'
} as const;

// OPTIMIZED distribution to favor lighter models
export const TREE_DISTRIBUTION = {
  pine218: 0.8,   // 80% pine_tree_218poly (lightest model)
  stylized: 0.15, // 15% stylized
  realistic: 0.05 // 5% realistic (heaviest model)
} as const;

// Reduced scale ranges for better performance
export const TREE_SCALES = {
  realistic: { min: 0.6, max: 0.8 },  // Smaller range
  stylized: { min: 0.7, max: 0.9 },   // Smaller range
  pine218: { min: 0.4, max: 0.7 }     // Smaller range
} as const;

// Y-offset adjustments for proper alignment
export const TREE_Y_OFFSETS = {
  realistic: 0,
  stylized: -0.1,
  pine218: 0
} as const;

interface CachedTreeModel {
  scene: THREE.Object3D;
  loaded: boolean;
  error?: Error;
}

class TreeAssetManagerSingleton {
  private cache = new Map<string, CachedTreeModel>();
  private preloadPromises = new Map<string, Promise<void>>();
  private instancedMeshes = new Map<string, THREE.InstancedMesh>();

  async preloadAllModels(): Promise<void> {
    console.log('TreeAssetManager: Fast preload with performance priority...');
    
    // Load only pine218 initially for fastest startup
    const criticalModel = 'pine218';
    if (!this.preloadPromises.has(criticalModel)) {
      const promise = this.preloadModel(criticalModel, TREE_MODELS[criticalModel]);
      this.preloadPromises.set(criticalModel, promise);
      await promise; // Wait for critical model
    }
    
    // Load other models in background
    const backgroundModels = ['stylized', 'realistic'] as const;
    backgroundModels.forEach(type => {
      if (!this.preloadPromises.has(type)) {
        const promise = this.preloadModel(type, TREE_MODELS[type]);
        this.preloadPromises.set(type, promise);
        // Don't await - load in background
      }
    });
    
    console.log('TreeAssetManager: Critical model loaded, others loading in background');
  }

  private async preloadModel(type: keyof typeof TREE_MODELS, url: string): Promise<void> {
    try {
      const gltf = await new Promise<any>((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(url, resolve, undefined, reject);
      });

      if (gltf?.scene) {
        // AGGRESSIVE optimization for performance
        this.optimizeForPerformance(gltf.scene);
        
        this.cache.set(type, {
          scene: gltf.scene,
          loaded: true
        });
        console.log(`TreeAssetManager: Optimized ${type} model for 60fps`);
      }
    } catch (error) {
      console.warn(`TreeAssetManager: Failed to preload ${type}, using lightweight fallback`);
      this.cache.set(type, {
        scene: this.createLightweightFallback(type),
        loaded: false,
        error: error as Error
      });
    }
  }

  private optimizeForPerformance(model: THREE.Object3D): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // PERFORMANCE: Disable expensive features
        child.castShadow = false;     // Major performance gain
        child.receiveShadow = false;  // Major performance gain
        child.frustumCulled = true;   // Enable culling for performance
        
        // Optimize geometry
        if (child.geometry) {
          // Reduce geometry complexity if needed
          child.geometry.deleteAttribute('uv2');
          child.geometry.deleteAttribute('normal'); // Let Three.js compute normals
          child.geometry.computeVertexNormals();
        }
        
        // Optimize materials for performance
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => this.optimizeMaterial(mat));
          } else {
            this.optimizeMaterial(child.material);
          }
        }
      }
    });
  }

  private optimizeMaterial(material: THREE.Material): void {
    // PERFORMANCE: Use fastest material settings
    material.transparent = false;
    material.opacity = 1.0;
    material.needsUpdate = false; // Prevent unnecessary updates
    
    // Use fastest rendering mode
    if (material instanceof THREE.MeshStandardMaterial) {
      material.roughness = 0.8;
      material.metalness = 0.0;
      material.envMapIntensity = 0; // Disable env mapping for performance
    }
    
    if (material instanceof THREE.MeshLambertMaterial) {
      material.combine = THREE.MixOperation; // Fastest combine mode
    }
  }

  private createLightweightFallback(type: keyof typeof TREE_MODELS): THREE.Object3D {
    const group = new THREE.Group();
    
    // ULTRA lightweight fallback geometry
    const trunkGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.6, 6); // Reduced segments
    const canopyGeometry = type === 'pine218' 
      ? new THREE.ConeGeometry(0.3, 0.8, 6)     // Reduced segments
      : new THREE.SphereGeometry(0.4, 8, 6);    // Reduced segments
    
    // Use basic materials for best performance
    const trunkMaterial = new THREE.MeshBasicMaterial({ color: '#8B4513' });
    const canopyMaterial = new THREE.MeshBasicMaterial({ 
      color: type === 'pine218' ? '#013220' : '#228B22' 
    });
    
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 0.3;
    
    const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
    canopy.position.y = type === 'pine218' ? 0.9 : 0.8;
    
    group.add(trunk, canopy);
    return group;
  }

  getCachedModel(type: keyof typeof TREE_MODELS): THREE.Object3D | null {
    const cached = this.cache.get(type);
    if (cached?.scene) {
      return cached.scene.clone();
    }
    return null;
  }

  isModelLoaded(type: keyof typeof TREE_MODELS): boolean {
    return this.cache.get(type)?.loaded === true;
  }

  clearCache(): void {
    this.cache.clear();
    this.preloadPromises.clear();
    this.instancedMeshes.clear();
    
    Object.values(TREE_MODELS).forEach(url => {
      useGLTF.clear(url);
    });
  }

  getStats() {
    const loaded = Array.from(this.cache.values()).filter(c => c.loaded).length;
    const total = Object.keys(TREE_MODELS).length;
    return { loaded, total, cached: this.cache.size };
  }
}

export const TreeAssetManager = new TreeAssetManagerSingleton();

// Start preloading immediately for faster startup
TreeAssetManager.preloadAllModels().catch(error => {
  console.warn('TreeAssetManager: Fast preload failed, using fallbacks');
});
