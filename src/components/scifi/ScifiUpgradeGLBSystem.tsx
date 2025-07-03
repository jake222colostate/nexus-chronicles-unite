import React, { useMemo, Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { scifiUpgrades } from '../../data/ScifiUpgrades';
import * as THREE from 'three';

interface ScifiUpgradeGLBSystemProps {
  gameState: any;
  onUpgradeClick: (upgradeId: string) => void;
  checkUpgradeUnlocked: (upgrade: any) => boolean;
}

// Enhanced sci-fi upgrade positions with collision avoidance
const SCIFI_UPGRADE_POSITIONS = [
  { id: 'quantum_boost', x: -8, y: 3, z: -5 },
  { id: 'plasma_conduit', x: 8, y: 3, z: -5 },
  { id: 'fusion_core', x: 0, y: 6, z: -12 },
  { id: 'antimatter_engine', x: 0, y: 9, z: -20 }
];

// Calculate radius of influence for revolving elements
const UPGRADE_INFLUENCE_RADIUS = 4; // Max radius of rings + particles + safety buffer

// Function to check if two upgrades are too close
const checkUpgradeCollision = (pos1: any, pos2: any): boolean => {
  const distance = Math.sqrt(
    Math.pow(pos1.x - pos2.x, 2) + 
    Math.pow(pos1.y - pos2.y, 2) + 
    Math.pow(pos1.z - pos2.z, 2)
  );
  return distance < (UPGRADE_INFLUENCE_RADIUS * 2); // Minimum safe distance
};

// Cool sci-fi upgrade component
const CyberUpgrade: React.FC<{
  position: [number, number, number];
  upgradeData: any;
  gameState: any;
  onUpgradeClick: (upgradeId: string) => void;
}> = ({ position, upgradeData, gameState, onUpgradeClick }) => {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Group>(null);
  
  const isPurchased = gameState.purchasedUpgrades?.includes(upgradeData.id) || false;
  const canAfford = gameState.energyCredits >= upgradeData.cost;
  
  // Enhanced color scheme based on upgrade type
  const colors = useMemo(() => {
    switch (upgradeData.id) {
      case 'quantum_boost':
        return { primary: '#00FFFF', secondary: '#0080FF', glow: '#00DDFF' };
      case 'plasma_conduit':
        return { primary: '#FF4000', secondary: '#FF8000', glow: '#FF6600' };
      case 'fusion_core':
        return { primary: '#FFFF00', secondary: '#FFD700', glow: '#FFCC00' };
      case 'antimatter_engine':
        return { primary: '#8000FF', secondary: '#A020F0', glow: '#9900FF' };
      default:
        return { primary: '#00FFFF', secondary: '#0080FF', glow: '#00DDFF' };
    }
  }, [upgradeData.id]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (groupRef.current) {
      // Floating animation
      groupRef.current.position.y = position[1] + Math.sin(time * 2 + position[0]) * 0.3;
    }
    
    if (coreRef.current) {
      // Core rotation and pulsing
      coreRef.current.rotation.x = time * 0.5;
      coreRef.current.rotation.y = time * 0.8;
      coreRef.current.rotation.z = time * 0.3;
      
      const scale = 1 + Math.sin(time * 4) * 0.1;
      coreRef.current.scale.setScalar(scale);
    }
    
    if (ringsRef.current) {
      // Rotating rings
      ringsRef.current.children.forEach((ring, i) => {
        ring.rotation.x = time * (1 + i * 0.5);
        ring.rotation.y = time * (0.8 - i * 0.3);
        ring.rotation.z = time * (0.6 + i * 0.2);
      });
    }
    
    if (particlesRef.current) {
      // Orbiting particles
      particlesRef.current.children.forEach((particle, i) => {
        const angle = time * 3 + (i * Math.PI * 2) / 8;
        const radius = 1.5 + Math.sin(time * 2 + i) * 0.3; // Reduced from 2 to 1.5
        particle.position.x = Math.cos(angle) * radius;
        particle.position.z = Math.sin(angle) * radius;
        particle.position.y = Math.sin(time * 4 + i) * 1;
        particle.rotation.x = time + i;
        particle.rotation.y = time * 1.5 + i;
      });
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    onUpgradeClick(upgradeData.id);
  };

  return (
    <group ref={groupRef} position={position} onClick={handleClick}>
      {/* Core holographic structure */}
      <mesh ref={coreRef}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial 
          color={colors.primary}
          emissive={colors.primary}
          emissiveIntensity={isPurchased ? 0.6 : canAfford ? 0.4 : 0.2}
          transparent
          opacity={0.8}
          roughness={0}
          metalness={1}
          clearcoat={1}
          clearcoatRoughness={0}
        />
      </mesh>
      
      {/* Inner energy core */}
      <mesh scale={0.7}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial 
          color={colors.glow}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Rotating ring system */}
      <group ref={ringsRef}>
        {[...Array(3)].map((_, i) => (
          <mesh key={i} scale={1.2 + i * 0.2} rotation={[Math.PI / 2 * i, Math.PI / 3 * i, 0]}>
            <torusGeometry args={[1.5, 0.04, 8, 32]} />
            <meshStandardMaterial 
              color={colors.secondary}
              emissive={colors.secondary}
              emissiveIntensity={0.3}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>
      
      {/* Data stream particles */}
      <group ref={particlesRef}>
        {[...Array(8)].map((_, i) => (
          <mesh key={i} scale={0.05}>
            <tetrahedronGeometry args={[1, 0]} />
            <meshBasicMaterial 
              color={colors.glow}
              transparent
              opacity={0.9}
            />
          </mesh>
        ))}
      </group>
      
      {/* Holographic base */}
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 2.5, 32]} />
        <meshBasicMaterial 
          color={colors.primary}
          transparent
          opacity={isPurchased ? 0.4 : canAfford ? 0.3 : 0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Energy column */}
      <mesh position={[0, -0.5, 0]} scale={[0.1, 2, 0.1]}>
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshBasicMaterial 
          color={colors.glow}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Upgrade status indicator */}
      {isPurchased && (
        <mesh position={[0, 2.5, 0]}>
          <sphereGeometry args={[0.2]} />
          <meshBasicMaterial color="#00FF00" />
        </mesh>
      )}
      
      {/* Interaction glow */}
      <pointLight 
        color={colors.glow}
        intensity={isPurchased ? 1 : canAfford ? 0.8 : 0.5}
        distance={10}
        decay={2}
      />
    </group>
  );
};

export const ScifiUpgradeGLBSystem: React.FC<ScifiUpgradeGLBSystemProps> = ({
  gameState,
  onUpgradeClick,
  checkUpgradeUnlocked
}) => {
  // Validate upgrade positions don't have intersecting revolving elements
  const validatedPositions = useMemo(() => {
    console.log('Validating upgrade positions for collision avoidance...');
    
    // Check all pairs of positions for collisions
    for (let i = 0; i < SCIFI_UPGRADE_POSITIONS.length; i++) {
      for (let j = i + 1; j < SCIFI_UPGRADE_POSITIONS.length; j++) {
        const pos1 = SCIFI_UPGRADE_POSITIONS[i];
        const pos2 = SCIFI_UPGRADE_POSITIONS[j];
        
        if (checkUpgradeCollision(pos1, pos2)) {
          console.warn(`Collision detected between ${pos1.id} and ${pos2.id}!`);
        } else {
          const distance = Math.sqrt(
            Math.pow(pos1.x - pos2.x, 2) + 
            Math.pow(pos1.y - pos2.y, 2) + 
            Math.pow(pos1.z - pos2.z, 2)
          );
          console.log(`Safe distance between ${pos1.id} and ${pos2.id}: ${distance.toFixed(2)} units`);
        }
      }
    }
    
    return SCIFI_UPGRADE_POSITIONS;
  }, []);

  const upgradeNodes = useMemo(() => {
    return validatedPositions.map((position) => {
      const upgrade = scifiUpgrades.find(u => u.id === position.id);
      if (!upgrade) return null;

      return (
        <Suspense key={upgrade.id} fallback={null}>
          <CyberUpgrade
            position={[position.x, position.y, position.z]}
            upgradeData={upgrade}
            gameState={gameState}
            onUpgradeClick={onUpgradeClick}
          />
        </Suspense>
      );
    }).filter(Boolean);
  }, [validatedPositions, gameState.purchasedUpgrades, gameState.energyCredits, onUpgradeClick]);

  return <>{upgradeNodes}</>;
};