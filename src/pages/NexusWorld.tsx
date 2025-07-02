import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box } from '@react-three/drei';
import { useInventoryStore } from '../stores/useInventoryStore';

const NexusWorld: React.FC = () => {
  const items = useInventoryStore((s) => s.items);
  return (
    <div className="w-full h-screen bg-black relative">
      <Canvas camera={{ position: [0, 5, 10] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />
        {items.map((item, idx) => (
          <Box key={item.id} args={[1, 1, 1]} position={[idx * 2, 0.5, 0]}>
            <meshStandardMaterial color="#8b5cf6" />
          </Box>
        ))}
      </Canvas>
      <div className="absolute top-4 left-4">
        <a href="/" className="text-white bg-purple-600 px-3 py-2 rounded">Back</a>
      </div>
    </div>
  );
};

export default NexusWorld;
