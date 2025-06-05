
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Tree model URLs from the local assets folder
export const TREE_MODELS = {
  realistic: '/assets/realistic_tree.glb',
  pine: '/assets/pine_tree_218poly.glb'
} as const;

// Distribution ratios as specified
export const TREE_DISTRIBUTION = {
  pine: 0.5,       // 50%
  realistic: 0.5   // 50%
} as const;

// Scale configurations as specified
export const TREE_SCALES = {
  realistic: { min: 0.75, max: 1.0 },
  pine: { min: 0.65, max: 0.85 }
} as const;

// Y-offset adjustments for proper alignment
export const TREE_Y_OFFSETS = {
  realistic: 0,
  pine: 0
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
    console.log('TreeAssetManager: Starting preload of all tree models from assets...');
    
    const preloadPromises = Object.entries(TREE_MODELS).map(async ([type, url]) => {
      if (!this.preloadPromises.has(type)) {
        const promise = this.preloadModel(type as keyof typeof TREE_MODELS, url);
        this.preloadPromises.set(type, promise);
      }
      return this.preloadPromises.get(type)!;
    });

    await Promise.allSettled(preloadPromises);
    console.log('TreeAssetManager: Asset model preload completed');
  }

  private async preloadModel(type: keyof typeof TREE_MODELS, url: string): Promise<void> {
    try {
      console.log(`TreeAssetManager: Preloading ${type} from assets: ${url}`);
      
      // Use GLTFLoader directly for better control
      const gltf = await new Promise<any>((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(url, resolve, undefined, reject);
      });

      if (gltf?.scene) {
        // Optimize the loaded model
        this.optimizeTreeModel(gltf.scene);
        
        this.cache.set(type, {
          scene: gltf.scene,
          loaded: true
        });
        console.log(`TreeAssetManager: Successfully cached ${type} model from assets`);
      }
    } catch (error) {
      console.warn(`TreeAssetManager: Failed to preload ${type} from assets:`, error);
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
        child.frustumCulled = true;
        
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
    
    // Create different fallback trees based on type
    switch (type) {
      case 'pine':
        // Pine tree fallback
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
        break;
        
      default: // realistic
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
        break;
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

// Initialize preloading
TreeAssetManager.preloadAllModels().catch(error => {
  console.warn('TreeAssetManager: Initial asset preload failed:', error);
});
