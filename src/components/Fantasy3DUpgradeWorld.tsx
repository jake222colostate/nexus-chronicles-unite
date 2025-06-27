
import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useFantasy3DUpgradeWorld } from './hooks/useFantasy3DUpgradeWorld';
import { Fantasy3DScene } from './Fantasy3DScene';
import { Fantasy3DUpgradePedestals } from './Fantasy3DUpgradePedestals';
import { Fantasy3DUpgradeModal } from './Fantasy3DUpgradeModal';
import { Fantasy3DInsufficientManaMessage } from './Fantasy3DInsufficientManaMessage';
import { TreeAssetManager } from '../environment/TreeAssetManager';

interface Fantasy3DUpgradeWorldProps {
  onUpgradeClick: (upgradeName: string) => void;
  showTapEffect?: boolean;
  onTapEffectComplete?: () => void;
  gameState?: any;
  realm?: 'fantasy' | 'scifi';
  onPlayerPositionUpdate?: (position: { x: number; y: number; z: number }) => void;
  onEnemyCountChange?: (count: number) => void;
  onEnemyKilled?: () => void;
  weaponDamage: number;
}

export const Fantasy3DUpgradeWorld: React.FC<Fantasy3DUpgradeWorldProps> = ({
  onUpgradeClick,
  showTapEffect,
  onTapEffectComplete,
  gameState,
  realm = 'fantasy',
  onPlayerPositionUpdate,
  onEnemyCountChange,
  onEnemyKilled,
  weaponDamage
}) => {
  console.log('Fantasy3DUpgradeWorld: Rendering with realm:', realm);
  
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  const {
    cameraPosition,
    selectedUpgrade,
    showInsufficientMana,
    maxUnlockedUpgrade,
    currentManaRef,
    upgrades,
    purchasedUpgrades,
    CHUNK_SIZE,
    RENDER_DISTANCE,
    UPGRADE_SPACING,
    handlePositionChange,
    handleUpgradeClick,
    handleUpgradePurchase,
    handleTierProgression,
    setSelectedUpgrade
  } = useFantasy3DUpgradeWorld({
    gameState,
    onPlayerPositionUpdate
  });

  // Preload environment assets once on mount
  useEffect(() => {
    console.log('Fantasy3DUpgradeWorld: Starting asset preload');
    let cancelled = false;
    TreeAssetManager.preloadAllModels().then(() => {
      console.log('Fantasy3DUpgradeWorld: Assets loaded successfully');
      if (!cancelled) setAssetsLoaded(true);
    }).catch((error) => {
      console.error('Fantasy3DUpgradeWorld: Error loading assets:', error);
      if (!cancelled) setAssetsLoaded(true); // Continue anyway
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Force Canvas to initialize properly on mount
  useEffect(() => {
    console.log('Fantasy3DUpgradeWorld: Initializing for realm:', realm);
    if (realm === 'fantasy') {
      // Small delay to ensure proper initialization
      const timer = setTimeout(() => {
        console.log('Fantasy3DUpgradeWorld: Canvas ready');
        setIsCanvasReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [realm]);

  // Only render if realm is fantasy and canvas is ready
  if (realm !== 'fantasy') {
    console.log('Fantasy3DUpgradeWorld: Not rendering - realm is not fantasy');
    return null;
  }

  console.log('Fantasy3DUpgradeWorld: Canvas ready:', isCanvasReady, 'Assets loaded:', assetsLoaded);

  try {
    return (
      <div className="absolute inset-0 w-full h-full">
        {(!assetsLoaded || !isCanvasReady) && (
          <div className="absolute inset-0 flex items-center justify-center text-white bg-black">
            Loading Fantasy World...
          </div>
        )}
        {isCanvasReady && assetsLoaded && (
          <Canvas
            key={`fantasy-canvas-${realm}`}
            dpr={[0.5, 1]}
            camera={{ 
              position: [0, 5, 12], 
              fov: 50,
              near: 0.1,
              far: 1200
            }}
            shadows
            gl={{ 
              antialias: false, 
              alpha: true,
              powerPreference: "high-performance",
              preserveDrawingBuffer: false,
              failIfMajorPerformanceCaveat: false
            }}
            onCreated={(state) => {
              console.log('Fantasy3DUpgradeWorld: Canvas created successfully');
              state.camera.updateProjectionMatrix();
            }}
            frameloop="demand"
          >
            <Fantasy3DScene
              cameraPosition={cameraPosition}
              onPositionChange={handlePositionChange}
              realm={realm}
              maxUnlockedUpgrade={maxUnlockedUpgrade}
              upgradeSpacing={UPGRADE_SPACING}
              onTierProgression={handleTierProgression}
              chunkSize={CHUNK_SIZE}
              renderDistance={RENDER_DISTANCE}
              onEnemyCountChange={onEnemyCountChange}
              onEnemyKilled={onEnemyKilled}
              weaponDamage={weaponDamage}
            />

            <Fantasy3DUpgradePedestals
              upgrades={upgrades}
              cameraPosition={cameraPosition}
              currentManaRef={currentManaRef}
              purchasedUpgrades={purchasedUpgrades}
              onUpgradeClick={handleUpgradeClick}
            />
          </Canvas>
        )}

        <Fantasy3DInsufficientManaMessage show={showInsufficientMana} />

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
  } catch (error) {
    console.error('Fantasy3DUpgradeWorld: Error during render:', error);
    return (
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-red-900/20">
        <div className="text-white text-center">
          <h2 className="text-xl font-bold mb-2">Fantasy World Error</h2>
          <p className="text-sm opacity-75">Check console for details</p>
        </div>
      </div>
    );
  }
};
