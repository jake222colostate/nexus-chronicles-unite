import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere, Cylinder, Box } from '@react-three/drei';
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
  const standRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Animation
  useFrame((state) => {
    if (vendorRef.current) {
      vendorRef.current.rotation.y += 0.005;
      vendorRef.current.position.y = position[1] + 1.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
    if (standRef.current) {
      standRef.current.rotation.y += 0.002;
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
      <mesh ref={standRef} position={[0, 0.5, 0]}>
        <Cylinder args={[1.2, 1.2, 1]}>
          <meshStandardMaterial color={colors.primary} />
        </Cylinder>
      </mesh>

      {/* Stand Top */}
      <mesh position={[0, 1, 0]}>
        <Cylinder args={[1.5, 1.2, 0.2]}>
          <meshStandardMaterial color={colors.secondary} />
        </Cylinder>
      </mesh>

      {/* Awning */}
      <mesh position={[0, 1.8, 0]}>
        <Cylinder args={[1.8, 1.8, 0.1]}>
          <meshStandardMaterial color={colors.primary} transparent opacity={0.8} />
        </Cylinder>
      </mesh>

      {/* Support Poles */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, index) => (
        <mesh key={index} position={[Math.cos(angle) * 1.4, 1.4, Math.sin(angle) * 1.4]}>
          <Cylinder args={[0.05, 0.05, 0.8]}>
            <meshStandardMaterial color={colors.secondary} />
          </Cylinder>
        </mesh>
      ))}

      {/* Vendor Character */}
      <mesh
        ref={vendorRef}
        position={[0, 2, 0]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={onInteract}
        scale={hovered ? 1.2 : 1}
      >
        {/* Head */}
        <Sphere args={[0.3]}>
          <meshStandardMaterial color="#FDBCB4" />
        </Sphere>
        
        {/* Body */}
        <mesh position={[0, -0.5, 0]}>
          <Cylinder args={[0.25, 0.35, 0.6]}>
            <meshStandardMaterial color={colors.primary} />
          </Cylinder>
        </mesh>

        {/* Hat */}
        <mesh position={[0, 0.35, 0]}>
          <Cylinder args={[0.1, 0.35, 0.2]}>
            <meshStandardMaterial color={colors.secondary} />
          </Cylinder>
        </mesh>

        {/* Arms */}
        <mesh position={[-0.4, -0.3, 0]}>
          <Cylinder args={[0.08, 0.08, 0.4]}>
            <meshStandardMaterial color="#FDBCB4" />
          </Cylinder>
        </mesh>
        <mesh position={[0.4, -0.3, 0]}>
          <Cylinder args={[0.08, 0.08, 0.4]}>
            <meshStandardMaterial color="#FDBCB4" />
          </Cylinder>
        </mesh>
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
          position={[0, 1.5, 0]}
          fontSize={0.15}
          color="#FFFF00"
          anchorX="center"
          anchorY="middle"
        >
          Click to Shop
        </Text>
      )}

      {/* Display Items */}
      <group position={[0, 1.1, 0]}>
        {standType === 'nexus' && (
          <>
            <mesh position={[-0.5, 0.1, 0.5]}>
              <Box args={[0.2, 0.2, 0.2]}>
                <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
              </Box>
            </mesh>
            <mesh position={[0.5, 0.1, 0.5]}>
              <Sphere args={[0.15]}>
                <meshStandardMaterial color="#FFA500" emissive="#FFA500" emissiveIntensity={0.3} />
              </Sphere>
            </mesh>
          </>
        )}

        {standType === 'supplies' && (
          <>
            <mesh position={[-0.4, 0.1, 0.4]}>
              <Box args={[0.15, 0.25, 0.15]}>
                <meshStandardMaterial color="#10B981" />
              </Box>
            </mesh>
            <mesh position={[0.4, 0.1, 0.4]}>
              <Box args={[0.15, 0.25, 0.15]}>
                <meshStandardMaterial color="#059669" />
              </Box>
            </mesh>
          </>
        )}

        {standType === 'staffs' && (
          <>
            <mesh position={[0, 0.3, 0.5]} rotation={[0, 0, Math.PI / 6]}>
              <Cylinder args={[0.02, 0.02, 0.6]}>
                <meshStandardMaterial color="#8B5CF6" />
              </Cylinder>
            </mesh>
            <mesh position={[0, 0.6, 0.5]}>
              <Sphere args={[0.1]}>
                <meshStandardMaterial color="#A855F7" emissive="#A855F7" emissiveIntensity={0.4} />
              </Sphere>
            </mesh>
          </>
        )}
      </group>

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