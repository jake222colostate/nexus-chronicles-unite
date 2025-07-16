import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, Sparkles, useTexture } from '@react-three/drei';
import * as THREE from 'three';

function CrystalObelisk() {
  const crystalRef = useRef<THREE.Group>(null);
  const waterRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.5;
    }
    if (waterRef.current) {
      waterRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group>
      {/* Detailed stone fountain base with carved edges */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.2, 2.2, 0.4, 32]} />
        <meshStandardMaterial color="#6b6b6b" roughness={0.8} />
      </mesh>
      
      {/* Inner stone rim */}
      <mesh position={[0, 0.25, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.8, 1.8, 0.3, 32]} />
        <meshStandardMaterial color="#7a7a7a" roughness={0.7} />
      </mesh>

      {/* Water surface */}
      <group ref={waterRef} position={[0, 0.45, 0]}>
        <mesh>
          <cylinderGeometry args={[1.7, 1.7, 0.02, 32]} />
          <meshStandardMaterial color="#4dd0e1" transparent opacity={0.7} />
        </mesh>
        {/* Water ripples */}
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 0.01, 32]} />
          <meshStandardMaterial color="#26c6da" transparent opacity={0.5} />
        </mesh>
      </group>

      {/* Crystal obelisk - multi-segmented */}
      <group ref={crystalRef} position={[0, 0.5, 0]}>
        {/* Base crystal segment */}
        <mesh position={[0, 0.8, 0]}>
          <coneGeometry args={[0.4, 1.2, 6]} />
          <meshStandardMaterial 
            color="#00e5ff" 
            emissive="#0088cc" 
            emissiveIntensity={0.3}
            transparent 
            opacity={0.9}
            roughness={0.1}
            metalness={0.1}
          />
        </mesh>
        
        {/* Middle crystal segment */}
        <mesh position={[0, 1.8, 0]}>
          <coneGeometry args={[0.3, 1.0, 6]} />
          <meshStandardMaterial 
            color="#00d4ff" 
            emissive="#0099dd" 
            emissiveIntensity={0.4}
            transparent 
            opacity={0.9}
            roughness={0.1}
            metalness={0.1}
          />
        </mesh>

        {/* Top crystal segment */}
        <mesh position={[0, 2.6, 0]}>
          <coneGeometry args={[0.2, 0.8, 6]} />
          <meshStandardMaterial 
            color="#00c4ff" 
            emissive="#00aaee" 
            emissiveIntensity={0.5}
            transparent 
            opacity={0.9}
            roughness={0.1}
            metalness={0.1}
          />
        </mesh>

        <Sparkles count={30} scale={3} size={3} color="#88e5ff" />
        <pointLight position={[0, 2, 0]} intensity={3} color="#88e5ff" distance={8} />
      </group>
    </group>
  );
}

function VendorStall({ position, canopyColor, item }: { position: [number, number, number]; canopyColor: string; item: 'coin' | 'gems'; }) {
  return (
    <group position={position}>
      {/* Wooden stall base platform */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.6, 1.4]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>

      {/* Wooden counter */}
      <mesh position={[0, 0.65, 0.5]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.1, 0.8]} />
        <meshStandardMaterial color="#a0522d" roughness={0.8} />
      </mesh>

      {/* Support posts */}
      {[[-0.8, 0.8], [0.8, 0.8], [-0.8, -0.2], [0.8, -0.2]].map(([x, z], i) => (
        <mesh key={i} position={[x, 1.0, z]} castShadow receiveShadow>
          <cylinderGeometry args={[0.06, 0.06, 2, 8]} />
          <meshStandardMaterial color="#654321" roughness={0.9} />
        </mesh>
      ))}

      {/* Fabric awning */}
      <mesh position={[0, 1.8, 0.3]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.05, 1.6]} />
        <meshStandardMaterial color={canopyColor} />
      </mesh>

      {/* Awning sides */}
      <mesh position={[0, 1.5, 1.0]} rotation={[Math.PI / 6, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.05, 0.8]} />
        <meshStandardMaterial color={canopyColor} />
      </mesh>

      {/* Display shelves */}
      <mesh position={[0, 0.85, 0.6]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.05, 0.6]} />
        <meshStandardMaterial color="#daa520" />
      </mesh>

      {/* Item display */}
      <group position={[0, 0.9, 0.6]}>
        {item === 'coin' ? (
          <>
            <mesh position={[0, 0.05, 0]} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.03, 16]} />
              <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0.2, 0.05, 0]} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.03, 16]} />
              <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[-0.2, 0.05, 0]} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.03, 16]} />
              <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
            </mesh>
          </>
        ) : (
          <>
            <mesh position={[0, 0.1, 0]} castShadow>
              <octahedronGeometry args={[0.2]} />
              <meshStandardMaterial color="#8b5cf6" emissive="#6a4c93" emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[0.25, 0.08, 0]} castShadow>
              <octahedronGeometry args={[0.15]} />
              <meshStandardMaterial color="#9c27b0" emissive="#7b1fa2" emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[-0.25, 0.08, 0]} castShadow>
              <octahedronGeometry args={[0.15]} />
              <meshStandardMaterial color="#673ab7" emissive="#512da8" emissiveIntensity={0.2} />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
}

function FenceRing() {
  const radius = 6;
  const segments = 20;
  return (
    <group>
      {Array.from({ length: segments }).map((_, i) => {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <group key={i} position={[x, 0, z]} rotation={[0, angle + Math.PI / 2, 0]}>
            {/* Fence post */}
            <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.15, 1.6, 0.15]} />
              <meshStandardMaterial color="#8b4513" roughness={0.9} />
            </mesh>
            {/* Horizontal rail */}
            <mesh position={[0, 0.8, 0.4]} castShadow receiveShadow>
              <boxGeometry args={[0.1, 0.1, 0.8]} />
              <meshStandardMaterial color="#8b4513" roughness={0.9} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function StonePath() {
  return (
    <group>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, 0.05, 3.5 - i * 1.0]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 0.15, 0.8]} />
          <meshStandardMaterial color="#daa520" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Trees() {
  const radius = 9;
  const treePositions = [
    [0, 0], [45, 0], [90, 0], [135, 0], [180, 0], [225, 0], [270, 0], [315, 0],
    [22.5, 1.5], [67.5, 1.5], [112.5, 1.5], [157.5, 1.5], [202.5, 1.5], [247.5, 1.5], [292.5, 1.5], [337.5, 1.5]
  ];
  
  return (
    <group>
      {treePositions.map(([angle, radiusOffset], i) => {
        const rad = (angle * Math.PI) / 180;
        const treeRadius = radius + radiusOffset;
        const x = Math.cos(rad) * treeRadius;
        const z = Math.sin(rad) * treeRadius;
        const treeHeight = 1.5 + Math.random() * 0.8;
        const trunkRadius = 0.15 + Math.random() * 0.1;
        
        return (
          <group key={i} position={[x, 0, z]}>
            {/* Tree trunk */}
            <mesh position={[0, treeHeight, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[trunkRadius * 0.8, trunkRadius, treeHeight * 2, 12]} />
              <meshStandardMaterial color="#8b4513" roughness={0.9} />
            </mesh>
            
            {/* Tree foliage - multiple layers for fullness */}
            <mesh position={[0, treeHeight * 1.8, 0]} castShadow receiveShadow>
              <icosahedronGeometry args={[1.8, 2]} />
              <meshStandardMaterial color="#32cd32" roughness={0.8} />
            </mesh>
            
            <mesh position={[0, treeHeight * 1.5, 0]} castShadow receiveShadow>
              <icosahedronGeometry args={[1.5, 2]} />
              <meshStandardMaterial color="#228b22" roughness={0.8} />
            </mesh>
            
            <mesh position={[0, treeHeight * 2.2, 0]} castShadow receiveShadow>
              <icosahedronGeometry args={[1.2, 2]} />
              <meshStandardMaterial color="#3cb371" roughness={0.8} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// Enhanced ground with grass texture
function EnhancedGround() {
  return (
    <group>
      {/* Main circular ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[12, 12, 0.2, 64]} />
        <meshStandardMaterial color="#4caf50" roughness={0.9} />
      </mesh>
      
      {/* Grass patches for detail */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const distance = 3 + Math.random() * 6;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        return (
          <mesh key={i} position={[x, 0.12, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <cylinderGeometry args={[0.8, 0.8, 0.02, 16]} />
            <meshStandardMaterial color="#66bb6a" roughness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
}

const SceneContent = () => (
  <group>
    <EnhancedGround />
    <StonePath />
    <CrystalObelisk />
    <VendorStall position={[-4, 0, 1]} canopyColor="#8b5cf6" item="coin" />
    <VendorStall position={[4, 0, 1]} canopyColor="#60a5fa" item="gems" />
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
