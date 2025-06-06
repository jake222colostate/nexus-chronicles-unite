import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Staff model URLs from GitHub repository - Updated to use Draco-compressed versions
const STAFF_MODELS = {
  tier1: 'https://raw.githubusercontent.com/jake222colostate/nexus-chronicles-unite/main/public/assets/mage_staff_draco.glb',
  tier2: 'https://raw.githubusercontent.com/jake222colostate/nexus-chronicles-unite/main/public/assets/magical_staff_draco.glb',
  tier3: 'https://raw.githubusercontent.com/jake222colostate/nexus-chronicles-unite/main/public/assets/stylized_magic_staff_of_water_game_ready_draco.glb'
} as const;

interface MagicStaffWeaponSystemProps {
  upgradeLevel: number;
  visible?: boolean;
}

// Persistent staff model cache
class StaffModelCache {
  private static instance: StaffModelCache;
  private cachedModels = new Map<string, THREE.Object3D>();
  private loadingPromises = new Map<string, Promise<THREE.Object3D>>();

  static getInstance(): StaffModelCache {
    if (!StaffModelCache.instance) {
      StaffModelCache.instance = new StaffModelCache();
    }
    return StaffModelCache.instance;
  }

  async loadModel(tier: keyof typeof STAFF_MODELS): Promise<THREE.Object3D> {
    if (this.cachedModels.has(tier)) {
      return this.cachedModels.get(tier)!.clone();
    }

    if (this.loadingPromises.has(tier)) {
      const model = await this.loadingPromises.get(tier)!;
      return model.clone();
    }

    const loadPromise = this.loadStaffModel(tier);
    this.loadingPromises.set(tier, loadPromise);
    
    const model = await loadPromise;
    return model.clone();
  }

  private async loadStaffModel(tier: keyof typeof STAFF_MODELS): Promise<THREE.Object3D> {
    const url = STAFF_MODELS[tier];
    
    try {
      console.log(`StaffModelCache: Loading Draco-compressed ${tier} staff from GitHub: ${url}`);
      
      // Use GLTFLoader with correct import
      const loader = new GLTFLoader();
      const gltf = await new Promise<any>((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
      });

      if (gltf?.scene) {
        this.optimizeStaffModel(gltf.scene);
        this.cachedModels.set(tier, gltf.scene);
        console.log(`StaffModelCache: Successfully cached Draco-compressed ${tier} staff from GitHub`);
        return gltf.scene;
      } else {
        throw new Error('No scene found in Draco GLB file');
      }
    } catch (error) {
      console.error(`StaffModelCache: Failed to load Draco-compressed ${tier} staff from GitHub:`, error);
      // Create fallback staff
      const fallback = this.createFallbackStaff(tier);
      this.cachedModels.set(tier, fallback);
      return fallback;
    }
  }

  private optimizeStaffModel(model: THREE.Object3D): void {
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

  private createFallbackStaff(tier: keyof typeof STAFF_MODELS): THREE.Object3D {
    console.log(`StaffModelCache: Creating fallback ${tier} staff geometry`);
    const group = new THREE.Group();
    
    // Different fallback designs based on tier
    const colors = {
      tier1: { handle: '#8B4513', orb: '#4B0082' },
      tier2: { handle: '#654321', orb: '#8A2BE2' },
      tier3: { handle: '#2F4F4F', orb: '#00CED1' }
    };
    
    const tierColors = colors[tier];
    
    // Staff handle
    const handleGeometry = new THREE.CylinderGeometry(0.02, 0.025, 1.5, 8);
    const handleMaterial = new THREE.MeshLambertMaterial({ color: tierColors.handle });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.y = 0.75;
    group.add(handle);
    
    // Staff crystal/orb - different sizes for different tiers
    const orbSize = tier === 'tier1' ? 0.08 : tier === 'tier2' ? 0.1 : 0.12;
    const orbGeometry = new THREE.SphereGeometry(orbSize, 12, 8);
    const orbMaterial = new THREE.MeshLambertMaterial({ 
      color: tierColors.orb, 
      emissive: tierColors.orb, 
      emissiveIntensity: 0.3 
    });
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    orb.position.y = 1.6;
    group.add(orb);
    
    return group;
  }

  getCachedModel(tier: keyof typeof STAFF_MODELS): THREE.Object3D | null {
    return this.cachedModels.get(tier)?.clone() || null;
  }

  clearCache(): void {
    this.cachedModels.clear();
    this.loadingPromises.clear();
    console.log('StaffModelCache: Cache cleared');
  }

  async preloadAllStaffs(): Promise<void> {
    console.log('StaffModelCache: Preloading all staff models from GitHub...');
    const loadPromises = Object.keys(STAFF_MODELS).map(tier => 
      this.loadModel(tier as keyof typeof STAFF_MODELS)
    );
    await Promise.allSettled(loadPromises);
    console.log('StaffModelCache: All staff models preloaded');
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

  // Determine staff tier based on upgrade level
  const staffTier = useMemo(() => {
    if (upgradeLevel >= 2) return 'tier3';
    if (upgradeLevel >= 1) return 'tier2';
    return 'tier1';
  }, [upgradeLevel]);

  // Load staff model based on tier
  useEffect(() => {
    if (visible) {
      staffCache.loadModel(staffTier).then(model => {
        setStaffModel(model);
      }).catch(error => {
        console.error('MagicStaffWeaponSystem: Failed to load staff model:', error);
        // Use fallback
        setStaffModel(staffCache.getCachedModel(staffTier));
      });
    }
  }, [visible, staffTier, staffCache]);

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
      // X: 0.45 (right side), Y: -0.3 (down), Z: 0.6 (forward)
      const staffPosition = camera.position.clone()
        .add(cameraRight.clone().multiplyScalar(0.45))    // X = 0.45
        .add(cameraUp.clone().multiplyScalar(-0.3))        // Y = -0.3
        .add(cameraForward.clone().multiplyScalar(0.6));   // Z = 0.6
      
      weaponGroupRef.current.position.copy(staffPosition);
      
      // Exact rotation as specified:
      // Y: -20°, Z: 30°
      weaponGroupRef.current.rotation.copy(camera.rotation);
      weaponGroupRef.current.rotateY(-20 * Math.PI / 180); // Y = -20°
      weaponGroupRef.current.rotateZ(30 * Math.PI / 180);  // Z = 30°
    }
  });

  // Don't render if not visible or model not loaded
  if (!visible || !staffModel) {
    return null;
  }

  // Scale to fit screen without clipping
  const staffScale = staffTier === 'tier1' ? 0.4 : staffTier === 'tier2' ? 0.45 : 0.5;

  return (
    <group ref={weaponGroupRef}>
      <primitive 
        object={staffModel} 
        scale={[staffScale, staffScale, staffScale]}
      />
    </group>
  );
};

// Preload all Draco-compressed staff models for immediate availability
const staffCache = StaffModelCache.getInstance();
staffCache.preloadAllStaffs().catch(error => {
  console.warn('MagicStaffWeaponSystem: Failed to preload Draco-compressed staff models from GitHub:', error);
});

// Clear staff model cache
export const clearStaffModelCache = () => {
  const staffCache = StaffModelCache.getInstance();
  staffCache.clearCache();
};
