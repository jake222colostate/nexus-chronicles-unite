import React, { useRef, useMemo, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OptimizedProjectileSystemProps {
  staffTipPosition?: THREE.Vector3;
  targetPositions?: THREE.Vector3[];
  damage: number;
  fireRate: number;
  onHitEnemy: (index: number, damage: number) => void;
  playerPosition?: THREE.Vector3; // ADDED: Player position for better tracking
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
>(({ staffTipPosition, targetPositions = [], damage, fireRate, onHitEnemy, playerPosition }, ref) => {
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

  // Initialize mesh pool with useEffect to ensure it happens after groupRef is set
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

  const fireProjectile = (targets: THREE.Vector3[] = []) => {
    // Check if mesh pool is initialized before firing
    if (!meshPoolInitializedRef.current) {
      console.log('OptimizedProjectileSystem: Mesh pool not initialized yet, skipping fire');
      return;
    }

    // FIXED: Validate staff tip position with better error handling
    if (!isValidVector3(staffTipPosition)) {
      console.log('OptimizedProjectileSystem: Invalid staff tip position, using player position as fallback');
      
      // FIXED: Use player position as fallback if staff tip position is invalid
      if (!isValidVector3(playerPosition)) {
        console.log('OptimizedProjectileSystem: No valid position available for projectile spawning');
        return;
      }
    }

    // FIXED: Better target validation
    if (!Array.isArray(targets) || targets.length === 0) {
      console.log('OptimizedProjectileSystem: No valid targets for auto-firing');
      return;
    }

    // Filter and validate all targets thoroughly
    const validTargets = targets.filter(target => isValidVector3(target));

    if (validTargets.length === 0) {
      console.log('OptimizedProjectileSystem: No valid targets after filtering');
      return;
    }

    const projectileIndex = getInactiveProjectile();
    if (projectileIndex === -1) {
      console.log('OptimizedProjectileSystem: No inactive projectiles available');
      return;
    }

    const mesh = meshPoolRef.current[projectileIndex];
    if (!mesh) {
      console.log('OptimizedProjectileSystem: Mesh not found at index', projectileIndex);
      return;
    }

    // FIXED: Improved targeting with better enemy selection
    const targetIndex = lastTargetIndexRef.current % validTargets.length;
    lastTargetIndexRef.current = (lastTargetIndexRef.current + 1) % validTargets.length;
    
    const targetPosition = validTargets[targetIndex];
    const originalTargetIndex = targets.findIndex(target => 
      isValidVector3(target) && 
      target.x === targetPosition.x && 
      target.y === targetPosition.y && 
      target.z === targetPosition.z
    );

    const projectile = projectilePoolRef.current[projectileIndex];

    try {
      // FIXED: Use best available position for projectile spawning
      const spawnPosition = isValidVector3(staffTipPosition) ? staffTipPosition : playerPosition;
      
      projectile.position.copy(spawnPosition);
      projectile.direction.subVectors(targetPosition, spawnPosition).normalize();
      projectile.damage = damage || 1;
      projectile.targetIndex = Math.max(0, originalTargetIndex);
      projectile.active = true;
      projectile.life = MAX_LIFE;
      
      // Setup mesh safely
      mesh.position.copy(spawnPosition);
      mesh.visible = true;
      mesh.scale.setScalar(1);
      
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 1.0;
      material.color.setHex(0x00ffff);
      material.emissive.setHex(0x00ffff);
      
      console.log(`OptimizedProjectileSystem: Fired projectile from position ${spawnPosition.x.toFixed(2)}, ${spawnPosition.y.toFixed(2)}, ${spawnPosition.z.toFixed(2)} at enemy ${originalTargetIndex}`);
    } catch (error) {
      console.log('OptimizedProjectileSystem: Error setting up projectile:', error);
      projectile.active = false;
      mesh.visible = false;
    }
  };

  const manualFire = () => {
    console.log('OptimizedProjectileSystem: Manual fire triggered with', targetPositions.length, 'targets');
    if (Array.isArray(targetPositions) && targetPositions.length > 0) {
      fireProjectile(targetPositions);
      lastFireTimeRef.current = Date.now();
      console.log('OptimizedProjectileSystem: Manual fire successful');
    } else {
      console.log('OptimizedProjectileSystem: Manual fire failed - no valid targets');
    }
  };

  useImperativeHandle(ref, () => ({ manualFire }), []);

  useFrame((state, delta) => {
    // Early return with comprehensive validation
    if (!Array.isArray(targetPositions) || !delta || isNaN(delta) || delta <= 0) {
      return;
    }

    const now = Date.now();
    
    // FIXED: More aggressive auto-firing when enemies are present
    if (targetPositions.length > 0 && now - lastFireTimeRef.current >= fireRate) {
      try {
        fireProjectile(targetPositions);
        lastFireTimeRef.current = now;
        console.log('OptimizedProjectileSystem: Auto-fired at', targetPositions.length, 'targets');
      } catch (error) {
        console.log('OptimizedProjectileSystem: Auto-fire failed:', error);
      }
    }

    // Update active projectiles
    for (let i = 0; i < projectilePoolRef.current.length; i++) {
      const projectile = projectilePoolRef.current[i];
      if (!projectile.active) continue;

      const mesh = meshPoolRef.current[i];
      if (!mesh) continue;
      
      try {
        // Update position
        const deltaMovement = projectile.direction.clone().multiplyScalar(projectile.speed * delta);
        if (isValidVector3(deltaMovement)) {
          projectile.position.add(deltaMovement);
          mesh.position.copy(projectile.position);
        }
        
        // Update life
        projectile.life -= delta;
        
        // Check collision with target
        if (projectile.targetIndex >= 0 && projectile.targetIndex < targetPositions.length) {
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
              console.log('OptimizedProjectileSystem: Collision check failed');
              projectile.active = false;
              mesh.visible = false;
              continue;
            }
          }
        }
        
        // FIXED: Deactivate if too old or too far using current player position
        try {
          const currentPlayerPos = isValidVector3(playerPosition) ? playerPosition : new THREE.Vector3(0, 0, 0);
          const distanceFromPlayer = projectile.position.distanceTo(currentPlayerPos);
          
          if (projectile.life <= 0 || (!isNaN(distanceFromPlayer) && distanceFromPlayer > 80)) {
            projectile.active = false;
            mesh.visible = false;
          }
        } catch (error) {
          if (projectile.life <= 0) {
            projectile.active = false;
            mesh.visible = false;
          }
        }
      } catch (error) {
        console.log('OptimizedProjectileSystem: Projectile update failed');
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
