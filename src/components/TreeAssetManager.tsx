
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Tree model URLs - Updated to prioritize local pine_tree_218poly
export const TREE_MODELS = {
  // Use bundled assets to avoid loading errors that caused placeholder trees
  realistic: '/assets/realistic_tree.glb',
  stylized: '/assets/stylized_tree.glb',
  pine218: '/assets/pine_tree_218poly.glb'
} as const;

// Updated distribution ratios to prioritize pine_tree_218poly
export const TREE_DISTRIBUTION = {
  pine218: 0.6,   // 60% pine_tree_218poly (increased)
  stylized: 0.2,  // 20% stylized
  realistic: 0.2  // 20% realistic
} as const;

// Scale configurations optimized for pine_tree_218poly
export const TREE_SCALES = {
  realistic: { min: 0.75, max: 1.0 },
  stylized: { min: 0.9, max: 1.1 },
  pine218: { min: 0.5, max: 0.8 } // Good scale range for pine_tree_218poly
} as const;

// Y-offset adjustments for proper alignment
export const TREE_Y_OFFSETS = {
  realistic: 0,
  stylized: -0.1,
  pine218: 0 // Pine trees sit well at ground level
} as const;

interface CachedTreeModel {
  scene: THREE.Object3D;
  loaded: boolean;
  error?: Error;
}

class TreeAssetManagerSingleton {
  private cache = new Map<string, CachedTreeModel>();
  private preloadPromises = new Map<string, Promise<void>>();

  async preloadAllModels(): Promise<void> {
    console.log('TreeAssetManager: Starting preload with pine_tree_218poly priority...');
    
    // Prioritize pine_tree_218poly loading first
    const preloadOrder = ['pine218', 'stylized', 'realistic'] as const;
    
    for (const type of preloadOrder) {
      const url = TREE_MODELS[type];
      if (!this.preloadPromises.has(type)) {
        const promise = this.preloadModel(type, url);
        this.preloadPromises.set(type, promise);
        
        // Wait for pine_tree_218poly to load first
        if (type === 'pine218') {
          await promise;
        }
      }
    }
    
    // Load remaining models in parallel
    const remainingPromises = Array.from(this.preloadPromises.values());
    await Promise.allSettled(remainingPromises);
    console.log('TreeAssetManager: Model preload completed with pine_tree_218poly priority');
  }

  private async preloadModel(type: keyof typeof TREE_MODELS, url: string): Promise<void> {
    try {
      console.log(`TreeAssetManager: Preloading ${type} from: ${url}`);
      
      let gltf;
      
      if (type === 'pine218') {
        // Use direct useGLTF for local pine_tree_218poly model
        gltf = await new Promise<any>((resolve, reject) => {
          const loader = new GLTFLoader();
          loader.load(url, resolve, undefined, reject);
        });
      } else {
        // Use GLTFLoader for remote models
        gltf = await new Promise<any>((resolve, reject) => {
          const loader = new GLTFLoader();
          loader.load(url, resolve, undefined, reject);
        });
      }

      if (gltf?.scene) {
        // Optimize the loaded model
        this.optimizeTreeModel(gltf.scene);
        
        this.cache.set(type, {
          scene: gltf.scene,
          loaded: true
        });
        console.log(`TreeAssetManager: Successfully cached ${type} model`);
      }
    } catch (error) {
      console.warn(`TreeAssetManager: Failed to preload ${type}:`, error);
      this.cache.set(type, {
        scene: this.createFallbackTree(type),
        loaded: false,
        error: error as Error
      });
    }
  }

  private optimizeTreeModel(model: THREE.Object3D): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // Disable frustum culling so trees do not pop out when the camera
        // gets very close to them. Some of the imported tree models have
        // bounding boxes that are too small, causing them to disappear
        // prematurely.
        child.frustumCulled = false;
        
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              mat.transparent = false;
              mat.opacity = 1.0;
              mat.needsUpdate = true;
            });
          } else {
            child.material.transparent = false;
            child.material.opacity = 1.0;
            child.material.needsUpdate = true;
          }
        }
      }
    });
  }

  private createFallbackTree(type: keyof typeof TREE_MODELS): THREE.Object3D {
    console.log(`TreeAssetManager: Creating fallback ${type} tree`);
    const group = new THREE.Group();
    
    // Create pine tree fallback for pine218 type
    if (type === 'pine218') {
      const pineHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.15, 1.2),
        new THREE.MeshLambertMaterial({ color: '#8B4513' })
      );
      pineHandle.position.y = 0.6;
      group.add(pineHandle);
      
      const pineCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 1.8, 8),
        new THREE.MeshLambertMaterial({ color: '#013220' })
      );
      pineCone.position.y = 1.5;
      group.add(pineCone);
    } else if (type === 'stylized') {
      // Stylized tree fallback
      const stylizedHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.18, 1.4),
        new THREE.MeshLambertMaterial({ color: '#8B4513' })
      );
      stylizedHandle.position.y = 0.7;
      group.add(stylizedHandle);
      
      const stylizedCanopy = new THREE.Mesh(
        new THREE.SphereGeometry(0.9, 12, 8),
        new THREE.MeshLambertMaterial({ color: '#228B22' })
      );
      stylizedCanopy.position.y = 1.6;
      group.add(stylizedCanopy);
    } else {
      // Realistic tree fallback
      const realisticHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.2, 1.6),
        new THREE.MeshLambertMaterial({ color: '#8B4513' })
      );
      realisticHandle.position.y = 0.8;
      group.add(realisticHandle);
      
      const realisticCanopy = new THREE.Mesh(
        new THREE.SphereGeometry(1.1, 12, 8),
        new THREE.MeshLambertMaterial({ color: '#228B22' })
      );
      realisticCanopy.position.y = 1.9;
      group.add(realisticCanopy);
    }
    
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
    console.log('TreeAssetManager: Clearing all cached models');
    this.cache.clear();
    this.preloadPromises.clear();
    
    // Clear useGLTF cache
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

// Initialize preloading with pine_tree_218poly priority
TreeAssetManager.preloadAllModels().catch(error => {
  console.warn('TreeAssetManager: Initial preload failed:', error);
});
