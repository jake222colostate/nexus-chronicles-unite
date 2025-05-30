
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Mesh, Group } from 'three';

interface GLBModelProps {
  modelUrl: string;
  position: [number, number, number];
  scale?: number;
  onClick: () => void;
  name: string;
  isUnlocked: boolean;
  isWithinRange: boolean;
  isPurchased?: boolean;
  cost: number;
  canAfford: boolean;
}

export const GLBModel: React.FC<GLBModelProps> = ({ 
  modelUrl, 
  position, 
  scale = 1,
  onClick, 
  name, 
  isUnlocked, 
  isWithinRange,
  isPurchased = false,
  cost,
  canAfford
}) => {
  const groupRef = useRef<Group>(null);
  const glowRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(1);
  
  // Load GLB model with proper error handling
  const { scene: gltfScene, error } = useGLTF(modelUrl);
  
  // Enhanced click handler with better debugging
  const handleClick = (event: any) => {
    event.stopPropagation();
    console.log(`Clicked on ${name}. Within range: ${isWithinRange}, Can afford: ${canAfford}`);
    
    // Always allow clicks, let the parent component handle the logic
    onClick();
  };
  
  useFrame((state) => {
    if (groupRef.current) {
      // Enhanced floating animation based on unlock state
      if (isPurchased) {
        groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.1;
        groupRef.current.rotation.y += 0.002;
      } else {
        groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.2;
        groupRef.current.rotation.y += 0.005;
      }
      
      // Enhanced hover effects
      if (hovered && isWithinRange) {
        const hoverScale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
        groupRef.current.scale.setScalar(scale * hoverScale);
      } else {
        groupRef.current.scale.setScalar(scale);
      }
    }

    // Enhanced pulsing glow effect based on state
    if (glowRef.current) {
      if (isPurchased) {
        const purchasedGlow = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.8;
        glowRef.current.scale.setScalar(purchasedGlow * 1.2);
        setGlowIntensity(0.6);
      } else if (canAfford && isWithinRange) {
        const activeGlow = Math.sin(state.clock.elapsedTime * 3) * 0.4 + 1;
        glowRef.current.scale.setScalar(activeGlow);
        setGlowIntensity(0.8);
      } else if (!canAfford) {
        // Locked state - dim and slow pulse
        const lockedGlow = Math.sin(state.clock.elapsedTime * 1) * 0.2 + 0.4;
        glowRef.current.scale.setScalar(lockedGlow);
        setGlowIntensity(0.2);
      } else {
        const defaultGlow = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.7;
        glowRef.current.scale.setScalar(defaultGlow);
        setGlowIntensity(0.4);
      }
    }
  });

  // Enhanced fallback geometry for failed loads or loading state
  if (error || !gltfScene) {
    console.log(`Using fallback for ${name}, error:`, error);
    return (
      <group
        ref={groupRef}
        position={position}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Invisible interaction sphere for better click detection */}
        <mesh>
          <sphereGeometry args={[scale * 2]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {/* Enhanced fallback crystal with state-based coloring */}
        <mesh>
          <octahedronGeometry args={[scale * 0.8]} />
          <meshLambertMaterial 
            color={
              isPurchased ? "#10b981" : 
              canAfford ? "#8b5cf6" : 
              "#6b7280"
            } 
            transparent 
            opacity={isPurchased ? 0.9 : canAfford ? 0.7 : 0.5} 
          />
        </mesh>
        
        {/* Fallback glow with state-based intensity */}
        <mesh ref={glowRef} position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[scale * 1.5]} />
          <meshBasicMaterial
            color={
              isPurchased ? "#10b981" : 
              canAfford ? "#8b5cf6" : 
              "#6b7280"
            }
            transparent
            opacity={glowIntensity * 0.3}
          />
        </mesh>
      </group>
    );
  }

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Invisible interaction sphere for better click detection */}
      <mesh>
        <sphereGeometry args={[scale * 2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Enhanced magical glow beneath model with state-based coloring */}
      <mesh ref={glowRef} position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[scale * 1.8]} />
        <meshBasicMaterial
          color={
            isPurchased ? "#10b981" : 
            canAfford ? "#c084fc" : 
            "#6b7280"
          }
          transparent
          opacity={glowIntensity * 0.4}
        />
      </mesh>

      {/* Main 3D model with state-based scaling and opacity */}
      <primitive 
        object={gltfScene.clone()} 
        scale={scale * (isPurchased ? 1.1 : canAfford ? 1 : 0.8)}
      />
      
      {/* Purchase success indicator */}
      {isPurchased && (
        <mesh position={[0, scale * 2.5, 0]}>
          <sphereGeometry args={[0.15]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      )}
      
      {/* Interaction range indicator */}
      {isWithinRange && !isPurchased && (
        <mesh position={[0, scale * 2.2, 0]}>
          <ringGeometry args={[0.3, 0.4]} />
          <meshBasicMaterial 
            color={canAfford ? "#ffffff" : "#ff6b6b"} 
            transparent 
            opacity={0.8} 
          />
        </mesh>
      )}

      {/* State indicator */}
      {!isPurchased && (
        <mesh position={[0, scale * 3, 0]}>
          <sphereGeometry args={[0.08]} />
          <meshBasicMaterial 
            color={canAfford ? "#ffffff" : "#ff6b6b"} 
            transparent
            opacity={canAfford ? 1 : 0.6}
          />
        </mesh>
      )}

      {/* Locked state visual overlay */}
      {!canAfford && !isPurchased && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[scale * 2, scale * 2, scale * 2]} />
          <meshBasicMaterial 
            color="#000000" 
            transparent 
            opacity={0.3} 
          />
        </mesh>
      )}
    </group>
  );
};

// Preload the models for better performance
const modelUrls = [
  'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb',
  'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb',
  'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_03.glb',
  'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_04.glb',
  'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_05.glb',
  'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_06.glb',
  'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_07.glb'
];

modelUrls.forEach(url => {
  useGLTF.preload(url);
});
