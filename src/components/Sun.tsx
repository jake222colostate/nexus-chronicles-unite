
import React from 'react';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

interface SunProps {
  position?: [number, number, number];
  color?: THREE.Color | string | number;
  intensity?: number;
}

export const Sun: React.FC<SunProps> = ({
  position = [10, 20, 5],
  color = new THREE.Color(1.0, 1.0, 0.9), // Brighter white-yellow sun
  intensity = 3.0 // Much brighter intensity
}) => {
  return (
    <>
      <group>
        <mesh position={position} scale={[3, 3, 3]}>
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
      {/* Enhanced bloom for brighter sun glow */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.3} intensity={1.2} />
      </EffectComposer>
    </>
  );
};
