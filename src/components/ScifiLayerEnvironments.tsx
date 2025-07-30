import React, { useMemo } from 'react';
import { useScifiLayerStore } from '@/stores/useScifiLayerStore';
import { SCIFI_LAYERS } from '@/data/SciFiUpgradeSystem';
import { Sphere, Box, Cylinder, Torus, Octahedron } from '@react-three/drei';
import { Vector3 } from 'three';

export const ScifiLayerEnvironments: React.FC = () => {
  const { currentLayer } = useScifiLayerStore();

  // Generate layer-specific environmental elements
  const getLayerEnvironment = (layerNum: number) => {
    const layerData = SCIFI_LAYERS[layerNum];
    if (!layerData) return null;

    const baseAltitude = layerData.altitudeThreshold / 10; // Convert to camera space
    const elements = [];

    switch (layerNum) {
      case 1: // Lower Orbit - Simple atmospheric stations
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          elements.push(
            <group key={`layer1-${i}`} position={[
              Math.cos(angle) * 25, 
              baseAltitude + Math.random() * 3, 
              Math.sin(angle) * 25
            ]}>
              <Box args={[2, 1, 4]} material-color="#3b82f6" material-wireframe />
              <pointLight color="#60a5fa" intensity={0.3} distance={15} />
            </group>
          );
        }
        break;

      case 2: // Debris Field - Scattered debris and wreckage
        for (let i = 0; i < 15; i++) {
          elements.push(
            <group key={`layer2-${i}`} position={[
              (Math.random() - 0.5) * 50,
              baseAltitude + (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 50
            ]} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}>
              <Octahedron args={[0.5 + Math.random() * 2]} material-color="#8b5cf6" material-wireframe />
              {Math.random() > 0.7 && <pointLight color="#a78bfa" intensity={0.2} distance={10} />}
            </group>
          );
        }
        break;

      case 3: // Solar Wind Zone - Solar collectors and energy streams
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          elements.push(
            <group key={`layer3-${i}`} position={[
              Math.cos(angle) * 20,
              baseAltitude + 2,
              Math.sin(angle) * 20
            ]}>
              <Cylinder args={[0.5, 2, 6]} material-color="#f59e0b" material-wireframe />
              <Torus args={[3, 0.3]} material-color="#fbbf24" material-wireframe 
                     rotation={[Math.PI / 2, 0, 0]} position={[0, 3, 0]} />
              <pointLight color="#fbbf24" intensity={0.8} distance={20} />
            </group>
          );
        }
        break;

      case 4: // Gravity Warped Zone - Distorted structures
        for (let i = 0; i < 12; i++) {
          elements.push(
            <group key={`layer4-${i}`} position={[
              (Math.random() - 0.5) * 40,
              baseAltitude + (Math.random() - 0.5) * 10,
              (Math.random() - 0.5) * 40
            ]}>
              <Box args={[1 + Math.random(), 3 + Math.random() * 2, 1 + Math.random()]} 
                   material-color="#ef4444" material-wireframe 
                   rotation={[Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.5]} />
              <spotLight color="#f87171" intensity={0.5} distance={15} angle={0.6} />
            </group>
          );
        }
        break;

      case 5: // Cosmic Radiation Belt - Glowing energy fields
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * Math.PI * 2;
          elements.push(
            <group key={`layer5-${i}`} position={[
              Math.cos(angle) * 30 + (Math.random() - 0.5) * 10,
              baseAltitude + Math.sin(Date.now() * 0.001 + i) * 2,
              Math.sin(angle) * 30 + (Math.random() - 0.5) * 10
            ]}>
              <Sphere args={[1.5 + Math.random()]} material-color="#10b981" 
                      material-transparent material-opacity={0.6} />
              <pointLight color="#34d399" intensity={0.7} distance={25} />
            </group>
          );
        }
        break;

      case 6: // Void Nexus - Portal-like structures
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          elements.push(
            <group key={`layer6-${i}`} position={[
              Math.cos(angle) * 35,
              baseAltitude + 5,
              Math.sin(angle) * 35
            ]} rotation={[0, angle, 0]}>
              <Torus args={[4, 0.5]} material-color="#6366f1" material-wireframe />
              <Torus args={[2, 0.3]} material-color="#818cf8" material-wireframe 
                     rotation={[Math.PI / 2, 0, 0]} />
              <pointLight color="#818cf8" intensity={1} distance={30} />
            </group>
          );
        }
        break;

      case 7: // Dark Matter Field - Ominous dark structures
        for (let i = 0; i < 8; i++) {
          elements.push(
            <group key={`layer7-${i}`} position={[
              (Math.random() - 0.5) * 60,
              baseAltitude + (Math.random() - 0.5) * 15,
              (Math.random() - 0.5) * 60
            ]}>
              <Octahedron args={[2 + Math.random() * 2]} material-color="#8b5a3c" 
                          material-wireframe />
              <Sphere args={[0.5]} material-color="#a16207" position={[0, 0, 0]} />
              <pointLight color="#a16207" intensity={0.4} distance={20} />
            </group>
          );
        }
        break;

      case 8: // Quantum Anomaly Zone - Shifting geometric patterns
        for (let i = 0; i < 16; i++) {
          const phase = Date.now() * 0.001 + i;
          elements.push(
            <group key={`layer8-${i}`} position={[
              Math.cos(phase) * (15 + i * 2),
              baseAltitude + Math.sin(phase * 1.3) * 8,
              Math.sin(phase) * (15 + i * 2)
            ]} rotation={[phase, phase * 1.2, phase * 0.8]}>
              <Octahedron args={[0.8 + Math.sin(phase) * 0.3]} 
                          material-color="#ec4899" material-wireframe />
              <pointLight color="#f472b6" intensity={0.5} distance={12} />
            </group>
          );
        }
        break;
    }

    return (
      <group key={`layer-${layerNum}`}>
        {elements}
        
        {/* Layer identification marker */}
        <group position={[0, baseAltitude + 10, 0]}>
          <Box args={[8, 0.5, 8]} material-color={layerData.visual.color} 
               material-transparent material-opacity={0.3} />
          <pointLight color={layerData.visual.particleColor} intensity={0.8} distance={50} />
        </group>
      </group>
    );
  };

  // Render current layer and adjacent layers for smooth transitions
  const layersToRender = useMemo(() => {
    const layers = [];
    for (let i = Math.max(1, currentLayer - 1); i <= Math.min(8, currentLayer + 1); i++) {
      layers.push(i);
    }
    return layers;
  }, [currentLayer]);

  return (
    <group>
      {layersToRender.map(layerNum => getLayerEnvironment(layerNum))}
      
      {/* Debug: Current layer indicator */}
      <group position={[15, (SCIFI_LAYERS[currentLayer]?.altitudeThreshold || 0) / 10, 0]}>
        <Box args={[2, 1, 2]} material-color="#00ff00" />
        <pointLight color="#00ff00" intensity={1} distance={20} />
      </group>
    </group>
  );
};