import React, { useEffect, useRef } from 'react';
import { Group } from 'three';
import { Tree } from '@dgreenheck/ez-tree';

interface EZTreeProps {
  seed?: number;
  position?: [number, number, number];
}

export const EZTree: React.FC<EZTreeProps> = ({ seed = 1, position = [0, 0, 0] }) => {
  const group = useRef<Group>(null);

  useEffect(() => {
    const tree = new Tree();
    tree.options.seed = seed;
    tree.generate();
    if (group.current) {
      group.current.add(tree as unknown as Group);
    }
    return () => {
      if (group.current) {
        group.current.remove(tree as unknown as Group);
      }
    };
  }, [seed]);

  return <group ref={group} position={position} />;
};
