
import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

const FANTASY_SKYBOX_URL = 'https://raw.githubusercontent.com/jake222colostate/HIGHPOLY/main/fantasy_skybox.glb';

// Fallback skybox using gradient sphere
const FallbackSkybox: React.FC = () => {
  return (
    <mesh>
      <sphereGeometry args={[200, 32, 32]} />
      <meshBasicMaterial 
        side={THREE.BackSide}
        color="#4C1D95"
      />
    </mesh>
  );
};

// GLB Skybox component
const GLBSkybox: React.FC<{ useFallback: boolean }> = ({ useFallback }) => {
  
  if (useFallback) {
    return <FallbackSkybox />;
  }

  try {
    const { scene } = useGLTF(FANTASY_SKYBOX_URL);
    
    if (!scene) {
      console.warn('Fantasy skybox scene not loaded, using fallback');
      return <FallbackSkybox />;
    }

    console.log('Fantasy skybox loaded successfully');
    
    // Clone the scene and ensure proper scaling for skybox
    const clonedScene = scene.clone();
    clonedScene.scale.set(200, 200, 200); // Scale to surround the entire scene
    
    return (
      <primitive 
        object={clonedScene}
      />
    );
  } catch (error) {
    console.error('Failed to load fantasy skybox model, using fallback:', error);
    return <FallbackSkybox />;
  }
};

interface FantasySkyboxSystemProps {
  realm: 'fantasy' | 'scifi';
}

export const FantasySkyboxSystem: React.FC<FantasySkyboxSystemProps> = ({
  realm
}) => {
  const [modelLoadFailed, setModelLoadFailed] = useState(false);
  const [useEnvironmentBackground, setUseEnvironmentBackground] = useState(false);
  const loadAttempted = useRef(false);

  console.log('FantasySkyboxSystem render - Realm:', realm);

  // Test model loading on mount
  useEffect(() => {
    if (!loadAttempted.current && realm === 'fantasy') {
      loadAttempted.current = true;
      
      const testLoad = async () => {
        try {
          console.log('FantasySkyboxSystem: Testing skybox model load...');
          const response = await fetch(FANTASY_SKYBOX_URL);
          if (!response.ok) {
            console.error('FantasySkyboxSystem: Skybox model URL not accessible:', response.status);
            setModelLoadFailed(true);
            setUseEnvironmentBackground(true);
          } else {
            console.log('FantasySkyboxSystem: Skybox model URL is accessible');
          }
        } catch (error) {
          console.error('FantasySkyboxSystem: Skybox model URL test failed:', error);
          setModelLoadFailed(true);
          setUseEnvironmentBackground(true);
        }
      };
      
      testLoad();
    }
  }, [realm]);

  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    console.log('FantasySkyboxSystem: Not fantasy realm, skipping');
    return null;
  }

  // If model failed to load, use Environment background as fallback
  if (useEnvironmentBackground) {
    console.log('FantasySkyboxSystem: Using Environment background as fallback');
    return (
      <Suspense fallback={null}>
        <Environment 
          background 
          preset="sunset"
        />
        {/* Add some atmospheric effects */}
        <fog 
          attach="fog" 
          args={['#8B5CF6', 50, 200]} 
        />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<FallbackSkybox />}>
      <GLBSkybox useFallback={modelLoadFailed} />
      {/* Add atmospheric fog */}
      <fog 
        attach="fog" 
        args={['#8B5CF6', 50, 200]} 
      />
    </Suspense>
  );
};

// Preload the model for better performance
console.log('Attempting to preload fantasy skybox model:', FANTASY_SKYBOX_URL);
try {
  useGLTF.preload(FANTASY_SKYBOX_URL);
} catch (error) {
  console.warn('Failed to preload fantasy skybox model, will use environment background:', error);
}
