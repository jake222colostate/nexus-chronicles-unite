import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';
import { assetUrl } from '@/lib/utils';

interface FantasyObeliskModelsProps {
  upgradeId: number;
  onInteract: () => void;
  isUnlocked: boolean;
  hovered: boolean;
  onPointerOver: (event: any) => void;
  onPointerOut: (event: any) => void;
}

export const FantasyObeliskModels: React.FC<FantasyObeliskModelsProps> = ({
  upgradeId,
  onInteract,
  isUnlocked,
  hovered,
  onPointerOver,
  onPointerOut,
}) => {
  const meshRef = useRef<Group>(null);

  // Validate upgradeId (can be 0 since IDs are 0-based)
  if (upgradeId < 0) {
    console.warn('FantasyObeliskModels: Invalid upgradeId:', upgradeId);
    return null;
  }

  // Cycle through the 5 obelisk models based on upgrade ID (0-based)
  const getModelPath = (id: number) => {
    const modelIndex = Math.floor(id / 5) % 5; // Which cycle of 5 we're in, mod 5
    const models = [
      'assets/upgrades/LargeObelisk.glb',  // First obelisk (upgrade 5)
      'assets/upgrades/Lotus.glb',         // Second obelisk (upgrade 10)
      'assets/upgrades/Meltingtower.glb',  // Third obelisk (upgrade 15)
      'assets/upgrades/Phoenix.glb',       // Fourth obelisk (upgrade 20)
      'assets/upgrades/Spiral.glb'         // Fifth obelisk (upgrade 25)
    ];
    
    // Validate modelIndex
    if (modelIndex < 0 || modelIndex >= models.length) {
      console.warn('FantasyObeliskModels: Invalid modelIndex:', modelIndex, 'for upgradeId:', id);
      return assetUrl('assets/upgrades/LargeObelisk.glb'); // Fallback to first model
    }
    
    const modelPath = models[modelIndex];
    if (!modelPath) {
      console.warn('FantasyObeliskModels: Model path is undefined for index:', modelIndex);
      return assetUrl('assets/upgrades/LargeObelisk.glb'); // Fallback
    }
    
    return assetUrl(modelPath);
  };

  // Get scale based on model type
  const getModelScale = (id: number): [number, number, number] => {
    const modelIndex = Math.floor(id / 5) % 5;
    const scales: [number, number, number][] = [
      [5.33, 5.33, 5.33], // LargeObelisk - original scale
      [4, 4, 4],          // Lotus - increased from 3
      [8, 8, 8],          // Meltingtower - doubled from 4
      [4.5, 4.5, 4.5],    // Phoenix - increased from 3.5
      [6, 6, 6]           // Spiral - doubled from 3
    ];
    return scales[Math.max(0, Math.min(modelIndex, scales.length - 1))];
  };

  // Get vertical position offset for proper grounding
  const getPositionOffset = (id: number): [number, number, number] => {
    const modelIndex = Math.floor(id / 5) % 5;
    const offsets: [number, number, number][] = [
      [0, 5, 0],     // LargeObelisk - lifted position like before
      [0, 2, 0],     // Lotus - raised to touch ground without clipping
      [0, 4, 0],     // Meltingtower - raised higher due to doubling
      [0, 2.5, 0],   // Phoenix - raised to touch ground without clipping
      [0, 3, 0]      // Spiral - raised higher due to doubling
    ];
    return offsets[Math.max(0, Math.min(modelIndex, offsets.length - 1))];
  };

  const modelPath = getModelPath(upgradeId);
  const scale = getModelScale(upgradeId);
  const positionOffset = getPositionOffset(upgradeId);

  // Remove useFrame rotation to fix hover lag - static models
  // useFrame removed to prevent lag on hover

  const handleClick = (event: any) => {
    event.stopPropagation();
    console.log('FantasyObeliskModels: Click detected on upgrade', upgradeId, 'unlocked:', isUnlocked);
    onInteract(); // Always call onInteract, let parent handle unlock logic
  };

  try {
    const { scene } = useGLTF(modelPath);

    return (
      <group position={positionOffset}>
        {/* Large invisible clickable area */}
        <mesh
          position={[0, 3, 0]}
          onClick={handleClick}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
          visible={false}
        >
          <sphereGeometry args={[4]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        
        <group
          ref={meshRef}
          scale={hovered ? scale.map(s => s * 1.02) as [number, number, number] : scale}
        >
          <primitive object={scene.clone()} />
          
          {/* Add mystical glow effect */}
          {isUnlocked && (
            <pointLight
              position={[0, 5, 0]}
              color="#9333ea"
              intensity={2}
              distance={15}
              decay={2}
            />
          )}
        </group>
      </group>
    );
  } catch (error) {
    console.error('Error loading obelisk model:', error);
    // Fallback to basic geometry
    return (
      <group
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        scale={hovered ? 1.05 : 1.0}
      >
        <mesh position={[0, 2, 0]}>
          <cylinderGeometry args={[0.5, 0.8, 4]} />
          <meshLambertMaterial color="#9333ea" />
        </mesh>
      </group>
    );
  }
};

// Preload all the obelisk models
useGLTF.preload(assetUrl('assets/upgrades/LargeObelisk.glb'));
useGLTF.preload(assetUrl('assets/upgrades/Lotus.glb'));
useGLTF.preload(assetUrl('assets/upgrades/Meltingtower.glb'));
useGLTF.preload(assetUrl('assets/upgrades/Phoenix.glb'));
useGLTF.preload(assetUrl('assets/upgrades/Spiral.glb'));