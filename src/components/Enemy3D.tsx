
import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { Group, Vector3 } from 'three';

interface Enemy3DProps {
  modelUrl: string;
  position: [number, number, number];
  scale?: number;
  health: number;
  maxHealth: number;
  isMoving?: boolean;
  isDying?: boolean;
  onDeathComplete?: () => void;
}

export const Enemy3D: React.FC<Enemy3DProps> = ({
  modelUrl,
  position,
  scale = 1,
  health,
  maxHealth,
  isMoving = true,
  isDying = false,
  onDeathComplete
}) => {
  const groupRef = useRef<Group>(null);
  const [animationState, setAnimationState] = useState<'idle' | 'walking' | 'death'>('idle');
  
  // Load the GLB model
  const { scene, animations } = useGLTF(modelUrl);
  const { actions, mixer } = useAnimations(animations, groupRef);
  
  // Set initial animation
  useEffect(() => {
    if (isDying) {
      setAnimationState('death');
    } else if (isMoving) {
      setAnimationState('walking');
    } else {
      setAnimationState('idle');
    }
  }, [isMoving, isDying]);
  
  // Handle animation transitions
  useEffect(() => {
    if (!actions) return;
    
    // Stop all current animations
    Object.values(actions).forEach(action => action?.stop());
    
    // Play the appropriate animation
    const animationNames = {
      idle: ['Idle', 'idle', 'Rest', 'rest'],
      walking: ['Walk', 'walk', 'Run', 'run', 'Moving', 'moving'],
      death: ['Death', 'death', 'Die', 'die', 'Destroy', 'destroy']
    };
    
    const possibleNames = animationNames[animationState];
    let playedAnimation = false;
    
    for (const name of possibleNames) {
      if (actions[name]) {
        const action = actions[name];
        action.reset();
        action.setLoop(animationState === 'death' ? 2200 : 2201, Infinity); // LoopOnce for death, LoopRepeat for others
        action.play();
        playedAnimation = true;
        
        if (animationState === 'death') {
          // Handle death animation completion
          mixer?.addEventListener('finished', () => {
            if (onDeathComplete) {
              onDeathComplete();
            }
          });
        }
        break;
      }
    }
    
    // Fallback to first available animation if none found
    if (!playedAnimation && Object.keys(actions).length > 0) {
      const firstAction = Object.values(actions)[0];
      if (firstAction) {
        firstAction.reset();
        firstAction.play();
      }
    }
  }, [actions, animationState, mixer, onDeathComplete]);
  
  // Update mixer
  useFrame((state, delta) => {
    if (mixer) {
      mixer.update(delta);
    }
    
    // Add slight floating effect for non-ground enemies
    if (groupRef.current && !isDying) {
      const time = state.clock.elapsedTime;
      groupRef.current.position.y = position[1] + Math.sin(time * 2 + position[0]) * 0.1;
    }
  });
  
  // Calculate health bar opacity
  const healthPercentage = health / maxHealth;
  const showHealthBar = health < maxHealth && health > 0;
  
  return (
    <group ref={groupRef} position={position}>
      {/* 3D Enemy Model */}
      <primitive 
        object={scene.clone()} 
        scale={[scale, scale, scale]}
        rotation={[0, Math.PI, 0]}
      />
      
      {/* Health Bar (3D Billboard) */}
      {showHealthBar && (
        <group position={[0, scale * 2, 0]}>
          {/* Background bar */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[1.5, 0.2]} />
            <meshBasicMaterial color="#800000" transparent opacity={0.8} />
          </mesh>
          
          {/* Health bar */}
          <mesh position={[-(1.5 * (1 - healthPercentage)) / 2, 0, 0.01]}>
            <planeGeometry args={[1.5 * healthPercentage, 0.15]} />
            <meshBasicMaterial color="#ff4444" transparent opacity={0.9} />
          </mesh>
        </group>
      )}
      
      {/* Death effect particles */}
      {isDying && (
        <group>
          {[...Array(8)].map((_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 2,
                Math.random() * 2,
                (Math.random() - 0.5) * 2
              ]}
            >
              <sphereGeometry args={[0.05]} />
              <meshBasicMaterial color="#ff6b6b" transparent opacity={0.7} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

// Preload enemy models
const enemyModelUrls = [
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/BrainStem/glTF/BrainStem.gltf',
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/CesiumMan/glTF/CesiumMan.gltf',
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/RiggedSimple/glTF/RiggedSimple.gltf'
];

enemyModelUrls.forEach(url => {
  useGLTF.preload(url);
});
