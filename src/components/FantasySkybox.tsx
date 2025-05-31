
import React, { useState } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface FantasySkyboxProps {
  opacity?: number;
  realm: 'fantasy' | 'scifi';
}

const FantasySkyboxContent: React.FC<FantasySkyboxProps> = ({ 
  opacity = 1,
  realm
}) => {
  const [hasError, setHasError] = useState(false);
  
  // Early return if not fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }
  
  let model;
  try {
    model = useGLTF('https://raw.githubusercontent.com/jake222colostate/enviornment/main/fantasy_skybox.glb');
  } catch (error) {
    console.error("Failed to load skybox model:", error);
    setHasError(true);
  }
  
  if (!model?.scene || hasError || realm !== 'fantasy') {
    // Fallback to existing gradient skybox only for fantasy realm
    if (realm === 'fantasy') {
      return (
        <mesh>
          <sphereGeometry args={[100, 32, 32]} />
          <meshBasicMaterial 
            transparent
            opacity={opacity}
            side={THREE.BackSide}
          >
            <primitive 
              object={new THREE.CanvasTexture((() => {
                const canvas = document.createElement('canvas');
                canvas.width = 512;
                canvas.height = 512;
                const ctx = canvas.getContext('2d')!;
                
                const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                gradient.addColorStop(0, '#87CEEB');
                gradient.addColorStop(1, '#E0F6FF');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                return canvas;
              })())}
            />
          </meshBasicMaterial>
        </mesh>
      );
    }
    return null;
  }

  const clonedScene = model.scene.clone();
  
  // Ensure skybox materials are optimized and face inward
  clonedScene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(mat => {
          mat.side = THREE.BackSide;
          mat.transparent = true;
          mat.opacity = opacity;
        });
      } else {
        child.material.side = THREE.BackSide;
        child.material.transparent = true;
        child.material.opacity = opacity;
      }
    }
  });

  return (
    <group>
      <primitive 
        object={clonedScene} 
        scale={[100, 100, 100]}
        position={[0, 0, 0]}
      />
    </group>
  );
};

export const FantasySkybox: React.FC<FantasySkyboxProps> = (props) => {
  // Early return if not fantasy realm
  if (props.realm !== 'fantasy') {
    return null;
  }

  return (
    <React.Suspense fallback={
      <mesh>
        <sphereGeometry args={[100, 32, 32]} />
        <meshBasicMaterial 
          transparent
          opacity={props.opacity || 1}
          side={THREE.BackSide}
          color="#87CEEB"
        />
      </mesh>
    }>
      <FantasySkyboxContent {...props} />
    </React.Suspense>
  );
};

// Only preload if we might need it for fantasy realm
try {
  useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/enviornment/main/fantasy_skybox.glb');
} catch (error) {
  console.warn('Failed to preload skybox model:', error);
}
