
import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { Group, Mesh } from 'three';
import { useThree } from '@react-three/fiber';

export const PathsideMountains: React.FC = () => {
  const { scene } = useThree();
  const { scene: mountain } = useGLTF('/assets/mountain_low_poly.glb');
  const mountainsRef = useRef<Group[]>([]);

  useEffect(() => {
    if (!mountain) return;

    // Clean up existing mountains
    mountainsRef.current.forEach(mountain => {
      scene.remove(mountain);
    });
    mountainsRef.current = [];

    const count = 15; // Increased for better infinite generation coverage
    const spacing = 8; // Keep current spacing
    const offsetX = 30; // REDUCED from 40 to 30 - move mountains closer to path
    const scale = 0.08; // Slightly increased from 0.06 to 0.08 for more immersive feel

    console.log('PathsideMountains: Creating enlarged mountains with scale:', scale, 'at distance:', offsetX);

    for (let i = 0; i < count; i++) {
      const z = -i * spacing;

      // Left side mountains (mirrored with negative X scale)
      const left = mountain.clone() as Group;
      left.position.set(-offsetX, 0, z); // X = -40, Y = 0 (ground level)
      left.scale.set(-scale, scale, scale); // Negative X scale to mirror/flip
      left.castShadow = true;
      left.receiveShadow = true;
      
      // Apply materials for visibility
      left.traverse((child) => {
        if ((child as Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      scene.add(left);
      mountainsRef.current.push(left);

      // Right side mountains (normal orientation)
      const right = mountain.clone() as Group;
      right.position.set(offsetX, 0, z); // X = 40, Y = 0 (ground level)
      right.scale.set(scale, scale, scale); // Normal positive scaling
      right.castShadow = true;
      right.receiveShadow = true;
      
      // Apply materials for visibility
      right.traverse((child) => {
        if ((child as Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      scene.add(right);
      mountainsRef.current.push(right);
    }

    console.log('PathsideMountains: Added', mountainsRef.current.length, 'enlarged mountains at ±40 units');

    // Cleanup function
    return () => {
      mountainsRef.current.forEach(mountain => {
        scene.remove(mountain);
      });
      mountainsRef.current = [];
    };
  }, [mountain, scene]);

  return null;
};

// Preload the mountain model
useGLTF.preload('/assets/mountain_low_poly.glb');
