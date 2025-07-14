import React from 'react';

interface FenceSegmentProps {
  position: [number, number, number];
  rotation?: [number, number, number];
}

const FenceSegment: React.FC<FenceSegmentProps> = ({ position, rotation = [0,0,0] }) => {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <boxGeometry args={[1,0.4,0.1]} />
      <meshStandardMaterial color="#8b4513" />
    </mesh>
  );
};

export default FenceSegment;
