import React from 'react';
import { Vector3 } from 'three';

interface ScifiUpgradePedestalProps {
  position: [number, number, number];
  isUnlocked: boolean;
  isPurchased: boolean;
  canAfford: boolean;
  upgrade: {
    id: string;
    name: string;
    cost: number;
    description: string;
  };
  onClick: () => void;
}

export const ScifiUpgradePedestal: React.FC<ScifiUpgradePedestalProps> = ({
  position,
  isUnlocked,
  isPurchased,
  canAfford,
  upgrade,
  onClick
}) => {
  const pedestalColor = isPurchased ? '#00ff88' : canAfford ? '#00ccff' : '#666666';
  const glowIntensity = isPurchased ? 0.8 : canAfford ? 0.5 : 0.2;

  return (
    <group position={position} onClick={onClick}>
      {/* Base platform */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.8, 0.3, 8]} />
        <meshStandardMaterial 
          color="#2d3748" 
          metalness={0.8} 
          roughness={0.3} 
        />
      </mesh>
      
      {/* Energy core */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial 
          color={pedestalColor}
          emissive={pedestalColor}
          emissiveIntensity={glowIntensity}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Holographic rings */}
      <mesh position={[0, 0.4, 0]} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.3, 0.35, 16]} />
        <meshBasicMaterial 
          color={pedestalColor}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.25, 0.3, 16]} />
        <meshBasicMaterial 
          color={pedestalColor}
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* Point light for glow */}
      <pointLight 
        position={[0, 0.4, 0]} 
        color={pedestalColor} 
        intensity={glowIntensity} 
        distance={3}
        decay={2}
      />
      
      {/* Upgrade indicator */}
      {isPurchased && (
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial 
            color="#00ff88"
            emissive="#00ff88"
            emissiveIntensity={1.0}
          />
        </mesh>
      )}
    </group>
  );
};