
import React, { Suspense, useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { Vector3 } from 'three';
import { GLBModel } from './GLBModelLoader';
import { FirstPersonController } from './FirstPersonController';
import { Fantasy3DUpgradeModal } from './Fantasy3DUpgradeModal';
import { EnvironmentSystem } from './EnvironmentSystem';

interface Fantasy3DUpgradeWorldProps {
  onUpgradeClick: (upgradeName: string) => void;
  showTapEffect?: boolean;
  onTapEffectComplete?: () => void;
  gameState?: any;
  realm?: 'fantasy' | 'scifi';
}

// Enhanced upgrade structure with exponential scaling
interface UpgradeData {
  id: number;
  name: string;
  baseCost: number;
  baseManaPerSecond: number;
  cost: number;
  manaPerSecond: number;
  unlocked: boolean;
  modelUrl: string;
  position: [number, number, number];
  scale: number;
}

// Updated upgrades with much more spacing for a journey feel
const createUpgradeData = (): UpgradeData[] => {
  const baseUpgrades = [
    { name: 'Mystic Fountain', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-3, 0, -15] as [number, number, number], scale: 1.0 },
    { name: 'Crystal Grove', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb', position: [3, 0, -35] as [number, number, number], scale: 1.1 },
    { name: 'Arcane Sanctum', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-4, 0, -55] as [number, number, number], scale: 1.2 },
    { name: 'Nexus Gateway', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_05.glb', position: [4, 0, -75] as [number, number, number], scale: 1.3 },
    { name: 'Temporal Altar', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-4.5, 0, -95] as [number, number, number], scale: 1.4 },
    { name: 'Phoenix Roost', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb', position: [4.5, 0, -115] as [number, number, number], scale: 1.5 },
    { name: 'Ethereal Nexus', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-5, 0, -135] as [number, number, number], scale: 1.6 },
    { name: 'Infinity Well', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_05.glb', position: [5, 0, -155] as [number, number, number], scale: 1.7 },
    { name: 'Reality Prism', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-5.5, 0, -175] as [number, number, number], scale: 1.8 },
    { name: 'Astral Crown', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb', position: [5.5, 0, -195] as [number, number, number], scale: 1.9 },
    { name: 'Omni Core', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-6, 0, -215] as [number, number, number], scale: 2.0 },
    { name: 'Eternal Beacon', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_05.glb', position: [6, 0, -235] as [number, number, number], scale: 2.1 },
    { name: 'Transcendent Gate', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-6.5, 0, -255] as [number, number, number], scale: 2.2 },
    { name: 'Primordial Engine', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb', position: [6.5, 0, -275] as [number, number, number], scale: 2.3 },
    { name: 'Universal Codex', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-7, 0, -295] as [number, number, number], scale: 2.4 },
    { name: 'Omega Singularity', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_05.glb', position: [0, 0, -315] as [number, number, number], scale: 2.5 }
  ];

  // Apply exponential scaling: cost = 50 * 2^n, manaPerSecond = 10 * 2^n
  return baseUpgrades.map((upgrade, index) => {
    const costMultiplier = Math.pow(2, index);
    const manaMultiplier = Math.pow(2, index);
    
    return {
      id: index + 1,
      name: upgrade.name,
      baseCost: 50,
      baseManaPerSecond: 10,
      cost: Math.floor(50 * costMultiplier),
      manaPerSecond: Math.floor(10 * manaMultiplier),
      unlocked: false,
      modelUrl: upgrade.modelUrl,
      position: upgrade.position,
      scale: upgrade.scale
    };
  });
};

export const Fantasy3DUpgradeWorld: React.FC<Fantasy3DUpgradeWorldProps> = ({
  onUpgradeClick,
  showTapEffect,
  onTapEffectComplete,
  gameState,
  realm = 'fantasy'
}) => {
  const [cameraPosition, setCameraPosition] = useState(new Vector3(0, 1.6, 0));
  const [upgrades, setUpgrades] = useState<UpgradeData[]>(createUpgradeData());
  const [currentMana, setCurrentMana] = useState(gameState?.mana || 100);
  const [totalManaPerSecond, setTotalManaPerSecond] = useState(gameState?.manaPerSecond || 0);
  const [selectedUpgrade, setSelectedUpgrade] = useState<UpgradeData | null>(null);
  const [showInsufficientMana, setShowInsufficientMana] = useState(false);
  const [currentEnvironmentTier, setCurrentEnvironmentTier] = useState(0);

  // Update internal state when gameState changes
  useEffect(() => {
    if (gameState) {
      setCurrentMana(gameState.mana);
      setTotalManaPerSecond(gameState.manaPerSecond);
    }
  }, [gameState]);

  // Calculate total unlocked upgrades for environment progression
  const unlockedUpgradeCount = upgrades.filter(upgrade => upgrade.unlocked).length;

  const handlePositionChange = useCallback((position: Vector3) => {
    setCameraPosition(position);
  }, []);

  const handleEnvironmentChange = useCallback((tier: number) => {
    setCurrentEnvironmentTier(tier);
    console.log(`Environment transitioned to tier ${tier + 1}`);
  }, []);

  const handleUpgradeClick = useCallback((upgrade: UpgradeData) => {
    console.log(`Clicked upgrade: ${upgrade.name}`);
    console.log(`Camera position:`, cameraPosition);
    console.log(`Upgrade position:`, upgrade.position);
    
    // Check if player is within interaction range (generous range)
    const distance = cameraPosition.distanceTo(new Vector3(...upgrade.position));
    console.log(`Distance to ${upgrade.name}: ${distance.toFixed(2)}`);
    
    if (distance > 20) { // Generous interaction range
      console.log("Move closer to interact with this upgrade!");
      return;
    }
    
    // Always open the modal when clicking
    console.log(`Opening modal for ${upgrade.name}`);
    setSelectedUpgrade(upgrade);
  }, [cameraPosition]);

  const handleUpgradePurchase = useCallback((upgrade: UpgradeData) => {
    console.log(`Attempting to purchase ${upgrade.name} for ${upgrade.cost} mana. Current mana: ${currentMana}`);
    
    if (currentMana >= upgrade.cost) {
      // Purchase successful
      setCurrentMana(prev => prev - upgrade.cost);
      setTotalManaPerSecond(prev => prev + upgrade.manaPerSecond);
      
      // Update upgrade state
      setUpgrades(prev => 
        prev.map(u => 
          u.id === upgrade.id 
            ? { ...u, unlocked: true }
            : u
        )
      );
      
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
    return distance <= 20; // Generous range
  };

  // Enhanced fade-in animation based on approach distance
  const getUpgradeOpacity = (upgradePosition: [number, number, number]): number => {
    const distance = cameraPosition.distanceTo(new Vector3(...upgradePosition));
    if (distance > 50) return 0; // Invisible when very far
    if (distance > 30) return 0.3; // Faint when far
    if (distance > 20) return 0.6; // Visible when medium distance
    return 1; // Fully visible when close
  };

  const getUpgradeScale = (upgradePosition: [number, number, number], baseScale: number): number => {
    const distance = cameraPosition.distanceTo(new Vector3(...upgradePosition));
    if (distance > 30) return baseScale * 0.8; // Smaller when far
    if (distance > 20) return baseScale * 0.9; // Slightly smaller when medium
    return baseScale; // Full size when close
  };

  // Player can move forward unless they've reached the very end
  const canMoveForward = cameraPosition.z > -350;

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
          far: 400
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

          {/* Clean Environment System */}
          <EnvironmentSystem 
            upgradeCount={unlockedUpgradeCount}
            onEnvironmentChange={handleEnvironmentChange}
          />

          {/* Enhanced lighting setup for better visibility */}
          <ambientLight intensity={0.8} color="#ffffff" />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1.2}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={400}
            shadow-camera-left={-50}
            shadow-camera-right={50}
            shadow-camera-top={50}
            shadow-camera-bottom={-50}
          />
          
          {/* Additional bright fill light */}
          <directionalLight
            position={[-10, 15, 5]}
            intensity={0.6}
            color="#ffffff"
          />

          {/* Enhanced point lights for extended path illumination */}
          {Array.from({ length: 16 }, (_, i) => (
            <pointLight 
              key={i}
              position={[(i % 2 === 0 ? -8 : 8), 10, -20 - (i * 20)]} 
              intensity={0.8}
              color="#ffffff" 
              distance={40} 
            />
          ))}

          <Environment preset="sunset" />

          {/* Extended stone path for longer journey */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -160]} receiveShadow>
            <planeGeometry args={[50, 350]} />
            <meshLambertMaterial color="#8B7355" />
          </mesh>

          {/* Enhanced stone path markers with more spacing */}
          {Array.from({ length: 32 }, (_, i) => (
            <mesh key={i} position={[0, -0.4, -10 - (i * 10)]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.8]} />
              <meshBasicMaterial 
                color="#A0A0A0" 
                transparent 
                opacity={0.8} 
              />
            </mesh>
          ))}

          <ContactShadows 
            position={[0, -0.4, -160]} 
            opacity={0.3} 
            scale={50} 
            blur={2.5} 
            far={15} 
          />

          {/* Load GLB upgrade models with enhanced fade-in animation */}
          {upgrades.map((upgrade) => {
            const distance = cameraPosition.distanceTo(new Vector3(...upgrade.position));
            if (distance > 60) return null; // Don't render if too far
            
            const opacity = getUpgradeOpacity(upgrade.position);
            const scale = getUpgradeScale(upgrade.position, upgrade.scale);
            
            return (
              <GLBModel
                key={upgrade.id}
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
                opacity={opacity}
              />
            );
          })}
        </Suspense>
      </Canvas>

      {/* Enhanced progress indicator for longer journey */}
      <div className="absolute bottom-2 left-4 right-4 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-sm rounded-full h-2 overflow-hidden relative">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
            style={{ 
              width: `${Math.max(0, Math.min(100, ((Math.abs(cameraPosition.z) / 320) * 100)))}%` 
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
