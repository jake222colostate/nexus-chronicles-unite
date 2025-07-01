
import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  OptimizedProjectileSystem,
  OptimizedProjectileSystemHandle
} from './OptimizedProjectileSystem';

// Staff model URLs - switched to local assets so the staff reliably appears
import { assetPath } from '../lib/assetPath';

const STAFF_MODELS = {
  tier1: assetPath('assets/mage_staff.glb'),
  tier2: assetPath('assets/magical_staff.glb'),
  tier3: assetPath('assets/stylized_magic_staff_of_water_game_ready.glb')
} as const;

interface MagicStaffWeaponSystemProps {
  upgradeLevel: number;
  visible?: boolean;
  enemyPositions?: THREE.Vector3[];
  onHitEnemy?: (index: number, damage: number) => void;
  damage?: number;
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
      console.log(`StaffModelCache: Loading ${tier} staff from ${url}`);
      
      // Use GLTFLoader with correct import
      const loader = new GLTFLoader();
      const gltf = await new Promise<any>((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
      });

      if (gltf?.scene) {
        this.optimizeStaffModel(gltf.scene);
        this.cachedModels.set(tier, gltf.scene);
        console.log(`StaffModelCache: Successfully cached ${tier} staff`);
        return gltf.scene;
      } else {
        throw new Error('No scene found in GLB file');
      }
    } catch (error) {
      console.error(`StaffModelCache: Failed to load ${tier} staff:`, error);
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
    console.log('StaffModelCache: Preloading all staff models...');
    const loadPromises = Object.keys(STAFF_MODELS).map(tier => 
      this.loadModel(tier as keyof typeof STAFF_MODELS)
    );
    await Promise.allSettled(loadPromises);
    console.log('StaffModelCache: All staff models preloaded');
  }
}

export const MagicStaffWeaponSystem: React.FC<MagicStaffWeaponSystemProps> = ({
  upgradeLevel,
  visible = true,
  enemyPositions = [],
  onHitEnemy = () => {},
  damage = 10
}) => {
  const { camera, gl } = useThree();
  const weaponGroupRef = useRef<THREE.Group>(null);
  const staffTipPositionRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const projectileSystemRef = useRef<OptimizedProjectileSystemHandle>(null);
  const [staffModel, setStaffModel] = React.useState<THREE.Object3D | null>(null);
  const staffCache = StaffModelCache.getInstance();

  // Determine staff tier based on upgrade level
  const staffTier = useMemo(() => {
    if (upgradeLevel >= 2) return 'tier3';
    if (upgradeLevel >= 1) return 'tier2';
    return 'tier1';
  }, [upgradeLevel]);

  // REDUCED staff scale by 50% to make it smaller and less obtrusive
  const staffScale =
    (staffTier === 'tier1' ? 0.3 : staffTier === 'tier2' ? 0.325 : 0.35);

  // Slower base auto-fire rate so manual aiming feels more meaningful
  const autoFireRate = useMemo(() => {
    return Math.max(500, 1200 - (upgradeLevel * 200));
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

  // FIXED: Use canvas-specific click handler instead of window
  useEffect(() => {
    const handleClick = () => {
      // Allow upgrade pedestals to receive their click events by not
      // stopping propagation or preventing default behaviour.
      console.log('MagicStaffWeaponSystem: Canvas clicked - manual fire triggered');
      projectileSystemRef.current?.manualFire();
    };
    
    // Get the canvas element from the WebGL renderer
    const canvas = gl.domElement;
    if (canvas) {
      console.log('MagicStaffWeaponSystem: Attaching click listener to canvas');
      canvas.addEventListener('click', handleClick);
      return () => {
        console.log('MagicStaffWeaponSystem: Removing click listener from canvas');
        canvas.removeEventListener('click', handleClick);
      };
    } else {
      console.warn('MagicStaffWeaponSystem: Canvas not found, cannot attach click listener');
    }
  }, [gl.domElement]);

  // Enhanced first-person weapon positioning with better tip calculation
  useFrame(() => {
    if (weaponGroupRef.current && camera && visible && staffModel) {
      // Get camera vectors for positioning
      const cameraForward = new THREE.Vector3();
      const cameraRight = new THREE.Vector3();
      const cameraUp = new THREE.Vector3();
      
      camera.getWorldDirection(cameraForward);
      cameraRight.crossVectors(cameraUp.set(0, 1, 0), cameraForward).normalize();
      cameraUp.crossVectors(cameraForward, cameraRight).normalize();
      
      // Right side positioning with smaller offset due to reduced scale
      const staffPosition = camera.position.clone()
        .add(cameraRight.clone().multiplyScalar(0.2))     // Positive for right side
        .add(cameraUp.clone().multiplyScalar(-0.15))       // Vertical offset
        .add(cameraForward.clone().multiplyScalar(0.3));   // Forward offset
      
      weaponGroupRef.current.position.copy(staffPosition);
      
      // Minimal rotation to keep staff vertical
      weaponGroupRef.current.rotation.copy(camera.rotation);
      weaponGroupRef.current.rotateY(-5 * Math.PI / 180);   // Slight angle toward center
      weaponGroupRef.current.rotateZ(0);                     // No roll rotation for vertical stance

      // ENHANCED: More accurate staff tip calculation
      // Calculate tip position relative to staff length and scale
      const tipOffset = new THREE.Vector3(0, 1.8 * staffScale, 0); // Increased multiplier for better tip position
      tipOffset.applyQuaternion(weaponGroupRef.current.quaternion);
      staffTipPositionRef.current.copy(weaponGroupRef.current.position).add(tipOffset);
    }
  });

  // Don't render if not visible or model not loaded
  if (!visible || !staffModel) {
    return null;
  }

  return (
    <>
      <group ref={weaponGroupRef}>
        <primitive
          object={staffModel}
          scale={[staffScale, staffScale, staffScale]}
        />
        {/* Enhanced staff tip indicator (visible point where projectiles spawn) */}
        <mesh position={[0, 1.8 * staffScale, 0]}>
          <sphereGeometry args={[0.02]} />
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.8} />
        </mesh>
        {/* Reduced light intensity to match smaller staff */}
        <pointLight position={[0, 0.5, 0]} color="#4B0082" intensity={0.3} distance={2} />
      </group>
      {/* Render projectiles outside of the weapon group so they aren't tied to the camera */}
      <OptimizedProjectileSystem
        ref={projectileSystemRef}
        staffTipPosition={staffTipPositionRef.current}
        targetPositions={enemyPositions}
        damage={damage}
        autoFireRate={autoFireRate}
        onHitEnemy={onHitEnemy}
      />
    </>
  );
};

// Preload all staff models for immediate availability
const staffCache = StaffModelCache.getInstance();
staffCache.preloadAllStaffs().catch(error => {
  console.warn('MagicStaffWeaponSystem: Failed to preload staff models:', error);
});

// Clear staff model cache
export const clearStaffModelCache = () => {
  const staffCache = StaffModelCache.getInstance();
  staffCache.clearCache();
};
