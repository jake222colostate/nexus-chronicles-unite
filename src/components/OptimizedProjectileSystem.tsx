
import React, { useRef, useMemo, forwardRef, useImperativeHandle, useEffect } from 'react';
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
  const lastTargetIndexRef = useRef(0);
  const meshPoolInitializedRef = useRef(false);

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
      console.log('OptimizedProjectileSystem: Projectile pool initialized');
    }
  }, []);

  // FIXED: Initialize mesh pool with useEffect to ensure it happens after groupRef is set
  useEffect(() => {
    if (groupRef.current && !meshPoolInitializedRef.current) {
      console.log('OptimizedProjectileSystem: Initializing mesh pool');
      meshPoolRef.current = [];
      
      for (let i = 0; i < MAX_PROJECTILES; i++) {
        const mesh = new THREE.Mesh(projectileGeometry, projectileMaterial.clone());
        mesh.visible = false;
        mesh.scale.setScalar(1);
        meshPoolRef.current.push(mesh);
        groupRef.current.add(mesh);
      }
      
      meshPoolInitializedRef.current = true;
      console.log('OptimizedProjectileSystem: Mesh pool initialized with', MAX_PROJECTILES, 'meshes');
    }
  });

  const getInactiveProjectile = (): number => {
    for (let i = 0; i < projectilePoolRef.current.length; i++) {
      if (!projectilePoolRef.current[i].active) {
        return i;
      }
    }
    return -1;
  };

  const fireProjectile = (staffPos: THREE.Vector3, targets: THREE.Vector3[] = []) => {
    // FIXED: Check if mesh pool is initialized before firing
    if (!meshPoolInitializedRef.current) {
      console.log('OptimizedProjectileSystem: Mesh pool not initialized yet, skipping fire');
      return;
    }

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
      console.log('OptimizedProjectileSystem: No inactive projectiles available');
      return;
    }

    // FIXED: Check if mesh exists before using it
    const mesh = meshPoolRef.current[projectileIndex];
    if (!mesh) {
      console.log('OptimizedProjectileSystem: Mesh not found at index', projectileIndex);
      return;
    }

    // FIXED: Round-robin targeting to ensure all enemies get targeted
    const targetIndex = lastTargetIndexRef.current % validTargets.length;
    lastTargetIndexRef.current = (lastTargetIndexRef.current + 1) % validTargets.length;
    
    const targetPosition = validTargets[targetIndex];
    
    // Find the original index in the targets array
    const originalTargetIndex = targets.findIndex(target => 
      isValidVector3(target) && 
      target.x === targetPosition.x && 
      target.y === targetPosition.y && 
      target.z === targetPosition.z
    );

    const projectile = projectilePoolRef.current[projectileIndex];

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
      
      console.log(`OptimizedProjectileSystem: Fired projectile at enemy ${originalTargetIndex} (round-robin)`);
    } catch (error) {
      console.log('OptimizedProjectileSystem: Error setting up projectile, deactivating:', error);
      projectile.active = false;
      mesh.visible = false;
    }
  };

  const manualFire = () => {
    console.log('OptimizedProjectileSystem: Manual fire triggered');
    if (isValidVector3(staffTipPosition) && Array.isArray(targetPositions) && targetPositions.length > 0) {
      fireProjectile(staffTipPosition, targetPositions);
      lastFireTimeRef.current = Date.now();
      console.log('OptimizedProjectileSystem: Manual fire successful');
    } else {
      console.log('OptimizedProjectileSystem: Manual fire failed - invalid conditions', {
        staffTipValid: isValidVector3(staffTipPosition),
        targetCount: targetPositions?.length || 0
      });
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
    
    // FIXED: More aggressive auto-firing with shorter intervals
    if (now - lastFireTimeRef.current >= fireRate && targetPositions.length > 0) {
      try {
        fireProjectile(staffTipPosition, targetPositions);
        lastFireTimeRef.current = now;
        console.log('OptimizedProjectileSystem: Auto-fired at targets:', targetPositions.length);
      } catch (error) {
        console.log('OptimizedProjectileSystem: Auto-fire failed, continuing render loop');
      }
    }

    // Update active projectiles with comprehensive error handling
    for (let i = 0; i < projectilePoolRef.current.length; i++) {
      const projectile = projectilePoolRef.current[i];
      if (!projectile.active) continue;

      const mesh = meshPoolRef.current[i];
      if (!mesh) continue; // Skip if mesh doesn't exist
      
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
                console.log(`OptimizedProjectileSystem: Hit enemy ${projectile.targetIndex}!`);
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
