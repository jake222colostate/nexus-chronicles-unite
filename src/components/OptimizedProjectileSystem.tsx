
import React, { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { assetPath } from '../lib/assetPath';

interface OptimizedProjectileSystemProps {
  staffTipPosition: THREE.Vector3;
  targetPositions: THREE.Vector3[];
  damage: number;
  fireRate: number;
  onHitEnemy: (index: number, damage: number) => void;
}

export interface OptimizedProjectileSystemHandle {
  manualFire: () => void;
}

interface ProjectileData {
  position: THREE.Vector3;
  direction: THREE.Vector3;
  speed: number;
  damage: number;
  targetIndex: number;
  active: boolean;
  life: number;
}

const MAX_PROJECTILES = 20; // Pool size
const PROJECTILE_SPEED = 25;
const MAX_LIFE = 5; // Seconds

export const OptimizedProjectileSystem = forwardRef<
  OptimizedProjectileSystemHandle,
  OptimizedProjectileSystemProps
>(({ staffTipPosition, targetPositions, damage, fireRate, onHitEnemy }, ref) => {
  const projectilePoolRef = useRef<ProjectileData[]>([]);
  const meshPoolRef = useRef<THREE.Object3D[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  const lastFireTimeRef = useRef(0);

  // Load orb model for projectiles with fallback
  let orbScene = null;
  try {
    const gltfResult = useGLTF(assetPath('assets/orb/uttm_core_accurate.glb'));
    orbScene = gltfResult.scene;
  } catch (error) {
    console.warn('Failed to load orb model, using fallback sphere:', error);
    orbScene = null;
  }

  const orbModel = useMemo<THREE.Object3D | null>(() => {
    if (orbScene) {
      return orbScene.clone();
    }
    // Create fallback sphere if model fails to load
    const fallbackGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const fallbackMaterial = new THREE.MeshStandardMaterial({ 
      color: '#00ffff', 
      emissive: '#00ffff', 
      emissiveIntensity: 0.5 
    });
    const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
    console.log('Using fallback sphere for projectile');
    return fallbackMesh;
  }, [orbScene]);

  // Scale applied to orb model
  const projectileScale = 0.8; // Increased size for better visibility

  // Initialize projectile pool
  useMemo(() => {
    if (projectilePoolRef.current.length === 0) {
      // Initialize data pool
      for (let i = 0; i < MAX_PROJECTILES; i++) {
        projectilePoolRef.current.push({
          position: new THREE.Vector3(),
          direction: new THREE.Vector3(),
          speed: PROJECTILE_SPEED,
          damage: 0,
          targetIndex: -1,
          active: false,
          life: 0
        });
      }
    }
  }, []);

  // Initialize mesh pool
  useMemo(() => {
    if (meshPoolRef.current.length === 0) {
      for (let i = 0; i < MAX_PROJECTILES; i++) {
        const container = new THREE.Group();
        container.visible = false;

        // Brighter light for better visibility
        const light = new THREE.PointLight('#00ffff', 2, 5);
        container.add(light);

        meshPoolRef.current.push(container);
        if (groupRef.current) {
          groupRef.current.add(container);
        }
      }
    }
  }, []);

  const getInactiveProjectile = (): number => {
    for (let i = 0; i < projectilePoolRef.current.length; i++) {
      if (!projectilePoolRef.current[i].active) {
        return i;
      }
    }
    return -1;
  };

  const fireProjectile = (staffPos: THREE.Vector3, targets: THREE.Vector3[]) => {
    if (targets.length === 0) return;

    const projectileIndex = getInactiveProjectile();
    if (projectileIndex === -1) return; // Pool exhausted

    // Find closest target
    let closestIndex = 0;
    let closestDistance = Infinity;
    
    targets.forEach((targetPos, index) => {
      const distance = staffPos.distanceTo(targetPos);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    const projectile = projectilePoolRef.current[projectileIndex];
    const mesh = meshPoolRef.current[projectileIndex];

    // Attach orb model - ensure it's visible
    if (orbModel) {
      // remove previous model but keep light as first child
      while (mesh.children.length > 1) {
        mesh.remove(mesh.children[1]);
      }
      const orb = orbModel.clone();
      orb.scale.setScalar(projectileScale);
      orb.visible = true; // Explicitly set visible
      
      // Make sure all child meshes are visible and have proper materials
      orb.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.visible = true;
          child.material = new THREE.MeshStandardMaterial({ 
            color: '#00ffff', 
            emissive: '#00ffff', 
            emissiveIntensity: 0.8 
          });
        }
      });
      
      mesh.add(orb);
      console.log('Added orb to projectile mesh');
    }
    
    // Setup projectile
    projectile.position.copy(staffPos);
    projectile.direction.subVectors(targets[closestIndex], staffPos).normalize();
    projectile.damage = damage;
    projectile.targetIndex = closestIndex;
    projectile.active = true;
    projectile.life = MAX_LIFE;
    
    // Setup mesh - ensure visibility
    mesh.position.copy(staffPos);
    mesh.visible = true;

    console.log('Fired projectile from', staffPos, 'to target', closestIndex, 'at position', targets[closestIndex]);
  };

  const manualFire = () => {
    fireProjectile(staffTipPosition, targetPositions);
    lastFireTimeRef.current = Date.now();
  };

  useImperativeHandle(ref, () => ({ manualFire }), [manualFire]);

  useFrame((state, delta) => {
    const now = Date.now();
    
    // Fire projectiles
    if (now - lastFireTimeRef.current >= fireRate && targetPositions.length > 0) {
      fireProjectile(staffTipPosition, targetPositions);
      lastFireTimeRef.current = now;
    }

    // Update active projectiles
    for (let i = 0; i < projectilePoolRef.current.length; i++) {
      const projectile = projectilePoolRef.current[i];
      if (!projectile.active) continue;

      const mesh = meshPoolRef.current[i];
      
      // Update position
      projectile.position.add(
        projectile.direction.clone().multiplyScalar(projectile.speed * delta)
      );
      mesh.position.copy(projectile.position);
      
      // Update life
      projectile.life -= delta;
      
      // Check collision with target
      if (projectile.targetIndex >= 0 && projectile.targetIndex < targetPositions.length) {
        const targetPos = targetPositions[projectile.targetIndex];
        if (targetPos && projectile.position.distanceTo(targetPos) < 1.5) {
          onHitEnemy(projectile.targetIndex, projectile.damage);
          projectile.active = false;
          mesh.visible = false;
          console.log('Projectile hit target', projectile.targetIndex);
          continue;
        }
      }
      
      // Deactivate if too old or too far
      if (projectile.life <= 0 || projectile.position.distanceTo(staffTipPosition) > 80) {
        projectile.active = false;
        mesh.visible = false;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Much brighter ambient light for projectiles */}
      <ambientLight intensity={1.2} color="#00ffff" />
    </group>
  );
});

// Preload with error handling
try {
  useGLTF.preload(assetPath('assets/orb/uttm_core_accurate.glb'));
} catch (error) {
  console.warn('Failed to preload orb model:', error);
}
