import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Mesh } from 'three';

interface NexusVendorStandProps {
  position: [number, number, number];
  vendorName: string;
  standType: 'nexus' | 'supplies' | 'staffs';
  onInteract: () => void;
}

export const NexusVendorStand: React.FC<NexusVendorStandProps> = ({
  position,
  vendorName,
  standType,
  onInteract
}) => {
  const vendorRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Animation
  useFrame((state) => {
    if (vendorRef.current) {
      vendorRef.current.rotation.y += 0.005;
      vendorRef.current.position.y = position[1] + 1.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  // Stand colors based on type
  const getStandColors = () => {
    switch (standType) {
      case 'nexus':
        return { primary: '#FFD700', secondary: '#FFA500', glow: '#FFFF00' };
      case 'supplies':
        return { primary: '#10B981', secondary: '#059669', glow: '#34D399' };
      case 'staffs':
        return { primary: '#8B5CF6', secondary: '#7C3AED', glow: '#A855F7' };
      default:
        return { primary: '#6B7280', secondary: '#4B5563', glow: '#9CA3AF' };
    }
  };

  const colors = getStandColors();

  return (
    <group position={position}>
      {/* Stand Base */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 1]} />
        <meshStandardMaterial color={colors.primary} />
      </mesh>

      {/* Stand Top */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[1.5, 1.2, 0.2]} />
        <meshStandardMaterial color={colors.secondary} />
      </mesh>

      {/* Vendor Character */}
      <mesh
        ref={vendorRef}
        position={[0, 2, 0]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={onInteract}
        scale={hovered ? 1.1 : 1}
      >
        {/* Head */}
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#FDBCB4" />
      </mesh>

      {/* Body (separate from head to avoid nesting issues) */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.25, 0.35, 0.6]} />
        <meshStandardMaterial color={colors.primary} />
      </mesh>

      {/* Hat */}
      <mesh position={[0, 2.35, 0]}>
        <cylinderGeometry args={[0.1, 0.35, 0.2]} />
        <meshStandardMaterial color={colors.secondary} />
      </mesh>

      {/* Vendor Name */}
      <Text
        position={[0, 2.8, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {vendorName}
      </Text>

      {/* Interaction Prompt */}
      {hovered && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.15}
          color="#FFFF00"
          anchorX="center"
          anchorY="middle"
        >
          Click to Shop
        </Text>
      )}

      {/* Simple Display Item */}
      <mesh position={[0, 1.15, 0.5]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial 
          color={colors.glow} 
          emissive={colors.glow}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Ambient lighting */}
      <pointLight 
        position={[0, 2.5, 0]} 
        color={colors.glow} 
        intensity={0.5} 
        distance={8}
      />
    </group>
  );
};