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
      
      const gltf = await new Promise<any>((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(url, resolve, undefined, reject);
      });

      if (gltf?.scene) {
        // Optimize the loaded model and fix clipping issues
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
    console.log('TreeAssetManager: Optimizing model to prevent clipping and disappearance');
    
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // CRITICAL FIX: Disable frustum culling to prevent tree disappearing
        child.frustumCulled = false;
        
        // ENHANCED: Prevent near clipping and LOD issues
        child.matrixAutoUpdate = true;
        child.matrixWorldNeedsUpdate = true;
        
        // Ensure proper bounding box calculation - FIXED TypeScript errors
        if (child.geometry) {
          child.geometry.computeBoundingBox();
          child.geometry.computeBoundingSphere();
          
          // Expand bounding box significantly to prevent edge clipping
          if (child.geometry.boundingBox) {
            child.geometry.boundingBox.expandByScalar(2.0); // Increased expansion
          }
          if (child.geometry.boundingSphere) {
            child.geometry.boundingSphere.radius += 2.0; // Increased radius
          }
        }
        
        // Fix material properties to prevent transparency and disappearance issues
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              this.fixMaterialProperties(mat);
            });
          } else {
            this.fixMaterialProperties(child.material);
          }
        }
      }
    });
    
    // Force the entire model to never be culled
    model.traverse((child) => {
      child.frustumCulled = false;
      child.matrixAutoUpdate = true;
      
      // ENHANCED: Force visibility at all distances
      if (child instanceof THREE.Object3D) {
        child.renderOrder = 0; // Ensure proper render order
        child.visible = true;
      }
    });
  }

  private fixMaterialProperties(material: THREE.Material): void {
    // ENHANCED: Ensure materials are always visible and opaque
    material.transparent = false;
    material.opacity = 1.0;
    material.alphaTest = 0;
    material.needsUpdate = true;
    
    // Disable back face culling for all materials to prevent disappearing
    material.side = THREE.DoubleSide;
    
    // ENHANCED: Prevent material-based disappearance
    material.visible = true;
    material.depthTest = true;
    material.depthWrite = true;
    
    // Force material to render at all distances
    if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshLambertMaterial) {
      material.wireframe = false;
    }
  }

  private createFallbackTree(type: keyof typeof TREE_MODELS): THREE.Object3D {
    console.log(`TreeAssetManager: Creating enhanced fallback ${type} tree with anti-disappearance settings`);
    const group = new THREE.Group();
    
    // Enhanced fallback trees with better visibility
    if (type === 'pine218') {
      const pineHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.15, 1.2),
        new THREE.MeshLambertMaterial({ 
          color: '#8B4513',
          side: THREE.DoubleSide,
          transparent: false
        })
      );
      pineHandle.position.y = 0.6;
      pineHandle.frustumCulled = false;
      pineHandle.matrixAutoUpdate = true;
      group.add(pineHandle);
      
      const pineCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 1.8, 8),
        new THREE.MeshLambertMaterial({ 
          color: '#013220', 
          side: THREE.DoubleSide,
          transparent: false
        })
      );
      pineCone.position.y = 1.5;
      pineCone.frustumCulled = false;
      pineCone.matrixAutoUpdate = true;
      group.add(pineCone);
    } else if (type === 'stylized') {
      // Stylized tree fallback
      const stylizedHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.18, 1.4),
        new THREE.MeshLambertMaterial({ 
          color: '#8B4513',
          side: THREE.DoubleSide,
          transparent: false
        })
      );
      stylizedHandle.position.y = 0.7;
      stylizedHandle.frustumCulled = false;
      group.add(stylizedHandle);
      
      const stylizedCanopy = new THREE.Mesh(
        new THREE.SphereGeometry(0.9, 12, 8),
        new THREE.MeshLambertMaterial({ 
          color: '#228B22', 
          side: THREE.DoubleSide,
          transparent: false
        })
      );
      stylizedCanopy.position.y = 1.6;
      stylizedCanopy.frustumCulled = false;
      group.add(stylizedCanopy);
    } else {
      // Realistic tree fallback
      const realisticHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.2, 1.6),
        new THREE.MeshLambertMaterial({ 
          color: '#8B4513',
          side: THREE.DoubleSide,
          transparent: false
        })
      );
      realisticHandle.position.y = 0.8;
      realisticHandle.frustumCulled = false;
      group.add(realisticHandle);
      
      const realisticCanopy = new THREE.Mesh(
        new THREE.SphereGeometry(1.1, 12, 8),
        new THREE.MeshLambertMaterial({ 
          color: '#228B22', 
          side: THREE.DoubleSide,
          transparent: false
        })
      );
      realisticCanopy.position.y = 1.9;
      realisticCanopy.frustumCulled = false;
      group.add(realisticCanopy);
    }
    
    // Apply anti-disappearance settings to entire fallback group
    group.frustumCulled = false;
    group.matrixAutoUpdate = true;
    
    return group;
  }

  getCachedModel(type: keyof typeof TREE_MODELS): THREE.Object3D | null {
    const cached = this.cache.get(type);
    if (cached?.scene) {
      const cloned = cached.scene.clone();
      // Apply enhanced anti-clipping settings to cloned model
      this.optimizeTreeModel(cloned);
      return cloned;
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
