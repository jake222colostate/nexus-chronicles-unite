
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

// Enhanced environment system with actual 3D models
const EnvironmentSystem: React.FC<EnvironmentSystemProps> = ({
  upgradeCount,
  onEnvironmentChange
}) => {
  const [currentTier, setCurrentTier] = useState(0);
  const [transitionOpacity, setTransitionOpacity] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [modelErrors, setModelErrors] = useState<Set<string>>(new Set());

  // Calculate environment tier based on upgrade count
  const environmentTier = useMemo(() => {
    if (upgradeCount < 5) return 0;
    if (upgradeCount < 10) return 1;
    return 2;
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

  // Model URLs from the GitHub repository
  const modelUrls = {
    ground: {
      0: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/ground_model_1.glb',
      1: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/ground_model_2.glb',
      2: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/ground_model_3.glb'
    },
    mountain: {
      0: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/mountain_model_1.glb',
      1: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/mountain_model_2.glb',
      2: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/mountain_model_3.glb'
    },
    sky: {
      0: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/sky_model_1.glb',
      1: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/sky_model_2.glb',
      2: 'https://raw.githubusercontent.com/jake222colostate/environment_models_new/main/sky_model_3.glb'
    }
  };

  // Tier-based colors and properties for fallback
  const tierConfig = {
    0: {
      groundColor: '#2a1810',
      mountainColor: '#4a4a5c',
      skyColor: '#1e1e3f',
      fogColor: '#0f0f23',
      particleColor: '#8b5cf6',
      particleCount: 20
    },
    1: {
      groundColor: '#3a2820',
      mountainColor: '#5a5a7c',
      skyColor: '#2e2e5f',
      fogColor: '#1a1a3a',
      particleColor: '#c084fc',
      particleCount: 30
    },
    2: {
      groundColor: '#4a3830',
      mountainColor: '#6a6a8c',
      skyColor: '#3e3e7f',
      fogColor: '#2a2a4a',
      particleColor: '#e879f9',
      particleCount: 40
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
      {/* Ground Models */}
      {!shouldUseFallback('ground') ? (
        <GLBEnvironmentModel
          url={modelUrls.ground[currentTier as keyof typeof modelUrls.ground]}
          position={[0, -1, -50]}
          scale={20}
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

      {/* Mountain Models - Left Side */}
      {!shouldUseFallback('mountain') ? (
        <>
          <GLBEnvironmentModel
            url={modelUrls.mountain[currentTier as keyof typeof modelUrls.mountain]}
            position={[-15, 0, -30]}
            scale={8}
            rotation={[0, 0.2, 0]}
            onError={() => handleModelError('mountain')}
          />
          <GLBEnvironmentModel
            url={modelUrls.mountain[currentTier as keyof typeof modelUrls.mountain]}
            position={[15, 0, -30]}
            scale={8}
            rotation={[0, -0.2, 0]}
            onError={() => handleModelError('mountain')}
          />
        </>
      ) : (
        <>
          {/* Fallback Procedural Mountains */}
          <group position={[-15, 0, -30]} rotation={[0, 0.2, 0]}>
            {Array.from({ length: 5 }, (_, i) => (
              <mesh key={`left-mountain-${i}`} position={[i * 2, 0, -i * 2]}>
                <coneGeometry args={[2 + i * 0.5, 8 + i * 2, 6]} />
                <meshLambertMaterial 
                  color={config.mountainColor} 
                  transparent 
                  opacity={transitionOpacity} 
                />
              </mesh>
            ))}
          </group>
          <group position={[15, 0, -30]} rotation={[0, -0.2, 0]}>
            {Array.from({ length: 5 }, (_, i) => (
              <mesh key={`right-mountain-${i}`} position={[-i * 2, 0, -i * 2]}>
                <coneGeometry args={[2 + i * 0.5, 8 + i * 2, 6]} />
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
          position={[0, 20, -40]}
          scale={15}
          onError={() => handleModelError('sky')}
        />
      ) : (
        /* Fallback Procedural Sky Elements */
        <group position={[0, 20, -40]}>
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const radius = 25;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            return (
              <mesh key={`sky-element-${i}`} position={[x, Math.sin(angle) * 5, z]}>
                <sphereGeometry args={[1 + currentTier * 0.5]} />
                <meshLambertMaterial 
                  color={config.skyColor} 
                  transparent 
                  opacity={transitionOpacity * 0.3} 
                  emissive={config.particleColor}
                  emissiveIntensity={0.1}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Procedural Crystal Formations */}
      {Array.from({ length: 8 }, (_, i) => {
        const x = (Math.random() - 0.5) * 30;
        const z = -20 - (Math.random() * 60);
        const height = 0.5 + (currentTier * 0.3) + Math.random() * 0.5;
        
        return (
          <mesh key={`crystal-${i}`} position={[x, -0.5 + height/2, z]}>
            <octahedronGeometry args={[0.3, 0]} />
            <meshLambertMaterial 
              color={config.particleColor} 
              transparent 
              opacity={transitionOpacity * 0.8} 
              emissive={config.particleColor}
              emissiveIntensity={0.2}
            />
          </mesh>
        );
      })}

      {/* Atmospheric fog for depth */}
      <fog attach="fog" args={[config.fogColor, 20, 120]} />
      
      {/* Enhanced particle system */}
      {Array.from({ length: config.particleCount }, (_, i) => {
        const x = (Math.random() - 0.5) * 40;
        const y = Math.random() * 20 + 5;
        const z = Math.random() * -80 - 10;
        
        return (
          <mesh key={`particle-${i}`} position={[x, y, z]}>
            <sphereGeometry args={[0.02]} />
            <meshLambertMaterial 
              color={config.particleColor} 
              transparent 
              opacity={transitionOpacity * (Math.random() * 0.5 + 0.3)} 
            />
          </mesh>
        );
      })}

      {/* Floating energy orbs for higher tiers */}
      {currentTier > 0 && Array.from({ length: currentTier * 3 }, (_, i) => {
        const angle = (i / (currentTier * 3)) * Math.PI * 2;
        const radius = 8 + currentTier * 2;
        const x = Math.cos(angle) * radius;
        const z = -30 + Math.sin(angle) * radius;
        const y = 5 + Math.sin(angle * 2) * 2;
        
        return (
          <mesh key={`orb-${i}`} position={[x, y, z]}>
            <sphereGeometry args={[0.15 + currentTier * 0.05]} />
            <meshLambertMaterial 
              color={config.particleColor} 
              transparent 
              opacity={transitionOpacity * 0.8} 
              emissive={config.particleColor}
              emissiveIntensity={0.5}
            />
          </mesh>
        );
      })}
    </>
  );
};

export { EnvironmentSystem };
