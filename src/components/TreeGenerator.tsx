import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { EZTree } from './EZTree';

interface TreeGeneratorProps {
  position?: [number, number, number];
}

export const TreeGenerator: React.FC<TreeGeneratorProps> = ({ position = [0, 0, 0] }) => {
  const [seed, setSeed] = useState(1);

  const generate = () => {
    setSeed(Math.floor(Math.random() * 100000));
  };

  return (
    <group position={position}>
      <EZTree seed={seed} />
      <Html position={[0, 2, 0]}>
        <button onClick={generate} style={{ padding: '4px 8px' }}>Generate Tree</button>
      </Html>
    </group>
  );
};

