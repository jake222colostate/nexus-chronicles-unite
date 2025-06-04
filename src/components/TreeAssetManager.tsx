
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Tree model URLs from updated Netlify deployment
export const TREE_MODELS = {
  realistic: 'https://6840b83a5870760bb84980de--stately-liger-80d127.netlify.app/realistic_tree.glb',
  stylized: 'https://6840b83a5870760bb84980de--stately-liger-80d127.netlify.app/stylized_tree.glb',
  pine: 'https://6840b83a5870760bb84980de--stately-liger-80d127.netlify.app/pine_tree_218poly.glb'
} as const;

// Scale configurations as specified
export const TREE_SCALES = {
  realistic: 0.75,
  stylized: 1.15,
  pine: 0.5
} as const;

// Y-offset adjustments for proper alignment
export const TREE_Y_OFFSETS = {
  realistic: 0,
  stylized: -0.25,
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
    console.log('TreeAssetManager: Starting preload of all tree models...');
    
    const preloadPromises = Object.entries(TREE_MODELS).map(async ([type, url]) => {
      if (!this.preloadPromises.has(type)) {
        const promise = this.preloadModel(type as keyof typeof TREE_MODELS, url);
        this.preloadPromises.set(type, promise);
      }
      return this.preloadPromises.get(type)!;
    });

    await Promise.allSettled(preloadPromises);
    console.log('TreeAssetManager: Preload completed');
  }

  private async preloadModel(type: keyof typeof TREE_MODELS, url: string): Promise<void> {
    try {
      console.log(`TreeAssetManager: Preloading ${type} from ${url}`);
      useGLTF.preload(url);
      
      // Load and cache the model
      const gltf = await new Promise<any>((resolve, reject) => {
        const loader = new THREE.GLTFLoader();
        loader.load(url, resolve, undefined, reject);
      });

      if (gltf?.scene) {
        this.cache.set(type, {
          scene: gltf.scene,
          loaded: true
        });
        console.log(`TreeAssetManager: Successfully cached ${type} model`);
      }
    } catch (error) {
      console.warn(`TreeAssetManager: Failed to preload ${type}:`, error);
      this.cache.set(type, {
        scene: new THREE.Object3D(),
        loaded: false,
        error: error as Error
      });
    }
  }

  getCachedModel(type: keyof typeof TREE_MODELS): THREE.Object3D | null {
    const cached = this.cache.get(type);
    if (cached?.loaded && cached.scene) {
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
  console.warn('TreeAssetManager: Initial preload failed:', error);
});
