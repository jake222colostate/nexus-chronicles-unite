
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';

interface Enemy3DProps {
  enemy: {
    id: string;
    x: number;
    y: number;
    z: number;
    health: number;
    maxHealth: number;
    type: 'slime' | 'goblin' | 'orc';
    speed: number;
    size: number;
  };
  modelPath?: string;
  onClick: () => void;
}

const enemyColors = {
  slime: '#22c55e',    // Green - basic enemy
  goblin: '#ef4444',   // Red - fast enemy  
  orc: '#8b5cf6'       // Purple - tank enemy
};

const enemyShapes = {
  slime: 'sphere',
  goblin: 'box',
  orc: 'octahedron'
};

export const Enemy3D: React.FC<Enemy3DProps> = ({ enemy, modelPath, onClick }) => {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const [loadError, setLoadError] = useState(!modelPath); // Start with placeholder if no model path

  // Walking animation
  useFrame((state) => {
    if (groupRef.current) {
      // Bobbing walk animation
      const walkBob = Math.sin(state.clock.elapsedTime * 4 + enemy.x) * 0.1;
      groupRef.current.position.y = enemy.y + walkBob;
      
      // Slight rotation for movement feel
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }

    if (meshRef.current && hovered) {
      // Hover scale effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.1;
      meshRef.current.scale.setScalar(enemy.size * scale);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(enemy.size);
    }
  });

  const handleClick = (event: any) => {
    event.stopPropagation();
    onClick();
  };

  const renderPlaceholder = () => {
    const color = enemyColors[enemy.type];
    const shape = enemyShapes[enemy.type];

    return (
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {shape === 'sphere' && <sphereGeometry args={[1, 16, 16]} />}
        {shape === 'box' && <boxGeometry args={[1.5, 1.5, 1.5]} />}
        {shape === 'octahedron' && <octahedronGeometry args={[1.2]} />}
        <meshLambertMaterial 
          color={color} 
          transparent 
          opacity={hovered ? 0.8 : 0.9}
        />
      </mesh>
    );
  };

  // Health percentage for bar
  const healthPercent = (enemy.health / enemy.maxHealth) * 100;

  return (
    <group 
      ref={groupRef}
      position={[enemy.x, enemy.y, enemy.z]}
    >
      {/* Main enemy model - placeholder for now */}
      {renderPlaceholder()}
      
      {/* Health bar above enemy */}
      <group position={[0, 2, 0]}>
        {/* Health bar background */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[2, 0.3]} />
          <meshBasicMaterial color="#440000" transparent opacity={0.8} />
        </mesh>
        
        {/* Health bar fill */}
        <mesh position={[-(100 - healthPercent) / 100, 0, 0.02]} scale={[healthPercent / 100, 1, 1]}>
          <planeGeometry args={[2, 0.25]} />
          <meshBasicMaterial 
            color={healthPercent > 50 ? "#22c55e" : healthPercent > 25 ? "#eab308" : "#ef4444"} 
            transparent 
            opacity={0.9} 
          />
        </mesh>
      </group>

      {/* Damage indicator */}
      {enemy.health < enemy.maxHealth && (
        <mesh position={[0, 2.5, 0]}>
          <sphereGeometry args={[0.1]} />
          <meshBasicMaterial color="#ff6b6b" />
        </mesh>
      )}
    </group>
  );
};
