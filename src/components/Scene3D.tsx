
import React, { Suspense, useRef, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { FloatingIsland } from './FloatingIsland';
import { UpgradeNode3D } from './UpgradeNode3D';
import { TapEffect3D } from './TapEffect3D';
import { WizardStaff } from './WizardStaff';
import { enhancedHybridUpgrades } from '../data/EnhancedHybridUpgrades';
import { sciFiUpgrades } from '../data/SciFiUpgrades';

interface Scene3DProps {
  realm: 'fantasy' | 'scifi';
  gameState: any;
  onUpgradeClick: (upgradeId: string) => void;
  isTransitioning?: boolean;
  showTapEffect?: boolean;
  onTapEffectComplete?: () => void;
}

// Enhanced upgrade positions with vertical scrolling layout
const UPGRADE_POSITIONS = [
  // Tier 1
  { id: 'quantum_core', x: 0, y: 6, z: 0, tier: 1 },
  { id: 'arcane_ai', x: 0, y: 6, z: 0, tier: 1 }, // Fantasy fallback
  
  // Tier 2
  { id: 'fusion_reactor', x: -2, y: 4, z: -1, tier: 2 },
  { id: 'antimatter_engine', x: 2, y: 4, z: -1, tier: 2 },
  { id: 'mana_fountain', x: -2, y: 4, z: -1, tier: 2 }, // Fantasy fallback
  { id: 'quantum_drive', x: 2, y: 4, z: -1, tier: 2 }, // Fantasy fallback
  
  // Tier 3
  { id: 'neural_network', x: -3, y: 2, z: -2, tier: 3 },
  { id: 'cyber_matrix', x: -1, y: 2, z: -2, tier: 3 },
  { id: 'plasma_conduits', x: 1, y: 2, z: -2, tier: 3 },
  { id: 'time_dilator', x: 3, y: 2, z: -2, tier: 3 },
  { id: 'arcane_beacon', x: -3, y: 2, z: -2, tier: 3 }, // Fantasy fallback
  { id: 'cyber_dragon', x: 0, y: 2, z: -2, tier: 3 }, // Fantasy fallback
  { id: 'nano_reactor', x: 3, y: 2, z: -2, tier: 3 }, // Fantasy fallback
  { id: 'rift_core', x: -1, y: 2, z: -2, tier: 3 }, // Fantasy fallback
  
  // Tier 4
  { id: 'singularity_engine', x: -1, y: 0, z: -3, tier: 4 },
  { id: 'dimensional_gateway', x: 1, y: 0, z: -3, tier: 4 },
  { id: 'reality_engine', x: 0, y: 0, z: -3, tier: 4 } // Fantasy fallback
];

export const Scene3D: React.FC<Scene3DProps> = React.memo(({
  realm,
  gameState,
  onUpgradeClick,
  isTransitioning = false,
  showTapEffect = false,
  onTapEffectComplete
}) => {
  const cameraRef = useRef();

  // Get the appropriate upgrade data based on realm
  const availableUpgrades = useMemo(() => {
    return realm === 'scifi' ? sciFiUpgrades : enhancedHybridUpgrades;
  }, [realm]);

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
    return UPGRADE_POSITIONS.map((position) => {
      const upgrade = availableUpgrades.find(u => u.id === position.id);
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
  }, [gameState.purchasedUpgrades, gameState.nexusShards, checkUpgradeUnlocked, onUpgradeClick, realm, availableUpgrades]);

  return (
    <div className="w-full h-full relative">
      <Canvas
        className={`transition-all duration-500 ${isTransitioning ? 'opacity-70 blur-sm' : 'opacity-100'}`}
        dpr={[1, 1.5]}
        performance={{ min: 0.6 }}
        gl={{ antialias: false, alpha: false }}
      >
        <Suspense fallback={null}>
          {/* Camera setup with better vertical range */}
          <PerspectiveCamera
            ref={cameraRef}
            makeDefault
            position={[0, 2, 10]}
            fov={60}
            near={0.1}
            far={100}
          />

          {/* Enhanced controls with vertical scrolling */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            panSpeed={0.8}
            zoomSpeed={0.6}
            rotateSpeed={0.5}
            minDistance={6}
            maxDistance={20}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={5 * Math.PI / 6}
            maxAzimuthAngle={Math.PI / 3}
            minAzimuthAngle={-Math.PI / 3}
            enableDamping={true}
            dampingFactor={0.05}
            target={[0, 2, 0]}
          />

          {/* Enhanced lighting */}
          <ambientLight intensity={1.2} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.5}
            castShadow={false}
          />
          
          {/* Additional lighting for sci-fi realm */}
          {realm === 'scifi' && (
            <>
              <pointLight
                position={[0, 6, 2]}
                intensity={1.0}
                color="#00ffff"
                distance={12}
              />
              <pointLight
                position={[-4, 3, -2]}
                intensity={0.8}
                color="#ff00ff"
                distance={10}
              />
              <pointLight
                position={[4, 3, -2]}
                intensity={0.8}
                color="#ffff00"
                distance={10}
              />
            </>
          )}

          {/* Floating Island Base */}
          <FloatingIsland realm={realm} />

          {/* Memoized upgrade nodes */}
          {upgradeNodes}

          {/* Wizard staff for fantasy realm only */}
          {realm === 'fantasy' && (
            <WizardStaff 
              visible={true}
              castShadow={false}
              receiveShadow={false}
            />
          )}

          {/* Tap Effect */}
          {showTapEffect && onTapEffectComplete && (
            <TapEffect3D realm={realm} onComplete={onTapEffectComplete} />
          )}
        </Suspense>
      </Canvas>

      {/* Scrolling Instructions */}
      <div className="absolute bottom-4 left-4 text-white/70 text-xs bg-black/50 backdrop-blur-sm rounded p-2">
        <div>🖱️ Drag to pan • 🔄 Right-click to rotate</div>
        <div>🔍 Scroll to zoom • ⬆️⬇️ Vertical navigation</div>
      </div>

      {/* Simplified loading fallback */}
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-sm">Loading...</div>
        </div>
      }>
        <div />
      </Suspense>
    </div>
  );
});

Scene3D.displayName = 'Scene3D';
