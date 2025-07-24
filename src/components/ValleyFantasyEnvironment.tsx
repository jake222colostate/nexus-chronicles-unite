import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ValleyFantasyEnvironmentProps {
  playerPosition: THREE.Vector3;
}

export const ValleyFantasyEnvironment: React.FC<ValleyFantasyEnvironmentProps> = ({ playerPosition }) => {
  const { scene } = useThree();

  // Setup valley atmosphere
  useEffect(() => {
    scene.fog = new THREE.Fog(0x87CEEB, 30, 120);
    scene.background = new THREE.Color(0x87CEEB);
  }, [scene]);

  return (
    <group name="ValleyFantasyEnvironment">
      {/* Brown dirt path segments extending forward */}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh
          key={`path-${i}`}
          position={[0, 0.1, i * 10 - 50]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[6, 10]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      ))}

      {/* Purple/dark terrain on sides of path */}
      {Array.from({ length: 20 }, (_, i) => (
        <group key={`terrain-${i}`}>
          {/* Left side terrain */}
          <mesh
            position={[-8, 0.05, i * 10 - 50]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#6A4C93" />
          </mesh>
          {/* Right side terrain */}
          <mesh
            position={[8, 0.05, i * 10 - 50]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#6A4C93" />
          </mesh>
        </group>
      ))}

      {/* Close valley mountains on both sides */}
      {Array.from({ length: 10 }, (_, i) => (
        <group key={`mountains-${i}`}>
          {/* Left mountain wall */}
          <mesh
            position={[-20, 8, i * 20 - 50]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[8, 16, 20]} />
            <meshStandardMaterial color="#4A5568" />
          </mesh>
          {/* Right mountain wall */}
          <mesh
            position={[20, 8, i * 20 - 50]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[8, 16, 20]} />
            <meshStandardMaterial color="#4A5568" />
          </mesh>
        </group>
      ))}

      {/* Additional mountain layers for depth */}
      {Array.from({ length: 8 }, (_, i) => (
        <group key={`far-mountains-${i}`}>
          {/* Left far mountains */}
          <mesh
            position={[-35, 12, i * 25 - 50]}
            castShadow
          >
            <boxGeometry args={[10, 24, 25]} />
            <meshStandardMaterial color="#2D3748" />
          </mesh>
          {/* Right far mountains */}
          <mesh
            position={[35, 12, i * 25 - 50]}
            castShadow
          >
            <boxGeometry args={[10, 24, 25]} />
            <meshStandardMaterial color="#2D3748" />
          </mesh>
        </group>
      ))}

      {/* Occasional trees on purple terrain */}
      {Array.from({ length: 12 }, (_, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * (12 + Math.random() * 4);
        const z = i * 15 - 30 + Math.random() * 10;
        
        return (
          <group key={`tree-${i}`} position={[x, 0, z]}>
            {/* Tree trunk */}
            <mesh position={[0, 1, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.3, 2]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* Tree foliage */}
            <mesh position={[0, 2.5, 0]} castShadow>
              <sphereGeometry args={[1.2, 8, 8]} />
              <meshStandardMaterial color="#2E7D32" />
            </mesh>
          </group>
        );
      })}

      {/* Valley lighting */}
      <directionalLight
        position={[10, 20, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      
      <ambientLight intensity={0.3} />
    </group>
  );
};