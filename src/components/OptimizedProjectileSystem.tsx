
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

const MAX_PROJECTILES = 15; // REDUCED: Fewer projectiles for better performance
const PROJECTILE_SPEED = 30;
const MAX_LIFE = 3; // REDUCED: Shorter projectile life

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
  const { camera } = useThree();
  const projectilePoolRef = useRef<ProjectileData[]>([]);
  const meshPoolRef = useRef<THREE.Mesh[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  const lastFireTimeRef = useRef(0);
  const meshPoolInitializedRef = useRef(false);
  const frameCountRef = useRef(0); // ADDED: Frame counting for optimization

  const projectileGeometry = useMemo(() => new THREE.SphereGeometry(0.2, 8, 8), []); // REDUCED: Simpler geometry
  const projectileMaterial = useMemo(() => new THREE.MeshBasicMaterial({ // CHANGED: Use MeshBasicMaterial for performance
    color: '#00ffff', 
    transparent: false
  }), []);

  const manualProjectileMaterial = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#ffff00', 
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
          life: 0,
          isManual: false
        });
      }
      console.log('OptimizedProjectileSystem: Projectile pool initialized');
    }
  }, []);

  // Initialize mesh pool
  useEffect(() => {
    if (groupRef.current && !meshPoolInitializedRef.current) {
      meshPoolRef.current = [];
      
      for (let i = 0; i < MAX_PROJECTILES; i++) {
        const mesh = new THREE.Mesh(projectileGeometry, projectileMaterial.clone());
        mesh.visible = false;
        mesh.scale.setScalar(1);
        meshPoolRef.current.push(mesh);
        groupRef.current.add(mesh);
      }
      
      meshPoolInitializedRef.current = true;
      console.log('OptimizedProjectileSystem: Mesh pool initialized');
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

  // OPTIMIZED: Simpler closest enemy finding
  const findClosestEnemy = (spawnPosition: THREE.Vector3, targets: THREE.Vector3[]): { targetIndex: number; targetPosition: THREE.Vector3 } | null => {
    if (!Array.isArray(targets) || targets.length === 0) {
      return null;
    }

    let closestDistance = Infinity;
    let closestIndex = -1;
    let closestTarget: THREE.Vector3 | null = null;

    for (let i = 0; i < Math.min(targets.length, 5); i++) { // LIMIT: Only check first 5 enemies
      const target = targets[i];
      if (isValidVector3(target)) {
        const distance = spawnPosition.distanceToSquared(target); // OPTIMIZED: Use squared distance
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
          closestTarget = target;
        }
      }
    }

    return closestTarget && closestIndex >= 0 ? { targetIndex: closestIndex, targetPosition: closestTarget } : null;
  };

  // OPTIMIZED: Simplified projectile firing
  const fireProjectileAtTarget = (targets: THREE.Vector3[] = []) => {
    if (!meshPoolInitializedRef.current || targets.length === 0) return;

    const projectileIndex = getInactiveProjectile();
    if (projectileIndex === -1) return;

    const spawnPosition = isValidVector3(staffTipPosition) ? staffTipPosition : (playerPosition || new THREE.Vector3(0, 2, 10));
    const closestEnemy = findClosestEnemy(spawnPosition, targets);
    
    if (!closestEnemy) return;

    const projectile = projectilePoolRef.current[projectileIndex];
    const mesh = meshPoolRef.current[projectileIndex];

    projectile.position.copy(spawnPosition);
    projectile.direction.subVectors(closestEnemy.targetPosition, spawnPosition).normalize();
    projectile.damage = damage || 1;
    projectile.targetIndex = closestEnemy.targetIndex;
    projectile.active = true;
    projectile.life = MAX_LIFE;
    projectile.isManual = false;
    
    mesh.position.copy(spawnPosition);
    mesh.visible = true;
    mesh.material = projectileMaterial;
  };

  const manualFire = () => {
    if (Array.isArray(targetPositions) && targetPositions.length > 0) {
      fireProjectileAtTarget(targetPositions);
    }
  };

  const manualFireDirection = () => {
    // Simplified manual fire - just fire forward
    if (!camera) return;
    
    const projectileIndex = getInactiveProjectile();
    if (projectileIndex === -1) return;

    const spawnPosition = isValidVector3(staffTipPosition) ? staffTipPosition : (playerPosition || camera.position);
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    const projectile = projectilePoolRef.current[projectileIndex];
    const mesh = meshPoolRef.current[projectileIndex];

    projectile.position.copy(spawnPosition);
    projectile.direction.copy(direction);
    projectile.damage = damage || 1;
    projectile.targetIndex = -1;
    projectile.active = true;
    projectile.life = MAX_LIFE;
    projectile.isManual = true;
    
    mesh.position.copy(spawnPosition);
    mesh.visible = true;
    mesh.material = manualProjectileMaterial;
  };

  useImperativeHandle(ref, () => ({ 
    manualFire, 
    manualFireDirection 
  }), []);

  // OPTIMIZED: Reduced frame rate processing
  useFrame((state, delta) => {
    frameCountRef.current++;
    
    // OPTIMIZATION: Only process every 2nd frame for auto-firing
    if (frameCountRef.current % 2 === 0 && Array.isArray(targetPositions) && targetPositions.length > 0) {
      const now = Date.now();
      if (now - lastFireTimeRef.current >= fireRate) {
        fireProjectileAtTarget(targetPositions);
        lastFireTimeRef.current = now;
      }
    }

    // Update projectiles every frame but with optimizations
    for (let i = 0; i < projectilePoolRef.current.length; i++) {
      const projectile = projectilePoolRef.current[i];
      if (!projectile.active) continue;

      const mesh = meshPoolRef.current[i];
      if (!mesh) continue;
      
      // OPTIMIZED: Simpler movement calculation
      projectile.position.addScaledVector(projectile.direction, projectile.speed * delta);
      mesh.position.copy(projectile.position);
      
      projectile.life -= delta;
      
      // OPTIMIZED: Simpler collision detection
      if (!projectile.isManual && projectile.targetIndex >= 0 && projectile.targetIndex < targetPositions.length) {
        const targetPos = targetPositions[projectile.targetIndex];
        if (isValidVector3(targetPos) && projectile.position.distanceToSquared(targetPos) < 2.25) { // 1.5^2
          onHitEnemy(projectile.targetIndex, projectile.damage);
          projectile.active = false;
          mesh.visible = false;
          continue;
        }
      }
      
      // OPTIMIZED: Simpler cleanup
      if (projectile.life <= 0) {
        projectile.active = false;
        mesh.visible = false;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} color="#00ffff" />
    </group>
  );
});
