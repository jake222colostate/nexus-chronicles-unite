
import React, { useState, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';

interface ModelLoader3DProps {
  modelPath?: string;
  fallbackComponent: React.ReactNode;
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}

const LoadedModel: React.FC<{ 
  modelPath: string; 
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}> = ({ modelPath, position, scale = 1, rotation }) => {
  try {
    const { scene } = useGLTF(modelPath);
    return (
      <primitive 
        object={scene.clone()} 
        position={position}
        scale={scale}
        rotation={rotation}
      />
    );
  } catch (error) {
    console.warn(`Failed to load model: ${modelPath}`, error);
    return null;
  }
};

export const ModelLoader3D: React.FC<ModelLoader3DProps> = ({
  modelPath,
  fallbackComponent,
  position,
  scale,
  rotation
}) => {
  const [loadError, setLoadError] = useState(false);

  // If no model path provided, use fallback
  if (!modelPath) {
    return <>{fallbackComponent}</>;
  }

  // If load error occurred, use fallback
  if (loadError) {
    return <>{fallbackComponent}</>;
  }

  return (
    <Suspense fallback={fallbackComponent}>
      <LoadedModel 
        modelPath={modelPath}
        position={position}
        scale={scale}
        rotation={rotation}
      />
    </Suspense>
  );
};

// Model path constants for easy management
export const MODEL_PATHS = {
  enemies: {
    slime: '/models/enemies/slime.glb',
    goblin: '/models/enemies/goblin.glb', 
    orc: '/models/enemies/orc.glb'
  },
  weapons: {
    wizardStaff: '/models/weapons/wizard_staff.glb'
  }
};
