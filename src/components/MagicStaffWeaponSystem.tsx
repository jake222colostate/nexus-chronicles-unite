
import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Staff model URL from updated Netlify deployment
const STAFF_MODEL_URL = 'https://6840b83a5870760bb84980de--stately-liger-80d127.netlify.app/mage_staff.glb';

interface MagicStaffWeaponSystemProps {
  upgradeLevel: number;
  visible?: boolean;
}

// Persistent staff model cache
class StaffModelCache {
  private static instance: StaffModelCache;
  private cachedModel: THREE.Object3D | null = null;
  private isLoading = false;
  private loadPromise: Promise<THREE.Object3D> | null = null;

  static getInstance(): StaffModelCache {
    if (!StaffModelCache.instance) {
      StaffModelCache.instance = new StaffModelCache();
    }
    return StaffModelCache.instance;
  }

  async loadModel(): Promise<THREE.Object3D> {
    if (this.cachedModel) {
      return this.cachedModel.clone();
    }

    if (this.loadPromise) {
      const model = await this.loadPromise;
      return model.clone();
    }

    if (!this.isLoading) {
      this.isLoading = true;
      this.loadPromise = this.loadStaffModel();
    }

    const model = await this.loadPromise!;
    return model.clone();
  }

  private async loadStaffModel(): Promise<THREE.Object3D> {
    try {
      console.log('StaffModelCache: Loading staff model...');
      
      // Use GLTFLoader directly for better control
      const loader = new THREE.GLTFLoader();
      const gltf = await new Promise<any>((resolve, reject) => {
        loader.load(STAFF_MODEL_URL, resolve, undefined, reject);
      });

      if (gltf?.scene) {
        this.cachedModel = gltf.scene;
        this.optimizeModel(this.cachedModel);
        console.log('StaffModelCache: Staff model loaded and cached successfully');
        return this.cachedModel;
      } else {
        throw new Error('No scene found in GLB file');
      }
    } catch (error) {
      console.error('StaffModelCache: Failed to load staff model:', error);
      // Create fallback staff
      this.cachedModel = this.createFallbackStaff();
      return this.cachedModel;
    } finally {
      this.isLoading = false;
    }
  }

  private optimizeModel(model: THREE.Object3D): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = false;
        child.frustumCulled = false; // Prevent first-person culling issues
        
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              mat.transparent = false;
              mat.opacity = 1.0;
              mat.side = THREE.DoubleSide;
              mat.needsUpdate = true;
            });
          } else {
            child.material.transparent = false;
            child.material.opacity = 1.0;
            child.material.side = THREE.DoubleSide;
            child.material.needsUpdate = true;
          }
        }
      }
    });
  }

  private createFallbackStaff(): THREE.Object3D {
    console.log('StaffModelCache: Creating fallback staff geometry');
    const group = new THREE.Group();
    
    // Staff handle
    const handleGeometry = new THREE.CylinderGeometry(0.02, 0.025, 1.5, 8);
    const handleMaterial = new THREE.MeshLambertMaterial({ color: '#8B4513' });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.y = 0.75;
    group.add(handle);
    
    // Staff crystal/orb
    const orbGeometry = new THREE.SphereGeometry(0.08, 12, 8);
    const orbMaterial = new THREE.MeshLambertMaterial({ 
      color: '#4B0082', 
      emissive: '#4B0082', 
      emissiveIntensity: 0.3 
    });
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    orb.position.y = 1.6;
    group.add(orb);
    
    return group;
  }

  getCachedModel(): THREE.Object3D | null {
    return this.cachedModel ? this.cachedModel.clone() : null;
  }

  clearCache(): void {
    this.cachedModel = null;
    this.loadPromise = null;
    this.isLoading = false;
    console.log('StaffModelCache: Cache cleared');
  }
}

export const MagicStaffWeaponSystem: React.FC<MagicStaffWeaponSystemProps> = ({
  upgradeLevel,
  visible = true
}) => {
  const { camera } = useThree();
  const weaponGroupRef = useRef<THREE.Group>(null);
  const [staffModel, setStaffModel] = React.useState<THREE.Object3D | null>(null);
  const staffCache = StaffModelCache.getInstance();

  // Load staff model on mount
  useEffect(() => {
    if (visible) {
      staffCache.loadModel().then(model => {
        setStaffModel(model);
      }).catch(error => {
        console.error('MagicStaffWeaponSystem: Failed to load staff model:', error);
        // Use fallback
        setStaffModel(staffCache.getCachedModel());
      });
    }
  }, [visible, staffCache]);

  // First-person weapon positioning with exact specifications
  useFrame(() => {
    if (weaponGroupRef.current && camera && visible && staffModel) {
      // Get camera vectors for positioning
      const cameraForward = new THREE.Vector3();
      const cameraRight = new THREE.Vector3();
      const cameraUp = new THREE.Vector3();
      
      camera.getWorldDirection(cameraForward);
      cameraRight.crossVectors(cameraUp.set(0, 1, 0), cameraForward).normalize();
      cameraUp.crossVectors(cameraForward, cameraRight).normalize();
      
      // Exact positioning as specified:
      // X: 0.55 (right side), Y: -0.25 (down), Z: 0.55 (forward)
      const staffPosition = camera.position.clone()
        .add(cameraRight.clone().multiplyScalar(0.55))    // X = 0.55
        .add(cameraUp.clone().multiplyScalar(-0.25))       // Y = -0.25
        .add(cameraForward.clone().multiplyScalar(0.55));  // Z = 0.55
      
      weaponGroupRef.current.position.copy(staffPosition);
      
      // Exact rotation as specified:
      // Y: -30°, Z: 15°
      weaponGroupRef.current.rotation.copy(camera.rotation);
      weaponGroupRef.current.rotateY(-30 * Math.PI / 180); // Y = -30°
      weaponGroupRef.current.rotateZ(15 * Math.PI / 180);  // Z = 15°
    }
  });

  // Don't render if not visible or model not loaded
  if (!visible || !staffModel) {
    return null;
  }

  return (
    <group ref={weaponGroupRef}>
      <primitive 
        object={staffModel} 
        scale={[0.55, 0.55, 0.55]} // Scale = 0.55 as specified
      />
    </group>
  );
};

// Preload staff model for immediate availability
const staffCache = StaffModelCache.getInstance();
staffCache.loadModel().catch(error => {
  console.warn('MagicStaffWeaponSystem: Failed to preload staff model:', error);
});

// Clear staff model cache
export const clearStaffModelCache = () => {
  const staffCache = StaffModelCache.getInstance();
  staffCache.clearCache();
};
