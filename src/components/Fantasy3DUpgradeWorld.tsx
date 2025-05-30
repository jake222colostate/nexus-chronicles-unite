
import React, { Suspense, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { Vector3, Fog } from 'three';
import { GLBModel } from './GLBModelLoader';
import { FirstPersonController } from './FirstPersonController';
import { Fantasy3DUpgradeModal } from './Fantasy3DUpgradeModal';

interface Fantasy3DUpgradeWorldProps {
  onUpgradeClick: (upgradeName: string) => void;
  showTapEffect?: boolean;
  onTapEffectComplete?: () => void;
}

// 25 upgrades with exponential scaling
const upgradeModels = [
  { name: 'Mystic Fountain', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-3, 0, -6] as [number, number, number], cost: 50, manaPerSec: 10, scale: 1.0 },
  { name: 'Crystal Grove', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb', position: [3, 0, -12] as [number, number, number], cost: 250, manaPerSec: 50, scale: 1.1 },
  { name: 'Arcane Sanctum', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_03.glb', position: [-4, 0, -18] as [number, number, number], cost: 1000, manaPerSec: 150, scale: 1.2 },
  { name: 'Celestial Spire', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_04.glb', position: [4, 0, -24] as [number, number, number], cost: 4000, manaPerSec: 400, scale: 1.3 },
  { name: 'Nexus Gateway', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_05.glb', position: [-4.5, 0, -30] as [number, number, number], cost: 15000, manaPerSec: 1000, scale: 1.4 },
  { name: 'Dragon\'s Heart', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_06.glb', position: [4.5, 0, -36] as [number, number, number], cost: 50000, manaPerSec: 2500, scale: 1.5 },
  { name: 'Void Obelisk', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_07.glb', position: [-5, 0, -42] as [number, number, number], cost: 150000, manaPerSec: 6000, scale: 1.6 },
  { name: 'Temporal Altar', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [5, 0, -48] as [number, number, number], cost: 400000, manaPerSec: 12000, scale: 1.7 },
  { name: 'Phoenix Roost', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb', position: [-5.5, 0, -54] as [number, number, number], cost: 1000000, manaPerSec: 25000, scale: 1.8 },
  { name: 'Ethereal Nexus', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_03.glb', position: [5.5, 0, -60] as [number, number, number], cost: 2500000, manaPerSec: 50000, scale: 1.9 },
  { name: 'Starfall Chamber', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_04.glb', position: [-6, 0, -66] as [number, number, number], cost: 6000000, manaPerSec: 100000, scale: 2.0 },
  { name: 'Infinity Well', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_05.glb', position: [6, 0, -72] as [number, number, number], cost: 15000000, manaPerSec: 200000, scale: 2.1 },
  { name: 'Cosmic Forge', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_06.glb', position: [-6.5, 0, -78] as [number, number, number], cost: 35000000, manaPerSec: 400000, scale: 2.2 },
  { name: 'Dimensional Anchor', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_07.glb', position: [6.5, 0, -84] as [number, number, number], cost: 80000000, manaPerSec: 800000, scale: 2.3 },
  { name: 'Reality Prism', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-7, 0, -90] as [number, number, number], cost: 200000000, manaPerSec: 1600000, scale: 2.4 },
  { name: 'Astral Crown', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb', position: [7, 0, -96] as [number, number, number], cost: 500000000, manaPerSec: 3200000, scale: 2.5 },
  { name: 'Omni Core', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_03.glb', position: [-7.5, 0, -102] as [number, number, number], cost: 1200000000, manaPerSec: 6400000, scale: 2.6 },
  { name: 'Genesis Matrix', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_04.glb', position: [7.5, 0, -108] as [number, number, number], cost: 3000000000, manaPerSec: 12800000, scale: 2.7 },
  { name: 'Eternal Beacon', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_05.glb', position: [-8, 0, -114] as [number, number, number], cost: 7500000000, manaPerSec: 25600000, scale: 2.8 },
  { name: 'Infinite Spiral', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_06.glb', position: [8, 0, -120] as [number, number, number], cost: 18000000000, manaPerSec: 51200000, scale: 2.9 },
  { name: 'Transcendent Gate', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_07.glb', position: [-8.5, 0, -126] as [number, number, number], cost: 45000000000, manaPerSec: 102400000, scale: 3.0 },
  { name: 'Primordial Engine', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [8.5, 0, -132] as [number, number, number], cost: 110000000000, manaPerSec: 204800000, scale: 3.1 },
  { name: 'Universal Codex', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb', position: [-9, 0, -138] as [number, number, number], cost: 270000000000, manaPerSec: 409600000, scale: 3.2 },
  { name: 'Apex Throne', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_03.glb', position: [9, 0, -144] as [number, number, number], cost: 650000000000, manaPerSec: 819200000, scale: 3.3 },
  { name: 'Omega Singularity', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_04.glb', position: [0, 0, -150] as [number, number, number], cost: 1600000000000, manaPerSec: 1638400000, scale: 3.5 }
];

export const Fantasy3DUpgradeWorld: React.FC<Fantasy3DUpgradeWorldProps> = ({
  onUpgradeClick,
  showTapEffect,
  onTapEffectComplete
}) => {
  const [cameraPosition, setCameraPosition] = useState(new Vector3(0, 1.6, 0));
  const [purchasedUpgrades, setPurchasedUpgrades] = useState<boolean[]>(Array(upgradeModels.length).fill(false));
  const [currency, setCurrency] = useState(100); // Starting mana
  const [manaPerSecond, setManaPerSecond] = useState(0);
  const [selectedUpgrade, setSelectedUpgrade] = useState<typeof upgradeModels[0] | null>(null);

  const handlePositionChange = useCallback((position: Vector3) => {
    setCameraPosition(position);
  }, []);

  const handleUpgradeClick = useCallback((upgradeName: string, index: number) => {
    const upgrade = upgradeModels[index];
    
    // Check if player is within interaction range
    const upgradePosition = upgrade.position;
    const distance = cameraPosition.distanceTo(new Vector3(...upgradePosition));
    if (distance > 4) {
      console.log("Move closer to interact with this upgrade!");
      return;
    }
    
    // Open upgrade modal
    setSelectedUpgrade(upgrade);
  }, [cameraPosition]);

  const handleUpgradePurchase = useCallback((upgrade: typeof upgradeModels[0]) => {
    const index = upgradeModels.findIndex(u => u.name === upgrade.name);
    if (index === -1) return;
    
    if (currency >= upgrade.cost) {
      setPurchasedUpgrades(prev => {
        const newPurchased = [...prev];
        newPurchased[index] = true;
        return newPurchased;
      });
      setCurrency(prev => prev - upgrade.cost);
      setManaPerSecond(prev => prev + upgrade.manaPerSec);
      setSelectedUpgrade(null);
    }
  }, [currency]);

  // Check if player is within interaction range of upgrade
  const isWithinRange = (upgradePosition: [number, number, number]): boolean => {
    const distance = cameraPosition.distanceTo(new Vector3(...upgradePosition));
    return distance <= 4;
  };

  // Player can move forward unless they've reached the very end
  const canMoveForward = cameraPosition.z > -160;

  // Passive mana generation
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrency(prev => prev + manaPerSecond / 10);
    }, 100);
    return () => clearInterval(interval);
  }, [manaPerSecond]);

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
        onCreated={({ scene }) => {
          scene.fog = new Fog('#0f0f23', 15, 180);
        }}
      >
        <Suspense fallback={null}>
          <FirstPersonController
            position={[0, 1.6, 0]}
            onPositionChange={handlePositionChange}
            canMoveForward={canMoveForward}
          />

          {/* Enhanced fantasy lighting setup */}
          <ambientLight intensity={0.3} color="#1a1a2e" />
          <directionalLight
            position={[8, 15, 8]}
            intensity={0.7}
            color="#e6e6fa"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={200}
            shadow-camera-left={-30}
            shadow-camera-right={30}
            shadow-camera-top={30}
            shadow-camera-bottom={-30}
          />
          
          {/* Progressive lighting along the path */}
          {Array.from({ length: 10 }, (_, i) => (
            <pointLight 
              key={i}
              position={[(i % 2 === 0 ? -6 : 6), 8, -15 - (i * 15)]} 
              intensity={0.6} 
              color="#8b5cf6" 
              distance={25} 
            />
          ))}

          <Environment preset="dawn" />

          {/* Extended mystical ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -75]} receiveShadow>
            <planeGeometry args={[40, 200]} />
            <meshLambertMaterial color="#1a1a2e" />
          </mesh>

          {/* Mystical path markers */}
          {Array.from({ length: 30 }, (_, i) => (
            <mesh key={i} position={[0, -0.4, -5 - (i * 5)]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.4]} />
              <meshBasicMaterial color="#8b5cf6" transparent opacity={0.5} />
            </mesh>
          ))}

          <ContactShadows 
            position={[0, -0.4, -75]} 
            opacity={0.6} 
            scale={40} 
            blur={2.5} 
            far={10} 
          />

          {/* Load all 25 GLB upgrade models */}
          {upgradeModels.map((upgrade, index) => {
            const distance = cameraPosition.distanceTo(new Vector3(...upgrade.position));
            if (distance > 25) return null; // Performance optimization
            
            return (
              <GLBModel
                key={upgrade.name}
                modelUrl={upgrade.modelUrl}
                name={upgrade.name}
                position={upgrade.position}
                scale={upgrade.scale}
                onClick={() => handleUpgradeClick(upgrade.name, index)}
                isUnlocked={true} // All upgrades are visible from start
                isPurchased={purchasedUpgrades[index]}
                isWithinRange={isWithinRange(upgrade.position)}
                cost={upgrade.cost}
                canAfford={currency >= upgrade.cost}
              />
            );
          })}

          {/* Enhanced atmospheric particles */}
          {Array.from({ length: 60 }, (_, i) => {
            const x = (Math.random() - 0.5) * 35;
            const y = Math.random() * 15 + 2;
            const z = Math.random() * -160 - 5;
            return (
              <mesh key={i} position={[x, y, z]}>
                <sphereGeometry args={[0.03]} />
                <meshBasicMaterial 
                  color="#c084fc" 
                  transparent 
                  opacity={Math.random() * 0.5 + 0.3} 
                />
              </mesh>
            );
          })}
        </Suspense>
      </Canvas>

      {/* Clean Resource Display - Top Right */}
      <div className="absolute top-4 right-4 pointer-events-none">
        <div className="bg-purple-900/90 backdrop-blur-sm rounded-lg px-4 py-3 border border-purple-400/40">
          <div className="text-yellow-400 text-lg font-bold">{formatNumber(currency)} Mana</div>
          <div className="text-purple-300 text-sm">{formatNumber(manaPerSecond)}/sec</div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-sm rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
            style={{ 
              width: `${Math.max(0, Math.min(100, ((Math.abs(cameraPosition.z) / 160) * 100)))}%` 
            }}
          />
        </div>
        <p className="text-white/50 text-xs text-center mt-1">
          Journey Progress: {purchasedUpgrades.filter(p => p).length}/{upgradeModels.length} Upgrades
        </p>
      </div>

      {/* Movement instructions */}
      <div className="absolute top-20 left-4 right-4 text-center pointer-events-none">
        <p className="text-white/70 text-sm font-medium">
          Swipe forward to explore • Tap upgrades to unlock
        </p>
      </div>

      {/* Upgrade Modal */}
      {selectedUpgrade && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedUpgrade(null);
            }
          }}
        >
          <Fantasy3DUpgradeModal
            upgradeName={selectedUpgrade.name}
            onClose={() => setSelectedUpgrade(null)}
            onPurchase={() => handleUpgradePurchase(selectedUpgrade)}
          />
        </div>
      )}
    </div>
  );
};
