
import React from 'react';

interface FantasyGroundPlaneProps {
  realm: 'fantasy' | 'scifi';
}

export const FantasyGroundPlane: React.FC<FantasyGroundPlaneProps> = ({ realm }) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  return (
    <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[400, 400]} />
      <meshLambertMaterial color="#2d4a2b" />
    </mesh>
  );
};
