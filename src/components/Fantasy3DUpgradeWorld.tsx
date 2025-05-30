
import React, { Suspense, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, Fog } from '@react-three/drei';
import { Vector3 } from 'three';
import { GLBModel } from './GLBModelLoader';
import { FirstPersonController } from './FirstPersonController';

interface Fantasy3DUpgradeWorldProps {
  onUpgradeClick: (upgradeName: string) => void;
  showTapEffect?: boolean;
  onTapEffectComplete?: () => void;
}

// Upgrade data with GLB model URLs
const upgradeModels = [
  { 
    name: 'Mana Altar', 
    description: 'Ancient stones that channel mystical energy',
    modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/mana_altar.glb',
    position: [0, 0, 0] as [number, number, number],
    cost: 50
  },
  { 
    name: 'Magic Tree', 
    description: 'Enchanted tree pulsing with natural magic',
    modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/magic_tree.glb',
    position: [0, 0, -12] as [number, number, number],
    cost: 150
  },
  { 
    name: 'Arcane Lab', 
    description: 'Laboratory for magical research and experiments',
    modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/arcane_lab.glb',
    position: [0, 0, -24] as [number, number, number],
    cost: 500
  },
  { 
    name: 'Crystal Tower', 
    description: 'Towering spire of crystallized magic',
    modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/crystal_tower.glb',
    position: [0, 0, -36] as [number, number, number],
    cost: 1500
  },
  { 
    name: 'Dream Gate', 
    description: 'Portal to mystical realms beyond',
    modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/dream_gate.glb',
    position: [0, 0, -48] as [number, number, number],
    cost: 5000
  }
];

export const Fantasy3DUpgradeWorld: React.FC<Fantasy3DUpgradeWorldProps> = ({
  onUpgradeClick,
  showTapEffect,
  onTapEffectComplete
}) => {
  const [cameraPosition, setCameraPosition] = useState(new Vector3(0, 1.6, 0));
  const [unlockedUpgrades, setUnlockedUpgrades] = useState([true, false, false, false, false]);
  const [purchasedUpgrades, setPurchasedUpgrades] = useState<boolean[]>([false, false, false, false, false]);

  const handlePositionChange = useCallback((position: Vector3) => {
    setCameraPosition(position);
  }, []);

  const handleUpgradeClick = useCallback((upgradeName: string, index: number) => {
    if (!unlockedUpgrades[index]) {
      // Show tooltip for locked upgrade
      console.log("Purchase the previous upgrade first!");
      return;
    }
    
    // Open upgrade modal
    onUpgradeClick(upgradeName);
  }, [unlockedUpgrades, onUpgradeClick]);

  const handleUpgradePurchase = useCallback((index: number) => {
    // Mark as purchased and unlock next upgrade
    setPurchasedUpgrades(prev => {
      const newPurchased = [...prev];
      newPurchased[index] = true;
      return newPurchased;
    });
    
    setUnlockedUpgrades(prev => {
      const newUnlocked = [...prev];
      if (index + 1 < newUnlocked.length) {
        newUnlocked[index + 1] = true;
      }
      return newUnlocked;
    });
  }, []);

  // Check if player is within interaction range of upgrade
  const isWithinRange = (upgradePosition: [number, number, number]): boolean => {
    const distance = cameraPosition.distanceTo(new Vector3(...upgradePosition));
    return distance <= 2.5;
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
      >
        <Suspense fallback={null}>
          {/* First Person Controller */}
          <FirstPersonController
            position={[0, 1.6, 0]}
            onPositionChange={handlePositionChange}
            canMoveForward={canMoveForward}
          />

          {/* Lighting setup */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={0.8}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <pointLight position={[-5, 5, 5]} intensity={0.5} color="#8b5cf6" />

          {/* Environment and atmosphere */}
          <Environment preset="dawn" />
          <Fog attach="fog" args={['#1a1a2e', 5, 50]} />

          {/* Ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -25]} receiveShadow>
            <planeGeometry args={[20, 60]} />
            <meshLambertMaterial color="#2a2a3e" />
          </mesh>

          {/* Ground shadows */}
          <ContactShadows 
            position={[0, -0.4, -25]} 
            opacity={0.3} 
            scale={20} 
            blur={2} 
            far={4} 
          />

          {/* Load and display GLB upgrade models */}
          {upgradeModels.map((upgrade, index) => (
            <GLBModel
              key={upgrade.name}
              modelUrl={upgrade.modelUrl}
              name={upgrade.name}
              position={upgrade.position}
              onClick={() => handleUpgradeClick(upgrade.name, index)}
              isUnlocked={unlockedUpgrades[index]}
              isWithinRange={isWithinRange(upgrade.position)}
            />
          ))}

          {/* Particle effects for atmosphere */}
          <mesh position={[0, 5, -25]}>
            <sphereGeometry args={[0.05]} />
            <meshBasicMaterial color="#8b5cf6" transparent opacity={0.6} />
          </mesh>
        </Suspense>
      </Canvas>

      {/* Movement instructions overlay */}
      <div className="absolute top-20 left-4 right-4 text-center pointer-events-none">
        <p className="text-white/70 text-sm">
          {canMoveForward ? "Tap screen or press W to walk forward" : "You've reached the end"}
        </p>
      </div>

      {/* Upgrade status indicator */}
      <div className="absolute top-32 right-4 pointer-events-none">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
          <p className="text-white text-xs">Upgrades Unlocked:</p>
          <div className="flex gap-1 mt-1">
            {unlockedUpgrades.map((unlocked, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  purchasedUpgrades[index] 
                    ? 'bg-green-400' 
                    : unlocked 
                      ? 'bg-yellow-400' 
                      : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
