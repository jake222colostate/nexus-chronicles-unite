import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { assetUrl } from '@/lib/utils';
import * as THREE from 'three';

const Scene = () => {
  const { scene: crystal } = useGLTF(assetUrl('/models/crystal_obelisk.glb'));
  const { scene: goldVendor } = useGLTF(assetUrl('/models/vendor_gold.glb'));
  const { scene: gemVendor } = useGLTF(assetUrl('/models/vendor_gems.glb'));
  const { scene: tree } = useGLTF(assetUrl('/models/tree.glb'));
  const { scene: fencePost } = useGLTF(assetUrl('/models/fence_post.glb'));
  const { scene: pathTile } = useGLTF(assetUrl('/models/path_tile.glb'));

  const crystalRef = useRef();

  useFrame((_, delta) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.5;
    }
  });

  const treePositions = [
    [-6, 0, -4],
    [6, 0, -4],
    [-6, 0, 6],
    [6, 0, 6],
    [-4, 0, -6],
    [4, 0, -6],
    [-4, 0, 8],
    [4, 0, 8]
  ];

  return (
    <group>
      {/* Ground */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <boxGeometry args={[20, 20, 0.2]} />
        <meshStandardMaterial color="#4caf50" />
      </mesh>

      {/* Path */}
      {Array.from({ length: 6 }).map((_, i) => (
        <primitive
          key={i}
          object={pathTile.clone()}
          position={[0, 0, 3 - i]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={1.2}
        />
      ))}

      {/* Crystal */}
      <primitive
        ref={crystalRef}
        object={crystal.clone()}
        position={[0, 0, 0]}
        scale={1.5}
      />

      {/* Vendors */}
      <primitive object={goldVendor.clone()} position={[-3, 0, 2]} scale={1.2} />
      <primitive object={gemVendor.clone()} position={[3, 0, 2]} scale={1.2} />

      {/* Trees */}
      {treePositions.map((pos, idx) => (
        <primitive key={idx} object={tree.clone()} position={pos} scale={2} />
      ))}

      {/* Fence Posts */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        return (
          <primitive
            key={i}
            object={fencePost.clone()}
            position={[Math.cos(angle) * 7, 0, Math.sin(angle) * 7]}
            rotation={[0, angle + Math.PI / 2, 0]}
            scale={1.2}
          />
        );
      })}
    </group>
  );
};

const NexusWorldScene = () => {
  return (
    <div className="w-full h-full relative">
      <Canvas shadows camera={{ position: [0, 6, 10], fov: 50 }}>
        <color attach="background" args={["#a0d8ef"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <Scene />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
      <div className="pointer-events-none absolute top-2 left-2 text-white font-bold flex gap-4">
        <span>🧙 2.6M</span>
        <span>⚡ 7.1M</span>
        <span>💎 145</span>
      </div>
      <div className="pointer-events-none absolute top-2 w-full text-center text-white font-bold text-xl">
        Nexus World
      </div>
      <div className="absolute bottom-4 w-full flex justify-center gap-4 text-white font-bold">
        <button className="px-4 py-2 bg-purple-600/80 rounded-lg pointer-events-auto">Fantasy</button>
        <button className="px-4 py-2 bg-yellow-600/80 rounded-lg pointer-events-auto">Nexus W</button>
        <button className="px-4 py-2 bg-cyan-600/80 rounded-lg pointer-events-auto">Sci-Fi</button>
      </div>
    </div>
  );
};

export default NexusWorldScene;
