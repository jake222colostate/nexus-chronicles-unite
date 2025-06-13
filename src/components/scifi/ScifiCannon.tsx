
import React from 'react';
import { Vector3 } from 'three';

interface ScifiCannonProps {
  target?: Vector3;
}

export const ScifiCannon: React.FC<ScifiCannonProps> = ({ target }) => {
  return (
    <group position={[2, 1, -3]} rotation={[0, -0.3, 0]}>
      {/* Procedural Sci-Fi Cannon - static positioning */}
      <group scale={[1.2, 1.2, 1.2]} rotation={[0, 0, 0]}>
        {/* Main barrel - longer and thicker */}
        <mesh position={[0, 0, -0.6]}>
          <cylinderGeometry args={[0.08, 0.1, 1.5, 8]} />
          <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Barrel tip - more prominent */}
        <mesh position={[0, 0, -1.35]}>
          <cylinderGeometry args={[0.05, 0.08, 0.15, 8]} />
          <meshStandardMaterial color="#2d3748" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Main body - larger */}
        <mesh position={[0, 0, 0.25]}>
          <boxGeometry args={[0.25, 0.18, 0.7]} />
          <meshStandardMaterial color="#2d3748" metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Grip - more visible */}
        <mesh position={[0, -0.18, 0.5]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.1, 0.35, 0.12]} />
          <meshStandardMaterial color="#1a202c" metalness={0.5} roughness={0.4} />
        </mesh>
        
        {/* Trigger guard - larger */}
        <mesh position={[0, -0.12, 0.25]}>
          <torusGeometry args={[0.08, 0.025, 8, 16]} />
          <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Side details - more prominent glow */}
        <mesh position={[0.1, 0.06, 0.15]}>
          <boxGeometry args={[0.05, 0.03, 0.35]} />
          <meshStandardMaterial color="#63b3ed" metalness={0.9} roughness={0.1} emissive="#1e40af" emissiveIntensity={0.4} />
        </mesh>
        
        <mesh position={[-0.1, 0.06, 0.15]}>
          <boxGeometry args={[0.05, 0.03, 0.35]} />
          <meshStandardMaterial color="#63b3ed" metalness={0.9} roughness={0.1} emissive="#1e40af" emissiveIntensity={0.4} />
        </mesh>
        
        {/* Scope - more visible */}
        <mesh position={[0, 0.15, -0.25]}>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
          <meshStandardMaterial color="#1a202c" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Additional detail - power core */}
        <mesh position={[0, 0.08, 0.4]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#00ffff" metalness={0.9} roughness={0.1} emissive="#00ffff" emissiveIntensity={0.6} />
        </mesh>
      </group>
      
      {/* Enhanced muzzle glow effect */}
      <pointLight 
        position={[0, 0, -1.35]} 
        color="#00ffff" 
        intensity={0.8} 
        distance={4}
        decay={2}
      />
      
      {/* Weapon highlight light - brighter */}
      <pointLight 
        position={[0, 0.25, 0]} 
        color="#4299e1" 
        intensity={0.5} 
        distance={3}
        decay={1}
      />
    </group>
  );
};
