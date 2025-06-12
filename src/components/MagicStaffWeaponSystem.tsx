
import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Use the existing public assets instead of GitHub URLs
const STAFF_MODELS = {
  tier1: '/assets/mage_staff.glb',
  tier2: '/assets/magical_staff.glb', 
  tier3: '/assets/stylized_magic_staff_of_water_game_ready.glb'
} as const;

interface MagicStaffWeaponSystemProps {
  upgradeLevel: number;
  visible?: boolean;
  onStaffTipPositionUpdate?: (position: THREE.Vector3) => void;
}

// Simple staff model cache
class StaffModelCache {
  private static instance: StaffModelCache;
  private cachedModels = new Map<string, THREE.Object3D>();

  static getInstance(): StaffModelCache {
    if (!StaffModelCache.instance) {
      StaffModelCache.instance = new StaffModelCache();
    }
    return StaffModelCache.instance;
  }

  getCachedModel(tier: keyof typeof STAFF_MODELS): THREE.Object3D | null {
    return this.cachedModels.get(tier)?.clone() || null;
  }

  setCachedModel(tier: keyof typeof STAFF_MODELS, model: THREE.Object3D): void {
    this.cachedModels.set(tier, model);
  }

  private createFallbackStaff(tier: keyof typeof STAFF_MODELS): THREE.Object3D {
    console.log(`Creating fallback ${tier} staff`);
    const group = new THREE.Group();
    
    const colors = {
      tier1: { handle: '#8B4513', orb: '#4B0082' },
      tier2: { handle: '#654321', orb: '#8A2BE2' },
      tier3: { handle: '#2F4F4F', orb: '#00CED1' }
    };
    
    const tierColors = colors[tier];
    
    // Staff handle - make it more visible
    const handleGeometry = new THREE.CylinderGeometry(0.05, 0.06, 3, 8);
    const handleMaterial = new THREE.MeshLambertMaterial({ color: tierColors.handle });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.y = 1.5;
    handle.castShadow = true;
    group.add(handle);
    
    // Staff crystal/orb - bigger and glowing
    const orbSize = 0.2;
    const orbGeometry = new THREE.SphereGeometry(orbSize, 12, 8);
    const orbMaterial = new THREE.MeshLambertMaterial({ 
      color: tierColors.orb, 
      emissive: tierColors.orb, 
      emissiveIntensity: 0.5 
    });
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    orb.position.y = 3.2;
    orb.castShadow = true;
    group.add(orb);
    
    // Add a point light to make it glow
    const light = new THREE.PointLight(tierColors.orb, 1, 5);
    light.position.y = 3.2;
    group.add(light);
    
    return group;
  }

  createFallback(tier: keyof typeof STAFF_MODELS): THREE.Object3D {
    return this.createFallbackStaff(tier);
  }
}

export const MagicStaffWeaponSystem: React.FC<MagicStaffWeaponSystemProps> = ({
  upgradeLevel,
  visible = true,
  onStaffTipPositionUpdate
}) => {
  const { camera } = useThree();
  const weaponGroupRef = useRef<THREE.Group>(null);
  const [staffModel, setStaffModel] = React.useState<THREE.Object3D | null>(null);
  const staffCache = StaffModelCache.getInstance();
  const staffTipPositionRef = useRef<THREE.Vector3>(new THREE.Vector3());

  // Determine staff tier based on upgrade level
  const staffTier = useMemo(() => {
    if (upgradeLevel >= 2) return 'tier3';
    if (upgradeLevel >= 1) return 'tier2';
    return 'tier1';
  }, [upgradeLevel]);

  // Load staff model with proper fallback using useGLTF
  const { scene: gltfScene } = useGLTF(STAFF_MODELS[staffTier], true);

  useEffect(() => {
    if (!visible) return;

    // Check cache first
    const cached = staffCache.getCachedModel(staffTier);
    if (cached) {
      setStaffModel(cached);
      return;
    }

    if (gltfScene) {
      console.log(`Successfully loaded ${staffTier} staff model`);
      const model = gltfScene.clone();
      
      // Optimize model
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = false;
          child.frustumCulled = false;
        }
      });
      
      staffCache.setCachedModel(staffTier, model);
      setStaffModel(model.clone());
    } else {
      console.warn(`Failed to load ${staffTier} staff, using fallback`);
      const fallback = staffCache.createFallback(staffTier);
      staffCache.setCachedModel(staffTier, fallback);
      setStaffModel(fallback.clone());
    }
  }, [visible, staffTier, gltfScene, staffCache]);

  // First-person weapon positioning and staff tip tracking
  useFrame(() => {
    if (weaponGroupRef.current && camera && visible && staffModel) {
      // Get camera vectors for positioning
      const cameraForward = new THREE.Vector3();
      const cameraRight = new THREE.Vector3();
      const cameraUp = new THREE.Vector3();
      
      camera.getWorldDirection(cameraForward);
      cameraRight.crossVectors(cameraUp.set(0, 1, 0), cameraForward).normalize();
      cameraUp.crossVectors(cameraForward, cameraRight).normalize();
      
      // Position staff in first-person view
      const staffPosition = camera.position.clone()
        .add(cameraRight.clone().multiplyScalar(0.6))    // Right side
        .add(cameraUp.clone().multiplyScalar(-0.4))       // Down
        .add(cameraForward.clone().multiplyScalar(1.0));  // Forward
      
      weaponGroupRef.current.position.copy(staffPosition);
      
      // Rotation to look natural
      weaponGroupRef.current.rotation.copy(camera.rotation);
      weaponGroupRef.current.rotateY(-15 * Math.PI / 180);
      weaponGroupRef.current.rotateZ(20 * Math.PI / 180);
      
      // Calculate staff tip position (top of the staff)
      const staffTipOffset = new THREE.Vector3(0, 3, 0); // Tip is 3 units up from staff base
      staffTipOffset.applyQuaternion(weaponGroupRef.current.quaternion);
      staffTipPositionRef.current.copy(weaponGroupRef.current.position).add(staffTipOffset);
      
      // Update parent component with staff tip position
      if (onStaffTipPositionUpdate) {
        onStaffTipPositionUpdate(staffTipPositionRef.current.clone());
      }
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
        scale={[0.6, 0.6, 0.6]}
      />
      {/* Debug sphere to show staff tip position */}
      <mesh position={[0, 3, 0]}>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
    </group>
  );
};

// Clear staff model cache
export const clearStaffModelCache = () => {
  const staffCache = StaffModelCache.getInstance();
  staffCache.getCachedModel = () => null;
};
