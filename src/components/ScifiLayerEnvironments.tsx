import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScifiLayerStore } from '@/stores/useScifiLayerStore';
import { SCIFI_LAYERS } from '@/data/SciFiUpgradeSystem';
import { Vector3 } from 'three';

export const ScifiLayerEnvironments: React.FC = () => {
  const { currentLayer } = useScifiLayerStore();
  const timeRef = useRef(0);

  // Smooth time progression for animations
  useFrame((state, delta) => {
    timeRef.current += delta * 0.3; // Much slower animation speed
  });

  // Generate layer-specific environmental elements
  const getLayerEnvironment = (layerNum: number) => {
    const layerData = SCIFI_LAYERS[layerNum];
    if (!layerData) return null;

    const baseAltitude = layerData.altitudeThreshold / 10; // Convert to camera space
    const elements = [];

    switch (layerNum) {
      case 1: // Lower Orbit - Simple atmospheric stations (reduced count)
        for (let i = 0; i < 6; i++) { // Reduced from 8
          const angle = (i / 8) * Math.PI * 2;
          elements.push(
            <group key={`layer1-${i}`} position={[
              Math.cos(angle) * 25, 
              baseAltitude + Math.random() * 3, 
              Math.sin(angle) * 25
            ]}>
              <mesh>
                <boxGeometry args={[2, 1, 4]} />
                <meshBasicMaterial color="#3b82f6" wireframe />
              </mesh>
              <pointLight color="#60a5fa" intensity={0.3} distance={15} />
            </group>
          );
        }
        break;

      case 2: // Debris Field - Scattered debris and wreckage (reduced count)
        for (let i = 0; i < 10; i++) { // Reduced from 15
          elements.push(
            <group key={`layer2-${i}`} position={[
              (Math.random() - 0.5) * 50,
              baseAltitude + (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 50
            ]} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}>
              <mesh>
                <octahedronGeometry args={[0.5 + Math.random() * 2]} />
                <meshBasicMaterial color="#8b5cf6" wireframe />
              </mesh>
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
              <mesh>
                <cylinderGeometry args={[0.5, 2, 6]} />
                <meshBasicMaterial color="#f59e0b" wireframe />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3, 0]}>
                <torusGeometry args={[3, 0.3]} />
                <meshBasicMaterial color="#fbbf24" wireframe />
              </mesh>
              <pointLight color="#fbbf24" intensity={0.8} distance={20} />
            </group>
          );
        }
        break;

      case 4: // Gravity Warped Zone - Distorted structures (reduced count)
        for (let i = 0; i < 8; i++) { // Reduced from 12
          elements.push(
            <group key={`layer4-${i}`} position={[
              (Math.random() - 0.5) * 40,
              baseAltitude + (Math.random() - 0.5) * 10,
              (Math.random() - 0.5) * 40
            ]}>
              <mesh rotation={[Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.5]}>
                <boxGeometry args={[1 + Math.random(), 3 + Math.random() * 2, 1 + Math.random()]} />
                <meshBasicMaterial color="#ef4444" wireframe />
              </mesh>
              <spotLight color="#f87171" intensity={0.5} distance={15} angle={0.6} />
            </group>
          );
        }
        break;

      case 5: // Cosmic Radiation Belt - Glowing energy fields (reduced count)
        for (let i = 0; i < 6; i++) { // Reduced from 10
          const angle = (i / 10) * Math.PI * 2;
          elements.push(
            <group key={`layer5-${i}`} position={[
              Math.cos(angle) * 30 + (Math.random() - 0.5) * 10,
              baseAltitude + Math.sin(timeRef.current * 0.5 + i) * 1, // Slower, controlled animation
              Math.sin(angle) * 30 + (Math.random() - 0.5) * 10
            ]}>
              <mesh>
                <sphereGeometry args={[1.5 + Math.random()]} />
                <meshBasicMaterial color="#10b981" transparent opacity={0.6} />
              </mesh>
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
              <mesh>
                <torusGeometry args={[4, 0.5]} />
                <meshBasicMaterial color="#6366f1" wireframe />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[2, 0.3]} />
                <meshBasicMaterial color="#818cf8" wireframe />
              </mesh>
              <pointLight color="#818cf8" intensity={1} distance={30} />
            </group>
          );
        }
        break;

      case 7: // Dark Matter Field - Ominous dark structures (reduced count)
        for (let i = 0; i < 6; i++) { // Reduced from 8
          elements.push(
            <group key={`layer7-${i}`} position={[
              (Math.random() - 0.5) * 60,
              baseAltitude + (Math.random() - 0.5) * 15,
              (Math.random() - 0.5) * 60
            ]}>
              <mesh>
                <octahedronGeometry args={[2 + Math.random() * 2]} />
                <meshBasicMaterial color="#8b5a3c" wireframe />
              </mesh>
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.5]} />
                <meshBasicMaterial color="#a16207" />
              </mesh>
              <pointLight color="#a16207" intensity={0.4} distance={20} />
            </group>
          );
        }
        break;

      case 8: // Quantum Anomaly Zone - Shifting geometric patterns (reduced count)
        for (let i = 0; i < 12; i++) { // Reduced from 16
          const phase = timeRef.current * 0.2 + i * 0.3; // Much slower quantum animations
          elements.push(
            <group key={`layer8-${i}`} position={[
              Math.cos(phase) * (15 + i * 2),
              baseAltitude + Math.sin(phase * 1.3) * 3,
              Math.sin(phase) * (15 + i * 2)
            ]} rotation={[phase * 0.1, phase * 0.15, phase * 0.08]}> {/* Slower rotation */}
              <mesh>
                <octahedronGeometry args={[0.8 + Math.sin(phase) * 0.2]} />
                <meshBasicMaterial color="#ec4899" wireframe />
              </mesh>
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
          <mesh>
            <boxGeometry args={[8, 0.5, 8]} />
            <meshBasicMaterial color={layerData.visual.color} transparent opacity={0.3} />
          </mesh>
          <pointLight color={layerData.visual.particleColor} intensity={0.8} distance={50} />
        </group>
      </group>
    );
  };

  // Only render current layer for better performance
  const layersToRender = useMemo(() => {
    return [currentLayer]; // Only current layer to improve performance
  }, [currentLayer]);

  return (
    <group>
      {layersToRender.map(layerNum => getLayerEnvironment(layerNum))}
      
      {/* Debug: Current layer indicator */}
      <group position={[15, (SCIFI_LAYERS[currentLayer]?.altitudeThreshold || 0) / 10, 0]}>
        <mesh>
          <boxGeometry args={[2, 1, 2]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
        <pointLight color="#00ff00" intensity={1} distance={20} />
      </group>
    </group>
  );
};