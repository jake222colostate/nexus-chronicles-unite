import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScifiLayerStore } from '@/stores/useScifiLayerStore';
import { Vector3, Group } from 'three';

interface ScifiPlatformEffectsProps {
  platformPosition: Vector3;
  onPlatformShake?: (intensity: number) => void;
  children?: React.ReactNode;
}

export const ScifiPlatformEffects: React.FC<ScifiPlatformEffectsProps> = ({
  platformPosition,
  onPlatformShake,
  children
}) => {
  const { currentLayer, unlockedUpgrades } = useScifiLayerStore();
  const groupRef = useRef<Group>(null);
  const shakeIntensity = useRef(0);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    timeRef.current += delta;

    // Calculate layer-based platform instability
    let baseShake = Math.max(0, (currentLayer - 1) * 0.01);
    
    // Layer-specific effects
    switch (currentLayer) {
      case 1: // Atmospheric Entry - Minimal turbulence
        baseShake = 0.005;
        break;
      case 2: // Ionosphere - Light electrical interference
        baseShake = 0.01 + Math.sin(timeRef.current * 8) * 0.005;
        break;
      case 3: // Solar Wind Zone - Consistent buffeting
        baseShake = 0.015 + Math.sin(timeRef.current * 3) * 0.008;
        break;
      case 4: // Magnetic Storm - Violent magnetic pulses
        baseShake = 0.025 + Math.sin(timeRef.current * 15) * 0.015;
        break;
      case 5: // Cosmic Radiation - Erratic fluctuations
        baseShake = 0.03 + Math.random() * 0.02;
        break;
      case 6: // Void Nexus - Reality distortion
        baseShake = 0.035 + Math.sin(timeRef.current * 0.7) * 0.025;
        break;
      case 7: // Dark Matter Field - Heavy gravitational waves
        baseShake = 0.04 + Math.sin(timeRef.current * 2) * 0.03;
        break;
      case 8: // Quantum Anomaly - Quantum fluctuations
        baseShake = 0.045 + (Math.sin(timeRef.current * 12) + Math.cos(timeRef.current * 7)) * 0.02;
        break;
      case 9: // Stellar Core Proximity - Intense radiation pressure
        baseShake = 0.05 + Math.sin(timeRef.current * 5) * 0.035;
        break;
      case 10: // Singularity Edge - Tidal forces
        baseShake = 0.06 + Math.sin(timeRef.current * 1.2) * 0.04;
        break;
      default: // Beyond Known Space
        baseShake = 0.065 + (currentLayer - 10) * 0.01 + Math.random() * 0.03;
    }

    // Apply upgrade stabilization
    if (unlockedUpgrades.includes('gravityAnchorArray')) {
      baseShake *= 0.7; // 30% reduction
    }

    if (unlockedUpgrades.includes('ionStabilizerCore')) {
      baseShake *= 0.8; // 20% reduction
    }

    // Update platform shake
    shakeIntensity.current = baseShake;
    
    // Apply shake to platform
    const shakeX = (Math.random() - 0.5) * baseShake;
    const shakeY = (Math.random() - 0.5) * baseShake * 0.5; // Less vertical shake
    const shakeZ = (Math.random() - 0.5) * baseShake;

    groupRef.current.position.set(
      platformPosition.x + shakeX,
      platformPosition.y + shakeY,
      platformPosition.z + shakeZ
    );

    // Notify parent of shake intensity for weapon accuracy effects
    onPlatformShake?.(shakeIntensity.current);
  });

  // Layer-specific visual effects for platform
  const getPlatformEffects = () => {
    const effects = [];

    // Electrical arcing for higher layers
    if (currentLayer >= 4) {
      effects.push(
        <pointLight
          key="electrical"
          intensity={0.3 + Math.random() * 0.2}
          color="#60a5fa"
          position={[0, 2, 0]}
          distance={10}
        />
      );
    }

    // Energy field for void layers
    if (currentLayer >= 6) {
      effects.push(
        <mesh key="energy-field" position={[0, 0.5, 0]}>
          <sphereGeometry args={[8, 16, 16]} />
          <meshBasicMaterial 
            color="#6366f1" 
            opacity={0.1 + Math.sin(timeRef.current * 2) * 0.05}
            transparent
            wireframe
          />
        </mesh>
      );
    }

    // Dark matter distortion for extreme layers
    if (currentLayer >= 8) {
      effects.push(
        <mesh key="distortion" position={[0, 1, 0]}>
          <torusGeometry args={[6, 1, 8, 16]} />
          <meshBasicMaterial 
            color="#ec4899" 
            opacity={0.15}
            transparent
          />
        </mesh>
      );
    }

    return effects;
  };

  return (
    <group ref={groupRef}>
      {children}
      {getPlatformEffects()}
    </group>
  );
};