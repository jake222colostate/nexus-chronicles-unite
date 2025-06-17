
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

const MAX_PROJECTILES = 20;
const PROJECTILE_SPEED = 25;
const MAX_LIFE = 5;

export const OptimizedProjectileSystem = forwardRef<
  OptimizedProjectileSystemHandle,
  OptimizedProjectileSystemProps
>(({ staffTipPosition, targetPositions, damage, fireRate, onHitEnemy }, ref) => {
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
        // Create a simple, bright, reliable projectile mesh
        const mesh = new THREE.Mesh(projectileGeometry, projectileMaterial.clone());
        mesh.visible = false;
        mesh.scale.setScalar(1);
        meshPoolRef.current.push(mesh);
        groupRef.current.add(mesh);
        console.log(`Created projectile mesh ${i}`);
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

  const fireProjectile = (staffPos: THREE.Vector3, targets: THREE.Vector3[]) => {
    if (targets.length === 0) {
      console.log('No targets available for projectile');
      return;
    }

    const projectileIndex = getInactiveProjectile();
    if (projectileIndex === -1) {
      console.log('No available projectiles in pool');
      return;
    }

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

    // Setup projectile data
    projectile.position.copy(staffPos);
    projectile.direction.subVectors(targets[closestIndex], staffPos).normalize();
    projectile.damage = damage;
    projectile.targetIndex = closestIndex;
    projectile.active = true;
    projectile.life = MAX_LIFE;
    
    // Setup mesh - make it bright and visible
    mesh.position.copy(staffPos);
    mesh.visible = true;
    mesh.scale.setScalar(1);
    
    // Make material even brighter
    const material = mesh.material as THREE.MeshStandardMaterial;
    material.emissiveIntensity = 1.0;
    material.color.setHex(0x00ffff);
    material.emissive.setHex(0x00ffff);

    console.log(`Fired projectile ${projectileIndex} from`, staffPos, 'to target', closestIndex, 'at position', targets[closestIndex]);
    console.log(`Mesh visible: ${mesh.visible}, position:`, mesh.position);
  };

  const manualFire = () => {
    console.log('Manual fire triggered');
    fireProjectile(staffTipPosition, targetPositions);
    lastFireTimeRef.current = Date.now();
  };

  useImperativeHandle(ref, () => ({ manualFire }), []);

  useFrame((state, delta) => {
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
      <ambientLight intensity={1.5} color="#00ffff" />
    </group>
  );
});
