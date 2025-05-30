
import React, { Suspense, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { Vector3, Fog } from 'three';
import { GLBModel } from './GLBModelLoader';
import { FirstPersonController } from './FirstPersonController';

interface Fantasy3DUpgradeWorldProps {
  onUpgradeClick: (upgradeName: string) => void;
  showTapEffect?: boolean;
  onTapEffectComplete?: () => void;
}

// Enhanced upgrade data with proper GitHub URLs and zigzag layout
const upgradeModels = [
  { 
    name: 'Mystic Fountain', 
    description: 'Ancient stones that channel mystical energy from flowing waters',
    modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb',
    position: [-3, 0, -8] as [number, number, number], // Left side
    cost: 50,
    scale: 1.0
  },
  { 
    name: 'Crystal Grove', 
    description: 'Enchanted crystals that amplify magical resonance',
    modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb',
    position: [3, 0, -16] as [number, number, number], // Right side
    cost: 150,
    scale: 1.1
  },
  { 
    name: 'Arcane Sanctum', 
    description: 'Sacred chamber where ancient magic is studied and preserved',
    modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_03.glb',
    position: [-3.5, 0, -24] as [number, number, number], // Left side
    cost: 500,
    scale: 1.2
  },
  { 
    name: 'Celestial Spire', 
    description: 'Towering monument that pierces the veil between realms',
    modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_04.glb',
    position: [3.5, 0, -32] as [number, number, number], // Right side
    cost: 1500,
    scale: 1.3
  },
  { 
    name: 'Nexus Gateway', 
    description: 'Portal to infinite dimensions of pure magical energy',
    modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_05.glb',
    position: [-4, 0, -40] as [number, number, number], // Left side
    cost: 5000,
    scale: 1.4
  },
  { 
    name: 'Dragon\'s Heart', 
    description: 'The beating heart of an ancient dragon, source of primal fire',
    modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_06.glb',
    position: [4, 0, -48] as [number, number, number], // Right side
    cost: 15000,
    scale: 1.5
  },
  { 
    name: 'Void Obelisk', 
    description: 'Monolith that channels the power of the cosmic void',
    modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_07.glb',
    position: [-4.5, 0, -56] as [number, number, number], // Left side
    cost: 50000,
    scale: 1.6
  }
];

export const Fantasy3DUpgradeWorld: React.FC<Fantasy3DUpgradeWorldProps> = ({
  onUpgradeClick,
  showTapEffect,
  onTapEffectComplete
}) => {
  const [cameraPosition, setCameraPosition] = useState(new Vector3(0, 1.6, 0));
  const [purchasedUpgrades, setPurchasedUpgrades] = useState<boolean[]>(Array(upgradeModels.length).fill(false));
  const [currency, setCurrency] = useState(10000); // Demo currency

  const handlePositionChange = useCallback((position: Vector3) => {
    setCameraPosition(position);
  }, []);

  const handleUpgradeClick = useCallback((upgradeName: string, index: number) => {
    // Check if upgrade is unlocked (first upgrade or previous one purchased)
    if (index > 0 && !purchasedUpgrades[index - 1]) {
      console.log("Purchase the previous upgrade first!");
      return;
    }
    
    // Check if player is within interaction range
    const upgradePosition = upgradeModels[index].position;
    const distance = cameraPosition.distanceTo(new Vector3(...upgradePosition));
    if (distance > 4) {
      console.log("Move closer to interact with this upgrade!");
      return;
    }
    
    // Open upgrade modal
    onUpgradeClick(upgradeName);
  }, [purchasedUpgrades, onUpgradeClick, cameraPosition]);

  const handleUpgradePurchase = useCallback((index: number) => {
    const upgrade = upgradeModels[index];
    if (currency >= upgrade.cost) {
      setPurchasedUpgrades(prev => {
        const newPurchased = [...prev];
        newPurchased[index] = true;
        return newPurchased;
      });
      setCurrency(prev => prev - upgrade.cost);
    }
  }, [currency]);

  // Check if upgrade is unlocked (first one or previous purchased)
  const isUpgradeUnlocked = (index: number): boolean => {
    return index === 0 || purchasedUpgrades[index - 1];
  };

  // Check if player is within interaction range of upgrade
  const isWithinRange = (upgradePosition: [number, number, number]): boolean => {
    const distance = cameraPosition.distanceTo(new Vector3(...upgradePosition));
    return distance <= 4;
  };

  // Player can move forward unless they've reached the very end
  const canMoveForward = cameraPosition.z > -65;

  // Find nearest visible upgrades for motivation
  const getVisibleUpgrades = () => {
    return upgradeModels.filter((upgrade, index) => {
      const distance = cameraPosition.distanceTo(new Vector3(...upgrade.position));
      return distance <= 15 && (isUpgradeUnlocked(index) || distance <= 8);
    });
  };

  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        dpr={[1, 2]}
        camera={{ 
          position: [0, 1.6, 0], 
          fov: 75,
          near: 0.1,
          far: 100
        }}
        shadows
        gl={{ antialias: true, alpha: true }}
        onCreated={({ scene }) => {
          scene.fog = new Fog('#0f0f23', 10, 70);
        }}
      >
        <Suspense fallback={null}>
          {/* Enhanced First Person Controller */}
          <FirstPersonController
            position={[0, 1.6, 0]}
            onPositionChange={handlePositionChange}
            canMoveForward={canMoveForward}
          />

          {/* Enhanced fantasy lighting setup */}
          <ambientLight intensity={0.3} color="#1a1a2e" />
          <directionalLight
            position={[5, 12, 5]}
            intensity={0.7}
            color="#e6e6fa"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={70}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          
          {/* Enhanced purple realm lighting for fantasy atmosphere */}
          <pointLight position={[-6, 10, -15]} intensity={0.8} color="#8b5cf6" distance={20} />
          <pointLight position={[6, 10, -25]} intensity={0.8} color="#c084fc" distance={20} />
          <pointLight position={[-6, 10, -35]} intensity={0.8} color="#8b5cf6" distance={20} />
          <pointLight position={[6, 10, -45]} intensity={0.8} color="#c084fc" distance={20} />
          <pointLight position={[-6, 10, -55]} intensity={0.8} color="#8b5cf6" distance={20} />

          {/* Dynamic lighting around upgrades */}
          {upgradeModels.map((upgrade, index) => {
            const isUnlocked = isUpgradeUnlocked(index);
            const isPurchased = purchasedUpgrades[index];
            const distance = cameraPosition.distanceTo(new Vector3(...upgrade.position));
            
            if (distance > 15) return null;
            
            return (
              <pointLight
                key={`glow-${index}`}
                position={[upgrade.position[0], upgrade.position[1] + 3, upgrade.position[2]]}
                intensity={isPurchased ? 1.2 : isUnlocked ? 1.5 : 0.3}
                color={isPurchased ? "#10b981" : isUnlocked ? "#c084fc" : "#6b7280"}
                distance={10}
                decay={1.5}
              />
            );
          })}

          {/* Environment */}
          <Environment preset="dawn" />

          {/* Enhanced mystical ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -35]} receiveShadow>
            <planeGeometry args={[30, 80]} />
            <meshLambertMaterial color="#1a1a2e" />
          </mesh>

          {/* Mystical path markers */}
          {Array.from({ length: 15 }, (_, i) => (
            <mesh key={i} position={[0, -0.4, -4 * i - 2]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.4]} />
              <meshBasicMaterial color="#8b5cf6" transparent opacity={0.5} />
            </mesh>
          ))}

          {/* Enhanced ground shadows */}
          <ContactShadows 
            position={[0, -0.4, -35]} 
            opacity={0.6} 
            scale={30} 
            blur={2.5} 
            far={8} 
          />

          {/* Load GLB upgrade models with performance optimization */}
          {upgradeModels.map((upgrade, index) => {
            const distance = cameraPosition.distanceTo(new Vector3(...upgrade.position));
            // Only render models that are reasonably close for performance
            if (distance > 20) return null;
            
            return (
              <GLBModel
                key={upgrade.name}
                modelUrl={upgrade.modelUrl}
                name={upgrade.name}
                position={upgrade.position}
                scale={upgrade.scale}
                onClick={() => handleUpgradeClick(upgrade.name, index)}
                isUnlocked={isUpgradeUnlocked(index)}
                isPurchased={purchasedUpgrades[index]}
                isWithinRange={isWithinRange(upgrade.position)}
                cost={upgrade.cost}
                canAfford={currency >= upgrade.cost}
              />
            );
          })}

          {/* Enhanced atmospheric particles */}
          {Array.from({ length: 40 }, (_, i) => {
            const x = (Math.random() - 0.5) * 25;
            const y = Math.random() * 12 + 2;
            const z = Math.random() * -65 - 5;
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

      {/* Enhanced movement instructions */}
      <div className="absolute top-20 left-4 right-4 text-center pointer-events-none">
        <p className="text-white/70 text-sm font-medium">
          Walk forward to discover mystical upgrades
        </p>
        <p className="text-purple-300/50 text-xs mt-1">
          Use W/S or swipe to move • Look around to explore
        </p>
      </div>

      {/* Currency display */}
      <div className="absolute top-4 right-4 pointer-events-none">
        <div className="bg-purple-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-purple-400/40">
          <p className="text-yellow-400 text-sm font-bold">{currency.toLocaleString()} Nexus Shards</p>
        </div>
      </div>

      {/* Dynamic contextual interaction hints */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-none max-w-sm">
        {upgradeModels.map((upgrade, index) => {
          const distance = cameraPosition.distanceTo(new Vector3(...upgrade.position));
          const isNearby = distance <= 6;
          const isUnlocked = isUpgradeUnlocked(index);
          const isPurchased = purchasedUpgrades[index];
          const isInRange = isWithinRange(upgrade.position);
          
          if (!isNearby || isPurchased) return null;
          
          if (!isUnlocked) {
            return (
              <div key={index} className="bg-red-900/70 backdrop-blur-sm rounded-lg p-3 mb-2 border border-red-400/30 text-center">
                <p className="text-red-300 text-sm font-bold">🔒 {upgrade.name}</p>
                <p className="text-red-200/80 text-xs">Purchase previous upgrade first</p>
              </div>
            );
          }
          
          return (
            <div key={index} className="bg-purple-900/80 backdrop-blur-sm rounded-lg p-3 mb-2 border border-purple-400/40 text-center">
              <p className="text-white text-sm font-bold">✨ {upgrade.name}</p>
              <p className="text-purple-200 text-xs">{upgrade.description}</p>
              <p className="text-yellow-400 text-xs font-bold mt-1">{upgrade.cost.toLocaleString()} Shards</p>
              {isInRange ? (
                <p className="text-green-400 text-xs animate-pulse mt-1">Tap to view upgrade!</p>
              ) : (
                <p className="text-white/60 text-xs mt-1">Move closer to interact</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-sm rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
            style={{ 
              width: `${Math.max(0, Math.min(100, ((Math.abs(cameraPosition.z) / 65) * 100)))}%` 
            }}
          />
        </div>
        <p className="text-white/50 text-xs text-center mt-1">
          Journey Progress: {purchasedUpgrades.filter(p => p).length}/{upgradeModels.length} Upgrades
        </p>
      </div>
    </div>
  );
};
