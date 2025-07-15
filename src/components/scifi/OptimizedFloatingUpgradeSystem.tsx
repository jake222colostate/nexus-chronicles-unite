import React, { useState, useMemo, useRef } from 'react';
import { Vector3, Group, InstancedMesh, Matrix4, Color } from 'three';
import { useFrame } from '@react-three/fiber';
import { ScifiUpgradeModal } from './ScifiUpgradeModal';

interface FloatingUpgradeSystemProps {
  energyCredits: number;
  onPurchaseUpgrade: (upgradeId: string) => void;
  purchasedUpgrades: string[];
}

export const OptimizedFloatingUpgradeSystem: React.FC<FloatingUpgradeSystemProps> = ({
  energyCredits,
  onPurchaseUpgrade,
  purchasedUpgrades
}) => {
  const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null);
  const instancedMeshRef = useRef<InstancedMesh>(null);
  const groupRef = useRef<Group>(null);
  
  // Reduced from 100 to 20 for better performance
  const upgradeCount = 20;
  
  // Generate upgrade positions once
  const upgradePositions = useMemo(() => {
    const positions: Array<{id: string, position: Vector3, color: Color}> = [];
    
    for (let i = 0; i < upgradeCount; i++) {
      const angle = (i / upgradeCount) * Math.PI * 2;
      const radius = 20 + (i % 3) * 10;
      const height = 2 + Math.sin(i * 0.5) * 2;
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = height;
      
      // Generate colors for variety
      const colors = [
        new Color('#00ffff'),
        new Color('#0088ff'),
        new Color('#ff00ff'),
        new Color('#00ff88'),
        new Color('#ffff00')
      ];
      
      positions.push({
        id: `upgrade-${i}`,
        position: new Vector3(x, y, z),
        color: colors[i % colors.length]
      });
    }
    
    return positions;
  }, [upgradeCount]);

  // Use single useFrame for all animations
  useFrame((state) => {
    if (!instancedMeshRef.current || !groupRef.current) return;
    
    const time = state.clock.elapsedTime;
    const matrix = new Matrix4();
    
    upgradePositions.forEach((upgrade, i) => {
      const floatingY = upgrade.position.y + Math.sin(time * 2 + upgrade.position.x) * 0.1;
      const rotation = time * 0.5;
      
      matrix.makeRotationY(rotation);
      matrix.setPosition(upgrade.position.x, floatingY, upgrade.position.z);
      matrix.scale(new Vector3(0.4, 0.4, 0.4));
      
      instancedMeshRef.current!.setMatrixAt(i, matrix);
      instancedMeshRef.current!.setColorAt(i, upgrade.color);
    });
    
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    if (instancedMeshRef.current.instanceColor) {
      instancedMeshRef.current.instanceColor.needsUpdate = true;
    }
  });

  const handleClick = (event: any) => {
    // Simple click handling - just open first upgrade for demo
    if (!purchasedUpgrades.includes('upgrade-0')) {
      setSelectedUpgrade('upgrade-0');
    }
  };

  const handlePurchase = (upgradeId: string) => {
    onPurchaseUpgrade(upgradeId);
    setSelectedUpgrade(null);
  };

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={instancedMeshRef}
        args={[undefined, undefined, upgradeCount]}
        onClick={handleClick}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          emissive="#0066cc"
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
          roughness={0.1}
          metalness={0.8}
        />
      </instancedMesh>
      
      {selectedUpgrade && (
        <ScifiUpgradeModal
          upgradeId={selectedUpgrade}
          energyCredits={energyCredits}
          onPurchase={handlePurchase}
          onClose={() => setSelectedUpgrade(null)}
        />
      )}
    </group>
  );
};