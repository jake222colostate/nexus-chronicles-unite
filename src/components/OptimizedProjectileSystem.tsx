
import React, { useRef, useMemo, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface OptimizedProjectileSystemProps {
  staffTipPosition?: THREE.Vector3;
  targetPositions?: THREE.Vector3[];
  damage: number;
  fireRate: number;
  onHitEnemy: (index: number, damage: number) => void;
  playerPosition?: THREE.Vector3;
}

export interface OptimizedProjectileSystemHandle {
  manualFire: () => void;
  manualFireDirection: (direction: THREE.Vector3) => void;
}

interface ProjectileData {
  position: THREE.Vector3;
  direction: THREE.Vector3;
  speed: number;
  damage: number;
  targetIndex: number;
  active: boolean;
  life: number;
  isManual: boolean;
}

const MAX_PROJECTILES = 30;
const PROJECTILE_SPEED = 25;
const MAX_LIFE = 5;

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
  const { camera, raycaster, pointer } = useThree();
  const projectilePoolRef = useRef<ProjectileData[]>([]);
  const meshPoolRef = useRef<THREE.Mesh[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  const lastFireTimeRef = useRef(0);
  const meshPoolInitializedRef = useRef(false);

  const projectileGeometry = useMemo(() => new THREE.SphereGeometry(0.3, 12, 12), []);
  const projectileMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#00ffff', 
    emissive: '#00ffff', 
    emissiveIntensity: 0.8,
    transparent: false
  }), []);

  const manualProjectileMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#ffff00', 
    emissive: '#ffff00', 
    emissiveIntensity: 1.0,
    transparent: false
  }), []);

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

  const findClosestEnemy = (spawnPosition: THREE.Vector3, targets: THREE.Vector3[]): { targetIndex: number; targetPosition: THREE.Vector3 } | null => {
    if (!Array.isArray(targets) || targets.length === 0) {
      return null;
    }

    const validTargets = targets.filter(target => isValidVector3(target));
    if (validTargets.length === 0) {
      return null;
    }

    let closestDistance = Infinity;
    let closestIndex = -1;
    let closestTarget: THREE.Vector3 | null = null;

    validTargets.forEach((target, index) => {
      const distance = spawnPosition.distanceTo(target);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = targets.findIndex(t => 
          isValidVector3(t) && 
          t.x === target.x && 
          t.y === target.y && 
          t.z === target.z
        );
        closestTarget = target;
      }
    });

    if (closestTarget && closestIndex >= 0) {
      return { targetIndex: closestIndex, targetPosition: closestTarget };
    }

    return null;
  };

  const fireProjectileAtTarget = (targets: THREE.Vector3[] = []) => {
    if (!meshPoolInitializedRef.current) {
      console.log('OptimizedProjectileSystem: Mesh pool not initialized yet, skipping auto-fire');
      return;
    }

    if (!isValidVector3(staffTipPosition)) {
      if (!isValidVector3(playerPosition)) {
        console.log('OptimizedProjectileSystem: No valid position available for projectile spawning');
        return;
      }
    }

    if (!Array.isArray(targets) || targets.length === 0) {
      return;
    }

    const projectileIndex = getInactiveProjectile();
    if (projectileIndex === -1) {
      return;
    }

    const mesh = meshPoolRef.current[projectileIndex];
    if (!mesh) {
      return;
    }

    const spawnPosition = isValidVector3(staffTipPosition) ? staffTipPosition : playerPosition;
    const closestEnemy = findClosestEnemy(spawnPosition, targets);
    
    if (!closestEnemy) {
      return;
    }

    const projectile = projectilePoolRef.current[projectileIndex];

    try {
      projectile.position.copy(spawnPosition);
      projectile.direction.subVectors(closestEnemy.targetPosition, spawnPosition).normalize();
      projectile.damage = damage || 1;
      projectile.targetIndex = closestEnemy.targetIndex;
      projectile.active = true;
      projectile.life = MAX_LIFE;
      projectile.isManual = false;
      
      mesh.position.copy(spawnPosition);
      mesh.visible = true;
      mesh.scale.setScalar(1);
      
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.8;
      material.color.setHex(0x00ffff);
      material.emissive.setHex(0x00ffff);
      
      console.log(`OptimizedProjectileSystem: Auto-fired projectile at closest enemy ${closestEnemy.targetIndex}`);
    } catch (error) {
      console.log('OptimizedProjectileSystem: Error setting up auto projectile:', error);
      projectile.active = false;
      mesh.visible = false;
    }
  };

  const fireProjectileInDirection = (direction: THREE.Vector3) => {
    if (!meshPoolInitializedRef.current) {
      console.log('OptimizedProjectileSystem: Mesh pool not initialized yet, skipping manual fire');
      return;
    }

    if (!isValidVector3(staffTipPosition)) {
      if (!isValidVector3(playerPosition)) {
        console.log('OptimizedProjectileSystem: No valid position available for manual projectile spawning');
        return;
      }
    }

    const projectileIndex = getInactiveProjectile();
    if (projectileIndex === -1) {
      console.log('OptimizedProjectileSystem: No inactive projectiles available for manual fire');
      return;
    }

    const mesh = meshPoolRef.current[projectileIndex];
    if (!mesh) {
      return;
    }

    const spawnPosition = isValidVector3(staffTipPosition) ? staffTipPosition : playerPosition;
    const projectile = projectilePoolRef.current[projectileIndex];

    try {
      projectile.position.copy(spawnPosition);
      projectile.direction.copy(direction.normalize());
      projectile.damage = damage || 1;
      projectile.targetIndex = -1;
      projectile.active = true;
      projectile.life = MAX_LIFE;
      projectile.isManual = true;
      
      mesh.position.copy(spawnPosition);
      mesh.visible = true;
      mesh.scale.setScalar(1.2); // Slightly bigger for manual projectiles
      
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 1.0;
      material.color.setHex(0xffff00);
      material.emissive.setHex(0xffff00);
      
      console.log('OptimizedProjectileSystem: Manual fire projectile launched in direction:', direction);
    } catch (error) {
      console.log('OptimizedProjectileSystem: Error setting up manual projectile:', error);
      projectile.active = false;
      mesh.visible = false;
    }
  };

  const getClickDirection = (): THREE.Vector3 | null => {
    if (!camera) return null;

    try {
      // Create a direction from camera forward with slight downward angle
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      
      // Add slight variation based on current pointer position if available
      if (pointer) {
        const horizontalOffset = pointer.x * 0.3;
        const verticalOffset = -pointer.y * 0.2;
        
        const cameraRight = new THREE.Vector3();
        const cameraUp = new THREE.Vector3();
        
        cameraRight.crossVectors(direction, camera.up).normalize();
        cameraUp.crossVectors(cameraRight, direction).normalize();
        
        direction.add(cameraRight.multiplyScalar(horizontalOffset));
        direction.add(cameraUp.multiplyScalar(verticalOffset));
      }
      
      return direction.normalize();
    } catch (error) {
      console.log('OptimizedProjectileSystem: Error calculating click direction:', error);
      return null;
    }
  };

  const manualFire = () => {
    console.log('OptimizedProjectileSystem: Manual fire triggered');
    if (Array.isArray(targetPositions) && targetPositions.length > 0) {
      fireProjectileAtTarget(targetPositions);
    }
  };

  const manualFireDirection = () => {
    console.log('OptimizedProjectileSystem: Manual directional fire triggered');
    const direction = getClickDirection();
    if (direction) {
      fireProjectileInDirection(direction);
    }
  };

  useImperativeHandle(ref, () => ({ 
    manualFire, 
    manualFireDirection 
  }), []);

  // Set up click/tap event listeners for manual directional shooting
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      console.log('OptimizedProjectileSystem: Click detected for directional shooting');
      event.preventDefault();
      manualFireDirection();
    };

    const handleTouch = (event: TouchEvent) => {
      console.log('OptimizedProjectileSystem: Touch detected for directional shooting');
      event.preventDefault();
      manualFireDirection();
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('click', handleClick);
      canvas.addEventListener('touchstart', handleTouch, { passive: false });
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('click', handleClick);
        canvas.removeEventListener('touchstart', handleTouch);
      }
    };
  }, []);

  useFrame((state, delta) => {
    if (!Array.isArray(targetPositions) || !delta || isNaN(delta) || delta <= 0) {
      return;
    }

    const now = Date.now();
    
    // Auto-fire at closest enemy at regular intervals
    if (targetPositions.length > 0 && now - lastFireTimeRef.current >= fireRate) {
      try {
        fireProjectileAtTarget(targetPositions);
        lastFireTimeRef.current = now;
      } catch (error) {
        console.log('OptimizedProjectileSystem: Auto-fire failed:', error);
      }
    }

    // Update all active projectiles
    for (let i = 0; i < projectilePoolRef.current.length; i++) {
      const projectile = projectilePoolRef.current[i];
      if (!projectile.active) continue;

      const mesh = meshPoolRef.current[i];
      if (!mesh) continue;
      
      try {
        const deltaMovement = projectile.direction.clone().multiplyScalar(projectile.speed * delta);
        if (isValidVector3(deltaMovement)) {
          projectile.position.add(deltaMovement);
          mesh.position.copy(projectile.position);
        }
        
        projectile.life -= delta;
        
        // Check collision with enemies (only for auto-targeting projectiles)
        if (!projectile.isManual && projectile.targetIndex >= 0 && projectile.targetIndex < targetPositions.length) {
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
        
        // Check if projectile should be deactivated
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
