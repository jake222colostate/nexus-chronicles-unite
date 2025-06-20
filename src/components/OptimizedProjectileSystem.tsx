
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

  const fireProjectile = (staffPos?: THREE.Vector3, targets: THREE.Vector3[] = []) => {
    // SAFETY CHECK: Ensure we have valid inputs
    if (!staffPos || !targets || targets.length === 0) {
      console.log('OptimizedProjectileSystem: Cannot fire - invalid staff position or no targets');
      return;
    }

    // Filter out undefined targets and validate positions
    const validTargets = targets.filter((target): target is THREE.Vector3 => 
      target && target instanceof THREE.Vector3 && 
      typeof target.x === 'number' && 
      typeof target.y === 'number' && 
      typeof target.z === 'number'
    );

    if (validTargets.length === 0) {
      console.log('OptimizedProjectileSystem: No valid targets available');
      return;
    }

    const projectileIndex = getInactiveProjectile();
    if (projectileIndex === -1) {
      console.log('OptimizedProjectileSystem: No available projectiles in pool');
      return;
    }

    // Find closest valid target
    let closestIndex = 0;
    let closestDistance = Infinity;
    
    validTargets.forEach((targetPos, index) => {
      const distance = staffPos.distanceTo(targetPos);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    const projectile = projectilePoolRef.current[projectileIndex];
    const mesh = meshPoolRef.current[projectileIndex];

    // Use valid target and store original index
    const targetPosition = validTargets[closestIndex];
    const originalTargetIndex = targets.indexOf(targetPosition);

    // Setup projectile data
    projectile.position.copy(staffPos);
    projectile.direction.subVectors(targetPosition, staffPos).normalize();
    projectile.damage = damage;
    projectile.targetIndex = originalTargetIndex;
    projectile.active = true;
    projectile.life = MAX_LIFE;
    
    // Setup mesh
    mesh.position.copy(staffPos);
    mesh.visible = true;
    mesh.scale.setScalar(1);
    
    const material = mesh.material as THREE.MeshStandardMaterial;
    material.emissiveIntensity = 1.0;
    material.color.setHex(0x00ffff);
    material.emissive.setHex(0x00ffff);

    console.log(`OptimizedProjectileSystem: Fired projectile ${projectileIndex} to target ${originalTargetIndex}`);
  };

  const manualFire = () => {
    console.log('OptimizedProjectileSystem: Manual fire triggered');
    if (staffTipPosition && targetPositions && targetPositions.length > 0) {
      fireProjectile(staffTipPosition, targetPositions);
      lastFireTimeRef.current = Date.now();
    } else {
      console.log('OptimizedProjectileSystem: Manual fire failed - missing staff position or targets');
    }
  };

  useImperativeHandle(ref, () => ({ manualFire }), []);

  useFrame((state, delta) => {
    // CRITICAL SAFETY CHECK: Prevent crashes from undefined props
    if (!staffTipPosition || !targetPositions || !Array.isArray(targetPositions)) {
      // Don't log continuously to avoid spam, but ensure we don't crash
      return;
    }

    const now = Date.now();
    
    // Auto fire projectiles
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
      
      // Check collision with target - add safety checks
      if (projectile.targetIndex >= 0 && 
          projectile.targetIndex < targetPositions.length && 
          targetPositions[projectile.targetIndex]) {
        
        const targetPos = targetPositions[projectile.targetIndex];
        if (targetPos && projectile.position.distanceTo(targetPos) < 1.5) {
          onHitEnemy(projectile.targetIndex, projectile.damage);
          projectile.active = false;
          mesh.visible = false;
          console.log('OptimizedProjectileSystem: Projectile hit target', projectile.targetIndex);
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
      <ambientLight intensity={1.5} color="#00ffff" />
    </group>
  );
});
