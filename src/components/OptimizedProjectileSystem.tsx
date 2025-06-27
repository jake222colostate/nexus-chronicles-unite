
import React, { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OptimizedProjectileSystemProps {
  staffTipPosition?: THREE.Vector3;
  targetPositions?: THREE.Vector3[];
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

const MAX_PROJECTILES = 20;
const PROJECTILE_SPEED = 25;
const MAX_LIFE = 5;

// Helper function to safely validate Vector3
const isValidVector3 = (vec: any): vec is THREE.Vector3 => {
  return vec && 
         vec.isVector3 && 
         typeof vec.x === 'number' && 
         typeof vec.y === 'number' && 
         typeof vec.z === 'number' &&
         !isNaN(vec.x) && 
         !isNaN(vec.y) && 
         !isNaN(vec.z);
};

export const OptimizedProjectileSystem = forwardRef<
  OptimizedProjectileSystemHandle,
  OptimizedProjectileSystemProps
>(({ staffTipPosition, targetPositions = [], damage, fireRate, onHitEnemy }, ref) => {
  const projectilePoolRef = useRef<ProjectileData[]>([]);
  const meshPoolRef = useRef<THREE.Mesh[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  const lastFireTimeRef = useRef(0);

  // Create simple, reliable projectile geometry and material
  const projectileGeometry = useMemo(() => new THREE.SphereGeometry(0.3, 12, 12), []);
  const projectileMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#00ffff', 
    emissive: '#00ffff', 
    emissiveIntensity: 0.8,
    transparent: false
  }), []);

  // Initialize projectile pool
  useMemo(() => {
    if (projectilePoolRef.current.length === 0) {
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

  // Initialize mesh pool with reliable geometries
  useMemo(() => {
    if (meshPoolRef.current.length === 0 && groupRef.current) {
      for (let i = 0; i < MAX_PROJECTILES; i++) {
        const mesh = new THREE.Mesh(projectileGeometry, projectileMaterial.clone());
        mesh.visible = false;
        mesh.scale.setScalar(1);
        meshPoolRef.current.push(mesh);
        groupRef.current.add(mesh);
      }
    }
  }, [projectileGeometry, projectileMaterial]);

  const getInactiveProjectile = (): number => {
    for (let i = 0; i < projectilePoolRef.current.length; i++) {
      if (!projectilePoolRef.current[i].active) {
        return i;
      }
    }
    return -1;
  };

  const fireProjectile = (staffPos: THREE.Vector3, targets: THREE.Vector3[] = []) => {
    // FIXED: Comprehensive validation to prevent all crashes
    if (!isValidVector3(staffPos)) {
      console.log('OptimizedProjectileSystem: Invalid staff position, skipping fire');
      return;
    }

    if (!Array.isArray(targets) || targets.length === 0) {
      console.log('OptimizedProjectileSystem: No valid targets, skipping fire');
      return;
    }

    // Filter and validate all targets thoroughly
    const validTargets = targets.filter(target => isValidVector3(target));

    if (validTargets.length === 0) {
      console.log('OptimizedProjectileSystem: No valid targets after filtering, skipping fire');
      return;
    }

    const projectileIndex = getInactiveProjectile();
    if (projectileIndex === -1) {
      return;
    }

    // Find closest valid target with safe distance calculation
    let closestIndex = 0;
    let closestDistance = Infinity;
    
    try {
      validTargets.forEach((targetPos, index) => {
        const distance = staffPos.distanceTo(targetPos);
        if (distance < closestDistance && !isNaN(distance)) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
    } catch (error) {
      console.log('OptimizedProjectileSystem: Error calculating target distance, using first target');
      closestIndex = 0;
    }

    const projectile = projectilePoolRef.current[projectileIndex];
    const mesh = meshPoolRef.current[projectileIndex];

    // Use valid target and store original index safely
    const targetPosition = validTargets[closestIndex];
    const originalTargetIndex = targets.findIndex(target => 
      isValidVector3(target) && 
      target.x === targetPosition.x && 
      target.y === targetPosition.y && 
      target.z === targetPosition.z
    );

    // Setup projectile data with safe operations
    try {
      projectile.position.copy(staffPos);
      projectile.direction.subVectors(targetPosition, staffPos).normalize();
      projectile.damage = damage || 1;
      projectile.targetIndex = Math.max(0, originalTargetIndex);
      projectile.active = true;
      projectile.life = MAX_LIFE;
      
      // Setup mesh safely
      mesh.position.copy(staffPos);
      mesh.visible = true;
      mesh.scale.setScalar(1);
      
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 1.0;
      material.color.setHex(0x00ffff);
      material.emissive.setHex(0x00ffff);
    } catch (error) {
      console.log('OptimizedProjectileSystem: Error setting up projectile, deactivating');
      projectile.active = false;
      mesh.visible = false;
    }
  };

  const manualFire = () => {
    if (isValidVector3(staffTipPosition) && Array.isArray(targetPositions) && targetPositions.length > 0) {
      fireProjectile(staffTipPosition, targetPositions);
      lastFireTimeRef.current = Date.now();
    }
  };

  useImperativeHandle(ref, () => ({ manualFire }), []);

  useFrame((state, delta) => {
    // CRITICAL: Early return with comprehensive validation - never crash the render loop
    if (!isValidVector3(staffTipPosition) || !Array.isArray(targetPositions)) {
      return;
    }

    // Validate delta to prevent NaN issues
    if (!delta || isNaN(delta) || delta <= 0) {
      return;
    }

    const now = Date.now();
    
    // Auto fire projectiles only with valid positions
    if (now - lastFireTimeRef.current >= fireRate && targetPositions.length > 0) {
      try {
        fireProjectile(staffTipPosition, targetPositions);
        lastFireTimeRef.current = now;
      } catch (error) {
        console.log('OptimizedProjectileSystem: Auto-fire failed, continuing render loop');
      }
    }

    // Update active projectiles with comprehensive error handling
    for (let i = 0; i < projectilePoolRef.current.length; i++) {
      const projectile = projectilePoolRef.current[i];
      if (!projectile.active) continue;

      const mesh = meshPoolRef.current[i];
      
      try {
        // Update position with safe vector operations
        const deltaMovement = projectile.direction.clone().multiplyScalar(projectile.speed * delta);
        if (isValidVector3(deltaMovement)) {
          projectile.position.add(deltaMovement);
          mesh.position.copy(projectile.position);
        }
        
        // Update life
        projectile.life -= delta;
        
        // Check collision with target - comprehensive safety checks
        if (projectile.targetIndex >= 0 && 
            projectile.targetIndex < targetPositions.length) {
          
          const targetPos = targetPositions[projectile.targetIndex];
          if (isValidVector3(targetPos)) {
            try {
              const distance = projectile.position.distanceTo(targetPos);
              if (!isNaN(distance) && distance < 1.5) {
                onHitEnemy(projectile.targetIndex, projectile.damage);
                projectile.active = false;
                mesh.visible = false;
                continue;
              }
            } catch (error) {
              console.log('OptimizedProjectileSystem: Collision check failed, deactivating projectile');
              projectile.active = false;
              mesh.visible = false;
              continue;
            }
          }
        }
        
        // Deactivate if too old or too far with safe distance check
        try {
          const distanceFromStart = projectile.position.distanceTo(staffTipPosition);
          if (projectile.life <= 0 || (!isNaN(distanceFromStart) && distanceFromStart > 80)) {
            projectile.active = false;
            mesh.visible = false;
          }
        } catch (error) {
          // If distance check fails, deactivate based on life only
          if (projectile.life <= 0) {
            projectile.active = false;
            mesh.visible = false;
          }
        }
      } catch (error) {
        // If any projectile update fails, deactivate it and continue
        console.log('OptimizedProjectileSystem: Projectile update failed, deactivating');
        projectile.active = false;
        mesh.visible = false;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={1.5} color="#00ffff" />
    </group>
  );
});
