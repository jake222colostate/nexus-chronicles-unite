
import React, { Suspense } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useLoader } from '@react-three/fiber';

interface EnvironmentProps {
  tier: number; // 1 through 5
}

const getModelUrls = (tier: number) => ({
  ground: `https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/ground_tier${tier}.glb`,
  mountain: `https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/mountain_tier${tier}.glb`,
  sky: `https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/sky_tier${tier}.glb`,
});

const Model = ({ url }: { url: string }) => {
  const gltf = useLoader(GLTFLoader, url);
  return <primitive object={gltf.scene} dispose={null} />;
};

const EnvironmentLoader: React.FC<EnvironmentProps> = ({ tier }) => {
  const { ground, mountain, sky } = getModelUrls(tier);

  return (
    <Suspense fallback={null}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 7]} intensity={1.2} />
      <Model url={ground} />
      <Model url={mountain} />
      <Model url={sky} />
      <OrbitControls enableZoom={false} />
    </Suspense>
  );
};

export default EnvironmentLoader;
