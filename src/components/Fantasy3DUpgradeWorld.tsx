
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

// Updated upgrades positioned directly on the path
const createUpgradeData = (): UpgradeData[] => {
  const baseUpgrades = [
    { name: 'Mystic Fountain', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [0, 0.5, -8] as [number, number, number], scale: 1.0 },
    { name: 'Crystal Grove', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb', position: [0, 0.5, -16] as [number, number, number], scale: 1.1 },
    { name: 'Arcane Sanctum', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [0, 0.5, -24] as [number, number, number], scale: 1.2 },
    { name: 'Nexus Gateway', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_05.glb', position: [0, 0.5, -32] as [number, number, number], scale: 1.3 },
    { name: 'Temporal Altar', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [0, 0.5, -40] as [number, number, number], scale: 1.4 },
    { name: 'Phoenix Roost', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb', position: [0, 0.5, -48] as [number, number, number], scale: 1.5 },
    { name: 'Ethereal Nexus', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [0, 0.5, -56] as [number, number, number], scale: 1.6 },
    { name: 'Infinity Well', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_05.glb', position: [0, 0.5, -64] as [number, number, number], scale: 1.7 },
    { name: 'Reality Prism', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [0, 0.5, -72] as [number, number, number], scale: 1.8 },
    { name: 'Astral Crown', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb', position: [0, 0.5, -80] as [number, number, number], scale: 1.9 },
    { name: 'Omni Core', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [0, 0.5, -88] as [number, number, number], scale: 2.0 },
    { name: 'Eternal Beacon', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_05.glb', position: [0, 0.5, -96] as [number, number, number], scale: 2.1 },
  ];

  // Apply exponential scaling
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
  onTapEffectComplete
}) => {
  const [cameraPosition, setCameraPosition] = useState(new Vector3(0, 1.6, 0));
  const [upgrades, setUpgrades] = useState<UpgradeData[]>(createUpgradeData());
  const [currentMana, setCurrentMana] = useState(100);
  const [totalManaPerSecond, setTotalManaPerSecond] = useState(0);
  const [selectedUpgrade, setSelectedUpgrade] = useState<UpgradeData | null>(null);
  const [showInsufficientMana, setShowInsufficientMana] = useState(false);
  const [currentEnvironmentTier, setCurrentEnvironmentTier] = useState(0);

  // Calculate total unlocked upgrades for environment progression
  const unlockedUpgradeCount = upgrades.filter(upgrade => upgrade.unlocked).length;

  const handlePositionChange = useCallback((position: Vector3) => {
    setCameraPosition(position);
  }, []);

  const handleEnvironmentChange = useCallback((tier: number) => {
    setCurrentEnvironmentTier(tier);
    console.log(`Environment transitioned to tier ${tier}`);
  }, []);

  const handleUpgradeClick = useCallback((upgrade: UpgradeData) => {
    console.log(`Clicked upgrade: ${upgrade.name}`);
    
    // Check if player is within interaction range
    const distance = cameraPosition.distanceTo(new Vector3(...upgrade.position));
    console.log(`Distance to ${upgrade.name}: ${distance.toFixed(2)}`);
    
    if (distance > 8) {
      console.log("Move closer to interact with this upgrade!");
      return;
    }
    
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

  // Check if player is within interaction range
  const isWithinRange = (upgradePosition: [number, number, number]): boolean => {
    const distance = cameraPosition.distanceTo(new Vector3(...upgradePosition));
    return distance <= 8;
  };

  // Player can move forward unless they've reached the very end
  const canMoveForward = cameraPosition.z > -110;

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

          {/* Enhanced Environment System */}
          <EnvironmentSystem 
            upgradeCount={unlockedUpgradeCount}
            onEnvironmentChange={handleEnvironmentChange}
            playerPosition={[cameraPosition.x, cameraPosition.y, cameraPosition.z]}
          />

          {/* Enhanced lighting system */}
          <ambientLight intensity={0.8} color="#ffffff" />
          <directionalLight
            position={[20, 30, 20]}
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
          
          {/* Path illumination lights */}
          {Array.from({ length: 12 }, (_, i) => (
            <pointLight 
              key={i}
              position={[0, 8, -8 - (i * 8)]} 
              intensity={0.8}
              color="#FFE4B5" 
              distance={25} 
            />
          ))}

          <Environment preset="sunset" />

          <ContactShadows 
            position={[0, -1.3, -50]} 
            opacity={0.4} 
            scale={50} 
            blur={3} 
            far={15} 
          />

          {/* Load GLB upgrade models positioned on path only */}
          {upgrades.map((upgrade) => {
            const distance = cameraPosition.distanceTo(new Vector3(...upgrade.position));
            if (distance > 60) return null;
            
            return (
              <GLBModel
                key={upgrade.id}
                modelUrl={upgrade.modelUrl}
                name={upgrade.name}
                position={upgrade.position}
                scale={upgrade.scale}
                onClick={() => handleUpgradeClick(upgrade)}
                isUnlocked={upgrade.unlocked}
                isPurchased={upgrade.unlocked}
                isWithinRange={isWithinRange(upgrade.position)}
                cost={upgrade.cost}
                canAfford={currentMana >= upgrade.cost}
              />
            );
          })}
        </Suspense>
      </Canvas>

      {/* Fixed Resource Display */}
      <div className="absolute top-4 right-4 pointer-events-none z-40">
        <div className="bg-purple-900/90 backdrop-blur-sm rounded-lg px-4 py-3 border border-purple-400/40">
          <div className="text-yellow-400 text-lg font-bold">{formatNumber(currentMana)} Mana</div>
          <div className="text-purple-300 text-sm">{formatNumber(totalManaPerSecond)}/sec</div>
          <div className="text-purple-200 text-xs mt-1">
            Environment Tier {currentEnvironmentTier}
          </div>
        </div>
      </div>

      {/* Fixed Tutorial Text */}
      <div className="absolute top-20 left-4 right-4 text-center pointer-events-none z-30">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 max-w-lg mx-auto">
          <p className="text-white/90 text-sm font-medium">
            Use WASD to move, mouse to look around. Walk close to upgrades and click to unlock them.
          </p>
        </div>
      </div>

      {/* Fixed Bottom UI - Clean layout with proper spacing */}
      <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-6 z-30">
        {/* Single Tap Button */}
        <button 
          className="bg-gradient-to-r from-purple-600/90 to-violet-700/90 hover:from-purple-500/90 hover:to-violet-600/90 
                     text-white px-10 py-5 rounded-full font-bold text-xl shadow-lg border border-purple-400/50
                     backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            boxShadow: '0 0 25px rgba(168, 85, 247, 0.5), 0 6px 25px rgba(0,0,0,0.3)'
          }}
          onClick={() => setCurrentMana(prev => prev + 1)}
        >
          ✨ Tap for Mana
        </button>
        
        {/* Realm Toggle Buttons */}
        <div className="flex items-center gap-6">
          <button className="bg-purple-600/80 hover:bg-purple-700/80 text-white px-8 py-4 rounded-full font-medium text-lg border border-purple-400/60 backdrop-blur-sm transition-all duration-300 hover:scale-105">
            🏰 Fantasy
          </button>
          <button className="bg-transparent border border-cyan-400/50 text-cyan-300 hover:bg-cyan-900/30 px-8 py-4 rounded-full font-medium text-lg backdrop-blur-sm transition-all duration-300 hover:scale-105">
            🚀 Sci-Fi
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full max-w-md px-4">
          <div className="bg-black/40 backdrop-blur-sm rounded-full h-3 overflow-hidden relative">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
              style={{ 
                width: `${Math.max(0, Math.min(100, ((Math.abs(cameraPosition.z) / 100) * 100)))}%` 
              }}
            />
            <div className="absolute top-0 left-1/4 w-0.5 h-full bg-yellow-400 opacity-60" />
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-yellow-400 opacity-60" />
            <div className="absolute top-0 left-3/4 w-0.5 h-full bg-yellow-400 opacity-60" />
          </div>
          <p className="text-white/50 text-xs text-center mt-2">
            Journey Progress: {unlockedUpgradeCount}/{upgrades.length} Upgrades | Environment: Tier {currentEnvironmentTier}
          </p>
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
