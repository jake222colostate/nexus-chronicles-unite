import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { NexusSpaceEnvironment } from './NexusSpaceEnvironment';
import { MapEditorElementRenderer } from './MapEditor/MapEditorElementRenderer';
import { useMapEditorStore } from '../stores/useMapEditorStore';

interface NexusWorldProps {
  showTapEffect?: boolean;
  onTapEffectComplete?: () => void;
}

export const NexusWorld: React.FC<NexusWorldProps> = ({
  showTapEffect,
  onTapEffectComplete
}) => {
  const { isEditorActive } = useMapEditorStore();

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 8, 12], fov: 60 }}
        shadows
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        {/* Environment */}
        <NexusSpaceEnvironment />
        
        {/* Map Editor Elements */}
        <MapEditorElementRenderer />

        {/* Controls - only active in map editor mode */}
        {isEditorActive && (
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxDistance={50}
            minDistance={5}
            target={[0, 0, 0]}
          />
        )}
      </Canvas>

      {/* Nexus-themed overlay effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 via-purple-900/10 to-blue-900/20" />
        
        {/* Space particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-indigo-300 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};