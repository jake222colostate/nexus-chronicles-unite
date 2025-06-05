import { useGLTF, Instances, Instance } from "@react-three/drei";
import { useMemo } from "react";

interface FantasyTreeSystemProps {
  chunkCenterZ: number;
}

export default function FantasyTreeSystem({ chunkCenterZ }: FantasyTreeSystemProps) {
  const realistic = useGLTF("/assets/realistic_tree.glb");
  const pine = useGLTF("/assets/pine_tree_218poly.glb");

  const realGeom = realistic.scene.children[0].geometry;
  const realMat = realistic.scene.children[0].material;
  const pineGeom = pine.scene.children[0].geometry;
  const pineMat = pine.scene.children[0].material;

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

useGLTF.preload("/assets/realistic_tree.glb");
useGLTF.preload("/assets/pine_tree_218poly.glb");
