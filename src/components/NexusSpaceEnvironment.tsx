import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

export const NexusSpaceEnvironment: React.FC = () => {
  const nebulaCloudsRef = useRef<THREE.Group>(null);
  const starsRef = useRef<any>(null);

  useFrame((state) => {
    if (nebulaCloudsRef.current) {
      nebulaCloudsRef.current.rotation.y += 0.0005;
    }
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <group>
      {/* Deep space stars */}
      <Stars 
        ref={starsRef}
        radius={200} 
        depth={150} 
        count={8000} 
        factor={6} 
        saturation={0.8} 
        fade 
        speed={0.5}
      />

      {/* Space floor/platform */}
      <Box args={[100, 0.5, 100]} position={[0, -0.75, 0]}>
        <meshStandardMaterial 
          color="#1a1a2e" 
          metalness={0.8} 
          roughness={0.2}
          emissive="#0f0f1a"
          emissiveIntensity={0.3}
        />
      </Box>

      {/* Grid lines on the floor for map editor */}
      <group position={[0, -0.2, 0]}>
        {Array.from({ length: 21 }).map((_, i) => (
          <React.Fragment key={i}>
            {/* Vertical lines */}
            <Box args={[0.02, 0.1, 100]} position={[-50 + i * 5, 0, 0]}>
              <meshBasicMaterial color="#4338ca" transparent opacity={0.3} />
            </Box>
            {/* Horizontal lines */}
            <Box args={[100, 0.1, 0.02]} position={[0, 0, -50 + i * 5]}>
              <meshBasicMaterial color="#4338ca" transparent opacity={0.3} />
            </Box>
          </React.Fragment>
        ))}
      </group>

      {/* Floating nebula clouds */}
      <group ref={nebulaCloudsRef}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Sphere 
            key={i}
            args={[5 + Math.random() * 10]} 
            position={[
              (Math.random() - 0.5) * 200,
              20 + Math.random() * 40,
              (Math.random() - 0.5) * 200
            ]}
          >
            <meshStandardMaterial 
              color={i % 2 === 0 ? "#4c1d95" : "#1e40af"} 
              transparent 
              opacity={0.1 + Math.random() * 0.2}
              emissive={i % 2 === 0 ? "#4c1d95" : "#1e40af"}
              emissiveIntensity={0.2}
            />
          </Sphere>
        ))}
      </group>

      {/* Distant planets */}
      <Sphere args={[8]} position={[-80, 30, -120]}>
        <meshStandardMaterial 
          color="#7c3aed" 
          emissive="#7c3aed" 
          emissiveIntensity={0.1}
        />
      </Sphere>

      <Sphere args={[12]} position={[100, 45, -150]}>
        <meshStandardMaterial 
          color="#2563eb" 
          emissive="#2563eb" 
          emissiveIntensity={0.1}
        />
      </Sphere>

      {/* Ambient space lighting */}
      <ambientLight intensity={0.3} color="#4338ca" />
      <directionalLight 
        position={[0, 50, 30]} 
        intensity={0.5} 
        color="#6366f1"
        castShadow
      />
      
      {/* Additional purple rim lighting */}
      <directionalLight 
        position={[-30, 20, -30]} 
        intensity={0.3} 
        color="#8b5cf6"
      />
    </group>
  );
};