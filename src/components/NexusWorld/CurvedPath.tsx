import React, { useMemo } from 'react';
import * as THREE from 'three';

const CurvedPath: React.FC = () => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-2, -2);
    s.quadraticCurveTo(0, 0, 2, -2);
    return s;
  }, []);

  const settings = useMemo(
    () => ({ depth: 0.05, bevelEnabled: true, bevelSize: 0.02, bevelSegments: 2 }),
    []
  );

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <extrudeGeometry args={[shape, settings]} />
      <meshStandardMaterial color="#e0c478" />
    </mesh>
  );
};

export default CurvedPath;
