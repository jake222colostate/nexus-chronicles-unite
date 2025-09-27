import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScifiLayerStore } from '@/stores/useScifiLayerStore';
import { SCIFI_LAYER_THEMES, getLayerByAltitude } from '@/data/ScifiLayerSystem';
import { Vector3 } from 'three';

export const ScifiLayerEnvironments: React.FC = () => {
  const { currentLayer, altitude } = useScifiLayerStore();
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
  });

  // Generate distinctive layer decorations based on theme
  const generateLayerDecorations = (layerId: number) => {
    const layerConfig = SCIFI_LAYER_THEMES[layerId];
    if (!layerConfig) return [];

    const decorations: JSX.Element[] = [];
    const baseAltitude = layerConfig.altitudeThreshold / 10;

    layerConfig.decorations.forEach((decoration, decorationIndex) => {
      switch (decoration.type) {
        case 'antennas':
          // Layer 1: Simple antennas
          for (let i = 0; i < decoration.count; i++) {
            const angle = (i / decoration.count) * Math.PI * 2;
            decorations.push(
              <mesh key={`antenna-${i}`} position={[
                Math.cos(angle) * decoration.properties.radius,
                baseAltitude + 1.5,
                Math.sin(angle) * decoration.properties.radius
              ]}>
                <cylinderGeometry args={[0.1, 0.1, decoration.properties.height]} />
                <meshBasicMaterial color={decoration.properties.color} wireframe={decoration.properties.wireframe} />
              </mesh>
            );
          }
          break;

        case 'debris_chunks':
          // Layer 2: Floating debris
          for (let i = 0; i < decoration.count; i++) {
            const angle = (i / decoration.count) * Math.PI * 2;
            const randomOffset = Math.random() * 0.5;
            decorations.push(
              <mesh key={`debris-${i}`} position={[
                Math.cos(angle) * (decoration.properties.radius + randomOffset),
                baseAltitude + 0.5 + randomOffset,
                Math.sin(angle) * (decoration.properties.radius + randomOffset)
              ]} rotation={[
                Math.random() * 0.5,
                angle + timeRef.current * 0.1,
                Math.random() * 0.3
              ]}>
                <boxGeometry args={decoration.properties.size.concat([decoration.properties.size[0]])} />
                <meshBasicMaterial color={decoration.properties.color} wireframe={decoration.properties.wireframe} />
              </mesh>
            );
          }
          break;

        case 'energy_crystals':
          // Layer 3: Glowing energy crystals
          for (let i = 0; i < decoration.count; i++) {
            const angle = (i / decoration.count) * Math.PI * 2;
            const pulse = Math.sin(timeRef.current * 2 + i) * 0.3 + 0.7;
            decorations.push(
              <group key={`crystal-${i}`} position={[
                Math.cos(angle) * decoration.properties.radius,
                baseAltitude + decoration.properties.height,
                Math.sin(angle) * decoration.properties.radius
              ]}>
                <mesh scale={[1, pulse, 1]}>
                  <octahedronGeometry args={[0.8]} />
                  <meshBasicMaterial color={decoration.properties.color} transparent opacity={0.8} />
                </mesh>
                {decoration.properties.glow && (
                  <pointLight color={decoration.properties.color} intensity={0.5 * pulse} distance={10} />
                )}
              </group>
            );
          }
          break;

        case 'gravity_rings':
          // Layer 4: Tilted gravity rings
          decoration.properties.radius.forEach((radius: number, ringIndex: number) => {
            decorations.push(
              <mesh key={`gravity-ring-${ringIndex}`} position={[0, baseAltitude + 1, 0]} 
                    rotation={[decoration.properties.tilt * Math.PI / 180, timeRef.current * 0.05 * (ringIndex + 1), 0]}>
                <torusGeometry args={[radius, decoration.properties.thickness]} />
                <meshBasicMaterial color={decoration.properties.color} wireframe={decoration.properties.wireframe} />
              </mesh>
            );
          });
          break;

        case 'event_horizon':
          // Layer 5: Black hole event horizon
          decorations.push(
            <group key="blackhole-core" position={[0, baseAltitude + 1, 0]}>
              <mesh>
                <sphereGeometry args={[decoration.properties.radius]} />
                <meshBasicMaterial color={decoration.properties.color} transparent opacity={0.9} />
              </mesh>
              <mesh scale={[1.2, 1.2, 1.2]}>
                <sphereGeometry args={[decoration.properties.radius]} />
                <meshBasicMaterial color={decoration.properties.innerGlow} wireframe transparent opacity={0.3} />
              </mesh>
            </group>
          );
          break;

        case 'matter_streams':
          for (let i = 0; i < decoration.count; i++) {
            const angle = (i / decoration.count) * Math.PI * 2;
            const spiralOffset = timeRef.current * 0.3 + i;
            decorations.push(
              <mesh key={`matter-stream-${i}`} position={[
                Math.cos(angle + spiralOffset) * 3,
                baseAltitude + 1,
                Math.sin(angle + spiralOffset) * 3
              ]} rotation={[0, angle + spiralOffset, 0]}>
                <cylinderGeometry args={[0.1, 0.1, decoration.properties.length]} />
                <meshBasicMaterial color={decoration.properties.color} transparent opacity={0.7} />
              </mesh>
            );
          }
          break;

        case 'holo_grid':
          // Layer 6: Holographic grid system
          const gridSize = decoration.properties.size;
          const divisions = decoration.properties.divisions;
          const gridStep = gridSize / divisions;
          
          // Grid lines
          for (let i = 0; i <= divisions; i++) {
            const offset = (i * gridStep) - (gridSize / 2);
            // Horizontal lines
            decorations.push(
              <mesh key={`grid-h-${i}`} position={[0, baseAltitude, offset]}>
                <boxGeometry args={[gridSize, 0.05, 0.05]} />
                <meshBasicMaterial color={decoration.properties.color} transparent opacity={decoration.properties.opacity} />
              </mesh>
            );
            // Vertical lines
            decorations.push(
              <mesh key={`grid-v-${i}`} position={[offset, baseAltitude, 0]}>
                <boxGeometry args={[0.05, 0.05, gridSize]} />
                <meshBasicMaterial color={decoration.properties.color} transparent opacity={decoration.properties.opacity} />
              </mesh>
            );
          }
          break;

        case 'data_nodes':
          for (let i = 0; i < decoration.count; i++) {
            const angle = (i / decoration.count) * Math.PI * 2;
            const pulse = Math.sin(timeRef.current * 1.5 + i) * 0.2 + 0.8;
            decorations.push(
              <mesh key={`data-node-${i}`} position={[
                Math.cos(angle) * decoration.properties.radius,
                baseAltitude + 0.5,
                Math.sin(angle) * decoration.properties.radius
              ]} scale={[pulse, pulse, pulse]}>
                <sphereGeometry args={[decoration.properties.size]} />
                <meshBasicMaterial color={decoration.properties.color} transparent opacity={0.8} />
              </mesh>
            );
          }
          break;

        case 'bio_tendrils':
          // Layer 7: Organic bio-tech tendrils
          for (let i = 0; i < decoration.count; i++) {
            const angle = (i / decoration.count) * Math.PI * 2;
            const growth = Math.sin(timeRef.current * 0.5 + i) * 0.3 + 0.7;
            decorations.push(
              <mesh key={`tendril-${i}`} position={[
                Math.cos(angle) * 5,
                baseAltitude + 1,
                Math.sin(angle) * 5
              ]} rotation={[0, angle, Math.sin(timeRef.current + i) * 0.2]} scale={[1, growth, 1]}>
                <cylinderGeometry args={[decoration.properties.thickness, decoration.properties.thickness * 0.5, decoration.properties.length]} />
                <meshBasicMaterial color={decoration.properties.color} transparent opacity={0.8} />
              </mesh>
            );
          }
          break;

        case 'bio_nodes':
          for (let i = 0; i < decoration.count; i++) {
            const angle = (i / decoration.count) * Math.PI * 2;
            const pulse = Math.sin(timeRef.current * 1.2 + i) * 0.4 + 0.6;
            decorations.push(
              <mesh key={`bio-node-${i}`} position={[
                Math.cos(angle) * decoration.properties.radius,
                baseAltitude + 1.5,
                Math.sin(angle) * decoration.properties.radius
              ]} scale={[pulse, pulse, pulse]}>
                <dodecahedronGeometry args={[decoration.properties.size]} />
                <meshBasicMaterial color={decoration.properties.color} transparent opacity={0.9} />
              </mesh>
            );
          }
          break;

        case 'quantum_fragments':
          // Layer 8: Quantum anomaly fragments
          for (let i = 0; i < decoration.count; i++) {
            const angle = (i / decoration.count) * Math.PI * 2;
            const phase = timeRef.current * 0.8 + i;
            const visibility = Math.sin(phase) * 0.5 + 0.5;
            decorations.push(
              <mesh key={`quantum-${i}`} position={[
                Math.cos(angle + phase * 0.1) * decoration.properties.radius,
                baseAltitude + 1 + Math.sin(phase) * 0.5,
                Math.sin(angle + phase * 0.1) * decoration.properties.radius
              ]} rotation={[phase * 0.2, phase * 0.3, phase * 0.1]}>
                <octahedronGeometry args={[decoration.properties.size]} />
                <meshBasicMaterial color={decoration.properties.color} wireframe transparent opacity={visibility} />
              </mesh>
            );
          }
          break;

        case 'plasma_arcs':
          // Layer 9: Plasma lightning arcs
          for (let i = 0; i < decoration.count; i++) {
            const angle = (i / decoration.count) * Math.PI * 2;
            const electrical = Math.sin(timeRef.current * 3 + i) * 0.3 + 0.7;
            decorations.push(
              <mesh key={`plasma-${i}`} position={[
                Math.cos(angle) * 8,
                baseAltitude + 2,
                Math.sin(angle) * 8
              ]} rotation={[0, angle, Math.sin(timeRef.current * 2 + i) * 0.5]} scale={[1, electrical, 1]}>
                <cylinderGeometry args={[decoration.properties.thickness, decoration.properties.thickness * 0.3, decoration.properties.length]} />
                <meshBasicMaterial color={decoration.properties.color} transparent opacity={0.9} />
              </mesh>
            );
          }
          break;

        case 'energy_storms':
          for (let i = 0; i < decoration.count; i++) {
            const angle = (i / decoration.count) * Math.PI * 2;
            const chaos = Math.sin(timeRef.current * 2 + i) * 0.5 + 0.5;
            decorations.push(
              <mesh key={`storm-${i}`} position={[
                Math.cos(angle) * 6,
                baseAltitude + 3,
                Math.sin(angle) * 6
              ]} scale={[chaos, chaos, chaos]}>
                <icosahedronGeometry args={[decoration.properties.radius]} />
                <meshBasicMaterial color={decoration.properties.color} wireframe transparent opacity={0.6} />
              </mesh>
            );
          }
          break;

        case 'singularity_core':
          // Layer 10: Central singularity
          decorations.push(
            <group key="singularity" position={[0, baseAltitude + 2, 0]}>
              <mesh>
                <sphereGeometry args={[decoration.properties.radius]} />
                <meshBasicMaterial color={decoration.properties.color} />
              </mesh>
            </group>
          );
          break;

        case 'distortion_rings':
          decoration.properties.radius.forEach((radius: number, ringIndex: number) => {
            const warp = Math.sin(timeRef.current * 0.5 + ringIndex) * 0.3;
            decorations.push(
              <mesh key={`distortion-ring-${ringIndex}`} position={[0, baseAltitude + 2, 0]} 
                    rotation={[warp, timeRef.current * 0.1 * (ringIndex + 1), warp * 0.5]}>
                <torusGeometry args={[radius, 0.2]} />
                <meshBasicMaterial color={decoration.properties.color} wireframe transparent opacity={0.7} />
              </mesh>
            );
          });
          break;
      }
    });

    return decorations;
  };

  // Generate the complete layer environment
  const renderLayer = (layerId: number) => {
    const layerConfig = SCIFI_LAYER_THEMES[layerId];
    if (!layerConfig) return null;

    const baseAltitude = layerConfig.altitudeThreshold / 10;
    const decorations = generateLayerDecorations(layerId);

    return (
      <group key={`layer-${layerId}`} position={[0, baseAltitude, 0]}>
        {/* Layer base platform - more visible */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[12, 12, 1]} />
          <meshBasicMaterial color={layerConfig.visual.primaryColor} transparent opacity={0.8} />
        </mesh>
        
        {/* Layer ring indicator */}
        <mesh position={[0, 0.5, 0]}>
          <torusGeometry args={[13, 0.5]} />
          <meshBasicMaterial color={layerConfig.visual.primaryColor} />
        </mesh>
        
        {/* Layer decorations */}
        {decorations}
        
        {/* Ambient lighting for layer */}
        <ambientLight intensity={layerConfig.visual.ambientIntensity} color={layerConfig.visual.primaryColor} />
      </group>
    );
  };

  // Only render current layer for performance
  const layersToRender = useMemo(() => {
    return [currentLayer];
  }, [currentLayer]);

  return (
    <group>
      {layersToRender.map(layerId => renderLayer(layerId))}
      
      {/* Global fog effect based on current layer */}
      <fog attach="fog" args={[
        SCIFI_LAYER_THEMES[currentLayer]?.visual.fogColor || '#0a0a1a',
        30,
        200
      ]} />
    </group>
  );
};