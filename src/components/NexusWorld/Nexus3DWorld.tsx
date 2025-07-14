import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import CentralObelisk from './CentralObelisk';
import VendorStall from './VendorStall';
import SandboxGrid from './SandboxGrid';
import FenceSegment from './FenceSegment';
import BackgroundElements from './BackgroundElements';

interface Nexus3DWorldProps {
  onTileSelect?: (x:number,z:number) => void;
}

const Nexus3DWorld: React.FC<Nexus3DWorldProps> = ({ onTileSelect }) => {
  const [gridSize] = useState(6);

  const fencePositions = Array.from({length:16}).map((_,i)=>{
    const angle = (i/16)*Math.PI*2;
    const radius = gridSize/2 + 3;
    return [Math.cos(angle)*radius,0,Math.sin(angle)*radius] as [number,number,number];
  });

  return (
    <Canvas camera={{ position: [0, 8, 10], fov: 50 }} style={{ height: '100%', width: '100%' }} shadows>
      <ambientLight intensity={0.6} />
      <hemisphereLight intensity={0.6} groundColor="#ffffff" />
      <Suspense fallback={null}>
        <BackgroundElements />
        <CentralObelisk />
        <VendorStall type="magic" color="#8a2be2" position={[-4,0,0]} />
        <VendorStall type="tech" color="#1e90ff" position={[4,0,0]} />
        <SandboxGrid position={[0,0,4]} size={gridSize} onTileClick={(x,z)=>onTileSelect?.(x,z)} />
        {fencePositions.map((pos,i)=> (
          <FenceSegment key={i} position={pos} rotation={[0,(i/16)*Math.PI*2,0]} />
        ))}
      </Suspense>
      <OrbitControls enablePan={false} enableZoom={false} />
    </Canvas>
  );
};

export default Nexus3DWorld;
