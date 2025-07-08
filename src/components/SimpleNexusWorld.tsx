import React from "react";
import { Canvas } from "@react-three/fiber";
import { NexusGround } from "./NexusGround";
import { NexusFirstPersonController } from "./NexusFirstPersonController";

/**
 * A lightweight 3D world containing only a floor and basic lights.
 * This is used when we want a minimal environment for testing or
 * when the full Nexus3DWorld is too heavy to load.
 */
export const SimpleNexusWorld: React.FC = () => (
  <Canvas
    camera={{ position: [0, 2, 5], fov: 60 }}
    style={{ height: "100%", width: "100%" }}
    onCreated={({ gl }) => gl.setClearColor("#000000")}
  >
    <ambientLight intensity={0.3} />
    <directionalLight position={[5, 10, 5]} intensity={0.5} />
    <NexusGround />
    <NexusFirstPersonController />
  </Canvas>
);
