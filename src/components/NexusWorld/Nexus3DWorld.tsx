import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Movement controller component
function MovementController() {
  return (
    <OrbitControls
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={3}
      maxDistance={20}
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 2}
    />
  );
}

// Crystal obelisk with geometric fallbacks
function CrystalObelisk() {
  const crystalRef = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group>
      {/* Foundation base - much larger */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[45, 45, 3, 16]} />
        <meshStandardMaterial color="#666666" roughness={0.8} />
      </mesh>
      
      {/* Crystal obelisk - 10x bigger and grounded */}
      <group ref={crystalRef} position={[0, 15, 0]}>
        <mesh>
          <boxGeometry args={[10, 20, 10]} />
          <meshStandardMaterial color="#88e5ff" transparent opacity={0.8} />
        </mesh>
        <Sparkles count={300} scale={30} size={30} color="#88e5ff" />
        <pointLight position={[0, 20, 0]} intensity={30} color="#88e5ff" distance={80} />
      </group>
    </group>
  );
}

// Vendor stall with geometric shapes
function VendorStall({ position, canopyColor, item }: { position: [number, number, number]; canopyColor: string; item: 'coin' | 'gems'; }) {
  const itemGeometry = useMemo(() => {
    return item === 'coin' ? 
      <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} /> :
      <octahedronGeometry args={[0.4]} />;
  }, [item]);

  const itemColor = item === 'coin' ? '#ffd700' : '#9c27b0';

  return (
    <group position={position}>
      {/* Stall base */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2, 1, 2]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Canopy */}
      <mesh position={[0, 1.8, 0]}>
        <coneGeometry args={[1.5, 0.8, 8]} />
        <meshStandardMaterial color={canopyColor} />
      </mesh>
      
      {/* Item display */}
      <mesh position={[0, 1.2, 0]}>
        {itemGeometry}
        <meshStandardMaterial color={itemColor} />
      </mesh>
    </group>
  );
}

// Fence ring with boxes
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
          <mesh
            key={i}
            position={[x, 0.8, z]}
            rotation={[0, angle + Math.PI / 2, 0]}
            scale={[0.2, 1.5, 0.2]}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
        );
      })}
    </group>
  );
}

// Stone path
function StonePath() {
  return (
    <group>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh
          key={i}
          position={[0, 0.05, 3.5 - i * 1.0]}
          scale={[2.5, 0.15, 0.8]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#a0a0a0" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// Trees with simple geometry
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
        
        return (
          <group key={i} position={[x, 1.5, z]}>
            {/* Tree trunk */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
              <meshStandardMaterial color="#8b4513" />
            </mesh>
            
            {/* Tree foliage */}
            <mesh position={[0, 1.5, 0]}>
              <sphereGeometry args={[1.2, 8, 6]} />
              <meshStandardMaterial color="#32cd32" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// Ground plane
function EnhancedGround() {
  return (
    <group>
      {/* Main horizontal ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#4caf50" roughness={0.9} />
      </mesh>
      
      {/* Additional circular grass area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <circleGeometry args={[12, 64]} />
        <meshStandardMaterial color="#66bb6a" roughness={0.9} />
      </mesh>
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
  <Canvas camera={{ position: [0, 2, 8], fov: 75 }} shadows style={{ height: '100%', width: '100%' }}>
    <Suspense fallback={null}>
      {/* Enhanced lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />
      
      {/* Sky color */}
      <fog attach="fog" args={['#87CEEB', 20, 100]} />
      
      <SceneContent />
      
      {/* Movement controller */}
      <MovementController />
    </Suspense>
  </Canvas>
);

export default Nexus3DWorld;