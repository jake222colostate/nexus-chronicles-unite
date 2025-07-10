import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Sphere, Cylinder, Ring } from '@react-three/drei';
import { Mesh, Vector3 } from 'three';
import { NexusGround } from './NexusGround';
import { NexusFirstPersonController } from './NexusFirstPersonController';
import { NexusVendorStand } from './NexusVendorStand';
import { NexusMerchantShop, SupplyKeeperShop, StaffCrafterShop } from './NexusVendorShops';
import { NexusCentralCrystal } from './NexusCentralCrystal';
import { NexusFloatingPlatform } from './NexusFloatingPlatforms';
import { NexusSandboxGrid } from './NexusSandboxGrid';

interface Nexus3DWorldProps {
  gameState: any;
  onUpgrade: (upgradeType: string) => void;
}

export const Nexus3DWorld: React.FC<Nexus3DWorldProps> = ({ 
  gameState,
  onUpgrade 
}) => {
  // Shop state management
  const [activeShop, setActiveShop] = useState<string | null>(null);
  
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
    console.log(`Opening ${vendorType} shop`);
    setActiveShop(vendorType);
  };

  // Sandbox grid interaction
  const handleGridTileClick = (x: number, z: number) => {
    console.log(`Clicked grid tile at ${x}, ${z}`);
    // TODO: Implement upgrade placement logic
  };

  // Purchase handler
  const handlePurchase = (item: any) => {
    console.log(`Purchasing ${item.name} for ${item.cost} ${item.currency}`);
    // TODO: Implement actual purchase logic
    onUpgrade(item.id);
    setActiveShop(null);
  };

  console.log('Nexus3DWorld: About to render Canvas');

  try {
    return (
      <>
        <Canvas
          camera={{ position: [0, 8, 15], fov: 60 }} // Moved camera back and adjusted angle
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
            {/* Enhanced Lighting System */}
            {/* Ambient lighting for general illumination */}
            <ambientLight intensity={0.4} color="#4a4a6a" />
            
            {/* Main directional light from above */}
            <directionalLight 
              position={[15, 20, 10]} 
              intensity={0.8} 
              color="#ffffff"
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-far={50}
              shadow-camera-left={-20}
              shadow-camera-right={20}
              shadow-camera-top={20}
              shadow-camera-bottom={-20}
            />
            
            {/* Atmospheric rim lighting */}
            <directionalLight 
              position={[-10, 15, -5]} 
              intensity={0.3} 
              color="#6366f1"
            />
            
            {/* Central point lights for dramatic effect */}
            <pointLight 
              position={[0, 5, 0]} 
              intensity={0.6} 
              color="#8b5cf6" 
              distance={25}
              decay={2}
            />
            
            {/* Vendor area lighting */}
            <pointLight 
              position={[-8, 3, -8]} 
              intensity={0.4} 
              color="#10b981" 
              distance={12}
              decay={2}
            />
            
            <pointLight 
              position={[8, 3, -8]} 
              intensity={0.4} 
              color="#f59e0b" 
              distance={12}
              decay={2}
            />
            
            <pointLight 
              position={[0, 3, -12]} 
              intensity={0.4} 
              color="#3b82f6" 
              distance={12}
              decay={2}
            />
            
            {/* Floor accent lighting */}
            <pointLight 
              position={[0, 1, 0]} 
              intensity={0.3} 
              color="#ec4899" 
              distance={15}
              decay={1.5}
            />
            
            {/* Perimeter atmospheric lights */}
            <pointLight 
              position={[15, 8, 15]} 
              intensity={0.2} 
              color="#06b6d4" 
              distance={20}
              decay={2}
            />
            
            <pointLight 
              position={[-15, 8, 15]} 
              intensity={0.2} 
              color="#f97316" 
              distance={20}
              decay={2}
            />
            
            <pointLight 
              position={[15, 8, -15]} 
              intensity={0.2} 
              color="#84cc16" 
              distance={20}
              decay={2}
            />
            
            <pointLight 
              position={[-15, 8, -15]} 
              intensity={0.2} 
              color="#ef4444" 
              distance={20}
              decay={2}
            />

            {/* Walkable Floor System */}
            <group>
              {/* Main floor with enhanced material */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial 
                  color="#1a1a2e" 
                  roughness={0.7}
                  metalness={0.3}
                  envMapIntensity={0.5}
                />
              </mesh>
              
              {/* Enhanced grid pattern with glow effect */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial 
                  color="#4a4a6e" 
                  transparent
                  opacity={0.6}
                  wireframe={true}
                  emissive="#2a2a4e"
                  emissiveIntensity={0.1}
                />
              </mesh>

              {/* Enhanced elevated platforms with better materials */}
              <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[8, 8, 1, 32]} />
                <meshStandardMaterial 
                  color="#2a2a4e" 
                  roughness={0.4}
                  metalness={0.6}
                  envMapIntensity={0.8}
                  emissive="#1a1a3e"
                  emissiveIntensity={0.1}
                />
              </mesh>

              {/* Enhanced outer ring platform */}
              <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[15, 15, 0.4, 32]} />
                <meshStandardMaterial 
                  color="#1a1a3e" 
                  roughness={0.6}
                  metalness={0.4}
                  envMapIntensity={0.6}
                  emissive="#0a0a2e"
                  emissiveIntensity={0.05}
                />
              </mesh>
            </group>

            {/* Central Crystal - Replaces old core */}
            <NexusCentralCrystal />

            {/* Floating Vendor Platforms */}
            <NexusFloatingPlatform 
              position={[-8, 2, -8]}
              vendorType="nexus"
              onInteract={() => handleVendorInteraction('nexus')}
            />
            
            <NexusFloatingPlatform 
              position={[8, 2, -8]}
              vendorType="supplies"
              onInteract={() => handleVendorInteraction('supplies')}
            />
            
            <NexusFloatingPlatform 
              position={[0, 2, -12]}
              vendorType="staffs"
              onInteract={() => handleVendorInteraction('staffs')}
            />

            {/* Sandbox Grid System */}
            <NexusSandboxGrid 
              position={[0, 0, 8]}
              size={8}
              onTileClick={handleGridTileClick}
            />

            {/* First Person Camera Controller */}
            <NexusFirstPersonController speed={8} sensitivity={0.003} />

            {/* Enhanced atmospheric fog with better color */}
            <fog attach="fog" args={['#0f0f2a', 15, 40]} />
          </Suspense>
        </Canvas>

        {/* Vendor Shop Modals */}
        <NexusMerchantShop
          isOpen={activeShop === 'nexus'}
          onClose={() => setActiveShop(null)}
          gameState={safeGameState}
          onPurchase={handlePurchase}
        />
        
        <SupplyKeeperShop
          isOpen={activeShop === 'supplies'}
          onClose={() => setActiveShop(null)}
          gameState={safeGameState}
          onPurchase={handlePurchase}
        />
        
        <StaffCrafterShop
          isOpen={activeShop === 'staffs'}
          onClose={() => setActiveShop(null)}
          gameState={safeGameState}
          onPurchase={handlePurchase}
        />
      </>
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