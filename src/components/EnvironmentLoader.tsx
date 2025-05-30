
import React, { Suspense } from 'react';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { useLoader } from '@react-three/fiber';

interface EnvironmentLoaderProps {
  tier: number; // 1 through 5
}

const getModelUrls = (tier: number) => ({
  ground: `https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/ground_tier${tier}.glb`,
  mountain: `https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/mountain_tier${tier}.glb`,
  sky: `https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/sky_tier${tier}.glb`,
});

const Model = ({ url, position = [0, 0, 0], scale = 1 }: { 
  url: string; 
  position?: [number, number, number]; 
  scale?: number;
}) => {
  const gltf = useLoader(GLTFLoader, url);
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
      {/* Ground model positioned below */}
      <Model url={ground} position={[0, -2, 0]} scale={5} />
      
      {/* Mountain models positioned in background */}
      <Model url={mountain} position={[-15, 0, -30]} scale={3} />
      <Model url={mountain} position={[15, 0, -30]} scale={3} />
      
      {/* Sky model positioned above */}
      <Model url={sky} position={[0, 20, -20]} scale={8} />
      
      {/* Enhanced lighting for the environment */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[0, 15, 0]} intensity={0.3} color="#8b5cf6" />
    </Suspense>
  );
};

export default EnvironmentLoader;
