
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group, Fog } from 'three';
import * as THREE from 'three';

interface EnvironmentSystemProps {
  upgradeCount: number;
  onEnvironmentChange?: (tier: number) => void;
}

// GLB Model component with proper error handling
const GLBEnvironmentModel: React.FC<{
  url: string;
  position: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  onError?: () => void;
}> = ({ url, position, scale = 1, rotation = [0, 0, 0], onError }) => {
  const [hasError, setHasError] = useState(false);
  
  let scene = null;
  
  try {
    const gltf = useGLTF(url, true);
    scene = gltf.scene;
  } catch (error) {
    console.error(`Failed to load GLB model: ${url}`, error);
    if (!hasError) {
      setHasError(true);
      onError?.();
    }
  }

  if (hasError || !scene) {
    return null;
  }

  return (
    <primitive 
      object={scene.clone()} 
      position={position} 
      scale={[scale, scale, scale]}
      rotation={rotation}
    />
  );
};

// Enhanced environment system with tier-based progression
const EnvironmentSystem: React.FC<EnvironmentSystemProps> = ({
  upgradeCount,
  onEnvironmentChange
}) => {
  const [currentTier, setCurrentTier] = useState(1);
  const [transitionOpacity, setTransitionOpacity] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [modelErrors, setModelErrors] = useState<Set<string>>(new Set());

  // Calculate environment tier based on upgrade count (1-5 tiers)
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

  // Model URLs from the GitHub repository with correct tier structure
  const modelUrls = {
    ground: {
      1: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/ground_tier1.glb',
      2: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/ground_tier2.glb',
      3: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/ground_tier3.glb',
      4: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/ground_tier4.glb',
      5: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/ground_tier5.glb'
    },
    mountain: {
      1: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/mountain_tier1.glb',
      2: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/mountain_tier2.glb',
      3: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/mountain_tier3.glb',
      4: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/mountain_tier4.glb',
      5: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/mountain_tier5.glb'
    },
    sky: {
      1: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/sky_tier1.glb',
      2: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/sky_tier2.glb',
      3: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/sky_tier3.glb',
      4: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/sky_tier4.glb',
      5: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/sky_tier5.glb'
    },
    extras: {
      crystalCliffs: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/crystal_rock_cliff.glb',
      fantasySkyscraper: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/fantasy_skybox.glb',
      glowingStones: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/glowing_path_stones.glb',
      crystalCluster: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/tier1_crystal_cluster.glb',
      crystalGround: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/crystal_ground.glb'
    }
  };

  // Tier-based colors and properties for enhanced visuals
  const tierConfig = {
    1: {
      groundColor: '#2a1810',
      mountainColor: '#4a4a5c',
      skyColor: '#1e1e3f',
      fogColor: '#0f0f23',
      particleColor: '#8b5cf6',
      particleCount: 15,
      ambientIntensity: 0.3,
      lightIntensity: 0.6
    },
    2: {
      groundColor: '#3a2820',
      mountainColor: '#5a5a7c',
      skyColor: '#2e2e5f',
      fogColor: '#1a1a3a',
      particleColor: '#c084fc',
      particleCount: 25,
      ambientIntensity: 0.4,
      lightIntensity: 0.7
    },
    3: {
      groundColor: '#4a3830',
      mountainColor: '#6a6a8c',
      skyColor: '#3e3e7f',
      fogColor: '#2a2a4a',
      particleColor: '#e879f9',
      particleCount: 35,
      ambientIntensity: 0.5,
      lightIntensity: 0.8
    },
    4: {
      groundColor: '#5a4840',
      mountainColor: '#7a7a9c',
      skyColor: '#4e4e9f',
      fogColor: '#3a3a5a',
      particleColor: '#f0abfc',
      particleCount: 45,
      ambientIntensity: 0.6,
      lightIntensity: 0.9
    },
    5: {
      groundColor: '#6a5850',
      mountainColor: '#8a8aac',
      skyColor: '#5e5ebf',
      fogColor: '#4a4a6a',
      particleColor: '#fbbf24',
      particleCount: 55,
      ambientIntensity: 0.7,
      lightIntensity: 1.0
    }
  };

  const config = tierConfig[currentTier as keyof typeof tierConfig];

  const handleModelError = (modelType: string) => {
    console.warn(`Failed to load ${modelType} model for tier ${currentTier}, using fallback`);
    setModelErrors(prev => new Set(prev).add(`${modelType}_${currentTier}`));
  };

  const shouldUseFallback = (modelType: string) => {
    return modelErrors.has(`${modelType}_${currentTier}`);
  };

  return (
    <>
      {/* Enhanced lighting system based on tier */}
      <ambientLight intensity={config.ambientIntensity} color="#e6e6fa" />
      <directionalLight
        position={[10, 20, 10]}
        intensity={config.lightIntensity}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />

      {/* Ground Models */}
      {!shouldUseFallback('ground') ? (
        <GLBEnvironmentModel
          url={modelUrls.ground[currentTier as keyof typeof modelUrls.ground]}
          position={[0, -1, -50]}
          scale={15}
          onError={() => handleModelError('ground')}
        />
      ) : (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, -50]} receiveShadow>
          <planeGeometry args={[40, 120]} />
          <meshLambertMaterial 
            color={config.groundColor} 
            transparent 
            opacity={transitionOpacity} 
          />
        </mesh>
      )}

      {/* Mountain Models - Positioned on sides */}
      {!shouldUseFallback('mountain') ? (
        <>
          <GLBEnvironmentModel
            url={modelUrls.mountain[currentTier as keyof typeof modelUrls.mountain]}
            position={[-20, 0, -40]}
            scale={10}
            rotation={[0, 0.3, 0]}
            onError={() => handleModelError('mountain')}
          />
          <GLBEnvironmentModel
            url={modelUrls.mountain[currentTier as keyof typeof modelUrls.mountain]}
            position={[20, 0, -40]}
            scale={10}
            rotation={[0, -0.3, 0]}
            onError={() => handleModelError('mountain')}
          />
          <GLBEnvironmentModel
            url={modelUrls.mountain[currentTier as keyof typeof modelUrls.mountain]}
            position={[-25, 0, -70]}
            scale={12}
            rotation={[0, 0.2, 0]}
            onError={() => handleModelError('mountain')}
          />
          <GLBEnvironmentModel
            url={modelUrls.mountain[currentTier as keyof typeof modelUrls.mountain]}
            position={[25, 0, -70]}
            scale={12}
            rotation={[0, -0.2, 0]}
            onError={() => handleModelError('mountain')}
          />
        </>
      ) : (
        <>
          {/* Fallback Procedural Mountains */}
          <group position={[-20, 0, -40]} rotation={[0, 0.3, 0]}>
            {Array.from({ length: 4 }, (_, i) => (
              <mesh key={`left-mountain-${i}`} position={[i * 3, 0, -i * 3]}>
                <coneGeometry args={[3 + i * 0.5, 10 + i * 2, 8]} />
                <meshLambertMaterial 
                  color={config.mountainColor} 
                  transparent 
                  opacity={transitionOpacity} 
                />
              </mesh>
            ))}
          </group>
          <group position={[20, 0, -40]} rotation={[0, -0.3, 0]}>
            {Array.from({ length: 4 }, (_, i) => (
              <mesh key={`right-mountain-${i}`} position={[-i * 3, 0, -i * 3]}>
                <coneGeometry args={[3 + i * 0.5, 10 + i * 2, 8]} />
                <meshLambertMaterial 
                  color={config.mountainColor} 
                  transparent 
                  opacity={transitionOpacity} 
                />
              </mesh>
            ))}
          </group>
        </>
      )}

      {/* Sky Models */}
      {!shouldUseFallback('sky') ? (
        <GLBEnvironmentModel
          url={modelUrls.sky[currentTier as keyof typeof modelUrls.sky]}
          position={[0, 25, -50]}
          scale={20}
          onError={() => handleModelError('sky')}
        />
      ) : (
        /* Fallback Procedural Sky Elements */
        <group position={[0, 25, -50]}>
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 30;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            return (
              <mesh key={`sky-element-${i}`} position={[x, Math.sin(angle) * 8, z]}>
                <sphereGeometry args={[1.5 + currentTier * 0.3]} />
                <meshLambertMaterial 
                  color={config.skyColor} 
                  transparent 
                  opacity={transitionOpacity * 0.4} 
                  emissive={config.particleColor}
                  emissiveIntensity={0.2}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Extra Fantasy Elements for higher tiers */}
      {currentTier >= 2 && (
        <GLBEnvironmentModel
          url={modelUrls.extras.crystalCluster}
          position={[-8, 0, -25]}
          scale={2}
          onError={() => console.log('Crystal cluster failed to load')}
        />
      )}

      {currentTier >= 3 && (
        <GLBEnvironmentModel
          url={modelUrls.extras.glowingStones}
          position={[0, -0.8, -15]}
          scale={1.5}
          onError={() => console.log('Glowing stones failed to load')}
        />
      )}

      {currentTier >= 4 && (
        <GLBEnvironmentModel
          url={modelUrls.extras.crystalCliffs}
          position={[12, 2, -60]}
          scale={8}
          rotation={[0, -0.5, 0]}
          onError={() => console.log('Crystal cliffs failed to load')}
        />
      )}

      {/* Enhanced Crystal Formations with tier-based complexity */}
      {Array.from({ length: 6 + currentTier * 2 }, (_, i) => {
        const x = (Math.random() - 0.5) * 35;
        const z = -20 - (Math.random() * 80);
        const height = 0.5 + (currentTier * 0.4) + Math.random() * 0.8;
        
        return (
          <mesh key={`crystal-${i}`} position={[x, -0.5 + height/2, z]}>
            <octahedronGeometry args={[0.3 + currentTier * 0.1, 0]} />
            <meshLambertMaterial 
              color={config.particleColor} 
              transparent 
              opacity={transitionOpacity * 0.9} 
              emissive={config.particleColor}
              emissiveIntensity={0.3 + currentTier * 0.1}
            />
          </mesh>
        );
      })}

      {/* Tier-based atmospheric fog */}
      <fog attach="fog" args={[config.fogColor, 25, 140]} />
      
      {/* Enhanced particle system with tier progression */}
      {Array.from({ length: config.particleCount }, (_, i) => {
        const x = (Math.random() - 0.5) * 45;
        const y = Math.random() * 25 + 5;
        const z = Math.random() * -100 - 10;
        
        return (
          <mesh key={`particle-${i}`} position={[x, y, z]}>
            <sphereGeometry args={[0.02 + currentTier * 0.01]} />
            <meshLambertMaterial 
              color={config.particleColor} 
              transparent 
              opacity={transitionOpacity * (Math.random() * 0.6 + 0.4)} 
              emissive={config.particleColor}
              emissiveIntensity={0.2 + currentTier * 0.1}
            />
          </mesh>
        );
      })}

      {/* Floating energy orbs with increased complexity per tier */}
      {Array.from({ length: currentTier * 4 }, (_, i) => {
        const angle = (i / (currentTier * 4)) * Math.PI * 2;
        const radius = 10 + currentTier * 3;
        const x = Math.cos(angle) * radius;
        const z = -35 + Math.sin(angle) * radius;
        const y = 6 + Math.sin(angle * 3) * 3;
        
        return (
          <mesh key={`orb-${i}`} position={[x, y, z]}>
            <sphereGeometry args={[0.2 + currentTier * 0.08]} />
            <meshLambertMaterial 
              color={config.particleColor} 
              transparent 
              opacity={transitionOpacity * 0.9} 
              emissive={config.particleColor}
              emissiveIntensity={0.6 + currentTier * 0.1}
            />
          </mesh>
        );
      })}

      {/* Tier-based point lights for enhanced glow effects */}
      {Array.from({ length: Math.min(currentTier, 3) }, (_, i) => (
        <pointLight 
          key={`tier-light-${i}`}
          position={[(i - 1) * 15, 8, -30 - (i * 20)]} 
          intensity={0.5 + currentTier * 0.2} 
          color={config.particleColor} 
          distance={30} 
        />
      ))}
    </>
  );
};

export { EnvironmentSystem };
