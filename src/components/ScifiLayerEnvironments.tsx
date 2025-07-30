import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScifiLayerStore } from '@/stores/useScifiLayerStore';
import * as THREE from 'three';

export const ScifiLayerEnvironments: React.FC = () => {
  const { currentLayer, altitude } = useScifiLayerStore();
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
  });

  // Layer 2 - Fragmented Plates
  const renderFragmentedPlates = (baseAltitude: number) => {
    const fragments = [];
    
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 8;
      const hoverOffset = Math.sin(timeRef.current * 0.8 + i) * 0.5;
      const tiltX = Math.sin(timeRef.current * 0.3 + i) * 0.2;
      const tiltZ = Math.cos(timeRef.current * 0.4 + i) * 0.2;
      
      fragments.push(
        <mesh key={`fragment-${i}`} 
              position={[
                Math.cos(angle) * radius,
                baseAltitude + hoverOffset + Math.random() * 2,
                Math.sin(angle) * radius
              ]}
              rotation={[tiltX, angle, tiltZ]}>
          {/* Irregular polygon using dodecahedron as base */}
          <dodecahedronGeometry args={[1.5 + Math.random()]} />
          <meshStandardMaterial 
            color="#4a4a4a" 
            emissive="#ff6666" 
            emissiveIntensity={0.1}
            transparent 
            opacity={0.8} 
          />
        </mesh>
      );
    }
    
    return fragments;
  };

  // Layer 3 - Crystal Cross Array
  const renderCrystalCrossArray = (baseAltitude: number) => {
    const crosses = [];
    
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const radius = 6 + Math.random() * 4;
      
      crosses.push(
        <group key={`crystal-cross-${i}`} 
               position={[
                 Math.cos(angle) * radius,
                 baseAltitude + 2,
                 Math.sin(angle) * radius
               ]}
               rotation={[0, angle, 0]}>
          {/* X-shaped crystal structure */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/4]}>
            <boxGeometry args={[4, 0.5, 0.5]} />
            <meshStandardMaterial 
              color="#87ceeb" 
              transparent 
              opacity={0.7}
              emissive="#ffffff"
              emissiveIntensity={0.2}
            />
          </mesh>
          <mesh position={[0, 0, 0]} rotation={[Math.PI/4, 0, 0]}>
            <boxGeometry args={[0.5, 4, 0.5]} />
            <meshStandardMaterial 
              color="#87ceeb" 
              transparent 
              opacity={0.7}
              emissive="#ffffff"
              emissiveIntensity={0.2}
            />
          </mesh>
          <mesh position={[0, 0, 0]} rotation={[0, Math.PI/4, 0]}>
            <boxGeometry args={[0.5, 0.5, 4]} />
            <meshStandardMaterial 
              color="#87ceeb" 
              transparent 
              opacity={0.7}
              emissive="#ffffff"
              emissiveIntensity={0.2}
            />
          </mesh>
          {/* Crystal light scattering */}
          <pointLight color="#ffffff" intensity={0.5} distance={15} />
        </group>
      );
    }
    
    return crosses;
  };

  // Layer 4 - Grid Circuit Sink
  const renderGridCircuitSink = (baseAltitude: number) => {
    const gridElements = [];
    const gridSize = 8;
    const cellSize = 2;
    
    for (let x = -gridSize; x <= gridSize; x += cellSize) {
      for (let z = -gridSize; z <= gridSize; z += cellSize) {
        if (Math.random() > 0.3) { // Create gaps
          const glowIntensity = Math.sin(timeRef.current * 2 + x + z) * 0.3 + 0.7;
          
          gridElements.push(
            <mesh key={`grid-${x}-${z}`} 
                  position={[x, baseAltitude - 0.5, z]}>
              <boxGeometry args={[cellSize * 0.8, 0.2, cellSize * 0.8]} />
              <meshStandardMaterial 
                color="#ffaa00" 
                emissive="#ffaa00" 
                emissiveIntensity={glowIntensity * 0.4}
              />
            </mesh>
          );
          
          // Glowing underlines
          gridElements.push(
            <mesh key={`glow-${x}-${z}`} 
                  position={[x, baseAltitude - 0.8, z]}>
              <boxGeometry args={[cellSize, 0.1, cellSize]} />
              <meshStandardMaterial 
                color="#ffffff" 
                emissive="#ffaa00" 
                emissiveIntensity={glowIntensity * 0.6}
                transparent
                opacity={0.8}
              />
            </mesh>
          );
        }
      }
    }
    
    return gridElements;
  };

  // Layer 5 - Concentric Ring Fins
  const renderConcentricRingFins = (baseAltitude: number) => {
    const rings = [];
    const ringCount = 4;
    
    for (let i = 0; i < ringCount; i++) {
      const radius = 4 + i * 2;
      const rotationSpeed = 0.2 + i * 0.1;
      const rotation = timeRef.current * rotationSpeed;
      
      rings.push(
        <mesh key={`ring-${i}`} 
              position={[0, baseAltitude + i * 0.5, 0]}
              rotation={[0, rotation, 0]}>
          <torusGeometry args={[radius, 0.3, 8, 32]} />
          <meshStandardMaterial 
            color="#00ff88" 
            emissive="#00ff88" 
            emissiveIntensity={0.3}
          />
        </mesh>
      );
      
      // Particle burst on middle ring
      if (i === 2 && Math.sin(timeRef.current * 2) > 0.8) {
        for (let p = 0; p < 8; p++) {
          const particleAngle = (p / 8) * Math.PI * 2;
          rings.push(
            <mesh key={`particle-${p}`} 
                  position={[
                    Math.cos(particleAngle) * radius,
                    baseAltitude + i * 0.5,
                    Math.sin(particleAngle) * radius
                  ]}>
              <sphereGeometry args={[0.1]} />
              <meshStandardMaterial 
                color="#ffffff" 
                emissive="#ffffff" 
                emissiveIntensity={0.8}
              />
            </mesh>
          );
        }
      }
    }
    
    return rings;
  };

  // Layer 6 - Tri-Pillar Field
  const renderTriPillarField = (baseAltitude: number) => {
    const pillars = [];
    
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 12;
      const heightCycle = Math.sin(timeRef.current * 0.5 + i) * 2 + 3;
      const glowIntensity = Math.sin(timeRef.current * 0.5 + i) * 0.3 + 0.7;
      
      pillars.push(
        <mesh key={`pillar-${i}`} 
              position={[
                Math.cos(angle) * radius,
                baseAltitude + heightCycle,
                Math.sin(angle) * radius
              ]}>
          {/* Triangular prism */}
          <cylinderGeometry args={[0, 0.5, heightCycle * 2, 3]} />
          <meshStandardMaterial 
            color="#9370db" 
            emissive="#9370db" 
            emissiveIntensity={glowIntensity * 0.4}
          />
        </mesh>
      );
      
      // Spotlight from above
      pillars.push(
        <spotLight key={`spot-${i}`} 
                   position={[
                     Math.cos(angle) * radius,
                     baseAltitude + heightCycle + 5,
                     Math.sin(angle) * radius
                   ]}
                   target-position={[
                     Math.cos(angle) * radius,
                     baseAltitude,
                     Math.sin(angle) * radius
                   ]}
                   color="#ffffff"
                   intensity={0.3}
                   distance={10}
                   angle={Math.PI / 6} />
      );
    }
    
    return pillars;
  };

  // Layer 7 - Spiral Circuit Core
  const renderSpiralCircuitCore = (baseAltitude: number) => {
    const spiralElements = [];
    const spiralTurns = 4;
    const spiralRadius = 8;
    
    // Create spiral path
    for (let i = 0; i < spiralTurns * 20; i++) {
      const t = i / (spiralTurns * 20);
      const angle = t * spiralTurns * Math.PI * 2;
      const radius = spiralRadius * (1 - t * 0.5);
      const height = t * 6;
      
      spiralElements.push(
        <mesh key={`spiral-${i}`} 
              position={[
                Math.cos(angle) * radius,
                baseAltitude + height,
                Math.sin(angle) * radius
              ]}>
          <sphereGeometry args={[0.2]} />
          <meshStandardMaterial 
            color="#00ffff" 
            emissive="#00ffff" 
            emissiveIntensity={0.8}
          />
        </mesh>
      );
    }
    
    // Moving electron
    const electronT = (timeRef.current * 0.2) % 1;
    const electronAngle = electronT * spiralTurns * Math.PI * 2;
    const electronRadius = spiralRadius * (1 - electronT * 0.5);
    const electronHeight = electronT * 6;
    
    spiralElements.push(
      <mesh key="electron" 
            position={[
              Math.cos(electronAngle) * electronRadius,
              baseAltitude + electronHeight,
              Math.sin(electronAngle) * electronRadius
            ]}>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff" 
          emissiveIntensity={1.0}
        />
      </mesh>
    );
    
    return spiralElements;
  };

  // Layer 8 - Rhombus Nexus Web
  const renderRhombusNexusWeb = (baseAltitude: number) => {
    const webElements = [];
    const rhombusCount = 8;
    
    // Create rhombus panels
    for (let i = 0; i < rhombusCount; i++) {
      const angle = (i / rhombusCount) * Math.PI * 2;
      const radius = 6;
      
      webElements.push(
        <mesh key={`rhombus-${i}`} 
              position={[
                Math.cos(angle) * radius,
                baseAltitude + 1,
                Math.sin(angle) * radius
              ]}
              rotation={[0, angle, Math.PI / 4]}>
          <boxGeometry args={[2, 2, 0.1]} />
          <meshStandardMaterial 
            color="#ff1493" 
            emissive="#ff1493" 
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
          />
        </mesh>
      );
      
      // Connecting beams to center
      const beamLength = radius;
      webElements.push(
        <mesh key={`beam-${i}`} 
              position={[
                Math.cos(angle) * radius * 0.5,
                baseAltitude + 1,
                Math.sin(angle) * radius * 0.5
              ]}
              rotation={[0, angle, 0]}>
          <cylinderGeometry args={[0.05, 0.05, beamLength]} />
          <meshStandardMaterial 
            color="#ffffff" 
            emissive="#ff1493" 
            emissiveIntensity={0.5}
          />
        </mesh>
      );
    }
    
    return webElements;
  };

  // Layer 9 - Quantum Fracture
  const renderQuantumFracture = (baseAltitude: number) => {
    const fractures = [];
    
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 10;
      const jitterX = Math.sin(timeRef.current * 3 + i) * 0.3;
      const jitterY = Math.cos(timeRef.current * 2.5 + i) * 0.3;
      const jitterZ = Math.sin(timeRef.current * 2.8 + i) * 0.3;
      const fade = Math.sin(timeRef.current * 1.5 + i) * 0.3 + 0.7;
      
      fractures.push(
        <mesh key={`fracture-${i}`} 
              position={[
                Math.cos(angle) * radius + jitterX,
                baseAltitude + 1 + jitterY,
                Math.sin(angle) * radius + jitterZ
              ]}
              rotation={[
                timeRef.current * 0.1 + i,
                timeRef.current * 0.15 + i,
                timeRef.current * 0.05 + i
              ]}>
          <octahedronGeometry args={[0.8]} />
          <meshStandardMaterial 
            color="#ff69b4" 
            transparent 
            opacity={fade * 0.6}
            emissive="#ff69b4"
            emissiveIntensity={0.2}
          />
        </mesh>
      );
    }
    
    return fractures;
  };

  // Layer 10 - Collapse Spiral Core
  const renderCollapseSpiralCore = (baseAltitude: number) => {
    const coreElements = [];
    const collapseScale = Math.sin(timeRef.current * 0.5) * 0.3 + 0.7;
    
    // Central black torus
    coreElements.push(
      <mesh key="central-torus" 
            position={[0, baseAltitude + 2, 0]}
            scale={[collapseScale, collapseScale, collapseScale]}>
        <torusGeometry args={[3, 1, 8, 32]} />
        <meshStandardMaterial 
          color="#000000" 
          emissive="#8b0000" 
          emissiveIntensity={0.8}
        />
      </mesh>
    );
    
    // Rotating panels being drawn inward
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + timeRef.current * 0.3;
      const radius = 8 - Math.sin(timeRef.current * 0.5) * 2;
      const inwardPull = Math.sin(timeRef.current * 0.8) * 0.5;
      
      coreElements.push(
        <mesh key={`panel-${i}`} 
              position={[
                Math.cos(angle) * (radius - inwardPull),
                baseAltitude + 2,
                Math.sin(angle) * (radius - inwardPull)
              ]}
              rotation={[0, angle, Math.sin(timeRef.current) * 0.2]}>
          <boxGeometry args={[1.5, 0.1, 3]} />
          <meshStandardMaterial 
            color="#8b0000" 
            emissive="#ff4500" 
            emissiveIntensity={0.6}
          />
        </mesh>
      );
    }
    
    // Central red-orange glow
    coreElements.push(
      <pointLight key="core-light" 
                  position={[0, baseAltitude + 2, 0]}
                  color="#ff4500"
                  intensity={2}
                  distance={20} />
    );
    
    return coreElements;
  };

  // Background geometry renderer for each layer
  const renderLayerBackground = (layerId: number, baseAltitude: number) => {
    const backgroundElements: JSX.Element[] = [];

    switch (layerId) {
      case 2: // Debris Field - Floating metal cubes and broken panels
        for (let i = 0; i < 12; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 20 + Math.random() * 15;
          const height = Math.random() * 10 - 5;
          backgroundElements.push(
            <mesh key={`debris-bg-${i}`} 
                  position={[
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius
                  ]}
                  rotation={[
                    timeRef.current * 0.1 + i,
                    timeRef.current * 0.15 + i,
                    timeRef.current * 0.05 + i
                  ]}>
              <boxGeometry args={[1 + Math.random(), 0.5 + Math.random(), 2 + Math.random()]} />
              <meshStandardMaterial color="#666666" wireframe={Math.random() > 0.5} />
            </mesh>
          );
        }
        break;

      case 3: // Crystal Drift - Large faceted crystal shards
        for (let i = 0; i < 8; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 25 + Math.random() * 10;
          const height = Math.sin(timeRef.current * 0.3 + i) * 3;
          backgroundElements.push(
            <group key={`crystal-bg-${i}`} 
                   position={[
                     Math.cos(angle) * radius,
                     height,
                     Math.sin(angle) * radius
                   ]}
                   rotation={[0, timeRef.current * 0.1 + i, 0]}>
              <mesh>
                <octahedronGeometry args={[2 + Math.random() * 2]} />
                <meshStandardMaterial 
                  color="#a855f7" 
                  transparent 
                  opacity={0.6}
                  emissive="#c084fc"
                  emissiveIntensity={0.2}
                />
              </mesh>
              {/* Orbiting glow sphere */}
              <mesh position={[4, 0, 0]} rotation={[0, timeRef.current * 0.5, 0]}>
                <sphereGeometry args={[0.3]} />
                <meshStandardMaterial 
                  color="#ffffff" 
                  emissive="#ffffff" 
                  emissiveIntensity={0.8}
                />
              </mesh>
            </group>
          );
        }
        break;

      case 4: // Arc Conduits - Floating U and L-shaped tubes
        for (let i = 0; i < 10; i++) {
          const drift = timeRef.current * 0.2 + i;
          const x = Math.sin(drift) * 30;
          const z = (i - 5) * 8;
          const glowFlicker = Math.sin(timeRef.current * 4 + i) * 0.3 + 0.7;
          backgroundElements.push(
            <group key={`conduit-bg-${i}`} position={[x, Math.sin(drift) * 2, z]}>
              {/* L-shaped conduit */}
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 4]} />
                <meshStandardMaterial color="#333333" />
              </mesh>
              <mesh position={[2, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                <cylinderGeometry args={[0.3, 0.3, 4]} />
                <meshStandardMaterial color="#333333" />
              </mesh>
              {/* Inner glow */}
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 4.2]} />
                <meshStandardMaterial 
                  color="#00aaff" 
                  emissive="#00aaff" 
                  emissiveIntensity={glowFlicker}
                />
              </mesh>
            </group>
          );
        }
        break;

      case 5: // Reactor Bones - Ribcage-like arc structures
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const breathe = Math.sin(timeRef.current * 0.8) * 0.2 + 1;
          backgroundElements.push(
            <group key={`rib-bg-${i}`} 
                   position={[
                     Math.cos(angle) * 25,
                     0,
                     Math.sin(angle) * 25
                   ]}
                   scale={[breathe, breathe, breathe]}
                   rotation={[0, angle, 0]}>
              {/* Curved rib structure */}
              <mesh position={[0, 3, 0]} rotation={[0, 0, Math.PI/4]}>
                <torusGeometry args={[4, 0.3, 8, 16]} />
                <meshStandardMaterial color="#8b0000" />
              </mesh>
              <mesh position={[0, -3, 0]} rotation={[0, 0, -Math.PI/4]}>
                <torusGeometry args={[4, 0.3, 8, 16]} />
                <meshStandardMaterial color="#2f2f2f" />
              </mesh>
            </group>
          );
        }
        break;

      case 6: // Grid Rain - Falling pixel squares
        for (let stream = 0; stream < 15; stream++) {
          const x = (stream - 7) * 4;
          const z = Math.random() * 40 - 20;
          for (let drop = 0; drop < 8; drop++) {
            const fallSpeed = 0.5 + Math.random() * 0.3;
            const y = ((timeRef.current * fallSpeed + drop * 3) % 20) - 10;
            backgroundElements.push(
              <mesh key={`rain-${stream}-${drop}`} 
                    position={[x, y, z]}>
                <boxGeometry args={[0.3, 0.3, 0.3]} />
                <meshStandardMaterial 
                  color="#00ff00" 
                  emissive="#00ff00" 
                  emissiveIntensity={0.6}
                />
              </mesh>
            );
          }
        }
        break;

      case 7: // Bio-Tendril Space - Curving root tubes
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const waveOffset = Math.sin(timeRef.current * 0.5 + i) * 2;
          backgroundElements.push(
            <group key={`tendril-bg-${i}`} 
                   position={[
                     Math.cos(angle) * 20,
                     waveOffset,
                     Math.sin(angle) * 20
                   ]}>
              {/* Root tube segments */}
              {Array.from({length: 6}).map((_, segment) => {
                const segmentWave = Math.sin(timeRef.current * 0.3 + i + segment) * 1;
                return (
                  <mesh key={segment} 
                        position={[0, segment * 2 + segmentWave, 0]}>
                    <cylinderGeometry args={[0.4 - segment * 0.05, 0.4 - (segment + 1) * 0.05, 2]} />
                    <meshStandardMaterial 
                      color="#00ffaa" 
                      emissive="#004d40" 
                      emissiveIntensity={0.2}
                    />
                  </mesh>
                );
              })}
              {/* Node bulb at end */}
              <mesh position={[0, 12 + waveOffset, 0]}>
                <sphereGeometry args={[0.8]} />
                <meshStandardMaterial 
                  color="#40e0d0" 
                  emissive="#40e0d0" 
                  emissiveIntensity={0.4}
                />
              </mesh>
            </group>
          );
        }
        break;

      case 9: // Shatter Fracture - Irregular floating triangles
        for (let i = 0; i < 20; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 15 + Math.random() * 20;
          const jitter = Math.sin(timeRef.current * 2 + i) * 0.3;
          const flicker = Math.sin(timeRef.current * 3 + i) > 0 ? 0.8 : 0.3;
          backgroundElements.push(
            <mesh key={`shatter-bg-${i}`} 
                  position={[
                    Math.cos(angle) * radius + jitter,
                    Math.random() * 10 - 5,
                    Math.sin(angle) * radius + jitter
                  ]}
                  rotation={[
                    timeRef.current * 0.2 + i,
                    timeRef.current * 0.3 + i,
                    timeRef.current * 0.1 + i
                  ]}>
              <coneGeometry args={[1, 0.1, 3]} />
              <meshStandardMaterial 
                color="#ff1493" 
                transparent 
                opacity={flicker}
                emissive="#ff69b4"
                emissiveIntensity={0.3}
              />
            </mesh>
          );
        }
        break;

      case 10: // Collapse Core - Angular slabs spiraling inward
        for (let i = 0; i < 12; i++) {
          const spiralAngle = (i / 12) * Math.PI * 2 + timeRef.current * 0.1;
          const spiralRadius = 30 - Math.sin(timeRef.current * 0.3) * 5;
          const inwardPull = Math.sin(timeRef.current * 0.2) * 2;
          backgroundElements.push(
            <mesh key={`collapse-bg-${i}`} 
                  position={[
                    Math.cos(spiralAngle) * (spiralRadius - inwardPull),
                    Math.sin(timeRef.current * 0.1 + i) * 3,
                    Math.sin(spiralAngle) * (spiralRadius - inwardPull)
                  ]}
                  rotation={[0, spiralAngle, Math.sin(timeRef.current + i) * 0.2]}>
              <boxGeometry args={[2, 0.5, 4]} />
              <meshStandardMaterial 
                color="#1a1a1a" 
                emissive="#ff4500" 
                emissiveIntensity={0.2}
              />
            </mesh>
          );
        }
        // Central singularity orb
        backgroundElements.push(
          <mesh key="singularity-orb" position={[0, 0, 0]}>
            <sphereGeometry args={[1]} />
            <meshStandardMaterial 
              color="#000000" 
              emissive="#ff4500" 
              emissiveIntensity={0.8}
            />
          </mesh>
        );
        break;
      
      default:
        // No background elements for other layers
        break;
    }

    return backgroundElements;
  };

  // Main platform renderer
  const renderLayerPlatform = (layerId: number, baseAltitude: number) => {
    // Base platform for cannon mounting
    const basePlatform = (
      <mesh key="base-platform" position={[0, baseAltitude - 1, 0]}>
        <cylinderGeometry args={[15, 15, 0.5]} />
        <meshStandardMaterial color="#333333" transparent opacity={0.3} />
      </mesh>
    );

    let layerGeometry;
    switch (layerId) {
      case 1:
        layerGeometry = [];
        break;
      case 2:
        layerGeometry = renderFragmentedPlates(baseAltitude);
        break;
      case 3:
        layerGeometry = renderCrystalCrossArray(baseAltitude);
        break;
      case 4:
        layerGeometry = renderGridCircuitSink(baseAltitude);
        break;
      case 5:
        layerGeometry = renderConcentricRingFins(baseAltitude);
        break;
      case 6:
        layerGeometry = renderTriPillarField(baseAltitude);
        break;
      case 7:
        layerGeometry = renderSpiralCircuitCore(baseAltitude);
        break;
      case 8:
        layerGeometry = renderRhombusNexusWeb(baseAltitude);
        break;
      case 9:
        layerGeometry = renderQuantumFracture(baseAltitude);
        break;
      case 10:
        layerGeometry = renderCollapseSpiralCore(baseAltitude);
        break;
      default:
        layerGeometry = [];
    }

    return [basePlatform, ...layerGeometry];
  };

  // Generate complete layer environment
  const renderLayer = (layerId: number) => {
    if (layerId < 1 || layerId > 10) return null;

    // Space layers 1000 units apart as requested
    const baseAltitude = layerId * 1000;
    const platformElements = renderLayerPlatform(layerId, baseAltitude);
    const backgroundElements = renderLayerBackground(layerId, baseAltitude);

    return (
      <group key={`layer-${layerId}`} position={[0, baseAltitude, 0]}>
        {/* Platform elements at this layer's altitude */}
        {platformElements}
        
        {/* Background elements at layer altitude */}
        {backgroundElements}
        
        {/* Layer number indicator */}
        <mesh position={[0, 8, 0]}>
          <sphereGeometry args={[0.8]} />
          <meshStandardMaterial 
            color="#ffffff" 
            emissive="#ffffff" 
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
    );
  };

  // Render all layers for now to ensure visibility
  const layersToRender = useMemo(() => {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }, []);

  return (
    <group>
      {layersToRender.map(layerId => renderLayer(layerId))}
      
      {/* Global ambient lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
    </group>
  );
};