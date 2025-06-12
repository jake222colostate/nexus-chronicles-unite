import React, { useRef, useEffect } from 'react';
import { useFBX } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';

interface ScifiCannonProps {
  target?: Vector3;
}

export const ScifiCannon: React.FC<ScifiCannonProps> = ({ target }) => {
  const group = useRef<THREE.Group>(null);
  const fbx = useFBX('/assets/c1/scifi-cannon/source/300_Gun.fbx');

  useFrame(() => {
    if (group.current && target) {
      group.current.lookAt(target);
    }
  });

  // Scale down and rotate for better orientation
  useEffect(() => {
    if (group.current) {
      group.current.rotation.x = Math.PI / 2;
    }
  }, []);

  return (
    <primitive ref={group} object={fbx.clone()} position={[0, -1.5, 4]} scale={0.003} />
  );
};


