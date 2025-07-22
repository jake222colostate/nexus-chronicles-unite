import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Object3D, Mesh } from 'three';

// GLB Scene reuse hook with memory optimization
export const useGLBSceneReuse = (url: string) => {
  const { scene } = useGLTF(url);
  
  // Memoized scene cloning for reuse
  const clonedScene = useMemo(() => {
    if (!scene) return null;
    
    // Clone the scene for reuse
    const clone = scene.clone();
    
    // Optimize the cloned scene
    clone.traverse((child) => {
      if (child instanceof Object3D) {
        // Enable frustum culling for better performance
        child.frustumCulled = true;
        child.matrixAutoUpdate = false;
        
        if (child instanceof Mesh) {
          // Optimize materials
          if (child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach(mat => {
              mat.needsUpdate = false; // Prevent unnecessary updates
            });
          }
        }
      }
    });
    
    return clone;
  }, [scene]);
  
  return { scene: clonedScene, originalScene: scene };
};

// Preload critical GLB assets with compression awareness
export const preloadGLBAssets = () => {
  const assets = [
    // Decorative assets disabled
    'assets/upgrades/Podiums.glb',
    'assets/upgrades/LargeObelisk.glb'
  ];
  
  assets.forEach(asset => {
    useGLTF.preload(asset);
  });
};