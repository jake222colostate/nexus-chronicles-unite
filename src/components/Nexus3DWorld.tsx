import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Sphere, Cylinder, Ring } from '@react-three/drei';
import { Mesh, Vector3 } from 'three';
import { NexusGround } from './NexusGround';
import { NexusFirstPersonController } from './NexusFirstPersonController';
// import { NexusVendorStand } from './NexusVendorStand'; // Temporarily commented out for debugging

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

  console.log('Nexus3DWorld: Initializing with gameState:', safeGameState);

  // Vendor interaction handlers
  const handleVendorInteraction = (vendorType: string) => {
    console.log(`Interacting with ${vendorType} vendor`);
    // TODO: Open vendor modal/menu based on type
    switch (vendorType) {
      case 'nexus':
        console.log('Opening Nexus Shards & Upgrades shop');
        break;
      case 'supplies':
        console.log('Opening Health & Repair Kits shop');
        break;
      case 'staffs':
        console.log('Opening Wizard Staffs shop');
        break;
    }
  };

  console.log('Nexus3DWorld: About to render Canvas');

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

          {/* Walkable Floor System */}
          <group>
            {/* Main floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial 
                color="#1a1a2e" 
                roughness={0.8}
                metalness={0.1}
              />
            </mesh>
            
            {/* Grid pattern for visual reference */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial 
                color="#2a2a3e" 
                transparent
                opacity={0.3}
                wireframe={true}
              />
            </mesh>

            {/* Elevated platforms around the center */}
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[8, 8, 1, 32]} />
              <meshStandardMaterial 
                color="#2a2a4e" 
                roughness={0.6}
                metalness={0.2}
              />
            </mesh>

            {/* Outer ring platform */}
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[15, 15, 0.4, 32]} />
              <meshStandardMaterial 
                color="#1a1a3e" 
                roughness={0.8}
                metalness={0.1}
              />
            </mesh>
          </group>

          {/* Simple Central Core instead of NexusCore3D */}
          <mesh position={[0, 3, 0]}>
            <sphereGeometry args={[1.5, 32, 32]} />
            <meshStandardMaterial 
              color="#FFD700" 
              emissive="#FFD700"
              emissiveIntensity={0.3}
            />
          </mesh>

          {/* Test cube to verify basic rendering */}
          <mesh position={[0, 2, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#00ff00" />
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