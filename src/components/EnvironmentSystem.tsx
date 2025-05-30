
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group, Fog } from 'three';
import * as THREE from 'three';

interface EnvironmentSystemProps {
  upgradeCount: number;
  onEnvironmentChange?: (tier: number) => void;
}

// Environment model URLs from GitHub
const environmentAssets = {
  ground: [
    'https://raw.githubusercontent.com/jake222colostate/environment_models/main/fantasy_environment_assets/ground_1.glb',
    'https://raw.githubusercontent.com/jake222colostate/environment_models/main/fantasy_environment_assets/ground_2.glb',
    'https://raw.githubusercontent.com/jake222colostate/environment_models/main/fantasy_environment_assets/ground_3.glb'
  ],
  mountains: [
    'https://raw.githubusercontent.com/jake222colostate/environment_models/main/fantasy_environment_assets/mountains_1.glb',
    'https://raw.githubusercontent.com/jake222colostate/environment_models/main/fantasy_environment_assets/mountains_2.glb',
    'https://raw.githubusercontent.com/jake222colostate/environment_models/main/fantasy_environment_assets/mountains_3.glb'
  ],
  sky: [
    'https://raw.githubusercontent.com/jake222colostate/environment_models/main/fantasy_environment_assets/sky_1.glb',
    'https://raw.githubusercontent.com/jake222colostate/environment_models/main/fantasy_environment_assets/sky_2.glb',
    'https://raw.githubusercontent.com/jake222colostate/environment_models/main/fantasy_environment_assets/sky_3.glb'
  ]
};

// Individual environment component with error handling
const EnvironmentModel: React.FC<{
  modelUrl: string;
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
  opacity: number;
  type: 'ground' | 'mountains' | 'sky';
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
    const fallbackColor = type === 'ground' ? '#2a1810' : type === 'mountains' ? '#4a4a5c' : '#1e1e3f';
    const fallbackGeometry = type === 'ground' ? 
      <planeGeometry args={[scale[0], scale[2]]} /> :
      type === 'mountains' ?
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
  const [currentTier, setCurrentTier] = useState(0);
  const [transitionOpacity, setTransitionOpacity] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Preload models on mount
  useEffect(() => {
    const preloadModels = async () => {
      try {
        // Preload all environment models
        const allUrls = [
          ...environmentAssets.ground,
          ...environmentAssets.mountains,
          ...environmentAssets.sky
        ];

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
  }, []); // Empty dependency array - only run once on mount

  // Calculate environment tier based on upgrade count
  const environmentTier = useMemo(() => {
    if (upgradeCount < 5) return 0;
    if (upgradeCount < 10) return 1;
    return 2;
  }, [upgradeCount]);

  // Handle environment transitions with simplified logic
  useEffect(() => {
    if (environmentTier !== currentTier && !isTransitioning) {
      setIsTransitioning(true);
      
      // Simple transition: fade out, change tier, fade in
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

  // Memoized environment components for performance
  const groundComponent = useMemo(() => (
    <EnvironmentModel
      modelUrl={environmentAssets.ground[currentTier]}
      position={[0, -1, -50]}
      scale={[20, 1, 100]}
      opacity={transitionOpacity}
      type="ground"
    />
  ), [currentTier, transitionOpacity]);

  const leftMountainsComponent = useMemo(() => (
    <EnvironmentModel
      modelUrl={environmentAssets.mountains[currentTier]}
      position={[-15, 0, -30]}
      scale={[8, 12, 60]}
      rotation={[0, 0.2, 0]}
      opacity={transitionOpacity}
      type="mountains"
    />
  ), [currentTier, transitionOpacity]);

  const rightMountainsComponent = useMemo(() => (
    <EnvironmentModel
      modelUrl={environmentAssets.mountains[currentTier]}
      position={[15, 0, -30]}
      scale={[8, 12, 60]}
      rotation={[0, -0.2, 0]}
      opacity={transitionOpacity}
      type="mountains"
    />
  ), [currentTier, transitionOpacity]);

  const skyComponent = useMemo(() => (
    <EnvironmentModel
      modelUrl={environmentAssets.sky[currentTier]}
      position={[0, 20, -40]}
      scale={[50, 50, 50]}
      opacity={transitionOpacity * 0.7}
      type="sky"
    />
  ), [currentTier, transitionOpacity]);

  return (
    <>
      {/* Ground */}
      {groundComponent}
      
      {/* Mountains on both sides */}
      {leftMountainsComponent}
      {rightMountainsComponent}
      
      {/* Sky dome */}
      {skyComponent}
      
      {/* Atmospheric fog for depth */}
      <fog 
        attach="fog" 
        args={[
          currentTier === 0 ? '#0f0f23' : 
          currentTier === 1 ? '#1a1a3a' : '#2a2a4a', 
          20, 
          120
        ]} 
      />
      
      {/* Additional ambient particles based on tier */}
      {Array.from({ length: currentTier === 0 ? 20 : currentTier === 1 ? 30 : 40 }, (_, i) => {
        const x = (Math.random() - 0.5) * 40;
        const y = Math.random() * 20 + 5;
        const z = Math.random() * -80 - 10;
        const particleColor = currentTier === 0 ? '#8b5cf6' : 
                            currentTier === 1 ? '#c084fc' : '#e879f9';
        
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.02]} />
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
