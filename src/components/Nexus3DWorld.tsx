import React, { useRef, useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Mesh } from 'three';
import { Pane } from 'tweakpane';
import { EffectComposer, Bloom, GodRays } from '@react-three/postprocessing';
import { NexusGround } from './NexusGround';
import { NexusFirstPersonController } from './NexusFirstPersonController';
import { NexusMerchantShop, SupplyKeeperShop, StaffCrafterShop } from './NexusVendorShops';
import { NexusCentralCrystal } from './NexusCentralCrystal';
import { NexusFloatingPlatform } from './NexusFloatingPlatforms';
import { NexusSandboxGrid } from './NexusSandboxGrid';
import { NexusResourceConverter } from './NexusResourceConverter';
import { TreeGenerator } from './TreeGenerator';
import { useGameStateStore } from '@/stores/useGameStateStore';

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
  const [terrainHeight, setTerrainHeight] = useState(4);
  const [terrainFrequency, setTerrainFrequency] = useState(2);
  const [treeDensity, setTreeDensity] = useState(5);
  const [crystalGlow, setCrystalGlow] = useState(2);
  const crystalRef = useRef<Mesh>(null);

  useEffect(() => {
    const pane = new Pane({ title: 'Scene Controls' });
    pane.addInput({ terrainHeight }, 'terrainHeight', { min: 1, max: 10 }).on('change', (e) => setTerrainHeight(e.value));
    pane.addInput({ terrainFrequency }, 'terrainFrequency', { min: 0.5, max: 5 }).on('change', (e) => setTerrainFrequency(e.value));
    pane.addInput({ treeDensity }, 'treeDensity', { min: 1, max: 20, step: 1 }).on('change', (e) => setTreeDensity(e.value));
    pane.addInput({ crystalGlow }, 'crystalGlow', { min: 0, max: 5 }).on('change', (e) => setCrystalGlow(e.value));
    return () => pane.dispose();
  }, []);
  
  // Use global game state store
  const globalGameState = useGameStateStore();
  
  // Merge provided gameState with global state (global state takes precedence)
  const safeGameState = {
    mana: 0,
    energyCredits: 0,
    nexusShards: 0,
    manaPerSecond: 0,
    energyPerSecond: 0,
    ...gameState,
    ...globalGameState // Global state overrides local state
  };

  console.log('Nexus3DWorld: Initializing with gameState:', safeGameState);

  // Vendor interaction handlers
  const handleVendorInteraction = (vendorType: string) => {
    if (vendorType === 'converter') {
      setActiveShop('converter');
    } else {
      console.log(`Opening ${vendorType} shop`);
      setActiveShop(vendorType);
    }
  };

  // Sandbox grid interaction
  const handleGridTileClick = (x: number, z: number) => {
    console.log(`Clicked grid tile at ${x}, ${z}`);
    // TODO: Implement upgrade placement logic
  };

  // Purchase handler with global state integration
  const handlePurchase = (item: any) => {
    console.log(`Purchasing ${item.name} for ${item.cost} ${item.currency}`);
    
    // Use global state store methods for purchases
    let success = false;
    switch (item.currency) {
      case 'mana':
        success = globalGameState.spendMana(item.cost);
        break;
      case 'energyCredits':
        success = globalGameState.spendEnergy(item.cost);
        break;
      case 'nexusShards':
        success = globalGameState.spendNexusShards(item.cost);
        break;
    }
    
    if (success) {
      globalGameState.unlockUpgrade(item.id);
      onUpgrade(item.id);
      setActiveShop(null);
    } else {
      console.log('Insufficient resources!');
    }
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

            {/* Procedural Ground */}
            <NexusGround size={40} maxHeight={terrainHeight} frequency={terrainFrequency} />
            {Array.from({ length: treeDensity }).map((_, i) => (
              <TreeGenerator key={i} position={[
                (Math.random() - 0.5) * 30,
                0,
                (Math.random() - 0.5) * 30
              ]} />
            ))}

            {/* Central Crystal - Replaces old core */}
            <NexusCentralCrystal ref={crystalRef} glow={crystalGlow} />

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

            {/* Resource Converter Platform */}
            <mesh 
              position={[-12, 2, 0]} 
              onClick={() => handleVendorInteraction('converter')}
            >
              <cylinderGeometry args={[1.2, 1.2, 0.3, 16]} />
              <meshStandardMaterial 
                color="#f59e0b"
                emissive="#d97706"
                emissiveIntensity={0.4}
                metalness={0.7}
                roughness={0.1}
              />
              {/* Converter Symbol */}
              <mesh position={[0, 0.5, 0]}>
                <torusGeometry args={[0.4, 0.1, 8, 16]} />
                <meshStandardMaterial 
                  color="#fbbf24"
                  emissive="#f59e0b"
                  emissiveIntensity={0.6}
                />
              </mesh>
            </mesh>

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
            <EffectComposer>
              <Bloom luminanceThreshold={0.5} intensity={0.6} />
              <GodRays sun={crystalRef as any} />
            </EffectComposer>
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
        
        <NexusResourceConverter
          isOpen={activeShop === 'converter'}
          onClose={() => setActiveShop(null)}
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
