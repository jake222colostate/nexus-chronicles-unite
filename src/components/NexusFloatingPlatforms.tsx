import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Group } from 'three';

interface FloatingPlatformProps {
  position: [number, number, number];
  vendorType: 'nexus' | 'supplies' | 'staffs';
  onInteract: () => void;
}

export const NexusFloatingPlatform: React.FC<FloatingPlatformProps> = ({
  position,
  vendorType,
  onInteract
}) => {
  const platformRef = useRef<Group>(null);
  const time = useRef(0);

  useFrame((state, delta) => {
    time.current += delta;
    
    if (platformRef.current) {
      platformRef.current.position.y = position[1] + Math.sin(time.current + position[0]) * 0.1;
      platformRef.current.rotation.y = Math.sin(time.current * 0.5) * 0.05;
    }
  });

  const getVendorDecoration = () => {
    switch (vendorType) {
      case 'nexus':
        return (
          <group>
            {/* Spell Book */}
            <mesh position={[0, 2.2, 0]} rotation={[0, Math.PI / 4, 0]}>
              <boxGeometry args={[0.8, 0.1, 1]} />
              <meshStandardMaterial color="#8b4513" />
            </mesh>
            <mesh position={[0, 2.3, 0]} rotation={[0, Math.PI / 4, 0]}>
              <boxGeometry args={[0.7, 0.05, 0.9]} />
              <meshStandardMaterial 
                color="#ffd700" 
                emissive="#ffaa00"
                emissiveIntensity={0.3}
              />
            </mesh>
          </group>
        );
        
      case 'supplies':
        return (
          <group>
            {/* Supply Container */}
            <mesh position={[0, 2.5, 0]}>
              <cylinderGeometry args={[0.4, 0.5, 1, 8]} />
              <meshStandardMaterial 
                color="#10b981"
                emissive="#059669"
                emissiveIntensity={0.4}
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[0, 2.8, 0]}>
              <sphereGeometry args={[0.15]} />
              <meshStandardMaterial 
                color="#34d399"
                emissive="#10b981"
                emissiveIntensity={0.6}
              />
            </mesh>
          </group>
        );
        
      case 'staffs':
        return (
          <group>
            {/* Magic Staff */}
            <mesh position={[0, 2.5, 0]} rotation={[0, 0, Math.PI / 8]}>
              <cylinderGeometry args={[0.05, 0.05, 1.5]} />
              <meshStandardMaterial color="#8b4513" />
            </mesh>
            <mesh position={[0.3, 3.1, 0]}>
              <octahedronGeometry args={[0.2]} />
              <meshStandardMaterial 
                color="#3b82f6"
                emissive="#1d4ed8"
                emissiveIntensity={0.8}
                transparent
                opacity={0.9}
              />
            </mesh>
          </group>
        );
        
      default:
        return null;
    }
  };

  const getThemeColor = () => {
    switch (vendorType) {
      case 'nexus': return '#8b5cf6';
      case 'supplies': return '#10b981';
      case 'staffs': return '#3b82f6';
      default: return '#6366f1';
    }
  };

  return (
    <group ref={platformRef} position={position}>
      {/* Platform Base */}
      <mesh position={[0, 1, 0]} receiveShadow onClick={onInteract}>
        <cylinderGeometry args={[1.5, 1.5, 0.3, 16]} />
        <meshStandardMaterial 
          color="#2a2a4e"
          metalness={0.8}
          roughness={0.2}
          emissive="#1a1a3e"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Platform Ring */}
      <mesh position={[0, 1.2, 0]}>
        <torusGeometry args={[1.3, 0.1, 8, 16]} />
        <meshStandardMaterial 
          color={getThemeColor()}
          emissive={getThemeColor()}
          emissiveIntensity={0.5}
          metalness={0.7}
          roughness={0.1}
        />
      </mesh>

      {/* Support Pillars */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 4) * Math.PI * 2) * 1.2,
            0.5,
            Math.sin((i / 4) * Math.PI * 2) * 1.2
          ]}
        >
          <cylinderGeometry args={[0.08, 0.1, 1]} />
          <meshStandardMaterial 
            color="#4a4a8e"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      ))}

      {/* Vendor Decoration */}
      {getVendorDecoration()}

      {/* Platform Light */}
      <pointLight 
        position={[0, 2, 0]} 
        intensity={0.8} 
        color={getThemeColor()} 
        distance={8}
        decay={2}
      />

      {/* Vendor Label */}
      <Text
        position={[0, 3.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {vendorType === 'nexus' ? 'Nexus Merchant' : 
         vendorType === 'supplies' ? 'Supply Keeper' : 'Staff Crafter'}
      </Text>
    </group>
  );
};