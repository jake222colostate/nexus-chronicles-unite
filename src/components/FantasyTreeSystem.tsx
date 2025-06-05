
import { useGLTF, Instances, Instance } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from 'three';

interface FantasyTreeSystemProps {
  chunkCenterZ: number;
}

export default function FantasyTreeSystem({ chunkCenterZ }: FantasyTreeSystemProps) {
  const realistic = useGLTF(new URL('../../public/assets/realistic_tree.glb', import.meta.url).href);
  const pine = useGLTF(new URL('../../public/assets/pine_tree_218poly.glb', import.meta.url).href);

  // Find the mesh objects and extract geometry/material with proper type casting
  const realGeom = useMemo(() => {
    const mesh = realistic.scene.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh;
    return mesh?.geometry;
  }, [realistic.scene]);

  const realMat = useMemo(() => {
    const mesh = realistic.scene.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh;
    return mesh?.material;
  }, [realistic.scene]);

  const pineGeom = useMemo(() => {
    const mesh = pine.scene.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh;
    return mesh?.geometry;
  }, [pine.scene]);

  const pineMat = useMemo(() => {
    const mesh = pine.scene.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh;
    return mesh?.material;
  }, [pine.scene]);

  const trees = useMemo(() => {
    const output: { x: number; z: number; type: "real" | "pine" }[] = [];
    for (let i = 0; i < 20; i++) {
      const z = chunkCenterZ + Math.random() * 30;
      const x = 3 + Math.random() * 4;
      output.push({ x, z, type: "real" });
      output.push({ x: -x, z, type: "pine" });
    }
    return output;
  }, [chunkCenterZ]);

  // Return null if geometry/material not available yet
  if (!realGeom || !realMat || !pineGeom || !pineMat) {
    return null;
  }

  return (
    <>
      <Instances geometry={realGeom} material={realMat}>
        {trees
          .filter((t) => t.type === "real")
          .map((tree, i) => (
            <Instance
              key={`real-${i}`}
              position={[tree.x, 0, tree.z]}
              scale={[1, 1.2, 1]}
            />
          ))}
      </Instances>
      <Instances geometry={pineGeom} material={pineMat}>
        {trees
          .filter((t) => t.type === "pine")
          .map((tree, i) => (
            <Instance
              key={`pine-${i}`}
              position={[tree.x, 0, tree.z]}
              scale={[0.9, 1.3, 0.9]}
            />
          ))}
      </Instances>
    </>
  );
}

useGLTF.preload(new URL('../../public/assets/realistic_tree.glb', import.meta.url).href);
useGLTF.preload(new URL('../../public/assets/pine_tree_218poly.glb', import.meta.url).href);
