
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Enhanced360Controller } from '../Enhanced360Controller';
import { ScifiDefenseSystem } from './ScifiDefenseSystem';
import { ScifiSpatialUpgradeSystem } from './ScifiSpatialUpgradeSystem';
import { Vector3 } from 'three';

interface ScifiTraversableWorldProps {
  gameState: any;
  onUpgradeClick: (upgradeId: string) => void;
  onMeteorDestroyed?: () => void;
  showTapEffect?: boolean;
  onTapEffectComplete?: () => void;
}

export const ScifiTraversableWorld: React.FC<ScifiTraversableWorldProps> = ({
  gameState,
  onUpgradeClick,
  onMeteorDestroyed,
  showTapEffect,
  onTapEffectComplete
}) => {
  const [playerPosition, setPlayerPosition] = useState<Vector3>(new Vector3(0, 2, 10));
  const [enemyPositions, setEnemyPositions] = useState<Vector3[]>([]);

  const handlePlayerPositionUpdate = useCallback((position: Vector3) => {
    setPlayerPosition(prev => {
      if (prev.distanceTo(position) > 0.5) {
        return position.clone();
      }
      return prev;
    });
  }, []);

  const handleEnemyPositionUpdate = useCallback((positions: Vector3[]) => {
    setEnemyPositions(positions);
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <Canvas
        className="opacity-100"
        dpr={[0.5, 1]}
        performance={{ min: 0.8 }}
        style={{ width: '375px', height: '667px' }}
        gl={{ 
          antialias: false, 
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
      >
        <PerspectiveCamera
          makeDefault
          position={[0, 2, 10]}
          fov={60}
          near={0.1}
          far={200}
          aspect={375 / 667}
        />

        <Enhanced360Controller
          position={[0, 2, 10]}
          onPositionChange={handlePlayerPositionUpdate}
          enemyPositions={enemyPositions}
          enemyRadius={1.5}
        />

        {/* Sci-fi lighting */}
        <ambientLight intensity={0.6} color="#ffffff" />
        <directionalLight position={[10, 10, 5]} intensity={0.8} color="#ffffff" />
        <pointLight position={[0, 10, 0]} intensity={0.5} color="#00ffff" />

        {/* Spatial upgrade system - distributed throughout the space */}
        <ScifiSpatialUpgradeSystem
          playerPosition={playerPosition}
          gameState={gameState}
          onUpgradeClick={onUpgradeClick}
        />

        {/* Enhanced defense system with more asteroids */}
        <ScifiDefenseSystem onMeteorDestroyed={onMeteorDestroyed} />

        {/* Space environment - simple starfield */}
        <mesh position={[0, 0, -100]}>
          <sphereGeometry args={[150, 32, 32]} />
          <meshBasicMaterial color="#000011" side={2} />
        </mesh>

        {/* Floating platforms for navigation reference */}
        {Array.from({ length: 20 }, (_, i) => {
          const x = (Math.random() - 0.5) * 200;
          const y = Math.random() * 20 - 5;
          const z = (Math.random() - 0.5) * 200;
          return (
            <mesh key={i} position={[x, y, z]}>
              <boxGeometry args={[2, 0.2, 2]} />
              <meshStandardMaterial color="#333366" />
            </mesh>
          );
        })}
      </Canvas>
    </div>
  );
};
