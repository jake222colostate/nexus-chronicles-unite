import React, { Suspense, useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { Vector3 } from 'three';
import { Enhanced360Controller } from './Enhanced360Controller';
import { Fantasy3DUpgradeModal } from './Fantasy3DUpgradeModal';
import { EnvironmentSystem } from './EnvironmentSystem';
import { ChunkSystem, ChunkData } from './ChunkSystem';
import { EnhancedPathwaySystem } from './EnhancedPathwaySystem';
import { NaturalMountainSystem } from './NaturalMountainSystem';
import { EnhancedUpgradePedestal } from './EnhancedUpgradePedestal';
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

  // Enhanced infinite world parameters
  const CHUNK_SIZE = 80;
  const RENDER_DISTANCE = 160;
  const UPGRADE_SPACING = 28; // Every 28 meters as requested

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
    
    const distance = cameraPosition.distanceTo(new Vector3(...upgrade.position));
    console.log(`Distance to ${upgrade.name}: ${distance.toFixed(2)}`);
    
    if (distance > 15) {
      console.log("Move closer to interact with this upgrade!");
      return;
    }
    
    setSelectedUpgrade(upgrade);
  }, [cameraPosition]);

  const handleUpgradePurchase = useCallback((upgrade: any) => {
    console.log(`Attempting to purchase ${upgrade.name} for ${upgrade.cost} mana. Current mana: ${currentMana}`);
    
    if (currentMana >= upgrade.cost) {
      setCurrentMana(prev => prev - upgrade.cost);
      setTotalManaPerSecond(prev => prev + upgrade.manaPerSecond);
      setMaxUnlockedUpgrade(prev => Math.max(prev, upgrade.id - 1));
      setSelectedUpgrade(null);
      console.log(`Unlocked ${upgrade.name}! +${upgrade.manaPerSecond} mana/sec`);
    } else {
      setShowInsufficientMana(true);
      setTimeout(() => setShowInsufficientMana(false), 2000);
      console.log("Not enough mana!");
    }
  }, [currentMana]);

  const isWithinRange = (upgradePosition: [number, number, number]): boolean => {
    const distance = cameraPosition.distanceTo(new Vector3(...upgradePosition));
    return distance <= 15;
  };

  // Passive mana generation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMana(prev => prev + totalManaPerSecond / 10);
    }, 100);
    return () => clearInterval(interval);
  }, [totalManaPerSecond]);

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
          {/* Enhanced 360° Movement Controller */}
          <Enhanced360Controller
            position={[0, 1.6, 0]}
            onPositionChange={handlePositionChange}
          />

          {/* Enhanced Environment System */}
          <EnvironmentSystem 
            upgradeCount={maxUnlockedUpgrade + 1}
            onEnvironmentChange={(tier) => console.log(`Environment tier: ${tier}`)}
          />

          {/* Enhanced Lighting */}
          <ambientLight intensity={0.7} color="#E6E6FA" />
          <directionalLight
            position={[20, 30, 20]}
            intensity={1.0}
            color="#FFFFFF"
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
            position={[-15, 20, 10]}
            intensity={0.5}
            color="#DDA0DD"
          />

          <Environment preset="sunset" />

          {/* Enhanced Chunked World System */}
          <ChunkSystem
            playerPosition={cameraPosition}
            chunkSize={CHUNK_SIZE}
            renderDistance={RENDER_DISTANCE}
          >
            {(chunks: ChunkData[]) => (
              <>
                {/* Enhanced Cobblestone Pathway */}
                <EnhancedPathwaySystem
                  chunks={chunks}
                  chunkSize={CHUNK_SIZE}
                />
                
                {/* Natural Mountain System */}
                <NaturalMountainSystem
                  chunks={chunks}
                  chunkSize={CHUNK_SIZE}
                />
              </>
            )}
          </ChunkSystem>

          {/* Dynamic lighting that follows player */}
          <pointLight 
            position={[cameraPosition.x, 8, cameraPosition.z - 5]} 
            intensity={0.8}
            color="#DDA0DD" 
            distance={40} 
          />

          <ContactShadows 
            position={[0, -0.4, cameraPosition.z]} 
            opacity={0.4} 
            scale={60} 
            blur={2.0} 
            far={15} 
          />

          {/* Enhanced Upgrade Pedestals */}
          {upgrades.map((upgrade) => {
            const distance = cameraPosition.distanceTo(new Vector3(...upgrade.position));
            if (distance > 100) return null; // Performance culling
            
            return (
              <EnhancedUpgradePedestal
                key={upgrade.id}
                position={upgrade.position}
                upgrade={upgrade}
                isUnlocked={upgrade.unlocked}
                isPurchased={upgrade.unlocked}
                canAfford={currentMana >= upgrade.cost}
                onInteract={() => handleUpgradeClick(upgrade)}
                tier={upgrade.tier + 1}
              />
            );
          })}
        </Suspense>
      </Canvas>

      {/* Enhanced Progress indicator */}
      <div className="absolute bottom-2 left-4 right-4 pointer-events-none">
        <div className="bg-black/50 backdrop-blur-sm rounded-full h-3 overflow-hidden relative">
          <div className="text-white text-sm text-center mb-2 font-semibold">
            Journey: {Math.floor(Math.abs(cameraPosition.z))}m | Upgrades: {maxUnlockedUpgrade + 1} | Realm: Fantasy
          </div>
          <div 
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-violet-600 h-full transition-all duration-500"
            style={{ 
              width: `${Math.min(100, (Math.abs(cameraPosition.z) / 1000) * 100)}%`
            }}
          />
        </div>
      </div>

      {/* Enhanced Insufficient Mana Warning */}
      {showInsufficientMana && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-red-600/95 text-white px-8 py-4 rounded-xl border-2 border-red-400 animate-bounce shadow-2xl">
            <p className="font-bold text-lg">✨ Not enough mana! ✨</p>
          </div>
        </div>
      )}

      {/* Enhanced Upgrade Modal */}
      {selectedUpgrade && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
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
