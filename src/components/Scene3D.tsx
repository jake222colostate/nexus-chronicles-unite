import React, { Suspense, useRef, useMemo, useCallback, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { FloatingIsland } from './FloatingIsland';
import { UpgradeNode3D } from './UpgradeNode3D';
import { TapEffect3D } from './TapEffect3D';
import { MagicStaffWeaponSystem } from './MagicStaffWeaponSystem';
import { Enhanced360Controller } from './Enhanced360Controller';
import { ChunkSystem } from './ChunkSystem';
import { FantasyEnvironmentOrchestrator } from './FantasyEnvironmentOrchestrator';
import { Sun } from './Sun';
import { enhancedHybridUpgrades } from '../data/EnhancedHybridUpgrades';
import { Vector3 } from 'three';
import { ImprovedFantasyLighting } from './ImprovedFantasyLighting';
import { ScifiDefenseSystem } from './scifi/ScifiDefenseSystem';
import { FloatingUpgradeSystem } from './scifi/FloatingUpgradeSystem';
import { ScifiUpgradeAsteroidSystem } from './scifi/ScifiUpgradeAsteroidSystem';
import { ScifiScrollUpgradeSystem } from './scifi/ScifiScrollUpgradeSystem';
import { ScifiUpgradeModal } from './scifi/ScifiUpgradeModal';
import { ScifiUpgradeGLBSystem } from './scifi/ScifiUpgradeGLBSystem';
import { CannonPlatformSystem } from './scifi/CannonPlatformSystem';
import { MapEditorGrid } from './MapEditor/MapEditorGrid';
import { MapEditorControls } from './MapEditor/MapEditorControls';
import { MapEditorElementRenderer } from './MapEditor/MapEditorElementRenderer';
import { MapEditorFlyingCamera } from './MapEditor/MapEditorFlyingCamera';
import { useMapEditorStore } from '../stores/useMapEditorStore';

interface Scene3DProps {
  realm: 'fantasy' | 'scifi';
  gameState: any;
  onUpgradeClick: (upgradeId: string) => void;
  isTransitioning?: boolean;
  showTapEffect?: boolean;
  onTapEffectComplete?: () => void;
  onMeteorDestroyed?: () => void;
  onEnergyGained?: (amount: number) => void;
  onPurchaseUpgrade?: (upgradeId: string) => void;
}

// Enhanced upgrade positions - neatly spaced around the center
const UPGRADE_POSITIONS = [
  // Tier 1 - Foundation (center)
  { id: 'arcane_ai', x: 0, y: 4, z: 0, tier: 1 },
  
  // Tier 2 - Close ring around center
  { id: 'mana_fountain', x: -3, y: 4, z: 0, tier: 2 },
  { id: 'quantum_drive', x: 3, y: 4, z: 0, tier: 2 },
  
  // Tier 3 - Second ring
  { id: 'arcane_beacon', x: -4, y: 4, z: -3, tier: 3 },
  { id: 'cyber_dragon', x: 0, y: 4, z: -4, tier: 3 },
  { id: 'nano_reactor', x: 4, y: 4, z: -3, tier: 3 },
  { id: 'rift_core', x: 0, y: 4, z: 4, tier: 3 },
  
  // Tier 4 - Behind center
  { id: 'reality_engine', x: 0, y: 4, z: -6, tier: 4 },
  
  // Tier 5 - Above center level
  { id: 'cosmic_nexus', x: -2, y: 6, z: 1, tier: 5 },
  { id: 'dimensional_forge', x: 2, y: 6, z: 1, tier: 5 },
  
  // Tier 6 - Highest level
  { id: 'omnipotent_core', x: -1, y: 8, z: 2, tier: 6 },
  { id: 'universe_creator', x: 1, y: 8, z: 2, tier: 6 }
];

export const Scene3D: React.FC<Scene3DProps> = React.memo(({
  realm,
  gameState,
  onUpgradeClick,
  isTransitioning = false,
  showTapEffect = false,
  onTapEffectComplete,
  onMeteorDestroyed,
  onEnergyGained,
  onPurchaseUpgrade
}) => {
  console.log('Scene3D: Rendering with realm:', realm);
  
  const cameraRef = useRef();
  const [enemyPositions, setEnemyPositions] = useState<Vector3[]>([]);
  const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null);
  const { isEditorActive } = useMapEditorStore();

  // Stable player position for chunk system - centered in the mountain valley
  const playerPosition = useMemo(() => new Vector3(0, 0, 0), []);

  // Callback to handle enemy position updates from environment
  const handleEnemyPositionUpdate = useCallback((positions: Vector3[]) => {
    setEnemyPositions(positions);
  }, []);

  // Callback to handle enemy hits
  const handleEnemyHit = useCallback((index: number, damage: number) => {
    console.log(`Enemy ${index} hit for ${damage} damage`);
    // This would typically trigger enemy damage/death logic
  }, []);

  // Memoize upgrade unlock checking to prevent recalculation
  const checkUpgradeUnlocked = useCallback((upgrade: any): boolean => {
    const { requirements } = upgrade;
    
    if (requirements.mana && gameState.mana < requirements.mana) return false;
    if (requirements.energy && gameState.energyCredits < requirements.energy) return false;
    if (requirements.nexusShards && gameState.nexusShards < requirements.nexusShards) return false;
    if (requirements.convergenceCount && gameState.convergenceCount < requirements.convergenceCount) return false;
    
    return true;
  }, [gameState.mana, gameState.energyCredits, gameState.nexusShards, gameState.convergenceCount]);

  // Memoize upgrade nodes to prevent unnecessary re-renders
  const upgradeNodes = useMemo(() => {
    console.log('Scene3D: Creating upgrade nodes');
    return UPGRADE_POSITIONS.map((position) => {
      const upgrade = enhancedHybridUpgrades.find(u => u.id === position.id);
      if (!upgrade) return null;

      return (
        <UpgradeNode3D
          key={upgrade.id}
          upgrade={upgrade}
          position={[position.x, position.y, position.z]}
          isUnlocked={checkUpgradeUnlocked(upgrade)}
          isPurchased={gameState.purchasedUpgrades?.includes(upgrade.id) || false}
          canAfford={gameState.nexusShards >= upgrade.cost}
          onClick={() => onUpgradeClick(upgrade.id)}
          realm={realm}
        />
      );
    }).filter(Boolean);
  }, [gameState.purchasedUpgrades, gameState.nexusShards, checkUpgradeUnlocked, onUpgradeClick, realm]);

  console.log('Scene3D: About to render Canvas');

  return (
    <div className="w-full h-full relative overflow-hidden">
      <Canvas
        className={`transition-all duration-500 ${isTransitioning ? 'opacity-70 blur-sm' : 'opacity-100'}`}
        dpr={[1, 1]}
        performance={{ min: 0.8 }}
        style={{ width: '375px', height: '667px' }}
        gl={{ 
          antialias: false, 
          alpha: false,
          powerPreference: "default",
          stencil: false,
          depth: true,
          preserveDrawingBuffer: false
        }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera
            ref={cameraRef}
            makeDefault
            position={isEditorActive ? [0, 5, 15] : [0, 2, 10]}
            fov={65}
            near={0.01}
            far={500}
            aspect={375 / 667}
            onUpdate={(cam) => cam.updateProjectionMatrix()}
          />

          {/* Enhanced MagicStaffWeaponSystem with enemy targeting - disabled in map editor */}
          {!isEditorActive && (
            <MagicStaffWeaponSystem 
              upgradeLevel={gameState.weaponUpgradeLevel || 0}
              visible={realm === 'fantasy'}
              enemyPositions={enemyPositions}
              onHitEnemy={handleEnemyHit}
              damage={10 + (gameState.weaponUpgradeLevel || 0) * 5}
            />
          )}

          {/* Enhanced camera controller with circular movement around center upgrades */}
          {!isEditorActive && (
            <Enhanced360Controller 
              camera={cameraRef.current}
              minY={-5}
              maxY={350}
              sensitivity={0.8}
              realm={realm}
              maxRotation={Math.PI / 3} // 60 degrees total range
              radius={10} // Distance from center upgrades
              centerPoint={realm === 'scifi' ? [0, -3, -2] : [0, 4, 0]} // Platform center for sci-fi, upgrades for fantasy
            />
          )}

          {/* ENHANCED: Keep lighting active during map editing */}
          <ImprovedFantasyLighting />

          {/* Use existing environment even in map editor mode */}
          <FloatingIsland realm={realm} />
          {/* Sci-fi systems - with background diamonds and upgrade modules */}
          {realm === 'scifi' && (
            <>
              <ScifiUpgradeGLBSystem
                gameState={gameState}
                onUpgradeClick={onUpgradeClick}
                checkUpgradeUnlocked={checkUpgradeUnlocked}
              />
              <FloatingUpgradeSystem
                energyCredits={gameState.energyCredits || 0}
                onPurchaseUpgrade={onPurchaseUpgrade || (() => {})}
                purchasedUpgrades={gameState.purchasedUpgrades || []}
              />
              <CannonPlatformSystem
                cannonCount={gameState.cannonCount || 1}
                targets={enemyPositions}
                gameState={gameState}
              />
              {!isEditorActive && (
                <ScifiDefenseSystem 
                  onMeteorDestroyed={onMeteorDestroyed}
                  onEnergyGained={onEnergyGained}
                  onUpgradeClick={setSelectedUpgrade}
                  purchasedUpgrades={gameState.purchasedUpgrades || []}
                />
              )}
            </>
          )}

          {/* Fantasy environment - now enabled in map editor too */}
          {realm === 'fantasy' && (
            <ChunkSystem
              playerPosition={playerPosition}
              chunkSize={50}
              renderDistance={150}
            >
              {(chunks) => (
                <FantasyEnvironmentOrchestrator
                  chunks={chunks}
                  chunkSize={50}
                  realm={realm}
                  playerPosition={playerPosition}
                  onEnemyPositionUpdate={handleEnemyPositionUpdate}
                />
              )}
            </ChunkSystem>
          )}

          {/* Show upgrade nodes in both realms (including map editor for visibility) */}
          {upgradeNodes}

          {/* Tap effect disabled in map editor */}
          {showTapEffect && onTapEffectComplete && !isEditorActive && (
            <TapEffect3D realm={realm} onComplete={onTapEffectComplete} />
          )}

          {/* Map Editor Components */}
          <MapEditorGrid />
          <MapEditorControls />
          <MapEditorElementRenderer />
          <MapEditorFlyingCamera />
        </Suspense>
      </Canvas>

      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-sm">Loading environment...</div>
        </div>
      }>
        <div />
      </Suspense>

      {/* Sci-fi upgrade modal outside Canvas - disabled in map editor */}
      {realm === 'scifi' && selectedUpgrade && !isEditorActive && (
        <ScifiUpgradeModal
          upgradeId={selectedUpgrade}
          energyCredits={gameState.energyCredits || 0}
          onPurchase={(upgradeId) => {
            onPurchaseUpgrade?.(upgradeId);
            setSelectedUpgrade(null);
          }}
          onClose={() => setSelectedUpgrade(null)}
        />
      )}
    </div>
  );
});

Scene3D.displayName = 'Scene3D';
