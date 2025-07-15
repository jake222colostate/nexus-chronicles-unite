import React, { useMemo } from 'react';

import * as THREE from 'three';
import 'three.terrain.js';

interface NexusGroundProps {
  size?: number;
  color?: string;
  maxHeight?: number;
  frequency?: number;
}

export const NexusGround: React.FC<NexusGroundProps> = ({
  size = 100,
  color = "#1a1a2e",
  maxHeight = 4,
  frequency = 2
}) => {
  const terrain = useMemo(() => {
    try {
      const scene = (THREE as any).Terrain({
        easing: (THREE as any).Terrain.Linear,
        frequency,
        maxHeight,
        minHeight: -maxHeight,
        steps: 1,
        xSegments: 63,
        xSize: size,
        ySegments: 63,
        ySize: size,
        material: new THREE.MeshStandardMaterial({ color })
      });
      scene.rotation.x = -Math.PI / 2;
      return scene;
    } catch (err) {
      console.warn('THREE.Terrain failed, using plane geometry', err);
      const fallback = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size, 1, 1),
        new THREE.MeshStandardMaterial({ color })
      );
      fallback.rotation.x = -Math.PI / 2;
      const group = new THREE.Group();
      group.add(fallback);
      return group;
    }
  }, [size, color, maxHeight, frequency]);

  return (
    <group>
      {/* Procedural terrain or fallback */}
      <primitive object={terrain} />
      
      {/* Grid lines for visual reference */}
      <primitive
        object={new THREE.GridHelper(size, 20, "#333344", "#222233")}
        position={[0, -0.45, 0]}
      />
      
      {/* Subtle ambient lighting for the ground */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </group>
  );
};

