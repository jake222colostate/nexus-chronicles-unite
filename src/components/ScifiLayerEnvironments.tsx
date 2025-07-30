import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScifiLayerStore } from '@/stores/useScifiLayerStore';
import { SCIFI_LAYER_THEMES } from '@/data/ScifiLayerSystem';

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
    // Position layers close together - every 20 units vertically
    const baseAltitude = layerId * 20;

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

        default:
          // Simple fallback decoration for other layer types
          for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            decorations.push(
              <mesh key={`fallback-${i}`} position={[
                Math.cos(angle) * 6,
                baseAltitude + 1,
                Math.sin(angle) * 6
              ]}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshBasicMaterial color={layerConfig.visual.primaryColor} wireframe />
              </mesh>
            );
          }
          break;
      }
    });

    return decorations;
  };

  // Generate the complete layer environment
  const renderLayer = (layerId: number) => {
    const layerConfig = SCIFI_LAYER_THEMES[layerId];
    if (!layerConfig) return null;

    // Position layers close together - every 20 units vertically
    const baseAltitude = layerId * 20;
    const decorations = generateLayerDecorations(layerId);

    return (
      <group key={`layer-${layerId}`} position={[0, baseAltitude, 0]}>
        {/* Layer base platform - highly visible */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[12, 12, 1]} />
          <meshBasicMaterial color={layerConfig.visual.primaryColor} />
        </mesh>
        
        {/* Layer ring indicator */}
        <mesh position={[0, 0.5, 0]}>
          <torusGeometry args={[13, 0.5]} />
          <meshBasicMaterial color={layerConfig.visual.primaryColor} wireframe />
        </mesh>

        {/* Layer number text indicator */}
        <group position={[0, 2, 0]}>
          <mesh>
            <sphereGeometry args={[1]} />
            <meshBasicMaterial color={layerConfig.visual.primaryColor} wireframe />
          </mesh>
        </group>
        
        {/* Layer decorations */}
        {decorations}
      </group>
    );
  };

  // Render ALL layers so you can see them stacked
  const layersToRender = useMemo(() => {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }, []);

  return (
    <group>
      {layersToRender.map(layerId => renderLayer(layerId))}
      
      {/* Debug info */}
      <group position={[15, 0, 0]}>
        <mesh>
          <boxGeometry args={[2, 1, 1]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
};