import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group, Mesh } from 'three';
import { assetUrl } from '@/lib/utils';

interface UpgradeGateProps {
  position: [number, number, number];
  gateId: number;
  isUnlocked: boolean;
  requiredUpgrades: number;
  completedUpgrades: number;
  onInteract: () => void;
}

export const UpgradeGate: React.FC<UpgradeGateProps> = ({
  position,
  gateId,
  isUnlocked,
  requiredUpgrades,
  completedUpgrades,
  onInteract
}) => {
  const meshRef = useRef<Group>(null);
  const barrierRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Animate the gate's energy barrier
  useFrame((state) => {
    if (barrierRef.current && !isUnlocked) {
      // Pulsing energy barrier effect
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 0.7;
      const material = barrierRef.current.material as any;
      if (material && 'opacity' in material) {
        material.opacity = pulse;
      }
    }
  });

  const handleClick = (event: any) => {
    event.stopPropagation();
    if (isUnlocked) {
      onInteract();
    }
  };

  const getGateColor = () => {
    if (isUnlocked) return '#10B981'; // Green for unlocked
    return '#EF4444'; // Red for locked
  };

  const progressPercentage = Math.min((completedUpgrades / requiredUpgrades) * 100, 100);

  try {
    // Try to load a gate model, fallback to basic geometry
    const gateModel = (() => {
      try {
        const { scene } = useGLTF(assetUrl('assets/environment/AncientTree.glb'));
        return scene.clone();
      } catch {
        return null;
      }
    })();

    return (
      <group position={position}>
        {/* Main gate structure */}
        <group
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHovered(false);
          }}
          scale={hovered ? 1.05 : 1.0}
        >
          {gateModel ? (
            <primitive object={gateModel} scale={[3, 3, 3]} />
          ) : (
            // Fallback gate structure
            <>
              {/* Left pillar */}
              <mesh position={[-8, 3, 0]}>
                <cylinderGeometry args={[0.8, 1, 6]} />
                <meshLambertMaterial color="#4B5563" />
              </mesh>
              
              {/* Right pillar */}
              <mesh position={[8, 3, 0]}>
                <cylinderGeometry args={[0.8, 1, 6]} />
                <meshLambertMaterial color="#4B5563" />
              </mesh>
              
              {/* Top beam */}
              <mesh position={[0, 6, 0]}>
                <boxGeometry args={[16, 0.8, 1]} />
                <meshLambertMaterial color="#4B5563" />
              </mesh>
            </>
          )}
        </group>

        {/* Energy barrier (only when locked) */}
        {!isUnlocked && (
          <mesh
            ref={barrierRef}
            position={[0, 3, 0]}
          >
            <planeGeometry args={[16, 6]} />
            <meshBasicMaterial
              color={getGateColor()}
              transparent
              opacity={0.7}
            />
          </mesh>
        )}

        {/* Progress indicator */}
        <group position={[0, 7, 0]}>
          {/* Background bar */}
          <mesh position={[0, 0, 0.1]}>
            <planeGeometry args={[12, 0.5]} />
            <meshBasicMaterial color="#374151" />
          </mesh>
          
          {/* Progress bar */}
          <mesh position={[(-6 + (12 * progressPercentage / 100) / 2), 0, 0.2]}>
            <planeGeometry args={[12 * progressPercentage / 100, 0.4]} />
            <meshBasicMaterial color={getGateColor()} />
          </mesh>
        </group>

        {/* Gate lights */}
        {isUnlocked ? (
          <pointLight
            position={[0, 4, 2]}
            color="#10B981"
            intensity={3}
            distance={20}
          />
        ) : (
          <pointLight
            position={[0, 4, 2]}
            color="#EF4444"
            intensity={2}
            distance={15}
          />
        )}

        {/* Floating text with requirements */}
        {hovered && (
          <group position={[0, 8, 0]}>
            <mesh>
              <planeGeometry args={[8, 2]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.8} />
            </mesh>
          </group>
        )}
      </group>
    );
  } catch (error) {
    console.error('Error rendering gate:', error);
    return null;
  }
};

// Preload the gate model
try {
  useGLTF.preload(assetUrl('assets/environment/AncientTree.glb'));
} catch (error) {
  console.warn('Could not preload gate model:', error);
}