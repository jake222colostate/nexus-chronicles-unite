import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function CrystalObelisk() {
  const { scene: crystal } = useGLTF('/models/crystal_obelisk.glb');
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
        <primitive object={crystal.clone()} scale={1.5} />
        <Sparkles count={20} scale={2} size={2} color="#88e5ff" />
        <pointLight position={[0, 1.5, 0]} intensity={2} color="#88e5ff" distance={6} />
      </group>
    </group>
  );
}

function VendorStall({ position, canopyColor, item }: { position: [number, number, number]; canopyColor: string; item: 'coin' | 'gems'; }) {
  const { scene: stallScene } = useGLTF('/models/gem_crate.glb');
  const { scene: coin } = useGLTF('/models/gold_coin.glb');
  const { scene: gems } = useGLTF('/models/gem_crate.glb');

  const itemScene = item === 'coin' ? coin : gems;

  const stall = useMemo(() => {
    const clone = stallScene.clone();
    clone.traverse((c: any) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
        if (c.material) {
          c.material = c.material.clone();
          (c.material as THREE.MeshStandardMaterial).color = new THREE.Color(canopyColor);
        }
      }
    });
    return clone;
  }, [stallScene, canopyColor]);

  return (
    <group position={position}>
      <primitive object={stall} scale={1.2} />
      <primitive object={itemScene.clone()} position={[0, 0.8, 0]} scale={item === 'coin' ? 1.5 : 1.2} />
    </group>
  );
}

function FenceRing() {
  const { scene } = useGLTF('/models/fence.glb');
  const radius = 5.5;
  const segments = 16;
  return (
    <group>
      {Array.from({ length: segments }).map((_, i) => {
        const angle = (i / segments) * Math.PI * 2;
        return (
          <primitive
            key={i}
            object={scene.clone()}
            position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
            rotation={[0, angle + Math.PI / 2, 0]}
            scale={1.1}
          />
        );
      })}
    </group>
  );
}

function StonePath() {
  const { scene } = useGLTF('/models/stone_tile.glb');
  return (
    <group>
      {Array.from({ length: 6 }).map((_, i) => (
        <primitive key={i} object={scene.clone()} position={[0, 0.05, 2 - i * 1.2]} scale={1.4} />
      ))}
    </group>
  );
}

function Trees() {
  const { scene } = useGLTF('/assets/pine_tree_218poly.glb');
  const radius = 8;
  return (
    <group>
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <primitive
            key={i}
            object={scene.clone()}
            position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
            scale={2}
          />
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
