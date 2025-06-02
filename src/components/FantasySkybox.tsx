
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { GradientTexture, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export const FantasySkybox: React.FC = () => {
  return (
    <group>
      {/* Main fantasy skybox sphere with gradient */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[500, 64, 64]} />
        <meshBasicMaterial side={THREE.BackSide}>
          <GradientTexture
            stops={[0, 1]}
            colors={['#1b0036', '#421C6D']}
            size={1024}
          />
        </meshBasicMaterial>
      </mesh>

      {/* Sparkles for magical starry effect */}
      <Sparkles 
        count={150} 
        scale={[100, 100, 100]} 
        size={2} 
        speed={0.2} 
        color="#99c2ff" 
      />
    </group>
  );
};
