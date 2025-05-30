
import React, { Suspense, useEffect } from 'react';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

interface EnvironmentLoaderProps {
  tier: number; // 1 through 5
}

const getModelUrls = (tier: number) => ({
  ground: `https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/ground_tier${tier}.glb`,
  mountain: `https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/mountain_tier${tier}.glb`,
  sky: `https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/sky_tier${tier}.glb`,
});

const EnhancedModel = ({ url, position = [0, 0, 0], scale = 1, enableGlow = false }: { 
  url: string; 
  position?: [number, number, number]; 
  scale?: number;
  enableGlow?: boolean;
}) => {
  const gltf = useLoader(GLTFLoader, url);

  useEffect(() => {
    if (enableGlow && gltf.scene) {
      // Add glowing materials to crystals and fantasy elements
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Clone material to avoid affecting other instances
          const material = child.material.clone();
          
          // Add emissive glow for fantasy atmosphere
          if (material instanceof THREE.MeshStandardMaterial) {
            material.emissive = new THREE.Color(0x8b5cf6); // Purple glow
            material.emissiveIntensity = 0.2;
            material.metalness = 0.1;
            material.roughness = 0.3;
          }
          
          child.material = material;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [gltf.scene, enableGlow]);

  return (
    <primitive 
      object={gltf.scene.clone()} 
      position={position} 
      scale={[scale, scale, scale]}
      dispose={null} 
    />
  );
};

const EnvironmentLoader: React.FC<EnvironmentLoaderProps> = ({ tier }) => {
  const { ground, mountain, sky } = getModelUrls(tier);

  return (
    <Suspense fallback={null}>
      {/* Ground model positioned below with glowing effects */}
      <EnhancedModel url={ground} position={[0, -2, 0]} scale={5} enableGlow={true} />
      
      {/* Mountain models positioned in background with glow */}
      <EnhancedModel url={mountain} position={[-15, 0, -30]} scale={3} enableGlow={true} />
      <EnhancedModel url={mountain} position={[15, 0, -30]} scale={3} enableGlow={true} />
      <EnhancedModel url={mountain} position={[0, 0, -35]} scale={2.5} enableGlow={true} />
      
      {/* Sky model positioned above */}
      <EnhancedModel url={sky} position={[0, 20, -20]} scale={8} enableGlow={false} />
      
      {/* Enhanced fantasy lighting setup */}
      <ambientLight intensity={0.3} color="#4c1d95" />
      
      {/* Main directional light with purple tint */}
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.6} 
        color="#e879f9"
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Multiple colored point lights for magical atmosphere */}
      <pointLight position={[0, 15, 0]} intensity={0.4} color="#8b5cf6" />
      <pointLight position={[-10, 8, -15]} intensity={0.3} color="#a855f7" />
      <pointLight position={[10, 8, -15]} intensity={0.3} color="#c084fc" />
      <pointLight position={[0, 5, 10]} intensity={0.2} color="#e879f9" />
      
      {/* Rim lighting for crystal enhancement */}
      <spotLight 
        position={[0, 25, 0]} 
        angle={Math.PI / 3} 
        penumbra={0.5} 
        intensity={0.5} 
        color="#ddd6fe"
        castShadow
      />
    </Suspense>
  );
};

export default EnvironmentLoader;
