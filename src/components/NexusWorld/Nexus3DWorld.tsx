import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import CentralObelisk from './CentralObelisk';
import VendorStall from './VendorStall';
import FancyFence from './FancyFence';
import Terrain from './Terrain';
import CurvedPath from './CurvedPath';
import PlayerControls from './PlayerControls';
import BackgroundElements from './BackgroundElements';

const Nexus3DWorld: React.FC = () => (
  <Canvas camera={{ position: [0, 3, 8], fov: 60 }} style={{ height: '100%', width: '100%' }} shadows>
    <color attach="background" args={["#000"]} />
    <ambientLight intensity={0.6} />
    <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
    <Suspense fallback={null}>
      <Environment preset="sunset" />
      <BackgroundElements />
      <Terrain />
      <CurvedPath />
      <CentralObelisk />
      <VendorStall type="magic" color="#8a2be2" position={[-3, 0, 2]} />
      <VendorStall type="tech" color="#1e90ff" position={[3, 0, 2]} />
      <FancyFence />
      <PlayerControls />
    </Suspense>
  </Canvas>
);

export default Nexus3DWorld;
