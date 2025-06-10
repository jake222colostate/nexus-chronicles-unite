import React from 'react';
import * as THREE from 'three';

interface SunProps {
  position?: [number, number, number];
  color?: THREE.Color | string | number;
  intensity?: number;
}

export const Sun: React.FC<SunProps> = ({
  position = [10, 20, 5],
  color = new THREE.Color(1.0, 0.95, 0.8),
  intensity = 1.5
}) => {
  return (
    <group>
      <mesh position={position} scale={[2, 2, 2]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <directionalLight
        position={position}
        color={color}
        intensity={intensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-bias={-0.001}
      />
    </group>
  );
};
