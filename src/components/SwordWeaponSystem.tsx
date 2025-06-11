import React, { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { assetPath } from '../lib/assetPath';

interface SwordWeaponSystemProps {
  damage: number;
  enemyPositions: THREE.Vector3[];
  onHitEnemy: (index: number, damage: number) => void;
}

export const SwordWeaponSystem: React.FC<SwordWeaponSystemProps> = ({
  damage,
  enemyPositions,
  onHitEnemy
}) => {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Object3D | null>(null);
  const swingRef = useRef(false);
  const hitRef = useRef(false);
  const swingProgress = useRef(0);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(assetPath('assets/sword_uitlbiaga_mid.glb'), gltf => {
      setModel(gltf.scene);
    });
  }, []);

  useEffect(() => {
    const handleClick = () => {
      if (!swingRef.current) {
        swingRef.current = true;
        hitRef.current = false;
        swingProgress.current = 0;
      }
    };
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current || !camera) return;

    const cameraForward = new THREE.Vector3();
    const cameraRight = new THREE.Vector3();
    const cameraUp = new THREE.Vector3();

    camera.getWorldDirection(cameraForward);
    cameraRight.crossVectors(cameraUp.set(0, 1, 0), cameraForward).normalize();
    cameraUp.crossVectors(cameraForward, cameraRight).normalize();

    const pos = camera.position.clone()
      .add(cameraRight.clone().multiplyScalar(0.35))
      .add(cameraUp.clone().multiplyScalar(-0.25))
      .add(cameraForward.clone().multiplyScalar(0.5));
    groupRef.current.position.copy(pos);

    groupRef.current.rotation.copy(camera.rotation);
    groupRef.current.rotateY(-Math.PI / 6);
    groupRef.current.rotateZ(Math.PI / 4);

    if (swingRef.current) {
      const duration = 0.3;
      swingProgress.current += delta;
      const t = Math.min(swingProgress.current / duration, 1);
      groupRef.current.rotation.x -= Math.sin(t * Math.PI) * 1.2 * delta / duration;

      if (t > 0.2 && t < 0.7 && !hitRef.current) {
        enemyPositions.forEach((pos, idx) => {
          if (pos.distanceTo(camera.position) < 2) {
            onHitEnemy(idx, damage);
            hitRef.current = true;
          }
        });
      }

      if (t >= 1) {
        swingRef.current = false;
        swingProgress.current = 0;
      }
    }
  });

  if (!model) return null;

  return (
    <group ref={groupRef}>
      <primitive object={model} scale={[0.6, 0.6, 0.6]} />
    </group>
  );
};
