
import React, { Suspense } from 'react';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

const FANTASY_SKYBOX_URL = 'https://raw.githubusercontent.com/jake222colostate/OK/main/fantasy_skybox.glb';

// GLB Skybox component
const GLBSkybox: React.FC = () => {
  try {
    const { scene } = useGLTF(FANTASY_SKYBOX_URL);
    
    if (!scene) {
      console.error('Fantasy skybox scene not loaded, using environment fallback');
      return (
        <Environment 
          background 
          preset="sunset"
        />
      );
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
    console.error('Failed to load fantasy skybox model:', error);
    return (
      <Environment 
        background 
        preset="sunset"
      />
    );
  }
};

interface FantasySkyboxSystemProps {
  realm: 'fantasy' | 'scifi';
}

export const FantasySkyboxSystem: React.FC<FantasySkyboxSystemProps> = ({
  realm
}) => {
  console.log('FantasySkyboxSystem render - Realm:', realm);

  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    console.log('FantasySkyboxSystem: Not fantasy realm, skipping');
    return null;
  }

  return (
    <Suspense fallback={<Environment background preset="sunset" />}>
      <GLBSkybox />
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
  console.error('Failed to preload fantasy skybox model:', error);
}
