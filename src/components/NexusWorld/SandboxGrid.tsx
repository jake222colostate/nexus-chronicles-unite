import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface SandboxGridProps {
  position: [number, number, number];
  size: number;
  onTileClick: (x: number, z: number) => void;
}

const SandboxGrid: React.FC<SandboxGridProps> = ({ position, size, onTileClick }) => {
  const [hovered, setHovered] = useState<{x:number,z:number}|null>(null);
  const gridRef = useRef<Mesh>(null);
  const tileSize = 1;
  const half = Math.floor(size/2);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (gridRef.current && (gridRef.current.material as any)) {
      (gridRef.current.material as any).opacity = 0.5 + Math.sin(t*2)*0.1;
    }
  });

  return (
    <group position={position}>
      {/* base */}
      <mesh position={[0,-0.05,0]} receiveShadow>
        <boxGeometry args={[size+0.5,0.1,size+0.5]} />
        <meshStandardMaterial color="#7ecf6b" />
      </mesh>
      {/* grid */}
      <mesh ref={gridRef} rotation={[-Math.PI/2,0,0]} position={[0,0.001,0]}>
        <planeGeometry args={[size,size,size,size]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.6} wireframe />
      </mesh>
      {Array.from({length:size*size}).map((_,idx)=>{
        const x = idx%size - half;
        const z = Math.floor(idx/size)-half;
        const isHover = hovered?.x===x && hovered?.z===z;
        return (
          <mesh
            key={`${x}-${z}`}
            position={[x*tileSize,0.02,z*tileSize]}
            onPointerEnter={()=>setHovered({x,z})}
            onPointerLeave={()=>setHovered(null)}
            onClick={()=>onTileClick(x,z)}
          >
            <planeGeometry args={[0.9,0.9]} />
            <meshStandardMaterial color={isHover?"#bde5a8":"#a0d68a"} transparent opacity={0.8} />
          </mesh>
        );
      })}
    </group>
  );
};

export default SandboxGrid;
