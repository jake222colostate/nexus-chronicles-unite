
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';
import * as THREE from 'three';

interface EnvironmentSystemProps {
  upgradeCount: number;
  onEnvironmentChange?: (tier: number) => void;
}

// Simple ground system with green grass
const SimpleGroundSystem: React.FC<{
  tier: number;
  opacity: number;
}> = ({ tier, opacity }) => {
  return (
    <>
      {/* Main grass ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, -50]} receiveShadow>
        <planeGeometry args={[50, 120]} />
        <meshLambertMaterial 
          color="#22c55e"
          transparent 
          opacity={opacity}
        />
      </mesh>

      {/* Simple grass patches */}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh 
          key={i}
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[
            (Math.random() - 0.5) * 40,
            -1.1,
            -20 - (i * 4)
          ]}
        >
          <circleGeometry args={[1 + Math.random(), 8]} />
          <meshLambertMaterial 
            color="#16a34a"
            transparent 
            opacity={opacity * 0.8}
          />
        </mesh>
      ))}
    </>
  );
};

// Simple blue skybox
const SimpleSkybox: React.FC<{
  tier: number;
  opacity: number;
}> = ({ tier, opacity }) => {
  return (
    <group>
      {/* Blue sky sphere */}
      <mesh position={[0, 0, -40]}>
        <sphereGeometry args={[80, 16, 16]} />
        <meshBasicMaterial 
          color="#3b82f6"
          transparent 
          opacity={opacity * 0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Simple white clouds */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 30;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = 20 + Math.random() * 5;
        
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[2 + Math.random() * 2, 8, 8]} />
            <meshBasicMaterial 
              color="#ffffff"
              transparent 
              opacity={opacity * 0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// Simple mountain system
const SimpleMountains: React.FC<{
  tier: number;
  opacity: number;
}> = ({ tier, opacity }) => {
  return (
    <group>
      {/* Left mountains */}
      <mesh position={[-20, 5, -60]} castShadow>
        <coneGeometry args={[8, 15, 8]} />
        <meshLambertMaterial 
          color="#6b7280"
          transparent 
          opacity={opacity}
        />
      </mesh>
      
      <mesh position={[-25, 3, -70]} castShadow>
        <coneGeometry args={[6, 12, 8]} />
        <meshLambertMaterial 
          color="#9ca3af"
          transparent 
          opacity={opacity}
        />
      </mesh>

      {/* Right mountains */}
      <mesh position={[20, 6, -65]} castShadow>
        <coneGeometry args={[7, 16, 8]} />
        <meshLambertMaterial 
          color="#6b7280"
          transparent 
          opacity={opacity}
        />
      </mesh>
      
      <mesh position={[25, 4, -75]} castShadow>
        <coneGeometry args={[5, 13, 8]} />
        <meshLambertMaterial 
          color="#9ca3af"
          transparent 
          opacity={opacity}
        />
      </mesh>

      {/* Background mountains */}
      <mesh position={[0, 8, -90]} castShadow>
        <coneGeometry args={[12, 20, 8]} />
        <meshLambertMaterial 
          color="#4b5563"
          transparent 
          opacity={opacity * 0.7}
        />
      </mesh>
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

  // Calculate environment tier based on upgrade count
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
      
      setTransitionOpacity(0.3);
      setCurrentTier(environmentTier);
      
      const transitionTimeout = setTimeout(() => {
        setTransitionOpacity(1);
        setIsTransitioning(false);
        onEnvironmentChange?.(environmentTier);
      }, 300);

      return () => clearTimeout(transitionTimeout);
    }
  }, [environmentTier, currentTier, isTransitioning, onEnvironmentChange]);

  return (
    <>
      {/* Simple Blue Skybox */}
      <SimpleSkybox tier={currentTier} opacity={transitionOpacity} />
      
      {/* Simple Green Ground */}
      <SimpleGroundSystem tier={currentTier} opacity={transitionOpacity} />
      
      {/* Simple Mountains */}
      <SimpleMountains tier={currentTier} opacity={transitionOpacity} />
      
      {/* Simple atmospheric fog */}
      <fog 
        attach="fog" 
        args={['#87ceeb', 30, 120]} 
      />
      
      {/* Minimal ambient particles - no animation to prevent glitching */}
      {Array.from({ length: 10 }, (_, i) => {
        const x = (Math.random() - 0.5) * 30;
        const y = Math.random() * 15 + 5;
        const z = Math.random() * -60 - 10;
        
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.05]} />
            <meshBasicMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.6} 
            />
          </mesh>
        );
      })}
    </>
  );
};
