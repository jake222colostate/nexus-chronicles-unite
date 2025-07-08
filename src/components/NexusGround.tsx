import React from "react";
import { Plane } from "@react-three/drei";
import * as THREE from "three";

interface NexusGroundProps {
  size?: number;
  color?: string;
}

export const NexusGround: React.FC<NexusGroundProps> = ({
  size = 100,
  color = "#1a1a2e",
}) => {
  return (
    <group>
      {/* Main ground plane */}
      <Plane
        args={[size, size]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
      >
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
      </Plane>

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
  );};
