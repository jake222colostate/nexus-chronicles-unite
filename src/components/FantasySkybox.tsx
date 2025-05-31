
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
  console.log('FantasySkyboxContent: Checking realm before any operations:', realm);
  
  // CRITICAL: Absolutely no operations if not fantasy realm
  if (realm !== 'fantasy') {
    console.log('FantasySkyboxContent: EARLY EXIT - not fantasy realm');
    return null;
  }
  
  console.log('FantasySkyboxContent: Proceeding with FANTASY realm only');
  
  const [hasError, setHasError] = useState(false);
  
  // Only call useGLTF hook if we're definitely in fantasy realm
  let model;
  try {
    console.log('FantasySkyboxContent: Loading GLTF model for fantasy realm');
    model = useGLTF('https://raw.githubusercontent.com/jake222colostate/enviornment/main/fantasy_skybox.glb');
    console.log('FantasySkyboxContent: GLTF model loaded successfully');
  } catch (error) {
    console.error("FantasySkyboxContent: Failed to load skybox model:", error);
    setHasError(true);
  }
  
  if (!model?.scene || hasError) {
    console.log('FantasySkyboxContent: Using fallback skybox for fantasy realm');
    // Fallback to gradient skybox for fantasy realm
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

  console.log('FantasySkyboxContent: Rendering GLTF skybox');

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
  console.log('FantasySkybox: Called with realm:', props.realm);
  
  // CRITICAL: Absolutely no rendering if not fantasy realm
  if (props.realm !== 'fantasy') {
    console.log('FantasySkybox: REJECTING - not fantasy realm');
    return null;
  }

  console.log('FantasySkybox: PROCEEDING with fantasy realm');

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
