
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

// Enhanced landscape features component
const DetailedLandscapeFeature: React.FC<{
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
  type: 'crystal' | 'tree' | 'rock' | 'rune_stone' | 'magical_spring';
  tier: number;
  opacity: number;
}> = ({ position, scale, rotation = [0, 0, 0], type, tier, opacity }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation for magical elements
      if (type === 'crystal' || type === 'rune_stone' || type === 'magical_spring') {
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.1;
        meshRef.current.rotation.y += 0.002;
      }
    }
  });

  const getGeometry = () => {
    switch (type) {
      case 'crystal':
        return <octahedronGeometry args={scale} />;
      case 'tree':
        return <coneGeometry args={[scale[0], scale[1], 8]} />;
      case 'rock':
        return <dodecahedronGeometry args={scale} />;
      case 'rune_stone':
        return <cylinderGeometry args={[scale[0], scale[0] * 1.2, scale[1], 6]} />;
      case 'magical_spring':
        return <torusGeometry args={[scale[0], scale[0] * 0.3, 8, 16]} />;
      default:
        return <boxGeometry args={scale} />;
    }
  };

  const getMaterial = () => {
    const tierColors = {
      1: { crystal: '#8b5cf6', tree: '#10b981', rock: '#6b7280', rune_stone: '#3b82f6', magical_spring: '#06b6d4' },
      2: { crystal: '#c084fc', tree: '#34d399', rock: '#9ca3af', rune_stone: '#60a5fa', magical_spring: '#22d3ee' },
      3: { crystal: '#e879f9', tree: '#6ee7b7', rock: '#d1d5db', rune_stone: '#93c5fd', magical_spring: '#67e8f9' },
      4: { crystal: '#f0abfc', tree: '#a7f3d0', rock: '#e5e7eb', rune_stone: '#ddd6fe', magical_spring: '#a5f3fc' },
      5: { crystal: '#fbbf24', tree: '#d1fae5', rock: '#f3f4f6', rune_stone: '#e0e7ff', magical_spring: '#cffafe' }
    };

    const color = tierColors[tier as keyof typeof tierColors]?.[type] || '#8b5cf6';
    const emissive = type === 'crystal' || type === 'rune_stone' || type === 'magical_spring' ? color : '#000000';
    const emissiveIntensity = type === 'crystal' || type === 'rune_stone' || type === 'magical_spring' ? 0.2 : 0;

    return (
      <meshPhongMaterial 
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        transparent 
        opacity={opacity}
        shininess={type === 'crystal' ? 100 : 30}
      />
    );
  };

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} castShadow receiveShadow>
      {getGeometry()}
      {getMaterial()}
    </mesh>
  );
};

// Enhanced ground system with detailed textures
const DetailedGroundSystem: React.FC<{
  tier: number;
  opacity: number;
}> = ({ tier, opacity }) => {
  const groundRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (groundRef.current) {
      // Subtle texture movement for magical ground
      (groundRef.current.material as THREE.MeshPhongMaterial).map?.offset.set(
        Math.sin(state.clock.elapsedTime * 0.1) * 0.01,
        Math.cos(state.clock.elapsedTime * 0.1) * 0.01
      );
    }
  });

  const getGroundColor = () => {
    const colors = ['#1a1a2e', '#2d1b3d', '#3d1a4a', '#4a1a5a', '#5a1a6a'];
    return colors[tier - 1] || colors[0];
  };

  return (
    <>
      {/* Main ground plane */}
      <mesh ref={groundRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, -50]} receiveShadow>
        <planeGeometry args={[50, 120, 32, 32]} />
        <meshPhongMaterial 
          color={getGroundColor()}
          transparent 
          opacity={opacity}
          shininess={20}
          bumpScale={0.1}
        />
      </mesh>

      {/* Magical ground patterns */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh 
          key={i}
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[
            (Math.random() - 0.5) * 40,
            -1.1,
            -20 - (i * 10)
          ]}
        >
          <ringGeometry args={[2, 4, 16]} />
          <meshBasicMaterial 
            color={tier >= 3 ? '#e879f9' : tier >= 2 ? '#c084fc' : '#8b5cf6'}
            transparent 
            opacity={opacity * 0.3}
          />
        </mesh>
      ))}

      {/* Ground crystals and features */}
      {Array.from({ length: 15 }, (_, i) => {
        const x = (Math.random() - 0.5) * 45;
        const z = Math.random() * -100 - 10;
        const featureTypes: Array<'crystal' | 'tree' | 'rock' | 'rune_stone' | 'magical_spring'> = 
          ['crystal', 'tree', 'rock', 'rune_stone', 'magical_spring'];
        const type = featureTypes[Math.floor(Math.random() * featureTypes.length)];
        
        return (
          <DetailedLandscapeFeature
            key={i}
            position={[x, -0.8, z]}
            scale={[0.3 + Math.random() * 0.5, 0.5 + Math.random() * 1, 0.3 + Math.random() * 0.5]}
            rotation={[0, Math.random() * Math.PI * 2, 0]}
            type={type}
            tier={tier}
            opacity={opacity}
          />
        );
      })}
    </>
  );
};

// Enhanced atmospheric skybox system
const DynamicSkybox: React.FC<{
  tier: number;
  opacity: number;
}> = ({ tier, opacity }) => {
  const skyRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (skyRef.current) {
      skyRef.current.rotation.y += 0.0001;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0002;
    }
  });

  const getSkyColors = () => {
    const skyGradients = [
      { top: '#0f0f23', middle: '#1a1a3a', bottom: '#2a1a4a' },
      { top: '#1a1a3a', middle: '#2a2a4a', bottom: '#3a2a5a' },
      { top: '#2a2a4a', middle: '#3a3a5a', bottom: '#4a3a6a' },
      { top: '#3a1a5a', middle: '#4a2a6a', bottom: '#5a3a7a' },
      { top: '#4a0a6a', middle: '#5a1a7a', bottom: '#6a2a8a' }
    ];
    return skyGradients[tier - 1] || skyGradients[0];
  };

  const skyColors = getSkyColors();

  return (
    <group>
      {/* Sky sphere with gradient */}
      <mesh ref={skyRef} position={[0, 0, -40]}>
        <sphereGeometry args={[80, 32, 32]} />
        <meshBasicMaterial 
          color={skyColors.middle}
          transparent 
          opacity={opacity * 0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Floating magical clouds */}
      <group ref={cloudsRef}>
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const radius = 25 + Math.random() * 20;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = 15 + Math.random() * 10;
          
          return (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[2 + Math.random() * 3, 8, 8]} />
              <meshBasicMaterial 
                color={tier >= 4 ? '#f0abfc' : tier >= 3 ? '#e879f9' : tier >= 2 ? '#c084fc' : '#8b5cf6'}
                transparent 
                opacity={opacity * 0.2}
              />
            </mesh>
          );
        })}
      </group>

      {/* Celestial bodies */}
      {tier >= 3 && (
        <mesh position={[30, 25, -60]}>
          <sphereGeometry args={[3]} />
          <meshBasicMaterial 
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={0.5}
            transparent 
            opacity={opacity * 0.8}
          />
        </mesh>
      )}

      {tier >= 4 && (
        <mesh position={[-25, 20, -50]}>
          <sphereGeometry args={[1.5]} />
          <meshBasicMaterial 
            color="#e879f9"
            emissive="#e879f9"
            emissiveIntensity={0.3}
            transparent 
            opacity={opacity * 0.6}
          />
        </mesh>
      )}
    </group>
  );
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
      {/* Enhanced Dynamic Skybox */}
      <DynamicSkybox tier={currentTier} opacity={transitionOpacity} />
      
      {/* Enhanced Detailed Ground System */}
      <DetailedGroundSystem tier={currentTier} opacity={transitionOpacity} />
      
      {/* Original Ground Model */}
      {groundComponent}
      
      {/* Mountains on both sides */}
      {leftMountainsComponent}
      {rightMountainsComponent}
      
      {/* Sky dome */}
      {skyComponent}
      
      {/* Enhanced atmospheric fog for depth */}
      <fog 
        attach="fog" 
        args={[
          currentTier === 1 ? '#0f0f23' : 
          currentTier === 2 ? '#1a1a3a' : 
          currentTier === 3 ? '#2a2a4a' : 
          currentTier === 4 ? '#3a1a5a' : '#4a0a6a',
          15, 
          100
        ]} 
      />
      
      {/* Enhanced magical particles with depth layers */}
      {Array.from({ length: currentTier * 15 }, (_, i) => {
        const x = (Math.random() - 0.5) * 50;
        const y = Math.random() * 25 + 3;
        const z = Math.random() * -100 - 5;
        const particleColor = currentTier === 1 ? '#8b5cf6' : 
                            currentTier === 2 ? '#c084fc' : 
                            currentTier === 3 ? '#e879f9' : 
                            currentTier === 4 ? '#f0abfc' : '#fbbf24';
        
        return (
          <mesh key={i} position={[x, y, z]}>
            <octahedronGeometry args={[0.03 + Math.random() * 0.05]} />
            <meshBasicMaterial 
              color={particleColor} 
              emissive={particleColor}
              emissiveIntensity={0.3}
              transparent 
              opacity={transitionOpacity * (Math.random() * 0.6 + 0.4)} 
            />
          </mesh>
        );
      })}

      {/* Floating magical orbs for ambiance */}
      {Array.from({ length: Math.min(currentTier * 3, 12) }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 20 + Math.sin(i) * 10;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = 5 + Math.sin(i * 2) * 3;
        
        return (
          <mesh key={`orb-${i}`} position={[x, y, z]}>
            <sphereGeometry args={[0.2]} />
            <meshBasicMaterial 
              color={currentTier >= 4 ? '#fbbf24' : currentTier >= 3 ? '#e879f9' : '#c084fc'}
              emissive={currentTier >= 4 ? '#fbbf24' : currentTier >= 3 ? '#e879f9' : '#c084fc'}
              emissiveIntensity={0.5}
              transparent 
              opacity={transitionOpacity * 0.7} 
            />
          </mesh>
        );
      })}
    </>
  );
};
