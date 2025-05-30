
import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Mesh, Group } from 'three';

interface GLBModelProps {
  modelUrl: string;
  position: [number, number, number];
  onClick: () => void;
  name: string;
  isUnlocked: boolean;
  isWithinRange: boolean;
  isPurchased?: boolean;
}

export const GLBModel: React.FC<GLBModelProps> = ({ 
  modelUrl, 
  position, 
  onClick, 
  name, 
  isUnlocked, 
  isWithinRange,
  isPurchased = false
}) => {
  const groupRef = useRef<Group>(null);
  const glowRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [gltfData, setGltfData] = useState<any>(null);
  
  // Load GLB model with proper error handling
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log(`Attempting to load model: ${name} from ${modelUrl}`);
        const gltf = await useGLTF.preload(modelUrl);
        setGltfData(gltf);
        console.log(`Successfully loaded model: ${name}`);
      } catch (error) {
        console.warn(`Failed to load model ${name}:`, error);
        setLoadError(true);
      }
    };

    loadModel();
  }, [modelUrl, name]);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Floating animation for unlocked models
      if (isUnlocked) {
        groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.15;
      }
      
      // Idle rotation for purchased models
      if (isPurchased) {
        groupRef.current.rotation.y += 0.01;
      } else if (hovered && isUnlocked) {
        groupRef.current.rotation.y += 0.02;
      }
    }

    // Pulsing glow effect for unlocked models
    if (glowRef.current && isUnlocked && !isPurchased) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  // Fallback geometry if model fails to load or is still loading
  if (loadError || !gltfData) {
    if (loadError) {
      console.warn(`Using fallback geometry for ${name}`);
    }
    return (
      <group
        ref={groupRef}
        position={position}
        onClick={isUnlocked && isWithinRange ? onClick : undefined}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered && isUnlocked ? 1.1 : 1}
      >
        {/* Fallback crystal shape */}
        <mesh>
          <octahedronGeometry args={[1.2]} />
          <meshLambertMaterial 
            color={isPurchased ? "#10b981" : isUnlocked ? "#8b5cf6" : "#666666"} 
            transparent 
            opacity={isUnlocked ? 0.8 : 0.3} 
          />
        </mesh>
        
        {/* Status indicators */}
        {!isUnlocked && (
          <>
            <mesh position={[0, 2, 0]}>
              <sphereGeometry args={[0.3]} />
              <meshBasicMaterial color="#ff4444" />
            </mesh>
            <mesh position={[0, 3, 0]}>
              <planeGeometry args={[3, 0.8]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.8} />
            </mesh>
          </>
        )}
      </group>
    );
  }

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={isUnlocked && isWithinRange ? onClick : undefined}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered && isUnlocked ? 1.1 : 1}
    >
      {/* Realm-colored glow beneath model */}
      {isUnlocked && (
        <mesh ref={glowRef} position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2]} />
          <meshBasicMaterial
            color="#8b5cf6"
            transparent
            opacity={isPurchased ? 0.3 : 0.2}
          />
        </mesh>
      )}

      <primitive 
        object={gltfData.scene.clone()} 
        scale={isPurchased ? 1.2 : isUnlocked ? 1 : 0.6}
      />
      
      {/* Purchase success indicator */}
      {isPurchased && (
        <mesh position={[0, 3, 0]}>
          <sphereGeometry args={[0.2]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      )}
      
      {/* Lock indicator for locked models */}
      {!isUnlocked && (
        <>
          <mesh position={[0, 2.5, 0]}>
            <sphereGeometry args={[0.4]} />
            <meshBasicMaterial color="#ff4444" />
          </mesh>
          {/* "Not Yet Unlocked" label */}
          <mesh position={[0, 3.5, 0]}>
            <planeGeometry args={[4, 1]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.8} />
          </mesh>
        </>
      )}
      
      {/* Interaction prompt when in range */}
      {isWithinRange && isUnlocked && !isPurchased && (
        <mesh position={[0, 3, 0]}>
          <planeGeometry args={[3, 0.8]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.9} />
        </mesh>
      )}

      {/* Guiding light/particle marker */}
      {isUnlocked && (
        <mesh position={[0, 4, 0]}>
          <sphereGeometry args={[0.1]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}
    </group>
  );
};

// Preload all GLB models for performance
useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/mana_altar.glb');
useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/magic_tree.glb');
useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/arcane_lab.glb');
useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/crystal_tower.glb');
useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/dream_gate.glb');
