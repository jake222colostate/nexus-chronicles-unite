
import React, { useRef, useState, useEffect } from 'react';
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
  const [loadError, setLoadError] = useState(false);
  const [gltfData, setGltfData] = useState<any>(null);
  const [glowIntensity, setGlowIntensity] = useState(1);
  
  // Load GLB model with enhanced error handling
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log(`Loading model: ${name} from ${modelUrl}`);
        const gltf = await useGLTF.preload(modelUrl);
        setGltfData(gltf);
        console.log(`Successfully loaded: ${name}`);
      } catch (error) {
        console.warn(`Failed to load ${name}, using fallback:`, error);
        setLoadError(true);
      }
    };

    loadModel();
  }, [modelUrl, name]);
  
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

    // Enhanced pulsing glow effect
    if (glowRef.current) {
      if (isPurchased) {
        const purchasedGlow = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.8;
        glowRef.current.scale.setScalar(purchasedGlow * 1.2);
        setGlowIntensity(0.4);
      } else if (canAfford) {
        const activeGlow = Math.sin(state.clock.elapsedTime * 3) * 0.4 + 1;
        glowRef.current.scale.setScalar(activeGlow);
        setGlowIntensity(0.6);
      } else {
        const subdued = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.6;
        glowRef.current.scale.setScalar(subdued);
        setGlowIntensity(0.3);
      }
    }
  });

  // Enhanced fallback geometry for failed loads
  if (loadError || !gltfData) {
    return (
      <group
        ref={groupRef}
        position={position}
        onClick={isWithinRange ? onClick : undefined}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Enhanced fallback crystal */}
        <mesh>
          <octahedronGeometry args={[scale * 0.8]} />
          <meshLambertMaterial 
            color={isPurchased ? "#10b981" : "#8b5cf6"} 
            transparent 
            opacity={0.9} 
          />
        </mesh>
        
        {/* Fallback glow */}
        <mesh ref={glowRef} position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[scale * 1.5]} />
          <meshBasicMaterial
            color={isPurchased ? "#10b981" : "#8b5cf6"}
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
      onClick={isWithinRange ? onClick : undefined}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Enhanced magical glow beneath model */}
      <mesh ref={glowRef} position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[scale * 1.8]} />
        <meshBasicMaterial
          color={isPurchased ? "#10b981" : canAfford ? "#c084fc" : "#8b5cf6"}
          transparent
          opacity={glowIntensity * 0.4}
        />
      </mesh>

      {/* Main 3D model */}
      <primitive 
        object={gltfData.scene.clone()} 
        scale={scale * (isPurchased ? 1.1 : 1)}
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
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Available for unlock indicator */}
      {!isPurchased && (
        <mesh position={[0, scale * 3, 0]}>
          <sphereGeometry args={[0.08]} />
          <meshBasicMaterial color="#ffffff" />
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
