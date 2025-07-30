import React, { useState, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Text } from '@react-three/drei';
import { Mesh } from 'three';
import { Crown, Zap, Shield, ShoppingCart, Settings } from 'lucide-react';
import { NexusModulePlacement } from './NexusModulePlacement';
import { NexusModuleShop } from './NexusModuleShop';
import { NexusMerchantShop, SupplyKeeperShop, StaffCrafterShop } from './NexusVendorShops';
import { useGameStateStore } from '@/stores/useGameStateStore';
import { NexusModule } from '@/data/NexusModules';

interface PlacedModule {
  id: string;
  moduleId: string;
  position: [number, number, number];
  module: NexusModule;
}

export const InteractiveNexusWorld: React.FC = () => {
  const gameState = useGameStateStore();
  const [activeShop, setActiveShop] = useState<string | null>(null);
  const [placedModules, setPlacedModules] = useState<PlacedModule[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number, number] | null>(null);
  const crystalRef = useRef<Mesh>(null);

  // Central crystal rotation animation would be handled in useFrame

  const handleVendorClick = (vendorType: string) => {
    setActiveShop(vendorType);
  };

  const handleModulePurchase = (module: NexusModule) => {
    // Check if player can afford the module
    const canAfford = gameState[module.currency] >= module.cost;
    if (!canAfford) return;

    // For now, auto-place the module in the next available position
    // In a full implementation, you'd allow the player to select a position
    const newModule: PlacedModule = {
      id: `module_${Date.now()}`,
      moduleId: module.id,
      position: [Math.random() * 6 - 3, 0, Math.random() * 6 - 3], // Random placement for demo
      module
    };

    // Deduct cost from player resources
    switch (module.currency) {
      case 'mana':
        gameState.spendMana(module.cost);
        break;
      case 'energyCredits':
        gameState.spendEnergy(module.cost);
        break;
      case 'nexusShards':
        gameState.spendNexusShards(module.cost);
        break;
    }

    setPlacedModules(prev => [...prev, newModule]);
    setActiveShop(null);
  };

  const handleModuleClick = (moduleId: string) => {
    console.log('Module clicked:', moduleId);
    // Could open module info/upgrade panel
  };

  const handlePurchase = (item: any) => {
    console.log('Purchasing:', item);
    // Handle vendor purchases
    let success = false;
    switch (item.currency) {
      case 'mana':
        success = gameState.spendMana(item.cost);
        break;
      case 'energyCredits':
        success = gameState.spendEnergy(item.cost);
        break;
      case 'nexusShards':
        success = gameState.spendNexusShards(item.cost);
        break;
    }
    
    if (success) {
      gameState.unlockUpgrade(item.id);
      setActiveShop(null);
    }
  };

  return (
    <>
      <div className="w-full h-full relative">
        {/* Resource Display */}
        <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 text-purple-400">
              <Crown size={16} />
              <span className="font-mono">{Math.floor(gameState.mana).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-400">
              <Zap size={16} />
              <span className="font-mono">{Math.floor(gameState.energyCredits).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-400">
              <Shield size={16} />
              <span className="font-mono">{gameState.nexusShards}</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <h1 className="text-2xl font-bold text-white text-center bg-black/60 backdrop-blur-sm rounded-lg px-6 py-2 border border-white/20">
            Nexus World
          </h1>
        </div>

        {/* Shop Button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setActiveShop('modules')}
            className="bg-blue-600/80 backdrop-blur-sm rounded-lg p-3 border border-blue-400/30 text-white hover:bg-blue-600/90 transition-colors"
          >
            <ShoppingCart size={20} />
          </button>
        </div>

        {/* 3D Scene */}
        <Canvas
          camera={{ position: [0, 12, 15], fov: 60 }}
          style={{ height: '100%', width: '100%' }}
        >
          <Suspense fallback={null}>
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            <pointLight position={[0, 5, 0]} intensity={1} color="#60a5fa" />

            {/* Sky */}
            <mesh scale={[100, 100, 100]}>
              <sphereGeometry args={[1, 32, 32]} />
              <meshBasicMaterial color="#87CEEB" side={2} />
            </mesh>

            {/* Ground */}
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
              <circleGeometry args={[15, 32]} />
              <meshStandardMaterial color="#3d5a3d" />
            </mesh>

            {/* Central Nexus Crystal */}
            <group position={[0, 0, 0]}>
              {/* Base Platform */}
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[2, 2.5, 0.5, 16]} />
                <meshStandardMaterial 
                  color="#4a5568" 
                  metalness={0.8} 
                  roughness={0.2} 
                />
              </mesh>
              
              {/* Main Crystal */}
              <mesh ref={crystalRef} position={[0, 2, 0]}>
                <octahedronGeometry args={[1.5, 1]} />
                <meshStandardMaterial
                  color="#60a5fa"
                  emissive="#3b82f6"
                  emissiveIntensity={0.5}
                  transparent
                  opacity={0.9}
                />
              </mesh>
              
              {/* Central Crystal Light */}
              <pointLight
                position={[0, 2, 0]}
                color="#60a5fa"
                intensity={2}
                distance={10}
                decay={2}
              />
            </group>

            {/* Vendor Stalls */}
            {/* Weapon Vendor (Left) */}
            <group position={[-8, 0, -6]} onClick={() => handleVendorClick('weapons')}>
              <mesh position={[0, 1, 0]}>
                <boxGeometry args={[3, 2, 2]} />
                <meshStandardMaterial color="#8b4513" />
              </mesh>
              <mesh position={[0, 2.5, 0]}>
                <coneGeometry args={[2, 1, 4]} />
                <meshStandardMaterial color="#4a5568" />
              </mesh>
              <Html position={[0, 3.5, 0]} center>
                <div className="bg-black/80 text-white px-3 py-1 rounded text-sm pointer-events-none">
                  ⚔️ Weapon Vendor
                </div>
              </Html>
            </group>

            {/* Crystal/Shard Vendor (Right) */}
            <group position={[8, 0, -6]} onClick={() => handleVendorClick('crystals')}>
              <mesh position={[0, 1, 0]}>
                <boxGeometry args={[3, 2, 2]} />
                <meshStandardMaterial color="#9333ea" />
              </mesh>
              <mesh position={[0, 2.5, 0]}>
                <coneGeometry args={[2, 1, 4]} />
                <meshStandardMaterial color="#4a5568" />
              </mesh>
              <Html position={[0, 3.5, 0]} center>
                <div className="bg-black/80 text-white px-3 py-1 rounded text-sm pointer-events-none">
                  💎 Crystal Vendor
                </div>
              </Html>
            </group>

            {/* Supply Vendor (Back) */}
            <group position={[0, 0, -10]} onClick={() => handleVendorClick('supplies')}>
              <mesh position={[0, 1, 0]}>
                <boxGeometry args={[3, 2, 2]} />
                <meshStandardMaterial color="#059669" />
              </mesh>
              <mesh position={[0, 2.5, 0]}>
                <coneGeometry args={[2, 1, 4]} />
                <meshStandardMaterial color="#4a5568" />
              </mesh>
              <Html position={[0, 3.5, 0]} center>
                <div className="bg-black/80 text-white px-3 py-1 rounded text-sm pointer-events-none">
                  🛡️ Supply Keeper
                </div>
              </Html>
            </group>

            {/* Module Placement System */}
            <NexusModulePlacement
              placedModules={placedModules}
              onModuleClick={handleModuleClick}
              gridSize={16}
              maxDistance={8}
            />

            {/* Camera Controls */}
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              minDistance={8}
              maxDistance={25}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 2.5}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Shop Modals */}
      <NexusModuleShop
        isOpen={activeShop === 'modules'}
        onClose={() => setActiveShop(null)}
        gameState={gameState}
        onPurchase={handleModulePurchase}
      />

      <StaffCrafterShop
        isOpen={activeShop === 'weapons'}
        onClose={() => setActiveShop(null)}
        gameState={gameState}
        onPurchase={handlePurchase}
      />

      <NexusMerchantShop
        isOpen={activeShop === 'crystals'}
        onClose={() => setActiveShop(null)}
        gameState={gameState}
        onPurchase={handlePurchase}
      />

      <SupplyKeeperShop
        isOpen={activeShop === 'supplies'}
        onClose={() => setActiveShop(null)}
        gameState={gameState}
        onPurchase={handlePurchase}
      />
    </>
  );
};