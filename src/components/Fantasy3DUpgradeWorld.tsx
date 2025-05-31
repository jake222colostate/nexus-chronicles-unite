
import React, { Suspense, useState, useCallback, useEffect, useMemo } from 'react';
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
  onPlayerPositionUpdate?: (position: { x: number; y: number; z: number }) => void;
}

export const Fantasy3DUpgradeWorld: React.FC<Fantasy3DUpgradeWorldProps> = ({
  onUpgradeClick,
  showTapEffect,
  onTapEffectComplete,
  gameState,
  realm = 'fantasy',
  onPlayerPositionUpdate
}) => {
  const [cameraPosition, setCameraPosition] = useState(new Vector3(0, 1.6, 0));
  const [selectedUpgrade, setSelectedUpgrade] = useState<any>(null);
  const [showInsufficientMana, setShowInsufficientMana] = useState(false);
  const [maxUnlockedUpgrade, setMaxUnlockedUpgrade] = useState(-1);

  // Enhanced infinite world parameters
  const CHUNK_SIZE = 80;
  const RENDER_DISTANCE = 200;
  const UPGRADE_SPACING = 35;

  // Stable gameState values to prevent infinite re-renders
  const currentMana = useMemo(() => gameState?.mana || 100, [gameState?.mana]);
  const totalManaPerSecond = useMemo(() => gameState?.manaPerSecond || 0, [gameState?.manaPerSecond]);

  // Get dynamic upgrades based on player position
  const upgrades = useInfiniteUpgrades({
    maxUnlockedUpgrade,
    playerPosition: [cameraPosition.x, cameraPosition.y, cameraPosition.z],
    upgradeSpacing: UPGRADE_SPACING,
    renderDistance: RENDER_DISTANCE
  });

  const handlePositionChange = useCallback((position: Vector3) => {
    setCameraPosition(position);
    if (onPlayerPositionUpdate) {
      onPlayerPositionUpdate({
        x: position.x,
        y: position.y,
        z: position.z
      });
    }
  }, [onPlayerPositionUpdate]);

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
      setMaxUnlockedUpgrade(prev => Math.max(prev, upgrade.id - 1));
      setSelectedUpgrade(null);
      console.log(`Unlocked ${upgrade.name}! +${upgrade.manaPerSecond} mana/sec`);
      
      // Call the parent's upgrade handler
      if (onUpgradeClick) {
        onUpgradeClick(upgrade.name);
      }
    } else {
      setShowInsufficientMana(true);
      setTimeout(() => setShowInsufficientMana(false), 2000);
      console.log("Not enough mana!");
    }
  }, [currentMana, onUpgradeClick]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto">
      <Canvas
        dpr={[1, 2]}
        camera={{ 
          position: [0, 1.6, 0], 
          fov: 75,
          near: 0.1,
          far: 1200
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

          {/* Environment System */}
          <EnvironmentSystem 
            upgradeCount={maxUnlockedUpgrade + 1}
            onEnvironmentChange={(tier) => console.log(`Environment tier: ${tier}`)}
          />

          {/* Lighting */}
          <ambientLight intensity={0.8} color="#E6E6FA" />
          <directionalLight
            position={[20, 30, 20]}
            intensity={1.2}
            color="#FFFFFF"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={1200}
            shadow-camera-left={-120}
            shadow-camera-right={120}
            shadow-camera-top={120}
            shadow-camera-bottom={-120}
          />
          
          <directionalLight
            position={[-15, 25, 15]}
            intensity={0.6}
            color="#DDA0DD"
          />

          <Environment preset="sunset" />

          {/* World System */}
          <ChunkSystem
            playerPosition={cameraPosition}
            chunkSize={CHUNK_SIZE}
            renderDistance={RENDER_DISTANCE}
          >
            {(chunks: ChunkData[]) => (
              <>
                <EnhancedPathwaySystem
                  chunks={chunks}
                  chunkSize={CHUNK_SIZE}
                />
                
                <NaturalMountainSystem
                  chunks={chunks}
                  chunkSize={CHUNK_SIZE}
                />
              </>
            )}
          </ChunkSystem>

          {/* Player lighting */}
          <pointLight 
            position={[cameraPosition.x, 10, cameraPosition.z - 8]} 
            intensity={1.0}
            color="#DDA0DD" 
            distance={50} 
          />

          <ContactShadows 
            position={[0, -0.45, cameraPosition.z]} 
            opacity={0.5} 
            scale={80} 
            blur={2.5} 
            far={20} 
          />

          {/* Upgrade Pedestals */}
          {upgrades.map((upgrade) => {
            const distance = cameraPosition.distanceTo(new Vector3(...upgrade.position));
            if (distance > 120) return null;
            
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

      {/* UI Overlays */}
      {showInsufficientMana && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-red-600/95 text-white px-8 py-4 rounded-xl border-2 border-red-400 animate-bounce shadow-2xl">
            <p className="font-bold text-lg">✨ Not enough mana! ✨</p>
          </div>
        </div>
      )}

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
