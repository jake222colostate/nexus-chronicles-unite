
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

// Upgrade data with GLB model URLs in zigzag layout
const upgradeModels = [
  { 
    name: 'Mana Altar', 
    description: 'Ancient stones that channel mystical energy',
    modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/mana_altar.glb',
    position: [-4, 0, -5] as [number, number, number], // Left side
    cost: 50
  },
  { 
    name: 'Magic Tree', 
    description: 'Enchanted tree pulsing with natural magic',
    modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/magic_tree.glb',
    position: [4, 0, -15] as [number, number, number], // Right side
    cost: 150
  },
  { 
    name: 'Arcane Lab', 
    description: 'Laboratory for magical research and experiments',
    modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/arcane_lab.glb',
    position: [-4, 0, -25] as [number, number, number], // Left side
    cost: 500
  },
  { 
    name: 'Crystal Tower', 
    description: 'Towering spire of crystallized magic',
    modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/crystal_tower.glb',
    position: [4, 0, -35] as [number, number, number], // Right side
    cost: 1500
  },
  { 
    name: 'Dream Gate', 
    description: 'Portal to mystical realms beyond',
    modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/dream_gate.glb',
    position: [-4, 0, -45] as [number, number, number], // Left side
    cost: 5000
  }
];

export const Fantasy3DUpgradeWorld: React.FC<Fantasy3DUpgradeWorldProps> = ({
  onUpgradeClick,
  showTapEffect,
  onTapEffectComplete
}) => {
  const [cameraPosition, setCameraPosition] = useState(new Vector3(0, 1.6, 0));
  const [purchasedUpgrades, setPurchasedUpgrades] = useState<boolean[]>([false, false, false, false, false]);
  const [upgradeCount, setUpgradeCount] = useState(0);

  const handlePositionChange = useCallback((position: Vector3) => {
    setCameraPosition(position);
  }, []);

  const handleUpgradeClick = useCallback((upgradeName: string, index: number) => {
    // Check if upgrade is unlocked (first upgrade or previous one purchased)
    if (index > 0 && !purchasedUpgrades[index - 1]) {
      console.log("Purchase the previous upgrade first!");
      return;
    }
    
    // Open upgrade modal
    onUpgradeClick(upgradeName);
  }, [purchasedUpgrades, onUpgradeClick]);

  const handleUpgradePurchase = useCallback((index: number) => {
    setPurchasedUpgrades(prev => {
      const newPurchased = [...prev];
      newPurchased[index] = true;
      return newPurchased;
    });
    
    setUpgradeCount(prev => prev + 1);
  }, []);

  // Check if upgrade is unlocked (first one or previous purchased)
  const isUpgradeUnlocked = (index: number): boolean => {
    return index === 0 || purchasedUpgrades[index - 1];
  };

  // Check if player is within interaction range of upgrade
  const isWithinRange = (upgradePosition: [number, number, number]): boolean => {
    const distance = cameraPosition.distanceTo(new Vector3(...upgradePosition));
    return distance <= 3.5;
  };

  const canMoveForward = cameraPosition.z > -50;

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
          scene.fog = new Fog('#1a1a2e', 8, 60);
        }}
      >
        <Suspense fallback={null}>
          {/* Enhanced First Person Controller */}
          <FirstPersonController
            position={[0, 1.6, 0]}
            onPositionChange={handlePositionChange}
            canMoveForward={canMoveForward}
          />

          {/* Enhanced lighting setup */}
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={0.6}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={60}
            shadow-camera-left={-15}
            shadow-camera-right={15}
            shadow-camera-top={15}
            shadow-camera-bottom={-15}
          />
          
          {/* Purple realm lighting for fantasy atmosphere */}
          <pointLight position={[-6, 8, -10]} intensity={0.4} color="#8b5cf6" />
          <pointLight position={[6, 8, -20]} intensity={0.4} color="#8b5cf6" />
          <pointLight position={[-6, 8, -30]} intensity={0.4} color="#8b5cf6" />
          <pointLight position={[6, 8, -40]} intensity={0.4} color="#8b5cf6" />

          {/* Environment and atmosphere */}
          <Environment preset="dawn" />

          {/* Enhanced ground plane with zigzag path markers */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -25]} receiveShadow>
            <planeGeometry args={[25, 60]} />
            <meshLambertMaterial color="#2a2a3e" />
          </mesh>

          {/* Path markers for guidance */}
          {Array.from({ length: 10 }, (_, i) => (
            <mesh key={i} position={[0, -0.4, -5 * i]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.3]} />
              <meshBasicMaterial color="#8b5cf6" transparent opacity={0.6} />
            </mesh>
          ))}

          {/* Ground shadows */}
          <ContactShadows 
            position={[0, -0.4, -25]} 
            opacity={0.4} 
            scale={25} 
            blur={2} 
            far={6} 
          />

          {/* Load and display GLB upgrade models in zigzag layout */}
          {upgradeModels.map((upgrade, index) => (
            <GLBModel
              key={upgrade.name}
              modelUrl={upgrade.modelUrl}
              name={upgrade.name}
              position={upgrade.position}
              onClick={() => handleUpgradeClick(upgrade.name, index)}
              isUnlocked={isUpgradeUnlocked(index)}
              isPurchased={purchasedUpgrades[index]}
              isWithinRange={isWithinRange(upgrade.position)}
            />
          ))}

          {/* Atmospheric particles for immersion */}
          {Array.from({ length: 20 }, (_, i) => {
            const x = (Math.random() - 0.5) * 20;
            const y = Math.random() * 10 + 2;
            const z = Math.random() * -50 - 5;
            return (
              <mesh key={i} position={[x, y, z]}>
                <sphereGeometry args={[0.02]} />
                <meshBasicMaterial color="#8b5cf6" transparent opacity={0.6} />
              </mesh>
            );
          })}
        </Suspense>
      </Canvas>

      {/* Enhanced movement instructions overlay */}
      <div className="absolute top-20 left-4 right-4 text-center pointer-events-none">
        <p className="text-white/80 text-sm font-medium">
          {canMoveForward ? "Walk forward to discover upgrades" : "You've reached the end of the path"}
        </p>
        <p className="text-purple-300/60 text-xs mt-1">
          Look left and right to spot upgrade nodes
        </p>
      </div>

      {/* Enhanced upgrade progress HUD */}
      <div className="absolute top-32 right-4 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-purple-400/30">
          <p className="text-white text-sm font-bold">Upgrades: {upgradeCount}/5</p>
          <div className="flex gap-1 mt-2">
            {purchasedUpgrades.map((purchased, index) => {
              const isUnlocked = isUpgradeUnlocked(index);
              return (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full border-2 ${
                    purchased 
                      ? 'bg-green-400 border-green-300' 
                      : isUnlocked 
                        ? 'bg-purple-400 border-purple-300' 
                        : 'bg-gray-600 border-gray-500'
                  }`}
                />
              );
            })}
          </div>
          <div className="text-xs text-white/60 mt-1 space-y-1">
            {upgradeModels.map((upgrade, index) => (
              <div key={index} className={`${purchasedUpgrades[index] ? 'text-green-400' : isUpgradeUnlocked(index) ? 'text-purple-300' : 'text-gray-500'}`}>
                {upgrade.name}: {upgrade.cost} shards
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Distance indicator for nearest upgrade */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-none">
        {upgradeModels.map((upgrade, index) => {
          const distance = cameraPosition.distanceTo(new Vector3(...upgrade.position));
          const isNearby = distance <= 5;
          const isUnlocked = isUpgradeUnlocked(index);
          
          if (!isNearby || !isUnlocked || purchasedUpgrades[index]) return null;
          
          return (
            <div key={index} className="bg-purple-900/80 backdrop-blur-sm rounded-lg p-2 mb-2 border border-purple-400/30">
              <p className="text-white text-sm font-bold">{upgrade.name}</p>
              <p className="text-purple-300 text-xs">Distance: {distance.toFixed(1)}m</p>
              {isWithinRange(upgrade.position) && (
                <p className="text-green-400 text-xs animate-pulse">Click to upgrade!</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
