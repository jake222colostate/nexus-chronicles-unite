
import React, { Suspense, useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { Vector3 } from 'three';
import { GLBModel } from './GLBModelLoader';
import { FirstPersonController } from './FirstPersonController';
import { Fantasy3DUpgradeModal } from './Fantasy3DUpgradeModal';
import { PixelFantasyTerrain } from './PixelFantasyTerrain';

interface Fantasy3DUpgradeWorldProps {
  onUpgradeClick: (upgradeName: string) => void;
  showTapEffect?: boolean;
  onTapEffectComplete?: () => void;
}

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

// Enhanced upgrade positioning along the path for better visibility
const createUpgradeData = (): UpgradeData[] => {
  const baseUpgrades = [
    { name: 'Mystic Fountain', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-2, 0.5, -8] as [number, number, number], scale: 1.2 },
    { name: 'Crystal Grove', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb', position: [2, 0.5, -16] as [number, number, number], scale: 1.3 },
    { name: 'Arcane Sanctum', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-2.5, 0.5, -24] as [number, number, number], scale: 1.4 },
    { name: 'Nexus Gateway', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_05.glb', position: [2.5, 0.5, -32] as [number, number, number], scale: 1.5 },
    { name: 'Temporal Altar', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-3, 0.5, -40] as [number, number, number], scale: 1.6 },
    { name: 'Phoenix Roost', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb', position: [3, 0.5, -48] as [number, number, number], scale: 1.7 },
    { name: 'Ethereal Nexus', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-3.5, 0.5, -56] as [number, number, number], scale: 1.8 },
    { name: 'Infinity Well', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_05.glb', position: [3.5, 0.5, -64] as [number, number, number], scale: 1.9 },
    { name: 'Reality Prism', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-4, 0.5, -72] as [number, number, number], scale: 2.0 },
    { name: 'Astral Crown', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb', position: [4, 0.5, -80] as [number, number, number], scale: 2.1 },
    { name: 'Omni Core', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-4.5, 0.5, -88] as [number, number, number], scale: 2.2 },
    { name: 'Eternal Beacon', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_05.glb', position: [4.5, 0.5, -96] as [number, number, number], scale: 2.3 },
    { name: 'Transcendent Gate', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-5, 0.5, -104] as [number, number, number], scale: 2.4 },
    { name: 'Primordial Engine', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb', position: [5, 0.5, -112] as [number, number, number], scale: 2.5 },
    { name: 'Universal Codex', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-5.5, 0.5, -120] as [number, number, number], scale: 2.6 },
    { name: 'Omega Singularity', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_05.glb', position: [0, 0.5, -128] as [number, number, number], scale: 2.7 }
  ];

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
  const [currentEnvironmentTier, setCurrentEnvironmentTier] = useState(1);

  const unlockedUpgradeCount = upgrades.filter(upgrade => upgrade.unlocked).length;

  const handlePositionChange = useCallback((position: Vector3) => {
    setCameraPosition(position);
  }, []);

  const handleUpgradeClick = useCallback((upgrade: UpgradeData) => {
    const distance = cameraPosition.distanceTo(new Vector3(...upgrade.position));
    
    if (distance > 12) {
      return;
    }
    
    setSelectedUpgrade(upgrade);
  }, [cameraPosition]);

  const handleUpgradePurchase = useCallback((upgrade: UpgradeData) => {
    if (currentMana >= upgrade.cost) {
      setCurrentMana(prev => prev - upgrade.cost);
      setTotalManaPerSecond(prev => prev + upgrade.manaPerSecond);
      
      setUpgrades(prev => 
        prev.map(u => 
          u.id === upgrade.id 
            ? { ...u, unlocked: true }
            : u
        )
      );
      
      setSelectedUpgrade(null);
    } else {
      setShowInsufficientMana(true);
      setTimeout(() => setShowInsufficientMana(false), 2000);
    }
  }, [currentMana]);

  const isWithinRange = (upgradePosition: [number, number, number]): boolean => {
    const distance = cameraPosition.distanceTo(new Vector3(...upgradePosition));
    return distance <= 12;
  };

  const canMoveForward = cameraPosition.z > -140;

  // Update environment tier based on progress
  useEffect(() => {
    const newTier = Math.min(5, Math.floor(unlockedUpgradeCount / 3) + 1);
    setCurrentEnvironmentTier(newTier);
  }, [unlockedUpgradeCount]);

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
          far: 200
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

          {/* Enhanced pixel fantasy terrain with mountains and corridors */}
          <PixelFantasyTerrain tier={currentEnvironmentTier} />

          {/* Enhanced lighting for better visibility */}
          <ambientLight intensity={0.6} color="#f0f0f0" />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1.0}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={200}
            shadow-camera-left={-40}
            shadow-camera-right={40}
            shadow-camera-top={40}
            shadow-camera-bottom={-40}
          />
          
          {/* Path illumination lights */}
          {Array.from({ length: 10 }, (_, i) => (
            <pointLight 
              key={i}
              position={[(i % 2 === 0 ? -3 : 3), 6, -12 - (i * 12)]} 
              intensity={0.4}
              color="#fbbf24" 
              distance={20} 
            />
          ))}

          <Environment preset="dawn" />

          {/* Enhanced golden path markers */}
          {Array.from({ length: 25 }, (_, i) => (
            <mesh key={i} position={[0, -0.3, -5 - (i * 5)]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.6]} />
              <meshStandardMaterial 
                color="#fbbf24" 
                transparent 
                opacity={0.8}
                emissive="#fbbf24"
                emissiveIntensity={0.2}
              />
            </mesh>
          ))}

          <ContactShadows 
            position={[0, -0.3, -60]} 
            opacity={0.2} 
            scale={50} 
            blur={3} 
            far={15} 
          />

          {/* Upgrade models - ensure all are visible */}
          {upgrades.map((upgrade) => {
            const distance = cameraPosition.distanceTo(new Vector3(...upgrade.position));
            if (distance > 50) return null;
            
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

      {/* Resource Display - positioned to avoid overlap */}
      <div className="absolute top-4 right-4 pointer-events-none z-50">
        <div className="bg-purple-900/90 backdrop-blur-sm rounded-lg px-4 py-3 border border-purple-400/40">
          <div className="text-yellow-400 text-lg font-bold">{formatNumber(currentMana)} Mana</div>
          <div className="text-purple-300 text-sm">{formatNumber(totalManaPerSecond)}/sec</div>
          <div className="text-purple-200 text-xs mt-1">
            Environment Tier {currentEnvironmentTier}
          </div>
        </div>
      </div>

      {/* Progress indicator - positioned higher to avoid overlap */}
      <div className="absolute bottom-20 left-4 right-4 pointer-events-none z-10">
        <div className="bg-black/40 backdrop-blur-sm rounded-full h-2 overflow-hidden relative">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
            style={{ 
              width: `${Math.max(0, Math.min(100, ((Math.abs(cameraPosition.z) / 130) * 100)))}%` 
            }}
          />
          <div className="absolute top-0 left-1/4 w-0.5 h-full bg-yellow-400 opacity-60" />
          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-yellow-400 opacity-60" />
          <div className="absolute top-0 left-3/4 w-0.5 h-full bg-yellow-400 opacity-60" />
        </div>
        <p className="text-white/70 text-xs text-center mt-1">
          Journey Progress: {unlockedUpgradeCount}/{upgrades.length} Upgrades | Environment: Tier {currentEnvironmentTier}
        </p>
      </div>

      {/* Movement instructions - positioned to avoid overlap */}
      <div className="absolute top-16 left-4 right-4 text-center pointer-events-none z-40">
        <p className="text-white/70 text-sm font-medium">
          Use WASD to move, click and drag to look around, get close to upgrades to unlock them
        </p>
      </div>

      {/* Insufficient Mana Warning */}
      {showInsufficientMana && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-red-600/90 text-white px-6 py-3 rounded-lg border border-red-400 animate-bounce">
            <p className="font-bold">Not enough mana!</p>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
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
