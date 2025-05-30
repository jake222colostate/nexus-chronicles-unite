
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group, Fog } from 'three';
import * as THREE from 'three';

interface EnvironmentSystemProps {
  upgradeCount: number;
  onEnvironmentChange?: (tier: number) => void;
}

// New tiered fantasy pixel-art environment models
const fantasyEnvModels = {
  1: {
    ground: "https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/ground_tier1.glb",
    mountain: "https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/mountain_tier1.glb",
    sky: "https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/sky_tier1.glb"
  },
  2: {
    ground: "https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/ground_tier2.glb",
    mountain: "https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/mountain_tier2.glb",
    sky: "https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/sky_tier2.glb"
  },
  3: {
    ground: "https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/ground_tier3.glb",
    mountain: "https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/mountain_tier3.glb",
    sky: "https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/sky_tier3.glb"
  },
  4: {
    ground: "https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/ground_tier4.glb",
    mountain: "https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/mountain_tier4.glb",
    sky: "https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/sky_tier4.glb"
  },
  5: {
    ground: "https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/ground_tier5.glb",
    mountain: "https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/mountain_tier5.glb",
    sky: "https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/sky_tier5.glb"
  }
};

// Individual environment component with error handling
const EnvironmentModel: React.FC<{
  modelUrl: string;
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
  opacity: number;
  type: 'ground' | 'mountain' | 'sky';
}> = ({ modelUrl, position, scale, rotation = [0, 0, 0], opacity, type }) => {
  const groupRef = useRef<Group>(null);
  const [loadError, setLoadError] = useState(false);

  let gltfScene = null;
  try {
    const gltf = useGLTF(modelUrl);
    gltfScene = gltf.scene;
  } catch (error) {
    console.log(`Failed to load ${type} model:`, error);
    if (!loadError) {
      setLoadError(true);
    }
  }

  useFrame((state) => {
    if (groupRef.current && type === 'sky') {
      // Slow ambient movement for sky models
      groupRef.current.rotation.y += 0.0002;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  // Fallback geometry for failed loads
  if (loadError || !gltfScene) {
    const fallbackColor = type === 'ground' ? '#2a1810' : type === 'mountain' ? '#4a4a5c' : '#1e1e3f';
    const fallbackGeometry = type === 'ground' ? 
      <planeGeometry args={[scale[0], scale[2]]} /> :
      type === 'mountain' ?
      <boxGeometry args={scale} /> :
      <sphereGeometry args={[scale[0]]} />;

    return (
      <group ref={groupRef} position={position} rotation={rotation}>
        <mesh>
          {fallbackGeometry}
          <meshLambertMaterial 
            color={fallbackColor} 
            transparent 
            opacity={opacity * 0.6} 
          />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <primitive 
        object={gltfScene.clone()} 
        transparent
        opacity={opacity}
      />
    </group>
  );
};

export const EnvironmentSystem: React.FC<EnvironmentSystemProps> = ({
  upgradeCount,
  onEnvironmentChange
}) => {
  const [currentTier, setCurrentTier] = useState(1);
  const [transitionOpacity, setTransitionOpacity] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Preload models on mount
  useEffect(() => {
    const preloadModels = async () => {
      try {
        // Preload all tiered environment models
        const allUrls = Object.values(fantasyEnvModels).flatMap(tier => [
          tier.ground,
          tier.mountain,
          tier.sky
        ]);

        allUrls.forEach(url => {
          try {
            useGLTF.preload(url);
            console.log(`Preloading model: ${url}`);
          } catch (error) {
            console.warn(`Failed to preload model: ${url}`, error);
          }
        });
      } catch (error) {
        console.warn('Error during model preloading:', error);
      }
    };

    preloadModels();
  }, []);

  // Calculate environment tier based on upgrade count - 5 tiers
  const environmentTier = useMemo(() => {
    if (upgradeCount < 3) return 1;
    if (upgradeCount < 6) return 2;
    if (upgradeCount < 9) return 3;
    if (upgradeCount < 12) return 4;
    return 5;
  }, [upgradeCount]);

  // Handle environment transitions
  useEffect(() => {
    if (environmentTier !== currentTier && !isTransitioning) {
      setIsTransitioning(true);
      
      setTransitionOpacity(0.1);
      setCurrentTier(environmentTier);
      
      const transitionTimeout = setTimeout(() => {
        setTransitionOpacity(1);
        setIsTransitioning(false);
        onEnvironmentChange?.(environmentTier);
      }, 500);

      return () => clearTimeout(transitionTimeout);
    }
  }, [environmentTier, currentTier, isTransitioning, onEnvironmentChange]);

  // Get current tier models
  const currentModels = fantasyEnvModels[currentTier as keyof typeof fantasyEnvModels];

  // Memoized environment components for performance
  const groundComponent = useMemo(() => (
    <EnvironmentModel
      modelUrl={currentModels.ground}
      position={[0, -1, -50]}
      scale={[20, 1, 100]}
      opacity={transitionOpacity}
      type="ground"
    />
  ), [currentTier, transitionOpacity, currentModels.ground]);

  const leftMountainsComponent = useMemo(() => (
    <EnvironmentModel
      modelUrl={currentModels.mountain}
      position={[-15, 0, -30]}
      scale={[8, 12, 60]}
      rotation={[0, 0.2, 0]}
      opacity={transitionOpacity}
      type="mountain"
    />
  ), [currentTier, transitionOpacity, currentModels.mountain]);

  const rightMountainsComponent = useMemo(() => (
    <EnvironmentModel
      modelUrl={currentModels.mountain}
      position={[15, 0, -30]}
      scale={[8, 12, 60]}
      rotation={[0, -0.2, 0]}
      opacity={transitionOpacity}
      type="mountain"
    />
  ), [currentTier, transitionOpacity, currentModels.mountain]);

  const skyComponent = useMemo(() => (
    <EnvironmentModel
      modelUrl={currentModels.sky}
      position={[0, 20, -40]}
      scale={[50, 50, 50]}
      opacity={transitionOpacity * 0.7}
      type="sky"
    />
  ), [currentTier, transitionOpacity, currentModels.sky]);

  return (
    <>
      {/* Ground */}
      {groundComponent}
      
      {/* Mountains on both sides */}
      {leftMountainsComponent}
      {rightMountainsComponent}
      
      {/* Sky dome */}
      {skyComponent}
      
      {/* Atmospheric fog for depth - enhanced colors for pixel art */}
      <fog 
        attach="fog" 
        args={[
          currentTier === 1 ? '#0f0f23' : 
          currentTier === 2 ? '#1a1a3a' : 
          currentTier === 3 ? '#2a2a4a' : 
          currentTier === 4 ? '#3a1a5a' : '#4a0a6a',
          20, 
          120
        ]} 
      />
      
      {/* Pixel-style ambient particles */}
      {Array.from({ length: currentTier * 10 }, (_, i) => {
        const x = (Math.random() - 0.5) * 40;
        const y = Math.random() * 20 + 5;
        const z = Math.random() * -80 - 10;
        const particleColor = currentTier === 1 ? '#8b5cf6' : 
                            currentTier === 2 ? '#c084fc' : 
                            currentTier === 3 ? '#e879f9' : 
                            currentTier === 4 ? '#f0abfc' : '#fbbf24';
        
        return (
          <mesh key={i} position={[x, y, z]}>
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshBasicMaterial 
              color={particleColor} 
              transparent 
              opacity={transitionOpacity * (Math.random() * 0.5 + 0.3)} 
            />
          </mesh>
        );
      })}
    </>
  );
};
