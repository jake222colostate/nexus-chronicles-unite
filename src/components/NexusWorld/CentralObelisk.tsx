import React from 'react';

const CentralObelisk: React.FC = () => (
  <group position={[0, 2, 0]}>
    <mesh position={[0, 0, 0]}>
      <dodecahedronGeometry args={[0.5]} />
      <meshStandardMaterial color="#00e0ff" emissive="#00f0ff" metalness={0.3} roughness={0.2} />
    </mesh>
    <mesh position={[0, 1.2, 0]}>
      <coneGeometry args={[0.4, 1, 32]} />
      <meshStandardMaterial color="#aafaff" emissive="#55f6ff" metalness={0.2} />
    </mesh>
    <mesh position={[0, 2, 0]}>
      <octahedronGeometry args={[0.3]} />
      <meshStandardMaterial color="#ccffff" emissive="#88f2ff" />
    </mesh>
    <pointLight position={[0, 3.5, 0]} intensity={1.5} color="#88f2ff" distance={6} />
  </group>
);

export default CentralObelisk;
