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
          camera={{ position: [0, 8, 15], fov: 60 }}
          style={{ height: '100%', width: '100%' }}
          gl={{ 
            antialias: true, 
            alpha: false,
            preserveDrawingBuffer: false,
            powerPreference: "high-performance"
          }}
          onCreated={({ gl }) => {
            console.log('Canvas created successfully');
            gl.setClearColor('#87CEEB'); // Bright sky blue
          }}
          onError={(error) => {
            console.error('Canvas error:', error);
          }}
        >
          <Suspense fallback={null}>
            {/* Bright Sky Lighting System */}
            <ambientLight intensity={1.2} color="#ffffff" />
            
            {/* Main sun light */}
            <directionalLight 
              position={[20, 30, 15]} 
              intensity={1.5} 
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
            
            {/* Secondary bright lighting */}
            <directionalLight 
              position={[-15, 25, -10]} 
              intensity={0.8} 
              color="#e0f6ff"
            />
            
            {/* Crystal enhancement light */}
            <pointLight 
              position={[0, 10, 0]} 
              intensity={1.5} 
              color="#60a5fa" 
              distance={30}
              decay={1}
            />
            
            {/* Vendor area bright lighting */}
            <pointLight 
              position={[-8, 5, -8]} 
              intensity={0.8} 
              color="#34d399" 
              distance={15}
              decay={1}
            />
            
            <pointLight 
              position={[8, 5, -8]} 
              intensity={0.8} 
              color="#fbbf24" 
              distance={15}
              decay={1}
            />
            
            <pointLight 
              position={[0, 5, -12]} 
              intensity={0.8} 
              color="#60a5fa" 
              distance={15}
              decay={1}
            />

            {/* Sky Environment */}
            <mesh scale={[100, 100, 100]}>
              <sphereGeometry args={[1, 32, 32]} />
              <meshBasicMaterial 
                color="#87CEEB"
                side={2} // THREE.BackSide
              />
            </mesh>

            {/* Floating Clouds */}
            {Array.from({ length: 12 }).map((_, i) => (
              <mesh
                key={i}
                position={[
                  (Math.random() - 0.5) * 80,
                  15 + Math.random() * 10,
                  (Math.random() - 0.5) * 80
                ]}
                scale={[2 + Math.random() * 2, 1, 2 + Math.random() * 2]}
              >
                <sphereGeometry args={[3, 8, 6]} />
                <meshBasicMaterial 
                  color="#ffffff"
                  transparent
                  opacity={0.8}
                />
              </mesh>
            ))}

            {/* Bright Platform System */}
            <group>
              {/* Main platform with bright materials */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[40, 40]} />
                <meshStandardMaterial 
                  color="#9CA3AF"
                  roughness={0.3}
                  metalness={0.1}
                />
              </mesh>
              
              {/* Bright grid pattern */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <planeGeometry args={[40, 40, 20, 20]} />
                <meshStandardMaterial 
                  color="#60a5fa"
                  wireframe
                  transparent
                  opacity={0.4}
                />
              </mesh>

              {/* Grass patches */}
              {Array.from({ length: 8 }).map((_, i) => (
                <mesh
                  key={i}
                  rotation={[-Math.PI / 2, 0, 0]}
                  position={[
                    (Math.random() - 0.5) * 30,
                    0.02,
                    (Math.random() - 0.5) * 30
                  ]}
                >
                  <circleGeometry args={[1 + Math.random(), 8]} />
                  <meshStandardMaterial color="#22c55e" />
                </mesh>
              ))}

              {/* Bright elevated platform */}
              <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[8, 8, 1, 16]} />
                <meshStandardMaterial 
                  color="#6B7280"
                  roughness={0.2}
                  metalness={0.3}
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

            {/* Bright atmospheric fog */}
            <fog attach="fog" args={['#b3d9ff', 30, 80]} />
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