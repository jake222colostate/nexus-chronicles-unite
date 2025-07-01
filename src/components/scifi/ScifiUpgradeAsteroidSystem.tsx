import React, { useMemo, useRef } from 'react';
import { Vector3, Group } from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { scifiUpgrades } from '../../data/ScifiUpgrades';

interface ScifiUpgradeAsteroidSystemProps {
  onUpgradeClick: (upgradeId: string) => void;
  purchasedUpgrades: string[];
  energyCredits: number;
}

export const ScifiUpgradeAsteroidSystem: React.FC<ScifiUpgradeAsteroidSystemProps> = ({
  onUpgradeClick,
  purchasedUpgrades,
  energyCredits
}) => {
  // Generate actual upgrade positions using real upgrade data
  const availableUpgrades = useMemo(() => {
    const upgradesWithPositions: Array<{
      upgrade: any;
      position: Vector3;
    }> = [];
    
    scifiUpgrades.slice(0, 8).forEach((upgrade, i) => {
      if (!purchasedUpgrades.includes(upgrade.id)) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 15 + (i % 2) * 5;
        const height = 3 + Math.sin(i * 0.8) * 2;
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = height;
        
        upgradesWithPositions.push({
          upgrade,
          position: new Vector3(x, y, z)
        });
      }
    });
    
    return upgradesWithPositions;
  }, [purchasedUpgrades]);

  const groupRef = useRef<Group>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.y = camera.position.y * 2;
    }
  });

  return (
    <group ref={groupRef}>
      {availableUpgrades.map(({ upgrade, position }) => (
        <group key={upgrade.id} position={position}>
          {/* 3D Upgrade Node */}
          <mesh
            onClick={() => onUpgradeClick(upgrade.id)}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'auto';
            }}
          >
            <boxGeometry args={[1.5, 1.5, 1.5]} />
            <meshStandardMaterial 
              color={energyCredits >= upgrade.cost ? '#00ff88' : '#ff4444'}
              emissive={energyCredits >= upgrade.cost ? '#004422' : '#442222'}
              emissiveIntensity={0.2}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          
          {/* Floating UI Label */}
          <Html 
            position={[0, 2, 0]}
            center
            transform
            occlude
            style={{
              pointerEvents: 'none',
              userSelect: 'none'
            }}
          >
            <div className="bg-background/90 backdrop-blur-sm border border-border rounded-lg p-2 text-center min-w-[120px]">
              <div className="text-sm font-semibold text-foreground">{upgrade.name}</div>
              <div className="text-xs text-muted-foreground">{upgrade.cost} Energy</div>
              <div className="text-xs text-primary">{upgrade.effect}</div>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
};