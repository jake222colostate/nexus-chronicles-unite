
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
}

export const GLBModel: React.FC<GLBModelProps> = ({ 
  modelUrl, 
  position, 
  onClick, 
  name, 
  isUnlocked, 
  isWithinRange 
}) => {
  const groupRef = useRef<Group>(null);
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
      // Subtle floating animation for unlocked models
      if (isUnlocked) {
        groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
      }
      
      // Gentle rotation when hovered and unlocked
      if (hovered && isUnlocked) {
        groupRef.current.rotation.y += 0.01;
      }
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
          <octahedronGeometry args={[0.8]} />
          <meshLambertMaterial 
            color={isUnlocked ? "#8b5cf6" : "#666666"} 
            transparent 
            opacity={isUnlocked ? 0.8 : 0.4} 
          />
        </mesh>
        
        {/* Visual indicator for locked state */}
        {!isUnlocked && (
          <mesh position={[0, 1.2, 0]}>
            <sphereGeometry args={[0.3]} />
            <meshBasicMaterial color="#ff4444" />
          </mesh>
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
      <primitive 
        object={gltfData.scene.clone()} 
        scale={isUnlocked ? 1 : 0.7}
      />
      
      {/* Glow effect for unlocked models */}
      {isUnlocked && (
        <mesh scale={1.5}>
          <sphereGeometry args={[1]} />
          <meshBasicMaterial
            color="#8b5cf6"
            transparent
            opacity={0.1}
          />
        </mesh>
      )}
      
      {/* Lock indicator for locked models */}
      {!isUnlocked && (
        <mesh position={[0, 2, 0]}>
          <sphereGeometry args={[0.3]} />
          <meshBasicMaterial color="#ff4444" />
        </mesh>
      )}
      
      {/* Interaction prompt when in range */}
      {isWithinRange && isUnlocked && (
        <mesh position={[0, 2.5, 0]}>
          <planeGeometry args={[2, 0.5]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  );
};

// Note: Commenting out preloads since the URLs return 404
// useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/mana_altar.glb');
// useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/magic_tree.glb');
// useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/arcane_lab.glb');
// useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/crystal_tower.glb');
// useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/dream_gate.glb');
