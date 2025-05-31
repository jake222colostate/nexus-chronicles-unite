
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

export const Enemy3D: React.FC<Enemy3DProps> = ({ enemy, onClick }) => {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  // Walking animation
  useFrame((state) => {
    if (groupRef.current) {
      // Bobbing walk animation
      const walkBob = Math.sin(state.clock.elapsedTime * 4 + enemy.x) * 0.1;
      groupRef.current.position.y = enemy.y + walkBob;
      
      // Slight rotation for movement feel
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      
      // Update position to match enemy data
      groupRef.current.position.x = enemy.x;
      groupRef.current.position.z = enemy.z;
    }

    if (meshRef.current && hovered) {
      // Hover scale effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.1;
      meshRef.current.scale.setScalar(enemy.size * scale);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(enemy.size);
    }
  });

  const handlePointerDown = (event: any) => {
    event.stopPropagation();
    console.log(`Enemy ${enemy.id} clicked!`);
    onClick();
  };

  const handlePointerOver = (event: any) => {
    event.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (event: any) => {
    event.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  const renderEnemyModel = () => {
    const color = enemyColors[enemy.type];

    return (
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {/* 3D Enemy body - more detailed than simple box */}
        <group>
          {/* Main body */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.8, 2.2, 1.6]} />
            <meshLambertMaterial 
              color={color} 
              transparent 
              opacity={hovered ? 0.8 : 0.9}
            />
          </mesh>
          
          {/* Head */}
          <mesh position={[0, 1.5, 0]}>
            <sphereGeometry args={[0.6]} />
            <meshLambertMaterial 
              color={color} 
              transparent 
              opacity={hovered ? 0.8 : 0.9}
            />
          </mesh>
          
          {/* Eyes */}
          <mesh position={[-0.2, 1.6, 0.5]}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.2, 1.6, 0.5]}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          
          {/* Eye pupils */}
          <mesh position={[-0.2, 1.6, 0.55]}>
            <sphereGeometry args={[0.05]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          <mesh position={[0.2, 1.6, 0.55]}>
            <sphereGeometry args={[0.05]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </group>
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
      {/* Main enemy model */}
      {renderEnemyModel()}
      
      {/* Health bar above enemy */}
      <group position={[0, 3, 0]}>
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
        <mesh position={[0, 3.5, 0]}>
          <sphereGeometry args={[0.15]} />
          <meshBasicMaterial color="#ff6b6b" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
};
