import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

const Nexus3DWorld: React.FC = () => {
  console.log('Nexus3DWorld: Starting render');
  
  return (
    <Canvas camera={{ position: [0, 3, 8], fov: 60 }} style={{ height: '100%', width: '100%' }}>
      <color attach="background" args={["#001122"]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      
      <Suspense fallback={null}>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#00ff00" />
        </mesh>
      </Suspense>
    </Canvas>
  );
};

export default Nexus3DWorld;
