
import React, { useRef, useEffect } from 'react';
import { Group, Mesh, ConeGeometry, MeshStandardMaterial, Mesh as ThreeMesh } from 'three';
import { useThree } from '@react-three/fiber';

export const MountainWalls: React.FC = () => {
  const { scene } = useThree();
  const mountainsRef = useRef<Group[]>([]);

  useEffect(() => {
    const createMountain = (scale: number) => {
      const group = new Group();
      const main = new ThreeMesh(
        new ConeGeometry(8 * scale, 12 * scale, 8),
        new MeshStandardMaterial({ color: '#6B7280' })
      );
      const second = new ThreeMesh(
        new ConeGeometry(6 * scale, 10 * scale, 6),
        new MeshStandardMaterial({ color: '#4B5563' })
      );
      second.position.set(4 * scale, 0, 3 * scale);
      const third = new ThreeMesh(
        new ConeGeometry(5 * scale, 8 * scale, 6),
        new MeshStandardMaterial({ color: '#374151' })
      );
      third.position.set(-3 * scale, 0, -2 * scale);
      [main, second, third].forEach(m => {
        m.castShadow = true;
        m.receiveShadow = true;
      });
      group.add(main, second, third);
      return group;
    };

    // Clean up existing mountains
    mountainsRef.current.forEach(mountain => {
      scene.remove(mountain);
    });
    mountainsRef.current = [];

    const clonesPerSide = 8;
    const spacingZ = 15;
    const startZ = 20;

    for (let i = 0; i < clonesPerSide; i++) {
      const z = startZ - (i * spacingZ);

      const leftMountain = createMountain(3);
      leftMountain.position.set(-25, 0, z);
      leftMountain.scale.x *= -1;
      scene.add(leftMountain);
      mountainsRef.current.push(leftMountain);

      const rightMountain = createMountain(3);
      rightMountain.position.set(25, 0, z);
      scene.add(rightMountain);
      mountainsRef.current.push(rightMountain);
    }

    return () => {
      mountainsRef.current.forEach(mountain => {
        scene.remove(mountain);
      });
      mountainsRef.current = [];
    };
  }, [scene]);

  return null;
};

