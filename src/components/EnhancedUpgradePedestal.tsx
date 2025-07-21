
import React, { useRef, useState, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { useRegisterCollider } from '@/lib/CollisionContext';
import { useGLTFWithCors } from '@/lib/useGLTFWithCors';

interface EnhancedUpgradePedestalProps {
  position: [number, number, number];
  upgrade: any;
  isUnlocked: boolean;
  isPurchased: boolean;
  canAfford: boolean;
  onInteract: () => void;
  tier: number;
}

export const EnhancedUpgradePedestal: React.FC<EnhancedUpgradePedestalProps> = ({
  position,
  upgrade,
  isUnlocked,
  isPurchased,
  canAfford,
  onInteract,
  tier
}) => {
  const meshRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useRegisterCollider(
    `upgrade-${upgrade.id}`,
    new Vector3(...position),
    1.5
  );
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation - now starting from ground level
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      
      // Rotation
      if (isPurchased) {
        meshRef.current.rotation.y += 0.01;
      } else if (isUnlocked) {
        meshRef.current.rotation.y += 0.02;
      }
    }
    
    if (glowRef.current && isUnlocked) {
      // Pulsing glow
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  const tierColors = ['#a7f3d0', '#7dd3fc', '#818cf8', '#c084fc'];
  const getCrystalColor = () => {
    if (isPurchased) return '#10B981';
    const base = tierColors[Math.min(tier - 1, tierColors.length - 1)] || '#6B7280';
    if (isUnlocked) return base;
    return '#6B7280';
  };

  const getPedestalTier = () => {
    if (tier >= 5) return { height: 2, rings: 3, material: '#FFD700' }; // Gold
    if (tier >= 3) return { height: 1.5, rings: 2, material: '#C0C0C0' }; // Silver
    return { height: 1, rings: 1, material: '#8B7355' }; // Bronze
  };

  const pedestalConfig = getPedestalTier();

  // Enhanced click handler with better event handling
  const handleClick = (event: any) => {
    event.stopPropagation();
    console.log('EnhancedUpgradePedestal: Clicked on upgrade', upgrade.id);
    if (isUnlocked) {
      onInteract();
    }
  };

  const handlePointerOver = (event: any) => {
    event.stopPropagation();
    setHovered(true);
  };

  const handlePointerOut = (event: any) => {
    event.stopPropagation();
    setHovered(false);
  };

  // All upgrades now use the same podium model

  // New podium model component - used for ALL upgrades
  const PodiumModel = () => {
    console.log('PodiumModel: Attempting to load Podiums.glb');
    
    try {
      const gltf = useGLTFWithCors('/assets/upgrades/Podiums.glb');
      console.log('PodiumModel: Successfully loaded GLB', gltf);
      
      if (!gltf || !gltf.scene) {
        console.warn('PodiumModel: GLB loaded but no scene found');
        throw new Error('No scene in GLB');
      }
      
      return (
        <primitive
          ref={meshRef}
          object={gltf.scene.clone()}
          position={[0, 0, 0]} // Positioned to sit flat on terrain
          scale={hovered ? 1.1 : 1.0} // Scale appropriately for fantasy world
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          castShadow
          receiveShadow
        />
      );
    } catch (error) {
      console.warn('PodiumModel: Failed to load Podiums.glb, using fallback', error);
      // Fallback to default crystal that looks like a podium
      return (
        <group>
          {/* Podium base */}
          <mesh position={[0, 0, 0]} receiveShadow>
            <cylinderGeometry args={[1.2, 1.5, 0.8, 8]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
          
          {/* Crystal/upgrade indicator on top */}
          <mesh
            ref={meshRef}
            position={[0, 0.8, 0]}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            scale={hovered ? 1.1 : 1}
            castShadow
          >
            <icosahedronGeometry args={[0.6, 1]} />
            <meshLambertMaterial
              color={getCrystalColor()}
              transparent
              opacity={isUnlocked ? 0.9 : 0.5}
            />
          </mesh>
        </group>
      );
    }
  };

  return (
    <group position={position}>
      {/* Enhanced clickable area - larger invisible mesh for easier clicking */}
      <mesh
        position={[0, 1.5, 0]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        visible={false}
      >
        <sphereGeometry args={[2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* New podium model for all upgrades */}
      <Suspense fallback={null}>
        <PodiumModel />
      </Suspense>
      
      {/* Magical glow effect around podium base */}
      {isUnlocked && (
        <mesh ref={glowRef} position={[0, 0.2, 0]}>
          <cylinderGeometry args={[2, 2.2, 0.5, 32]} />
          <meshBasicMaterial
            color={getCrystalColor()}
            transparent
            opacity={0.2}
          />
        </mesh>
      )}
      
      {/* Additional magical aura for enhanced visual appeal */}
      {isUnlocked && canAfford && (
        <mesh position={[0, 0.1, 0]} rotation={[0, 0, 0]}>
          <ringGeometry args={[1.8, 2.5, 32]} />
          <meshBasicMaterial
            color={isPurchased ? '#10B981' : getCrystalColor()}
            transparent
            opacity={0.25}
            side={2} // Double-sided
          />
        </mesh>
      )}
      
      {/* Upgrade tier indicators */}
      {isPurchased && tier > 1 && (
        <>
          {Array.from({ length: Math.min(tier - 1, 3) }).map((_, i) => (
            <mesh key={i} position={[Math.cos(i * 2.1) * 1, 2 + i * 0.2, Math.sin(i * 2.1) * 1]}>
              <sphereGeometry args={[0.1]} />
              <meshBasicMaterial color="#FFD700" />
            </mesh>
          ))}
        </>
      )}
      
      {/* Particle effects for higher tiers */}
      {isPurchased && tier >= 3 && (
        <>
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh key={i} position={[
              Math.cos(i * 1.26) * 2,
              1.5 + Math.sin(i * 1.26) * 0.5,
              Math.sin(i * 1.26) * 2
            ]}>
              <sphereGeometry args={[0.05]} />
              <meshBasicMaterial color="#A78BFA" transparent opacity={0.7} />
            </mesh>
          ))}
        </>
      )}
      
      {/* Interaction indicator */}
      {hovered && isUnlocked && (
        <mesh position={[0, 3, 0]}>
          <planeGeometry args={[2, 0.5]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
};
