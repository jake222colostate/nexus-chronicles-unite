import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

const CentralObelisk: React.FC = () => {
  const obeliskRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (obeliskRef.current) {
      obeliskRef.current.rotation.y = t * 0.2;
    }
    if (glowRef.current && (glowRef.current.material as any)) {
      (glowRef.current.material as any).emissiveIntensity = 0.6 + Math.sin(t * 2) * 0.2;
    }
  });

  return (
    <group>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[2, 2, 1, 12]} />
        <meshStandardMaterial color="#7a7a7a" />
      </mesh>
      <mesh ref={obeliskRef} position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 4, 8]} />
        <meshStandardMaterial color="#a4c8ff" metalness={0.3} roughness={0.2} />
      </mesh>
      <mesh ref={glowRef} position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.62, 0.62, 4.1, 8]} />
        <meshStandardMaterial color="#80caff" emissive="#80caff" transparent opacity={0.35} />
      </mesh>
      <pointLight position={[0, 5, 0]} intensity={1} color="#80caff" distance={15} />
    </group>
  );
};

export default CentralObelisk;
