
import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';
import { useThree } from '@react-three/fiber';

export const MountainWalls: React.FC = () => {
  const { scene } = useThree();
  const { scene: mountainModel } = useGLTF('/assets/mountain_low_poly.glb');
  const mountainsRef = useRef<Group[]>([]);

  useEffect(() => {
    if (!mountainModel) return;

    // Clean up existing mountains
    mountainsRef.current.forEach(mountain => {
      scene.remove(mountain);
    });
    mountainsRef.current = [];

    const clonesPerSide = 8; // More mountains for better wall effect
    const spacingZ = 15; // Spacing between mountains
    const startZ = 20; // Start ahead of player
    
    console.log('MountainWalls: Creating mountain wall with', clonesPerSide, 'mountains per side');

    for (let i = 0; i < clonesPerSide; i++) {
      const z = startZ - (i * spacingZ);

      // Left side mountains (mirrored)
      const leftMountain = mountainModel.clone() as Group;
      leftMountain.position.set(-25, 0, z);
      leftMountain.scale.set(-3, 3, 3);
      leftMountain.castShadow = true;
      leftMountain.receiveShadow = true;
      
      // Apply materials for visibility
      leftMountain.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      scene.add(leftMountain);
      mountainsRef.current.push(leftMountain);

      // Right side mountains (normal)
      const rightMountain = mountainModel.clone() as Group;
      rightMountain.position.set(25, 0, z);
      rightMountain.scale.set(3, 3, 3);
      rightMountain.castShadow = true;
      rightMountain.receiveShadow = true;
      
      // Apply materials for visibility
      rightMountain.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      scene.add(rightMountain);
      mountainsRef.current.push(rightMountain);
    }

    console.log('MountainWalls: Added', mountainsRef.current.length, 'mountains to scene');

    // Cleanup function
    return () => {
      mountainsRef.current.forEach(mountain => {
        scene.remove(mountain);
      });
      mountainsRef.current = [];
    };
  }, [mountainModel, scene]);

  return null;
};

// Preload the mountain model
useGLTF.preload('/assets/mountain_low_poly.glb');
