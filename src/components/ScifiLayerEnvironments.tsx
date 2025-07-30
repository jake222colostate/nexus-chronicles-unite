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

  // Generate layer-specific decorations based on detailed specifications
  const generateLayerDecorations = (layerId: number) => {
    const decorations: JSX.Element[] = [];
    const baseAltitude = layerId * 20;

    switch (layerId) {
      case 1: // Lower Orbit - Simple antennas
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          decorations.push(
            <mesh key={`antenna-${i}`} position={[
              Math.cos(angle) * 6,
              baseAltitude + 1.5,
              Math.sin(angle) * 6
            ]}>
              <cylinderGeometry args={[0.1, 0.1, 3]} />
              <meshBasicMaterial color="#60a5fa" />
            </mesh>
          );
        }
        break;

      case 2: // Derelict Belt - Abandoned machinery
        // Floating broken satellites
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2;
          decorations.push(
            <group key={`satellite-${i}`} position={[
              Math.cos(angle) * 8,
              baseAltitude + 2 + Math.sin(timeRef.current + i) * 0.3,
              Math.sin(angle) * 8
            ]} rotation={[
              timeRef.current * 0.1 + i,
              timeRef.current * 0.05 + i,
              0
            ]}>
              <mesh>
                <boxGeometry args={[1.5, 0.8, 2]} />
                <meshBasicMaterial color="#4a4a4a" />
              </mesh>
              {/* Solar panels */}
              <mesh position={[0, 0, 1.2]}>
                <planeGeometry args={[2, 1]} />
                <meshBasicMaterial color="#1a1a2e" transparent opacity={0.7} />
              </mesh>
              {/* Flickering damage light */}
              <pointLight 
                color="#ff6b6b" 
                intensity={Math.sin(timeRef.current * 5 + i) * 0.3 + 0.2} 
                distance={5} 
              />
            </group>
          );
        }
        break;

      case 3: // Cryo Drift - Frozen tech remnants
        // Crystallized pipes and frozen elements
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          decorations.push(
            <group key={`cryo-${i}`} position={[
              Math.cos(angle) * 7,
              baseAltitude + 1.5,
              Math.sin(angle) * 7
            ]}>
              {/* Frozen pipe */}
              <mesh rotation={[0, angle, Math.PI / 4]}>
                <cylinderGeometry args={[0.3, 0.3, 4]} />
                <meshBasicMaterial color="#87ceeb" transparent opacity={0.8} />
              </mesh>
              {/* Ice crystals */}
              <mesh position={[0, 1, 0]}>
                <octahedronGeometry args={[0.5]} />
                <meshBasicMaterial color="#e0f6ff" transparent opacity={0.9} />
              </mesh>
            </group>
          );
        }
        break;

      case 4: // Arc Circuit Nexus - Power grid
        // Floating capacitors and electric conduits
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const electricPulse = Math.sin(timeRef.current * 3 + i) * 0.5 + 0.5;
          decorations.push(
            <group key={`circuit-${i}`} position={[
              Math.cos(angle) * 9,
              baseAltitude + 2,
              Math.sin(angle) * 9
            ]}>
               {/* Capacitor tower */}
               <mesh>
                 <cylinderGeometry args={[0.4, 0.4, 3]} />
                 <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={electricPulse * 0.3} />
               </mesh>
              {/* Electric arc effect */}
              <mesh position={[0, 2, 0]} scale={[1, electricPulse, 1]}>
                <sphereGeometry args={[0.2]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={electricPulse} />
              </mesh>
            </group>
          );
        }
        break;

      case 5: // Spinal Array - Mechanical segments
        // Floating gear disks and rotating segments
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          decorations.push(
            <group key={`gear-${i}`} position={[
              Math.cos(angle) * 8,
              baseAltitude + 1.5,
              Math.sin(angle) * 8
            ]} rotation={[0, timeRef.current * 0.5 + i, 0]}>
              {/* Gear disk */}
              <mesh>
                <cylinderGeometry args={[1.2, 1.2, 0.3]} />
                <meshBasicMaterial color="#666666" />
              </mesh>
              {/* Gear teeth */}
              {Array.from({length: 8}).map((_, toothIndex) => {
                const toothAngle = (toothIndex / 8) * Math.PI * 2;
                return (
                  <mesh key={toothIndex} position={[
                    Math.cos(toothAngle) * 1.4,
                    0,
                    Math.sin(toothAngle) * 1.4
                  ]}>
                    <boxGeometry args={[0.2, 0.3, 0.2]} />
                    <meshBasicMaterial color="#888888" />
                  </mesh>
                );
              })}
            </group>
          );
        }
        break;

      case 6: // Terraform Shardfield - Tech/terrain mix
        // Sprouting metallic roots and broken drones
        for (let i = 0; i < 7; i++) {
          const angle = (i / 7) * Math.PI * 2;
          const growth = Math.sin(timeRef.current * 0.8 + i) * 0.3 + 0.7;
          decorations.push(
            <group key={`terraform-${i}`} position={[
              Math.cos(angle) * 7,
              baseAltitude + 0.5,
              Math.sin(angle) * 7
            ]}>
              {/* Metallic root */}
              <mesh scale={[1, growth, 1]}>
                <cylinderGeometry args={[0.15, 0.3, 3]} />
                <meshBasicMaterial color="#228b22" />
              </mesh>
              {/* Broken drone husk */}
              <mesh position={[0.5, 1, 0.5]}>
                <boxGeometry args={[0.8, 0.4, 0.8]} />
                <meshBasicMaterial color="#2d5a2d" />
              </mesh>
            </group>
          );
        }
        break;

      case 7: // Omega Core Shell - Reactor shell
        // Pulsing reactor nodes and coolant pipes
        const corePulse = Math.sin(timeRef.current * 1.5) * 0.5 + 0.5;
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          decorations.push(
            <group key={`reactor-${i}`} position={[
              Math.cos(angle) * 8,
              baseAltitude + 1.5,
              Math.sin(angle) * 8
            ]}>
              {/* Reactor node */}
              <mesh>
                <sphereGeometry args={[0.8]} />
                <meshStandardMaterial 
                  color="#ff4500" 
                  emissive="#ff4500" 
                  emissiveIntensity={corePulse * 0.8} 
                />
              </mesh>
              {/* Coolant pipe */}
              <mesh position={[0, -1, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 2]} />
                <meshBasicMaterial color="#333333" />
              </mesh>
            </group>
          );
        }
        break;

      case 8: // Drift Labyrinth - Alien megastructure
        // Geometric shapes and hologram projectors
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const hologramFlicker = Math.sin(timeRef.current * 4 + i) * 0.3 + 0.7;
          decorations.push(
            <group key={`labyrinth-${i}`} position={[
              Math.cos(angle) * 9,
              baseAltitude + 2,
              Math.sin(angle) * 9
            ]}>
              {/* Geometric pillar */}
              <mesh>
                <octahedronGeometry args={[1]} />
                <meshBasicMaterial color="#4b0082" />
              </mesh>
              {/* Hologram projection */}
              <mesh position={[0, 2, 0]} scale={[hologramFlicker, hologramFlicker, hologramFlicker]}>
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial 
                  color="#9370db" 
                  transparent 
                  opacity={hologramFlicker * 0.6} 
                />
              </mesh>
            </group>
          );
        }
        break;

      case 9: // Temporal Shardflow - Time distortion
        // Flickering objects and temporal effects
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const timeFlicker = Math.sin(timeRef.current * 2 + i * 2) > 0.3 ? 1 : 0.2;
          decorations.push(
            <group key={`temporal-${i}`} position={[
              Math.cos(angle) * 8,
              baseAltitude + 1.5,
              Math.sin(angle) * 8
            ]} scale={[timeFlicker, timeFlicker, timeFlicker]}>
              {/* Temporal shard */}
              <mesh rotation={[timeRef.current * 0.3, timeRef.current * 0.2, 0]}>
                <dodecahedronGeometry args={[0.8]} />
                <meshBasicMaterial 
                  color="#ff69b4" 
                  transparent 
                  opacity={timeFlicker * 0.8} 
                />
              </mesh>
              {/* Floating hourglass particle */}
              <mesh position={[0, 2, 0]}>
                <coneGeometry args={[0.3, 0.6]} />
                <meshBasicMaterial color="#dda0dd" transparent opacity={0.6} />
              </mesh>
            </group>
          );
        }
        break;

      case 10: // Singularity Well - Gravity effects
        // Debris caught in gravity ring
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * Math.PI * 2 + timeRef.current * 0.5;
          const radius = 6 + Math.sin(timeRef.current + i) * 2;
          decorations.push(
            <mesh key={`singularity-${i}`} position={[
              Math.cos(angle) * radius,
              baseAltitude + 1 + Math.sin(timeRef.current * 0.8 + i) * 0.5,
              Math.sin(angle) * radius
            ]} rotation={[timeRef.current + i, angle, 0]}>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshBasicMaterial color="#8b0000" />
            </mesh>
          );
        }
        break;
    }

    return decorations;
  };

  // Generate platform with layer-specific materials
  const renderLayerPlatform = (layerId: number, baseAltitude: number) => {
    switch (layerId) {
      case 1: // Lower Orbit - Blue atmospheric
        return (
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[12, 12, 1]} />
            <meshBasicMaterial color="#3b82f6" />
          </mesh>
        );

      case 2: // Derelict Belt - Dark scratched metal
        return (
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[12, 12, 1]} />
            <meshBasicMaterial color="#2d2d2d" />
          </mesh>
        );

      case 3: // Cryo Drift - Frosted blue/white with icy gloss
        return (
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[12, 12, 1]} />
            <meshBasicMaterial color="#b0e0e6" transparent opacity={0.9} />
          </mesh>
        );

      case 4: // Arc Circuit Nexus - High-energy grid
        return (
          <group>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[12, 12, 1]} />
               <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.2} />
            </mesh>
            {/* Grid lines */}
            {Array.from({length: 8}).map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              return (
                <mesh key={i} position={[0, 0.5, 0]} rotation={[0, angle, 0]}>
                  <boxGeometry args={[24, 0.1, 0.2]} />
                   <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
                </mesh>
              );
            })}
          </group>
        );

      case 5: // Spinal Array - Ribbed mechanical
        return (
          <group>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[12, 12, 1]} />
              <meshBasicMaterial color="#696969" />
            </mesh>
            {/* Ribbed supports */}
            {Array.from({length: 12}).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              return (
                <mesh key={i} position={[
                  Math.cos(angle) * 10,
                  0.5,
                  Math.sin(angle) * 10
                ]}>
                  <boxGeometry args={[0.5, 1, 2]} />
                  <meshBasicMaterial color="#808080" />
                </mesh>
              );
            })}
          </group>
        );

      case 6: // Terraform Shardfield - Green-gray hybrid
        return (
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[12, 12, 1]} />
            <meshBasicMaterial color="#556b2f" />
          </mesh>
        );

      case 7: // Omega Core Shell - Glowing reactor plating
        const corePulse = Math.sin(timeRef.current * 1.5) * 0.3 + 0.7;
        return (
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[12, 12, 1]} />
             <meshStandardMaterial 
               color="#ff4500" 
               emissive="#ff4500" 
               emissiveIntensity={corePulse * 0.5} 
             />
          </mesh>
        );

      case 8: // Drift Labyrinth - Black and violet obsidian
        return (
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[12, 12, 1]} />
            <meshBasicMaterial color="#2f2f4f" />
          </mesh>
        );

      case 9: // Temporal Shardflow - Semi-transparent shifting
        const temporalShift = Math.sin(timeRef.current * 2) * 0.3 + 0.7;
        return (
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[12, 12, 1]} />
            <meshBasicMaterial 
              color="#ff69b4" 
              transparent 
              opacity={temporalShift * 0.8} 
            />
          </mesh>
        );

      case 10: // Singularity Well - Cracked black stone with red underglow
        return (
          <group>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[12, 12, 1]} />
              <meshBasicMaterial color="#1c1c1c" />
            </mesh>
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[11, 11, 0.5]} />
               <meshStandardMaterial color="#8b0000" emissive="#8b0000" emissiveIntensity={0.4} />
            </mesh>
          </group>
        );

      default:
        return (
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[12, 12, 1]} />
            <meshBasicMaterial color="#666666" />
          </mesh>
        );
    }
  };

  // Generate complete layer environment
  const renderLayer = (layerId: number) => {
    if (layerId < 1 || layerId > 10) return null;

    const baseAltitude = layerId * 20;
    const decorations = generateLayerDecorations(layerId);

    return (
      <group key={`layer-${layerId}`} position={[0, baseAltitude, 0]}>
        {/* Layer platform with material */}
        {renderLayerPlatform(layerId, baseAltitude)}
        
        {/* Layer ring indicator */}
        <mesh position={[0, 0.5, 0]}>
          <torusGeometry args={[13, 0.5]} />
          <meshBasicMaterial color="#ffffff" wireframe />
        </mesh>

        {/* Layer number indicator */}
        <group position={[0, 3, 0]}>
          <mesh>
            <sphereGeometry args={[0.8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
        
        {/* Layer decorations */}
        {decorations}
      </group>
    );
  };

  // Render all layers for visibility
  const layersToRender = useMemo(() => {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }, []);

  return (
    <group>
      {layersToRender.map(layerId => renderLayer(layerId))}
    </group>
  );
};