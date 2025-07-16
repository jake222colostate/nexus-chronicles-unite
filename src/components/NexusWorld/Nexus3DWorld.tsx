import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function CrystalObelisk() {
  const crystalRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group>
      {/* Simple fountain base using basic geometry */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.3, 16]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <cylinderGeometry args={[1.2, 1.2, 0.1, 16]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
      <group ref={crystalRef} position={[0, 1.2, 0]}>
        <mesh>
          <octahedronGeometry args={[0.8]} />
          <meshStandardMaterial color="#88e5ff" emissive="#44aaff" emissiveIntensity={0.3} />
        </mesh>
        <Sparkles count={20} scale={2} size={2} color="#88e5ff" />
        <pointLight position={[0, 1.5, 0]} intensity={2} color="#88e5ff" distance={6} />
      </group>
    </group>
  );
}

function VendorStall({ position, canopyColor, item }: { position: [number, number, number]; canopyColor: string; item: 'coin' | 'gems'; }) {
  return (
    <group position={position}>
      {/* Stall base platform */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1.8, 0.5, 1]} />
        <meshStandardMaterial color="#6e3b1e" />
      </mesh>

      {/* Arched roof */}
      <mesh position={[0, 1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.2, 16, 32, Math.PI]} />
        <meshStandardMaterial color={canopyColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Support beams */}
      {[[-0.9, -0.25], [0.9, -0.25]].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.2, z]}>
          <cylinderGeometry args={[0.05, 0.05, 2, 12]} />
          <meshStandardMaterial color="#3a1e0f" />
        </mesh>
      ))}

      {/* Item display */}
      <mesh position={[0, 0.6, 0.5]}>
        {item === 'coin' ? (
          <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
        ) : (
          <octahedronGeometry args={[0.3]} />
        )}
        <meshStandardMaterial color={item === 'coin' ? "#ffd700" : "#8b5cf6"} />
      </mesh>
    </group>
  );
}

function FenceRing() {
  const radius = 5.5;
  const segments = 16;
  return (
    <group>
      {Array.from({ length: segments }).map((_, i) => {
        const angle = (i / segments) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * radius, 0.75, Math.sin(angle) * radius]}
            rotation={[0, angle + Math.PI / 2, 0]}
          >
            <boxGeometry args={[0.2, 1.5, 0.2]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
        );
      })}
    </group>
  );
}

function StonePath() {
  return (
    <group>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[0, 0.05, 2 - i * 1.2]}>
          <boxGeometry args={[2, 0.1, 1]} />
          <meshStandardMaterial color="#7a7a7a" />
        </mesh>
      ))}
    </group>
  );
}

function Trees() {
  const radius = 8;
  return (
    <group>
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
            {/* Tree trunk */}
            <mesh position={[0, 1, 0]}>
              <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
              <meshStandardMaterial color="#8b4513" />
            </mesh>
            {/* Tree foliage */}
            <mesh position={[0, 2.5, 0]}>
              <coneGeometry args={[1.5, 3, 8]} />
              <meshStandardMaterial color="#228b22" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

const SceneContent = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <cylinderGeometry args={[5, 5, 0.5, 32]} />
      <meshStandardMaterial color="#4caf50" />
    </mesh>
    <StonePath />
    <CrystalObelisk />
    <VendorStall position={[-3, 0, 2]} canopyColor="#8b5cf6" item="coin" />
    <VendorStall position={[3, 0, 2]} canopyColor="#60a5fa" item="gems" />
    <FenceRing />
    <Trees />
  </group>
);

const Nexus3DWorld: React.FC = () => (
  <Canvas camera={{ position: [0, 4, 8], fov: 50 }} shadows style={{ height: '100%', width: '100%' }}>
    <Suspense fallback={null}>
      <Stage adjustCamera intensity={0.6} shadows="contact" environment="sunset">
        <SceneContent />
      </Stage>
      <OrbitControls enableZoom={false} />
    </Suspense>
  </Canvas>
);

export default Nexus3DWorld;
