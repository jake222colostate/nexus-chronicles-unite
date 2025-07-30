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

  // Generate layer-specific platform bases with unique characteristics
  const getLayerBase = (layerNum: number) => {
    const layerData = SCIFI_LAYERS[layerNum];
    if (!layerData) return null;

    const baseAltitude = layerData.altitudeThreshold / 10;
    
    return (
      <group key={`base-${layerNum}`} position={[0, baseAltitude - 3, -2]}>
        {/* Main platform base - same structure as FloatingIsland but layer-themed */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[8, 7, 1.5, 8]} />
          <meshLambertMaterial
            color={layerData.visual.color}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Decorative rings with layer-specific styling */}
        <mesh position={[0, 0.8, 0]}>
          <ringGeometry args={[7.5, 8.5, 16]} />
          <meshBasicMaterial
            color={layerData.visual.particleColor}
            transparent
            opacity={0.4}
          />
        </mesh>

        {/* Glowing core with layer theme */}
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial
            color={layerData.visual.particleColor}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Layer-specific base decorations */}
        {getLayerBaseDecorations(layerNum, baseAltitude)}
      </group>
    );
  };

  // Add unique decorations to each layer's base
  const getLayerBaseDecorations = (layerNum: number, baseAltitude: number) => {
    const decorations = [];

    switch (layerNum) {
      case 1: // Lower Orbit - Simple antenna array
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          decorations.push(
            <mesh key={`antenna-${i}`} position={[
              Math.cos(angle) * 6,
              1.5,
              Math.sin(angle) * 6
            ]}>
              <cylinderGeometry args={[0.1, 0.1, 3]} />
              <meshBasicMaterial color="#60a5fa" />
            </mesh>
          );
        }
        break;

      case 2: // Debris Field - Damaged sections
        for (let i = 0; i < 3; i++) {
          const angle = (i / 3) * Math.PI * 2;
          decorations.push(
            <mesh key={`damage-${i}`} position={[
              Math.cos(angle) * 7,
              0.5,
              Math.sin(angle) * 7
            ]} rotation={[Math.random() * 0.5, angle, Math.random() * 0.3]}>
              <boxGeometry args={[0.8, 0.3, 1.2]} />
              <meshBasicMaterial color="#8b5cf6" wireframe />
            </mesh>
          );
        }
        break;

      case 3: // Solar Wind Zone - Solar panel array
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          decorations.push(
            <mesh key={`solar-${i}`} position={[
              Math.cos(angle) * 7.5,
              1,
              Math.sin(angle) * 7.5
            ]} rotation={[0, angle, 0]}>
              <boxGeometry args={[1.5, 0.1, 0.8]} />
              <meshBasicMaterial color="#fbbf24" transparent opacity={0.7} />
            </mesh>
          );
        }
        break;

      case 4: // Gravity Warped Zone - Distorted stabilizers
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          decorations.push(
            <mesh key={`stabilizer-${i}`} position={[
              Math.cos(angle) * 6.5,
              1.2,
              Math.sin(angle) * 6.5
            ]} rotation={[Math.sin(timeRef.current + i) * 0.3, angle, 0]}>
              <octahedronGeometry args={[0.8]} />
              <meshBasicMaterial color="#f87171" wireframe />
            </mesh>
          );
        }
        break;

      case 5: // Cosmic Radiation Belt - Energy collectors
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          decorations.push(
            <mesh key={`collector-${i}`} position={[
              Math.cos(angle) * 7,
              1 + Math.sin(timeRef.current + i) * 0.3,
              Math.sin(angle) * 7
            ]}>
              <sphereGeometry args={[0.4]} />
              <meshBasicMaterial color="#34d399" transparent opacity={0.8} />
            </mesh>
          );
        }
        break;

      case 6: // Void Nexus - Portal rings
        decorations.push(
          <mesh key="portal-ring" position={[0, 2, 0]} rotation={[0, timeRef.current * 0.1, 0]}>
            <torusGeometry args={[6, 0.3]} />
            <meshBasicMaterial color="#818cf8" wireframe />
          </mesh>
        );
        break;

      case 7: // Dark Matter Field - Dark energy cores
        for (let i = 0; i < 3; i++) {
          const angle = (i / 3) * Math.PI * 2;
          decorations.push(
            <mesh key={`dark-core-${i}`} position={[
              Math.cos(angle) * 5,
              1.5,
              Math.sin(angle) * 5
            ]}>
              <octahedronGeometry args={[0.6]} />
              <meshBasicMaterial color="#a16207" transparent opacity={0.9} />
            </mesh>
          );
        }
        break;

      case 8: // Quantum Anomaly Zone - Quantum field generators
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          const phase = timeRef.current * 0.3 + i;
          decorations.push(
            <mesh key={`quantum-${i}`} position={[
              Math.cos(angle) * 6,
              1 + Math.sin(phase) * 0.5,
              Math.sin(angle) * 6
            ]} rotation={[phase * 0.2, phase * 0.3, phase * 0.1]}>
              <octahedronGeometry args={[0.5]} />
              <meshBasicMaterial color="#f472b6" wireframe />
            </mesh>
          );
        }
        break;

      case 9: // Temporal Rift Zone - Time crystal formations
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const timeWarp = Math.sin(timeRef.current * 0.5 + i) * 0.8;
          decorations.push(
            <mesh key={`time-crystal-${i}`} position={[
              Math.cos(angle) * (7 + timeWarp),
              1.5 + timeWarp * 0.5,
              Math.sin(angle) * (7 + timeWarp)
            ]} rotation={[timeRef.current * 0.4, angle, timeRef.current * 0.2]}>
              <dodecahedronGeometry args={[0.6]} />
              <meshBasicMaterial color="#67e8f9" transparent opacity={0.8} />
            </mesh>
          );
        }
        break;

      case 10: // Hyperdimensional Gate - Dimensional anchors
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2;
          const dimShift = Math.cos(timeRef.current * 0.3 + i * 0.5) * 0.5;
          decorations.push(
            <group key={`dim-anchor-${i}`} position={[
              Math.cos(angle) * 8,
              1.8,
              Math.sin(angle) * 8
            ]} rotation={[0, angle + timeRef.current * 0.1, 0]}>
              <mesh position={[0, dimShift, 0]}>
                <cylinderGeometry args={[0.2, 0.4, 2]} />
                <meshBasicMaterial color="#c084fc" />
              </mesh>
              <mesh position={[0, dimShift + 1.5, 0]}>
                <dodecahedronGeometry args={[0.3]} />
                <meshBasicMaterial color="#a855f7" wireframe />
              </mesh>
            </group>
          );
        }
        break;

      case 11: // Stellar Forge - Fusion reactors
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          const fusionPulse = Math.sin(timeRef.current * 0.8 + i) * 0.3 + 0.7;
          decorations.push(
            <group key={`fusion-reactor-${i}`} position={[
              Math.cos(angle) * 7.5,
              1.2,
              Math.sin(angle) * 7.5
            ]}>
              <mesh scale={[fusionPulse, fusionPulse, fusionPulse]}>
                <sphereGeometry args={[0.8]} />
                <meshBasicMaterial color="#fb923c" transparent opacity={0.6} />
              </mesh>
              <mesh>
                <torusGeometry args={[1.2, 0.2]} />
                <meshBasicMaterial color="#f97316" />
              </mesh>
            </group>
          );
        }
        break;

      case 12: // Galactic Nexus - Spiral galaxy arms
        for (let i = 0; i < 8; i++) {
          const spiralAngle = (i / 8) * Math.PI * 4 + timeRef.current * 0.1;
          const radius = 4 + (i * 0.5);
          decorations.push(
            <mesh key={`galaxy-arm-${i}`} position={[
              Math.cos(spiralAngle) * radius,
              0.5 + Math.sin(timeRef.current + i) * 0.2,
              Math.sin(spiralAngle) * radius
            ]}>
              <sphereGeometry args={[0.3]} />
              <meshBasicMaterial color="#facc15" transparent opacity={0.9} />
            </mesh>
          );
        }
        break;

      case 13: // Cosmic Web Node - Web filaments
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          const webExtension = 6 + Math.sin(timeRef.current * 0.2 + i) * 2;
          decorations.push(
            <mesh key={`web-filament-${i}`} position={[
              Math.cos(angle) * webExtension * 0.5,
              1,
              Math.sin(angle) * webExtension * 0.5
            ]} rotation={[0, angle, 0]}>
              <cylinderGeometry args={[0.05, 0.05, webExtension]} />
              <meshBasicMaterial color="#5eead4" transparent opacity={0.7} />
            </mesh>
          );
        }
        // Central web node
        decorations.push(
          <mesh key="web-center" position={[0, 1, 0]}>
            <icosahedronGeometry args={[1]} />
            <meshBasicMaterial color="#14b8a6" wireframe />
          </mesh>
        );
        break;

      case 14: // Universal Threshold - Reality fragments
        for (let i = 0; i < 7; i++) {
          const angle = (i / 7) * Math.PI * 2;
          const universalShift = Math.sin(timeRef.current * 0.6 + i) * 0.8;
          decorations.push(
            <group key={`reality-fragment-${i}`} position={[
              Math.cos(angle) * 6,
              2 + universalShift,
              Math.sin(angle) * 6
            ]} rotation={[timeRef.current * 0.1, angle, timeRef.current * 0.15]}>
              <mesh>
                <octahedronGeometry args={[0.7]} />
                <meshBasicMaterial color="#fb7185" transparent opacity={0.8} />
              </mesh>
              <mesh scale={[1.5, 0.1, 1.5]}>
                <cylinderGeometry args={[0.8, 0.8, 0.1]} />
                <meshBasicMaterial color="#e11d48" transparent opacity={0.5} />
              </mesh>
            </group>
          );
        }
        break;

      case 15: // Infinity Engine - Infinite recursion patterns
        for (let level = 0; level < 3; level++) {
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + level * 0.5;
            const radius = 5 + level * 2;
            const infinityPhase = timeRef.current * (0.2 + level * 0.1);
            decorations.push(
              <mesh key={`infinity-${level}-${i}`} position={[
                Math.cos(angle + infinityPhase) * radius,
                1.5 + level * 0.8,
                Math.sin(angle + infinityPhase) * radius
              ]} rotation={[infinityPhase, angle, infinityPhase * 0.5]} scale={[1 - level * 0.2, 1 - level * 0.2, 1 - level * 0.2]}>
                <dodecahedronGeometry args={[0.4]} />
                <meshBasicMaterial color="#a78bfa" wireframe />
              </mesh>
            );
          }
        }
        // Central infinity core
        decorations.push(
          <mesh key="infinity-core" position={[0, 2.5, 0]} rotation={[timeRef.current * 0.2, timeRef.current * 0.3, timeRef.current * 0.1]}>
            <icosahedronGeometry args={[1.2]} />
            <meshBasicMaterial color="#7c3aed" transparent opacity={0.9} />
          </mesh>
        );
        break;
    }

    return decorations;
  };

  // Generate simplified environmental elements around the base
  const getLayerEnvironment = (layerNum: number) => {
    const layerData = SCIFI_LAYERS[layerNum];
    if (!layerData) return null;

    const baseAltitude = layerData.altitudeThreshold / 10;
    const elements = [];

    switch (layerNum) {
      case 1: // Lower Orbit - Simple atmospheric beacons
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          elements.push(
            <group key={`beacon-${i}`} position={[
              Math.cos(angle) * 15, 
              baseAltitude + 2, 
              Math.sin(angle) * 15
            ]}>
              <mesh>
                <cylinderGeometry args={[0.5, 0.5, 4]} />
                <meshBasicMaterial color="#3b82f6" />
              </mesh>
              <pointLight color="#60a5fa" intensity={0.3} distance={10} />
            </group>
          );
        }
        break;

      case 2: // Debris Field - Floating debris
        for (let i = 0; i < 6; i++) {
          elements.push(
            <group key={`debris-${i}`} position={[
              (Math.random() - 0.5) * 30,
              baseAltitude + (Math.random() - 0.5) * 5,
              (Math.random() - 0.5) * 30
            ]} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}>
              <mesh>
                <boxGeometry args={[1 + Math.random(), 0.5 + Math.random(), 1 + Math.random()]} />
                <meshBasicMaterial color="#8b5cf6" wireframe />
              </mesh>
            </group>
          );
        }
        break;

      case 3: // Solar Wind Zone - Energy streams
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          elements.push(
            <group key={`stream-${i}`} position={[
              Math.cos(angle) * 20,
              baseAltitude + 4,
              Math.sin(angle) * 20
            ]}>
              <mesh>
                <cylinderGeometry args={[0.2, 0.8, 8]} />
                <meshBasicMaterial color="#fbbf24" transparent opacity={0.7} />
              </mesh>
              <pointLight color="#fbbf24" intensity={0.6} distance={15} />
            </group>
          );
        }
        break;
    }

    return (
      <group key={`layer-${layerNum}`}>
        {/* Layer base (always present) */}
        {getLayerBase(layerNum)}
        
        {/* Environmental elements */}
        {elements}
      </group>
    );
  };

  // Only render current layer for better performance
  const layersToRender = useMemo(() => {
    return [currentLayer];
  }, [currentLayer]);

  return (
    <group>
      {layersToRender.map(layerNum => getLayerEnvironment(layerNum))}
    </group>
  );
};