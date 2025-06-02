
import React, { useRef, useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Vector3 } from 'three';

interface FantasyInfiniteTileLoaderProps {
  position: [number, number, number];
  tileIndex: number;
}

export const FantasyInfiniteTileLoader: React.FC<FantasyInfiniteTileLoaderProps> = ({
  position,
  tileIndex
}) => {
  const { scene } = useGLTF('https://raw.githubusercontent.com/jake222colostate/UpdatedModels/main/infinite_tile_scene.glb');
  const groupRef = useRef<THREE.Group>(null);
  const crystalRefs = useRef<THREE.Mesh[]>([]);
  const timeRef = useRef(0);

  // Clone and configure the scene
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // Configure materials
    const groundMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color().setHSL(110/360, 0.65, 0.5) // HSV(110°, 65%, 50%)
    });

    const pathMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color(0.45, 0.25, 0.10) // Warm earthy brown
    });

    const treeTrunkMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color(0.4, 0.2, 0.0) // Dark brown
    });

    const treeFoliageMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color().setHSL(120/360, 0.8, 0.5), // Bright forest green
      emissive: new THREE.Color(0.05, 0.15, 0.05),
      emissiveIntensity: 0.15
    });

    const crystalMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color(0.05, 0.8, 0.8), // Bright cyan-teal
      emissive: new THREE.Color(0.05, 0.8, 0.8),
      emissiveIntensity: 1.2
    });

    const archwayMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color(0.4, 0.4, 0.4) // Medium-gray stone
    });

    // Apply materials to meshes
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.name.toLowerCase().includes('terrain')) {
          child.material = groundMaterial;
          child.receiveShadow = true;
        } else if (child.name.toLowerCase().includes('path')) {
          child.material = pathMaterial;
          child.receiveShadow = true;
        } else if (child.name.toLowerCase().includes('trunk')) {
          child.material = treeTrunkMaterial;
          child.castShadow = true;
        } else if (child.name.toLowerCase().includes('foliage')) {
          child.material = treeFoliageMaterial;
          child.castShadow = true;
        } else if (child.name.toLowerCase().includes('crystal')) {
          child.material = crystalMaterial;
          child.castShadow = true;
          // Store crystal references for animation
          crystalRefs.current.push(child);
        } else if (child.name.toLowerCase().includes('archway')) {
          child.material = archwayMaterial;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      }
    });

    return clone;
  }, [scene]);

  // Animate crystals with subtle bobbing
  useFrame((state, delta) => {
    timeRef.current += delta;
    
    crystalRefs.current.forEach((crystal, index) => {
      if (crystal) {
        // Each crystal has slightly different phase for variety
        const phase = (timeRef.current + index * 0.5) % 3.0;
        const baseY = 2.0;
        const bobAmount = 0.3;
        
        // Smooth sine wave animation
        crystal.position.y = baseY + Math.sin((phase / 3.0) * Math.PI * 2) * bobAmount;
      }
    });
  });

  return (
    <group 
      ref={groupRef}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]} // Rotate -90° in X so +Z is forward
      scale={[1, 1, 1]}
    >
      <primitive object={clonedScene} />
      
      {/* Crystal point lights */}
      {crystalRefs.current.map((_, index) => (
        <pointLight
          key={`crystal-light-${index}`}
          position={[
            (Math.random() - 0.5) * 10, // Random X between -5 and +5
            2.0, // Y = 2.0 (hovering height)
            10 + index * 6 // Spread along Z from 10 to 44
          ]}
          color={new THREE.Color(0.05, 0.8, 0.8)} // Cyan-teal
          intensity={1.5}
          distance={6}
          castShadow={false}
        />
      ))}
      
      {/* Archway lantern lights */}
      <pointLight
        position={[-2, 3.5, 30]}
        color={new THREE.Color(0.9, 0.8, 0.7)} // Warm peach-orange
        intensity={1.2}
        distance={4}
        castShadow={false}
      />
      <pointLight
        position={[2, 3.5, 30]}
        color={new THREE.Color(0.9, 0.8, 0.7)} // Warm peach-orange
        intensity={1.2}
        distance={4}
        castShadow={false}
      />
    </group>
  );
};

// Preload the model
useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/UpdatedModels/main/infinite_tile_scene.glb');
