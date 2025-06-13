
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

  // Load lightning bolt models for projectiles
  const { scene: lightningScene } = useGLTF(assetPath('assets/3_pack_of_storm_lightning.glb'));
  const lightningBolts = useMemo<THREE.Object3D[]>(() => {
    return lightningScene ? lightningScene.children.map(child => child.clone()) : [];
  }, [lightningScene]);
  
  // Scale applied to lightning bolt models
  const projectileScale = 0.5;

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

        const light = new THREE.PointLight('#00ffff', 1, 3);
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

    // Attach a random lightning bolt model
    if (lightningBolts.length > 0) {
      // remove previous model but keep light as first child
      while (mesh.children.length > 1) {
        mesh.remove(mesh.children[1]);
      }
      const boltIndex = Math.floor(Math.random() * lightningBolts.length);
      const bolt = lightningBolts[boltIndex].clone();
      bolt.scale.setScalar(projectileScale);
      mesh.add(bolt);
    }
    
    // Setup projectile
    projectile.position.copy(staffPos);
    projectile.direction.subVectors(targets[closestIndex], staffPos).normalize();
    projectile.damage = damage;
    projectile.targetIndex = closestIndex;
    projectile.active = true;
    projectile.life = MAX_LIFE;
    
    // Setup mesh
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
      <ambientLight intensity={0.8} color="#00ffff" />
    </group>
  );
});

useGLTF.preload(assetPath('assets/3_pack_of_storm_lightning.glb'));
