import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { Mesh, Vector3 } from 'three';
import { useGameStateStore } from '@/stores/useGameStateStore';
import { NexusVendorShops } from './NexusShops';
import { NexusInventoryPanel } from './NexusInventoryPanel';

interface GridTile {
  x: number;
  z: number;
  occupied: boolean;
  moduleId?: string;
  isUnlocked: boolean;
}

interface PlacedModule {
  id: string;
  moduleId: string;
  position: [number, number, number];
  effectType: string;
  value: number;
  realmAffected: 'fantasy' | 'scifi' | 'all';
}

// Crystal Component with rotation animation
const Crystal: React.FC<{ 
  position: [number, number, number];
  size?: number;
  color?: string;
  onClick?: () => void;
  isHighlighted?: boolean;
}> = ({ position, size = 1, color = '#60a5fa', onClick, isHighlighted = false }) => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      {/* Stone Base */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.8, 1, 0.6, 8]} />
        <meshStandardMaterial color="#8B7355" roughness={0.8} />
      </mesh>
      
      {/* Crystal */}
      <mesh ref={meshRef} position={[0, 0.2, 0]}>
        <octahedronGeometry args={[size * 0.6, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHighlighted ? 0.6 : 0.3}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Glow Effect */}
      <pointLight
        position={[0, 0.5, 0]}
        color={color}
        intensity={isHighlighted ? 2 : 1}
        distance={5}
        decay={2}
      />
    </group>
  );
};

// Vendor Stall Component
const VendorStall: React.FC<{
  position: [number, number, number];
  stallType: 'blacksmith' | 'merchant' | 'mystic';
  onClick: () => void;
}> = ({ position, stallType, onClick }) => {
  const getStallColors = () => {
    switch (stallType) {
      case 'blacksmith': return { tent: '#8B4513', accent: '#CD853F' };
      case 'merchant': return { tent: '#9333ea', accent: '#a855f7' };
      case 'mystic': return { tent: '#059669', accent: '#10b981' };
      default: return { tent: '#8B4513', accent: '#CD853F' };
    }
  };

  const colors = getStallColors();

  return (
    <group position={position} onClick={onClick}>
      {/* Stall Base */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[3, 1, 2]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      
      {/* Tent/Canopy */}
      <mesh position={[0, 1.8, 0]}>
        <coneGeometry args={[2, 1, 4]} />
        <meshStandardMaterial color={colors.tent} />
      </mesh>
      
      {/* Support Poles */}
      {[-1, 1].map((x, i) => 
        [-0.5, 0.5].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, 1.2, z]}>
            <cylinderGeometry args={[0.05, 0.05, 1.5]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        ))
      )}
      
      {/* Vendor Character */}
      <mesh position={[0, 1.2, -0.5]}>
        <capsuleGeometry args={[0.3, 0.8]} />
        <meshStandardMaterial color={colors.accent} />
      </mesh>
      
      {/* Floating Label */}
      <Html position={[0, 3, 0]} center>
        <div className="bg-black/80 text-white px-3 py-1 rounded text-sm pointer-events-none">
          {stallType === 'blacksmith' && '⚔️ Blacksmith'}
          {stallType === 'merchant' && '💎 Merchant'}
          {stallType === 'mystic' && '🔮 Mystic'}
        </div>
      </Html>
    </group>
  );
};

// Ground/Environment Component
const Environment: React.FC = () => {
  return (
    <>
      {/* Sky */}
      <mesh scale={[200, 200, 200]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#87CEEB" side={2} />
      </mesh>
      
      {/* Main Ground */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#8FBC8F" />
      </mesh>
      
      {/* Path */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]}>
        <planeGeometry args={[4, 30]} />
        <meshStandardMaterial color="#CD853F" />
      </mesh>
      
      {/* Trees */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 15 + Math.random() * 5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <group key={i} position={[x, 0, z]}>
            {/* Trunk */}
            <mesh position={[0, 1, 0]}>
              <cylinderGeometry args={[0.3, 0.4, 2]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* Foliage */}
            <mesh position={[0, 2.5, 0]}>
              <sphereGeometry args={[1.5 + Math.random() * 0.5]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
          </group>
        );
      })}
      
      {/* Mountains in background */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 40;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const height = 8 + Math.random() * 4;
        
        return (
          <mesh key={i} position={[x, height / 2, z]}>
            <coneGeometry args={[6 + Math.random() * 2, height]} />
            <meshStandardMaterial color="#708090" />
          </mesh>
        );
      })}
    </>
  );
};

export const NexusWorldGrid: React.FC = () => {
  const gameState = useGameStateStore();
  const [selectedTile, setSelectedTile] = useState<GridTile | null>(null);
  const [activeVendor, setActiveVendor] = useState<string | null>(null);
  const [showInventory, setShowInventory] = useState(false);
  const [placedModules, setPlacedModules] = useState<PlacedModule[]>([]);

  // Create 5x5 grid
  const gridSize = 5;
  const tileSpacing = 2;
  const gridTiles: GridTile[] = [];

  for (let x = 0; x < gridSize; x++) {
    for (let z = 0; z < gridSize; z++) {
      gridTiles.push({
        x: (x - Math.floor(gridSize / 2)) * tileSpacing,
        z: (z - Math.floor(gridSize / 2)) * tileSpacing,
        occupied: false,
        isUnlocked: true
      });
    }
  }

  const handleTileClick = (tile: GridTile) => {
    if (!tile.occupied && tile.isUnlocked) {
      setSelectedTile(tile);
      setShowInventory(true);
    }
  };

  const handleVendorClick = (vendorType: string) => {
    setActiveVendor(vendorType);
  };

  const handleModulePlacement = (moduleId: string) => {
    if (!selectedTile) return;

    const newModule: PlacedModule = {
      id: `placed_${Date.now()}`,
      moduleId,
      position: [selectedTile.x, 0, selectedTile.z],
      effectType: 'manaBoost', // This would come from module data
      value: 10,
      realmAffected: 'fantasy'
    };

    setPlacedModules(prev => [...prev, newModule]);
    setSelectedTile(null);
    setShowInventory(false);
  };

  return (
    <>
      <div className="w-full h-full relative">
        {/* Resource Display */}
        <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 text-purple-400">
              <span>🔮</span>
              <span className="font-mono">{Math.floor(gameState.mana).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-400">
              <span>⚡</span>
              <span className="font-mono">{Math.floor(gameState.energyCredits).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-400">
              <span>💎</span>
              <span className="font-mono">{gameState.nexusShards}</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <h1 className="text-2xl font-bold text-white text-center bg-black/60 backdrop-blur-sm rounded-lg px-6 py-2 border border-white/20">
            Nexus Hub
          </h1>
        </div>

        {/* Inventory Button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setShowInventory(true)}
            className="bg-blue-600/80 backdrop-blur-sm rounded-lg p-3 border border-blue-400/30 text-white hover:bg-blue-600/90 transition-colors"
          >
            🎒 Inventory
          </button>
        </div>

        {/* 3D Scene */}
        <Canvas
          camera={{ position: [0, 15, 12], fov: 60 }}
          style={{ height: '100%', width: '100%' }}
          shadows
        >
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[10, 20, 5]} 
            intensity={1} 
            castShadow 
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />

          {/* Environment */}
          <Environment />

          {/* Grid Tiles with Crystals */}
          {gridTiles.map((tile, index) => {
            const placedModule = placedModules.find(m => 
              Math.abs(m.position[0] - tile.x) < 0.1 && Math.abs(m.position[2] - tile.z) < 0.1
            );

            return (
              <Crystal
                key={index}
                position={[tile.x, 0.5, tile.z]}
                size={placedModule ? 1.2 : 0.8}
                color={placedModule ? '#fbbf24' : '#60a5fa'}
                onClick={() => handleTileClick(tile)}
                isHighlighted={selectedTile?.x === tile.x && selectedTile?.z === tile.z}
              />
            );
          })}

          {/* Vendor Stalls */}
          <VendorStall 
            position={[-8, 0, -6]} 
            stallType="blacksmith"
            onClick={() => handleVendorClick('blacksmith')}
          />
          <VendorStall 
            position={[8, 0, -6]} 
            stallType="merchant"
            onClick={() => handleVendorClick('merchant')}
          />
          <VendorStall 
            position={[0, 0, -10]} 
            stallType="mystic"
            onClick={() => handleVendorClick('mystic')}
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
        </Canvas>
      </div>

      {/* UI Modals */}
      <NexusVendorShops
        activeVendor={activeVendor}
        onClose={() => setActiveVendor(null)}
        gameState={gameState}
      />

      <NexusInventoryPanel
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
        onModuleSelect={handleModulePlacement}
        gameState={gameState}
      />
    </>
  );
};