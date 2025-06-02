
import React from 'react';
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
            colors={['#130c30', '#44146a']}
            size={1024}
          />
        </meshBasicMaterial>
      </mesh>

      {/* Sparkles for magical starry effect */}
      <Sparkles 
        count={300} 
        scale={[500, 200, 500]} 
        size={2} 
        speed={0.1} 
        color="#99c2ff" 
      />
    </group>
  );
};
