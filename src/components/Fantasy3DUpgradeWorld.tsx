
import React, { Suspense, useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { Vector3 } from 'three';
import { GLBModel } from './GLBModelLoader';
import { FirstPersonController } from './FirstPersonController';
import { Fantasy3DUpgradeModal } from './Fantasy3DUpgradeModal';
import { EnvironmentSystem } from './EnvironmentSystem';
import { ChunkSystem, ChunkData } from './ChunkSystem';
import { ProceduralTerrain } from './ProceduralTerrain';
import { useInfiniteUpgrades } from './InfiniteUpgradeSystem';

interface Fantasy3DUpgradeWorldProps {
  onUpgradeClick: (upgradeName: string) => void;
  showTapEffect?: boolean;
  onTapEffectComplete?: () => void;
  gameState?: any;
  realm?: 'fantasy' | 'scifi';
}

export const Fantasy3DUpgradeWorld: React.FC<Fantasy3DUpgradeWorldProps> = ({
  onUpgradeClick,
  showTapEffect,
  onTapEffectComplete,
  gameState,
  realm = 'fantasy'
}) => {
  const [cameraPosition, setCameraPosition] = useState(new Vector3(0, 1.6, 0));
  const [currentMana, setCurrentMana] = useState(gameState?.mana || 100);
  const [totalManaPerSecond, setTotalManaPerSecond] = useState(gameState?.manaPerSecond || 0);
  const [selectedUpgrade, setSelectedUpgrade] = useState<any>(null);
  const [showInsufficientMana, setShowInsufficientMana] = useState(false);
  const [maxUnlockedUpgrade, setMaxUnlockedUpgrade] = useState(-1);

  // Infinite world parameters
  const CHUNK_SIZE = 100;
  const RENDER_DISTANCE = 200;
  const UPGRADE_SPACING = 50;

  // Get dynamic upgrades based on player position
  const upgrades = useInfiniteUpgrades({
    maxUnlockedUpgrade,
    playerPosition: [cameraPosition.x, cameraPosition.y, cameraPosition.z],
    upgradeSpacing: UPGRADE_SPACING,
    renderDistance: RENDER_DISTANCE
  });

  // Update internal state when gameState changes
  useEffect(() => {
    if (gameState) {
      setCurrentMana(gameState.mana);
      setTotalManaPerSecond(gameState.manaPerSecond);
    }
  }, [gameState]);

  const handlePositionChange = useCallback((position: Vector3) => {
    setCameraPosition(position);
  }, []);

  const handleUpgradeClick = useCallback((upgrade: any) => {
    console.log(`Clicked upgrade: ${upgrade.name}`);
    
    // Check if player is within interaction range
    const distance = cameraPosition.distanceTo(new Vector3(...upgrade.position));
    console.log(`Distance to ${upgrade.name}: ${distance.toFixed(2)}`);
    
    if (distance > 25) {
      console.log("Move closer to interact with this upgrade!");
      return;
    }
    
    setSelectedUpgrade(upgrade);
  }, [cameraPosition]);

  const handleUpgradePurchase = useCallback((upgrade: any) => {
    console.log(`Attempting to purchase ${upgrade.name} for ${upgrade.cost} mana. Current mana: ${currentMana}`);
    
    if (currentMana >= upgrade.cost) {
      // Purchase successful
      setCurrentMana(prev => prev - upgrade.cost);
      setTotalManaPerSecond(prev => prev + upgrade.manaPerSecond);
      
      // Update max unlocked upgrade for infinite system
      setMaxUnlockedUpgrade(prev => Math.max(prev, upgrade.id - 1));
      
      setSelectedUpgrade(null);
      console.log(`Unlocked ${upgrade.name}! +${upgrade.manaPerSecond} mana/sec`);
    } else {
      // Insufficient mana
      setShowInsufficientMana(true);
      setTimeout(() => setShowInsufficientMana(false), 2000);
      console.log("Not enough mana!");
    }
  }, [currentMana]);

  // Check if player is within interaction range of upgrade
  const isWithinRange = (upgradePosition: [number, number, number]): boolean => {
    const distance = cameraPosition.distanceTo(new Vector3(...upgradePosition));
    return distance <= 25;
  };

  // Enhanced fade-in animation based on approach distance
  const getUpgradeOpacity = (upgradePosition: [number, number, number]): number => {
    const distance = cameraPosition.distanceTo(new Vector3(...upgradePosition));
    if (distance > 80) return 0;
    if (distance > 60) return 0.2;
    if (distance > 40) return 0.5;
    if (distance > 25) return 0.8;
    return 1;
  };

  const getUpgradeScale = (upgradePosition: [number, number, number], baseScale: number): number => {
    const distance = cameraPosition.distanceTo(new Vector3(...upgradePosition));
    if (distance > 60) return baseScale * 0.6;
    if (distance > 40) return baseScale * 0.8;
    if (distance > 25) return baseScale * 0.9;
    return baseScale;
  };

  // No movement restrictions - infinite movement enabled
  const canMoveForward = true;

  // Passive mana generation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMana(prev => prev + totalManaPerSecond / 10);
    }, 100);
    return () => clearInterval(interval);
  }, [totalManaPerSecond]);

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };

  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        dpr={[1, 2]}
        camera={{ 
          position: [0, 1.6, 0], 
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <FirstPersonController
            position={[0, 1.6, 0]}
            onPositionChange={handlePositionChange}
            canMoveForward={canMoveForward}
          />

          {/* Environment System */}
          <EnvironmentSystem 
            upgradeCount={maxUnlockedUpgrade + 1}
            onEnvironmentChange={(tier) => console.log(`Environment tier: ${tier}`)}
          />

          {/* Lighting setup */}
          <ambientLight intensity={0.8} color="#ffffff" />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1.2}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={1000}
            shadow-camera-left={-100}
            shadow-camera-right={100}
            shadow-camera-top={100}
            shadow-camera-bottom={-100}
          />
          
          <directionalLight
            position={[-10, 15, 5]}
            intensity={0.6}
            color="#ffffff"
          />

          <Environment preset="sunset" />

          {/* Infinite Chunked Terrain System */}
          <ChunkSystem
            playerPosition={cameraPosition}
            chunkSize={CHUNK_SIZE}
            renderDistance={RENDER_DISTANCE}
          >
            {(chunks: ChunkData[]) => (
              <>
                {chunks.map(chunk => (
                  <ProceduralTerrain
                    key={chunk.id}
                    chunk={chunk}
                    chunkSize={CHUNK_SIZE}
                  />
                ))}
              </>
            )}
          </ChunkSystem>

          {/* Main stone path extending infinitely */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -500]} receiveShadow>
            <planeGeometry args={[60, 2000]} />
            <meshLambertMaterial color="#8B7355" />
          </mesh>

          {/* Dynamic lighting that follows the player */}
          <pointLight 
            position={[cameraPosition.x, 12, cameraPosition.z - 10]} 
            intensity={1.0}
            color="#ffffff" 
            distance={60} 
          />

          <ContactShadows 
            position={[0, -0.4, cameraPosition.z]} 
            opacity={0.3} 
            scale={80} 
            blur={2.5} 
            far={20} 
          />

          {/* Infinite Dynamic Upgrades */}
          {upgrades.map((upgrade) => {
            const distance = cameraPosition.distanceTo(new Vector3(...upgrade.position));
            if (distance > 120) return null; // Culling for performance
            
            const opacity = getUpgradeOpacity(upgrade.position);
            const scale = getUpgradeScale(upgrade.position, upgrade.scale);
            
            if (opacity <= 0) return null;
            
            return (
              <group key={upgrade.id}>
                <GLBModel
                  modelUrl={upgrade.modelUrl}
                  name={upgrade.name}
                  position={upgrade.position}
                  scale={scale}
                  onClick={() => handleUpgradeClick(upgrade)}
                  isUnlocked={upgrade.unlocked}
                  isPurchased={upgrade.unlocked}
                  isWithinRange={isWithinRange(upgrade.position)}
                  cost={upgrade.cost}
                  canAfford={currentMana >= upgrade.cost}
                />
              </group>
            );
          })}
        </Suspense>
      </Canvas>

      {/* Progress indicator - now shows infinite progress */}
      <div className="absolute bottom-2 left-4 right-4 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-sm rounded-full h-2 overflow-hidden relative">
          <div className="text-white text-xs text-center mb-1">
            Distance: {Math.floor(Math.abs(cameraPosition.z))}m | Upgrades: {maxUnlockedUpgrade + 1}
          </div>
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
            style={{ 
              width: `${Math.min(100, (Math.abs(cameraPosition.z) / 1000) * 100)}%`
            }}
          />
        </div>
      </div>

      {/* Insufficient Mana Warning */}
      {showInsufficientMana && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-red-600/90 text-white px-6 py-3 rounded-lg border border-red-400 animate-bounce">
            <p className="font-bold">Not enough mana!</p>
          </div>
        </div>
      )}

      {/* Enhanced Upgrade Modal */}
      {selectedUpgrade && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedUpgrade(null);
            }
          }}
        >
          <div className="w-full max-w-sm">
            <Fantasy3DUpgradeModal
              upgradeName={selectedUpgrade.name}
              onClose={() => setSelectedUpgrade(null)}
              onPurchase={() => handleUpgradePurchase(selectedUpgrade)}
              upgradeData={{
                cost: selectedUpgrade.cost,
                manaPerSecond: selectedUpgrade.manaPerSecond,
                unlocked: selectedUpgrade.unlocked
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
