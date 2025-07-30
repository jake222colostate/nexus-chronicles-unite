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

  // Validate upgradeId
  if (!upgradeId || upgradeId < 1) {
    console.warn('FantasyObeliskModels: Invalid upgradeId:', upgradeId);
    return null;
  }

  // Cycle through the 4 new models based on upgrade ID
  const getModelPath = (id: number) => {
    const modelIndex = Math.floor((id - 1) / 5) % 4; // Which cycle of 5 we're in, mod 4
    const models = [
      'assets/upgrades/Lotus.glb',
      'assets/upgrades/Meltingtower.glb', 
      'assets/upgrades/Phoenix.glb',
      'assets/upgrades/Spiral.glb'
    ];
    
    // Validate modelIndex
    if (modelIndex < 0 || modelIndex >= models.length) {
      console.warn('FantasyObeliskModels: Invalid modelIndex:', modelIndex, 'for upgradeId:', id);
      return assetUrl('assets/upgrades/Lotus.glb'); // Fallback to first model
    }
    
    const modelPath = models[modelIndex];
    if (!modelPath) {
      console.warn('FantasyObeliskModels: Model path is undefined for index:', modelIndex);
      return assetUrl('assets/upgrades/Lotus.glb'); // Fallback
    }
    
    return assetUrl(modelPath);
  };

  // Get scale based on model type
  const getModelScale = (id: number): [number, number, number] => {
    const modelIndex = Math.floor((id - 1) / 5) % 4;
    const scales: [number, number, number][] = [
      [3, 3, 3],     // Lotus
      [4, 4, 4],     // Meltingtower
      [3.5, 3.5, 3.5], // Phoenix
      [3, 3, 3]      // Spiral
    ];
    return scales[Math.max(0, Math.min(modelIndex, scales.length - 1))];
  };

  // Get vertical position offset for proper grounding
  const getPositionOffset = (id: number): [number, number, number] => {
    const modelIndex = Math.floor((id - 1) / 5) % 4;
    const offsets: [number, number, number][] = [
      [0, 0, 0],     // Lotus - already grounded
      [0, 2, 0],     // Meltingtower - lift slightly
      [0, 1, 0],     // Phoenix - slight lift
      [0, 0.5, 0]    // Spiral - minimal lift
    ];
    return offsets[Math.max(0, Math.min(modelIndex, offsets.length - 1))];
  };

  const modelPath = getModelPath(upgradeId);
  const scale = getModelScale(upgradeId);
  const positionOffset = getPositionOffset(upgradeId);

  // Add gentle rotation for some models
  useFrame((state) => {
    if (meshRef.current && isUnlocked) {
      const modelIndex = Math.floor((upgradeId - 1) / 5) % 4;
      // Only rotate Lotus and Spiral models
      if (modelIndex === 0 || modelIndex === 3) {
        meshRef.current.rotation.y += 0.005;
      }
    }
  });

  const handleClick = (event: any) => {
    event.stopPropagation();
    if (isUnlocked) {
      onInteract();
    }
  };

  try {
    const { scene } = useGLTF(modelPath);

    return (
      <group
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        scale={hovered ? scale.map(s => s * 1.02) as [number, number, number] : scale}
        position={positionOffset}
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

// Preload all the new obelisk models
useGLTF.preload(assetUrl('assets/upgrades/Lotus.glb'));
useGLTF.preload(assetUrl('assets/upgrades/Meltingtower.glb'));
useGLTF.preload(assetUrl('assets/upgrades/Phoenix.glb'));
useGLTF.preload(assetUrl('assets/upgrades/Spiral.glb'));