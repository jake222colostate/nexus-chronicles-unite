import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Sphere, Cylinder, Ring } from '@react-three/drei';
import { Mesh, Vector3 } from 'three';
import { NexusGround } from './NexusGround';
import { NexusFirstPersonController } from './NexusFirstPersonController';

interface NexusStandProps {
  position: [number, number, number];
  title: string;
  price: number;
  currency: string;
  color: string;
  glowColor: string;
  onPurchase: () => void;
  available: boolean;
}

const NexusStand: React.FC<NexusStandProps> = ({
  position,
  title,
  price,
  currency,
  color,
  glowColor,
  onPurchase,
  available
}) => {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Base Platform */}
      <Cylinder args={[1.5, 1.5, 0.2]} position={[0, -0.1, 0]}>
        <meshStandardMaterial color="#2a2a2a" />
      </Cylinder>

      {/* Main Stand */}
      <Cylinder args={[0.3, 0.3, 2]} position={[0, 1, 0]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Cylinder>

      {/* Item Display */}
      <mesh
        ref={meshRef}
        position={[0, 2.5, 0]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={available ? onPurchase : undefined}
        scale={hovered ? 1.2 : 1}
      >
        <Sphere args={[0.5]}>
          <meshStandardMaterial 
            color={color} 
            emissive={glowColor}
            emissiveIntensity={available ? (hovered ? 0.3 : 0.1) : 0.05}
            transparent
            opacity={available ? 1 : 0.5}
          />
        </Sphere>
      </mesh>

      {/* Floating Ring */}
      <mesh position={[0, 2.5, 0]}>
        <Ring args={[0.7, 0.8, 32]}>
          <meshStandardMaterial color={glowColor} transparent opacity={0.3} />
        </Ring>
      </mesh>

      {/* Title Text */}
      <Text
        position={[0, 3.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {title}
      </Text>

      {/* Price Text */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.2}
        color={available ? "#ffff00" : "#666666"}
        anchorX="center"
        anchorY="middle"
      >
        {price} {currency}
      </Text>

      {/* Availability Indicator */}
      {!available && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.15}
          color="#ff4444"
          anchorX="center"
          anchorY="middle"
        >
          Insufficient {currency}
        </Text>
      )}

      {/* Light source */}
      <pointLight 
        position={[0, 3, 0]} 
        color={glowColor} 
        intensity={available ? 1 : 0.2} 
        distance={5}
      />
    </group>
  );
};

const NexusCore3D: React.FC = () => {
  const coreRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.02;
      coreRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group position={[0, 4, 0]}>
      {/* Core Orb */}
      <mesh ref={coreRef}>
        <Sphere args={[1.5]}>
          <meshStandardMaterial 
            color="#FFD700" 
            emissive="#FFD700"
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
          />
        </Sphere>
      </mesh>

      {/* Orbiting Rings */}
      {[1, 2, 3].map((i) => (
        <mesh key={i} rotation={[Math.PI / 4 * i, 0, Math.PI / 3 * i]}>
          <Ring args={[2 + i * 0.5, 2.2 + i * 0.5, 32]}>
            <meshStandardMaterial 
              color="#4A90E2" 
              transparent 
              opacity={0.3}
              emissive="#4A90E2"
              emissiveIntensity={0.1}
            />
          </Ring>
        </mesh>
      ))}

      {/* Core Light */}
      <pointLight position={[0, 0, 0]} color="#FFD700" intensity={2} distance={20} />
    </group>
  );
};


interface Nexus3DWorldProps {
  gameState: any;
  onUpgrade: (upgradeType: string) => void;
}

export const Nexus3DWorld: React.FC<Nexus3DWorldProps> = ({ 
  gameState,
  onUpgrade 
}) => {
  // Ensure gameState has all required properties with defaults
  const safeGameState = {
    mana: 0,
    energyCredits: 0,
    nexusShards: 0,
    manaPerSecond: 0,
    energyPerSecond: 0,
    ...gameState
  };

  // Add error handling for Canvas initialization
  console.log('Nexus3DWorld: Initializing with gameState:', safeGameState);

  const stands = [
    {
      position: [-5, 0, -5] as [number, number, number],
      title: "Mana Amplifier",
      price: 500,
      currency: "Mana",
      color: "#8B5CF6",
      glowColor: "#A855F7",
      type: "mana-amplifier",
      available: safeGameState.mana >= 500
    },
    {
      position: [5, 0, -5] as [number, number, number],
      title: "Energy Booster",
      price: 400,
      currency: "Energy",
      color: "#06B6D4",
      glowColor: "#22D3EE",
      type: "energy-booster",
      available: safeGameState.energyCredits >= 400
    },
    {
      position: [-5, 0, 5] as [number, number, number],
      title: "Convergence Catalyst",
      price: 10,
      currency: "Nexus Shards",
      color: "#F59E0B",
      glowColor: "#FCD34D",
      type: "convergence-catalyst",
      available: safeGameState.nexusShards >= 10
    },
    {
      position: [5, 0, 5] as [number, number, number],
      title: "Realm Bridge",
      price: 15,
      currency: "Nexus Shards",
      color: "#EF4444",
      glowColor: "#F87171",
      type: "realm-bridge",
      available: safeGameState.nexusShards >= 15
    },
    {
      position: [0, 0, -8] as [number, number, number],
      title: "Nexus Multiplier",
      price: 25,
      currency: "Nexus Shards",
      color: "#10B981",
      glowColor: "#34D399",
      type: "nexus-multiplier",
      available: safeGameState.nexusShards >= 25
    },
    {
      position: [0, 0, 8] as [number, number, number],
      title: "Infinity Core",
      price: 50,
      currency: "Nexus Shards",
      color: "#F97316",
      glowColor: "#FB923C",
      type: "infinity-core",
      available: safeGameState.nexusShards >= 50
    }
  ];

  try {
    return (
      <Canvas
        camera={{ position: [0, 8, 12], fov: 60 }}
        style={{ height: '100%', width: '100%' }}
        gl={{ 
          antialias: false, 
          alpha: false,
          preserveDrawingBuffer: false,
          powerPreference: "default"
        }}
        onCreated={({ gl }) => {
          console.log('Canvas created successfully');
          gl.setClearColor('#000000');
        }}
        onError={(error) => {
          console.error('Canvas error:', error);
        }}
      >
        <Suspense fallback={null}>
          {/* Ambient lighting */}
          <ambientLight intensity={0.3} />
          
          {/* Main directional light */}
          <directionalLight position={[10, 10, 5]} intensity={0.5} />

          {/* Simple test mesh to verify Canvas works */}
          <mesh position={[0, 2, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#00ff00" />
          </mesh>

          {/* Ground - simplified */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#1a1a2e" />
          </mesh>

          {/* First Person Camera Controller */}
          <NexusFirstPersonController speed={8} sensitivity={0.003} />

          {/* Fog for atmosphere */}
          <fog attach="fog" args={['#0a0a1a', 10, 30]} />
        </Suspense>
      </Canvas>
    );
  } catch (error) {
    console.error('Nexus3DWorld render error:', error);
    return (
      <div className="flex items-center justify-center h-full w-full bg-black text-white">
        <div className="text-center">
          <h2 className="text-xl mb-2">3D World Error</h2>
          <p className="text-gray-400">Failed to initialize 3D environment</p>
        </div>
      </div>
    );
  }
};