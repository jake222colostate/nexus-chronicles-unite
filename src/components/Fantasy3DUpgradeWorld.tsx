
import React, { Suspense, useState, useCallback, useEffect } from 'react';
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

// Updated upgrades with only working model URLs
const createUpgradeData = (): UpgradeData[] => {
  const baseUpgrades = [
    { name: 'Mystic Fountain', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-3, 0, -6] as [number, number, number], scale: 1.0 },
    { name: 'Crystal Grove', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb', position: [3, 0, -12] as [number, number, number], scale: 1.1 },
    { name: 'Arcane Sanctum', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-4, 0, -18] as [number, number, number], scale: 1.2 },
    { name: 'Nexus Gateway', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_05.glb', position: [4, 0, -24] as [number, number, number], scale: 1.3 },
    { name: 'Temporal Altar', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-4.5, 0, -30] as [number, number, number], scale: 1.4 },
    { name: 'Phoenix Roost', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb', position: [4.5, 0, -36] as [number, number, number], scale: 1.5 },
    { name: 'Ethereal Nexus', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-5, 0, -42] as [number, number, number], scale: 1.6 },
    { name: 'Infinity Well', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_05.glb', position: [5, 0, -48] as [number, number, number], scale: 1.7 },
    { name: 'Reality Prism', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-5.5, 0, -54] as [number, number, number], scale: 1.8 },
    { name: 'Astral Crown', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb', position: [5.5, 0, -60] as [number, number, number], scale: 1.9 },
    { name: 'Omni Core', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-6, 0, -66] as [number, number, number], scale: 2.0 },
    { name: 'Eternal Beacon', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_05.glb', position: [6, 0, -72] as [number, number, number], scale: 2.1 },
    { name: 'Transcendent Gate', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-6.5, 0, -78] as [number, number, number], scale: 2.2 },
    { name: 'Primordial Engine', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb', position: [6.5, 0, -84] as [number, number, number], scale: 2.3 },
    { name: 'Universal Codex', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb', position: [-7, 0, -90] as [number, number, number], scale: 2.4 },
    { name: 'Omega Singularity', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_05.glb', position: [0, 0, -96] as [number, number, number], scale: 2.5 }
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
  onTapEffectComplete
}) => {
  const [cameraPosition, setCameraPosition] = useState(new Vector3(0, 1.6, 0));
  const [upgrades, setUpgrades] = useState<UpgradeData[]>(createUpgradeData());
  const [currentMana, setCurrentMana] = useState(100);
  const [totalManaPerSecond, setTotalManaPerSecond] = useState(0);
  const [selectedUpgrade, setSelectedUpgrade] = useState<UpgradeData | null>(null);
  const [showInsufficientMana, setShowInsufficientMana] = useState(false);

  const handlePositionChange = useCallback((position: Vector3) => {
    setCameraPosition(position);
  }, []);

  const handleUpgradeClick = useCallback((upgrade: UpgradeData) => {
    console.log(`Clicked upgrade: ${upgrade.name}`);
    console.log(`Camera position:`, cameraPosition);
    console.log(`Upgrade position:`, upgrade.position);
    
    // Check if player is within interaction range (increased range for better UX)
    const distance = cameraPosition.distanceTo(new Vector3(...upgrade.position));
    console.log(`Distance to ${upgrade.name}: ${distance.toFixed(2)}`);
    
    if (distance > 8) { // Increased from 6 to 8 for better UX
      console.log("Move closer to interact with this upgrade!");
      return;
    }
    
    setSelectedUpgrade(upgrade);
  }, [cameraPosition]);

  const handleUpgradePurchase = useCallback((upgrade: UpgradeData) => {
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

  // Check if player is within interaction range of upgrade (increased range)
  const isWithinRange = (upgradePosition: [number, number, number]): boolean => {
    const distance = cameraPosition.distanceTo(new Vector3(...upgradePosition));
    return distance <= 8; // Increased from 6 to 8
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
          far: 200
        }}
        shadows
        gl={{ antialias: true, alpha: true }}
        onCreated={({ scene }) => {
          scene.fog = new Fog('#0f0f23', 15, 120);
        }}
      >
        <Suspense fallback={null}>
          <FirstPersonController
            position={[0, 1.6, 0]}
            onPositionChange={handlePositionChange}
            canMoveForward={canMoveForward}
          />

          {/* Enhanced fantasy lighting setup */}
          <ambientLight intensity={0.4} color="#1a1a2e" />
          <directionalLight
            position={[8, 15, 8]}
            intensity={0.8}
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
          {Array.from({ length: 8 }, (_, i) => (
            <pointLight 
              key={i}
              position={[(i % 2 === 0 ? -6 : 6), 8, -12 - (i * 12)]} 
              intensity={0.8} 
              color="#8b5cf6" 
              distance={25} 
            />
          ))}

          <Environment preset="dawn" />

          {/* Extended mystical ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -50]} receiveShadow>
            <planeGeometry args={[40, 120]} />
            <meshLambertMaterial color="#1a1a2e" />
          </mesh>

          {/* Mystical path markers */}
          {Array.from({ length: 20 }, (_, i) => (
            <mesh key={i} position={[0, -0.4, -5 - (i * 5)]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.4]} />
              <meshBasicMaterial color="#8b5cf6" transparent opacity={0.5} />
            </mesh>
          ))}

          <ContactShadows 
            position={[0, -0.4, -50]} 
            opacity={0.6} 
            scale={40} 
            blur={2.5} 
            far={10} 
          />

          {/* Load GLB upgrade models with working URLs only */}
          {upgrades.map((upgrade) => {
            const distance = cameraPosition.distanceTo(new Vector3(...upgrade.position));
            if (distance > 30) return null; // Performance optimization
            
            console.log(`Rendering upgrade: ${upgrade.name} at position:`, upgrade.position);
            
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

          {/* Enhanced atmospheric particles */}
          {Array.from({ length: 40 }, (_, i) => {
            const x = (Math.random() - 0.5) * 35;
            const y = Math.random() * 15 + 2;
            const z = Math.random() * -100 - 5;
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
          <div className="text-yellow-400 text-lg font-bold">{formatNumber(currentMana)} Mana</div>
          <div className="text-purple-300 text-sm">{formatNumber(totalManaPerSecond)}/sec</div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-sm rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
            style={{ 
              width: `${Math.max(0, Math.min(100, ((Math.abs(cameraPosition.z) / 100) * 100)))}%` 
            }}
          />
        </div>
        <p className="text-white/50 text-xs text-center mt-1">
          Journey Progress: {upgrades.filter(u => u.unlocked).length}/{upgrades.length} Upgrades
        </p>
      </div>

      {/* Movement instructions */}
      <div className="absolute top-20 left-4 right-4 text-center pointer-events-none">
        <p className="text-white/70 text-sm font-medium">
          Use WASD to move around, look around with mouse, get close and click upgrades to unlock
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

      {/* Enhanced Upgrade Modal with proper positioning */}
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
