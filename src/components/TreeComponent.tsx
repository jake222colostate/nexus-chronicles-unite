
import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface TreeComponentProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export const TreeComponent: React.FC<TreeComponentProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1]
}) => {
  // GLB assets disabled - returning null to disable tree rendering
  return null;
};

// GLB assets disabled - Preloading disabled
// useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/UpdatedModels/main/tree_draco.glb');
// console.log('TreeComponent: Preloading Draco-compressed tree model');
