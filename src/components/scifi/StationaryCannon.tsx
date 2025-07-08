import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group } from 'three';

interface StationaryCannonProps {
  position: [number, number, number];
  health: number;
  maxHealth: number;
  onRepair?: () => void;
  onDestroy?: () => void;
  target?: Vector3;
}

export const StationaryCannon: React.FC<StationaryCannonProps> = ({ 
  position, 
  health, 
  maxHealth, 
  onRepair, 
  onDestroy,
  target 
}) => {
  const groupRef = useRef<Group>(null);
  const barrelRef = useRef<Group>(null);
  const [lastFired, setLastFired] = useState(0);
  
  const isDamaged = health < maxHealth;
  const isDestroyed = health <= 0;
  const healthPercent = health / maxHealth;

  // Rotate barrel towards target
  useFrame((state) => {
    if (barrelRef.current && target && !isDestroyed) {
      const cannonPos = new Vector3(...position);
      const direction = target.clone().sub(cannonPos).normalize();
      barrelRef.current.lookAt(target);
    }
  });

  const handleClick = () => {
    if (isDestroyed) {
      onRepair?.();
    }
  };

  return (
    <group ref={groupRef} position={position} onClick={handleClick}>
      {/* Platform base */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.2, 8]} />
        <meshStandardMaterial 
          color={isDestroyed ? "#444444" : "#2d3748"} 
          metalness={0.8} 
          roughness={0.3} 
        />
      </mesh>
      
      {/* Cannon base */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 0.3, 8]} />
        <meshStandardMaterial 
          color={isDestroyed ? "#333333" : "#4a5568"} 
          metalness={0.7} 
          roughness={0.4} 
        />
      </mesh>
      
      {/* Cannon barrel group */}
      <group ref={barrelRef} position={[0, 0.25, 0]}>
        {/* Main barrel */}
        <mesh position={[0, 0, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 1.2, 8]} />
          <meshStandardMaterial 
            color={isDestroyed ? "#222222" : "#1a202c"} 
            metalness={0.9} 
            roughness={0.2} 
          />
        </mesh>
        
        {/* Barrel tip */}
        <mesh position={[0, 0, 1.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.08, 0.1, 8]} />
          <meshStandardMaterial 
            color={isDestroyed ? "#111111" : "#0f1419"} 
            metalness={1.0} 
            roughness={0.1} 
          />
        </mesh>
        
        {/* Muzzle glow - only when not destroyed */}
        {!isDestroyed && (
          <pointLight 
            position={[0, 0, 1.5]} 
            color="#00ccff" 
            intensity={0.6} 
            distance={3}
            decay={2}
          />
        )}
      </group>
      
      {/* Health indicator */}
      <group position={[0, 0.8, 0]}>
        {/* Health bar background */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.6, 0.05, 0.02]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        
        {/* Health bar fill */}
        <mesh position={[(-0.6 + (0.6 * healthPercent)) / 2, 0, 0.01]} scale={[healthPercent, 1, 1]}>
          <boxGeometry args={[0.6, 0.04, 0.02]} />
          <meshStandardMaterial 
            color={healthPercent > 0.6 ? "#00ff00" : healthPercent > 0.3 ? "#ffff00" : "#ff0000"}
            emissive={healthPercent > 0.6 ? "#004400" : healthPercent > 0.3 ? "#444400" : "#440000"}
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
      
      {/* Damage effects */}
      {isDamaged && (
        <>
          {/* Smoke particles simulation */}
          <mesh position={[0.2, 0.3, 0.5]}>
            <sphereGeometry args={[0.1, 6, 6]} />
            <meshStandardMaterial 
              color="#666666" 
              transparent 
              opacity={0.3}
              emissive="#ff4400"
              emissiveIntensity={0.2}
            />
          </mesh>
          
          {/* Sparks */}
          <mesh position={[-0.1, 0.4, 0.3]}>
            <sphereGeometry args={[0.05, 4, 4]} />
            <meshStandardMaterial 
              color="#ffaa00" 
              emissive="#ff6600"
              emissiveIntensity={0.8}
            />
          </mesh>
        </>
      )}
      
      {/* Repair prompt when destroyed */}
      {isDestroyed && (
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial 
            color="#ff4444" 
            emissive="#ff0000"
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  );
};