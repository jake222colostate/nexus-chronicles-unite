import React, { Suspense, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { Object3D } from 'three';

interface GLBModelLoaderProps {
  path: string;
  scale?: number | [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  dracoCompressed?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  onLoad?: (scene: Object3D) => void;
  onError?: (error: Error) => void;
  fallback?: React.ReactNode;
  retryOnFailure?: boolean;
}

// Loading spinner fallback
const LoadingSpinner: React.FC<{ scale?: number | [number, number, number] }> = ({ scale = 1 }) => (
  <mesh scale={scale}>
    <ringGeometry args={[0.8, 1, 8]} />
    <meshBasicMaterial color="#6b7280" transparent opacity={0.6} />
  </mesh>
);

// Error fallback with retry option
const ErrorFallback: React.FC<{ 
  scale?: number | [number, number, number];
  onRetry?: () => void;
  showRetry?: boolean;
}> = ({ scale = 1, onRetry, showRetry }) => (
  <group>
    <mesh scale={scale}>
      <octahedronGeometry args={[0.5]} />
      <meshBasicMaterial color="#ef4444" transparent opacity={0.7} />
    </mesh>
    {showRetry && onRetry && (
      <mesh position={[0, 1, 0]} onClick={onRetry}>
        <planeGeometry args={[1, 0.3]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>
    )}
  </group>
);

// Core GLB model component
const GLBModel: React.FC<GLBModelLoaderProps> = ({
  path,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  dracoCompressed = false,
  castShadow = true,
  receiveShadow = true,
  onLoad,
  onError,
  fallback,
  retryOnFailure = true
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const maxRetries = retryOnFailure ? 1 : 0;

  // Load GLB with error handling and retry logic
  let scene: Object3D | null = null;
  try {
    const gltf = useGLTF(path, dracoCompressed);
    scene = gltf.scene;
    
    // Configure shadows
    scene.traverse((child) => {
      if (child instanceof Object3D && 'isMesh' in child && child.isMesh) {
        child.castShadow = castShadow;
        child.receiveShadow = receiveShadow;
      }
    });

    // Call onLoad callback
    useEffect(() => {
      if (scene && onLoad) {
        onLoad(scene);
      }
    }, [scene, onLoad]);

    // Reset error state on successful load
    if (loadError) {
      setLoadError(null);
    }
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('GLB load failed');
    console.warn(`❌ Failed to load GLB model: ${path}`, errorObj);
    
    if (!loadError) {
      setLoadError(errorObj);
      if (onError) {
        onError(errorObj);
      }
    }
  }

  // Retry logic
  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setLoadError(null);
      // Force re-fetch by clearing cache and reloading
      useGLTF.clear(path);
      useGLTF.preload(path);
    }
  };

  // Show error fallback if loading failed
  if (loadError) {
    const showRetryButton = retryOnFailure && retryCount < maxRetries;
    return fallback || (
      <ErrorFallback 
        scale={scale} 
        onRetry={handleRetry}
        showRetry={showRetryButton}
      />
    );
  }

  // Show loading or actual model
  if (!scene) {
    return <LoadingSpinner scale={scale} />;
  }

  return (
    <primitive 
      object={scene.clone()} 
      scale={scale}
      position={position}
      rotation={rotation}
      dispose={null}
    />
  );
};

// Main GLBModelLoader component with Suspense
export const GLBModelLoader: React.FC<GLBModelLoaderProps> = (props) => {
  return (
    <Suspense fallback={<LoadingSpinner scale={props.scale} />}>
      <GLBModel {...props} />
    </Suspense>
  );
};

// Preload utility for critical assets
export const preloadCriticalAssets = (paths: string[]) => {
  console.log('🚀 Preloading critical GLB assets...');
  paths.forEach(path => {
    useGLTF.preload(path);
    console.log(`📦 Preloaded: ${path}`);
  });
};

// Asset size checker utility
export const checkAssetSize = async (path: string): Promise<number> => {
  try {
    const response = await fetch(path, { method: 'HEAD' });
    const size = parseInt(response.headers.get('content-length') || '0');
    const sizeMB = size / (1024 * 1024);
    
    if (sizeMB > 15) {
      console.warn(`⚠️ Large asset detected: ${path} (${sizeMB.toFixed(2)}MB)`);
    }
    
    return sizeMB;
  } catch (error) {
    console.warn(`❌ Could not check size for: ${path}`);
    return 0;
  }
};