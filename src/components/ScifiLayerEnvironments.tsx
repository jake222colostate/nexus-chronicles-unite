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

  // Layer 2 - Clean Crystal Formation
  const renderCleanCrystalFormation = (baseAltitude: number) => {
    const crystals = [];
    
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const radius = 8;
      
      crystals.push(
        <mesh key={`crystal-${i}`} 
              position={[
                Math.cos(angle) * radius,
                baseAltitude + 1,
                Math.sin(angle) * radius
              ]}>
          <octahedronGeometry args={[1.5]} />
          <meshStandardMaterial 
            color="#40e0d0" 
            emissive="#40e0d0" 
            emissiveIntensity={0.2}
            transparent 
            opacity={0.8} 
          />
        </mesh>
      );
    }
    
    return crystals;
  };

  // Layer 3 - Simple Floating Rings
  const renderSimpleFloatingRings = (baseAltitude: number) => {
    const rings = [];
    
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const radius = 6;
      
      rings.push(
        <mesh key={`ring-${i}`} 
              position={[
                Math.cos(angle) * radius,
                baseAltitude + 1,
                Math.sin(angle) * radius
              ]}
              rotation={[0, timeRef.current * 0.2, 0]}>
          <torusGeometry args={[2, 0.3, 8, 32]} />
          <meshStandardMaterial 
            color="#00ff88" 
            emissive="#00ff88" 
            emissiveIntensity={0.3}
          />
        </mesh>
      );
    }
    
    return rings;
  };

  // Layer 4 - Minimal Grid Pattern
  const renderMinimalGridPattern = (baseAltitude: number) => {
    const gridElements = [];
    
    for (let x = -6; x <= 6; x += 3) {
      for (let z = -6; z <= 6; z += 3) {
        if (x !== 0 || z !== 0) { // Skip center
          gridElements.push(
            <mesh key={`grid-${x}-${z}`} 
                  position={[x, baseAltitude, z]}>
              <boxGeometry args={[1.5, 0.2, 1.5]} />
              <meshStandardMaterial 
                color="#ffaa00" 
                emissive="#ffaa00" 
                emissiveIntensity={0.4}
              />
            </mesh>
          );
        }
      }
    }
    
    return gridElements;
  };

  // Layer 5 - Clean Pillar Formation
  const renderCleanPillarFormation = (baseAltitude: number) => {
    const pillars = [];
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 7;
      
      pillars.push(
        <mesh key={`pillar-${i}`} 
              position={[
                Math.cos(angle) * radius,
                baseAltitude + 2,
                Math.sin(angle) * radius
              ]}>
          <cylinderGeometry args={[0.4, 0.4, 4]} />
          <meshStandardMaterial 
            color="#9370db" 
            emissive="#9370db" 
            emissiveIntensity={0.3}
          />
        </mesh>
      );
    }
    
    return pillars;
  };

  // Layer 6 - Simple Orbital Spheres
  const renderSimpleOrbitalSpheres = (baseAltitude: number) => {
    const spheres = [];
    
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + timeRef.current * 0.3;
      const radius = 8;
      
      spheres.push(
        <mesh key={`sphere-${i}`} 
              position={[
                Math.cos(angle) * radius,
                baseAltitude + 1,
                Math.sin(angle) * radius
              ]}>
          <sphereGeometry args={[0.8]} />
          <meshStandardMaterial 
            color="#00ffff" 
            emissive="#00ffff" 
            emissiveIntensity={0.5}
          />
        </mesh>
      );
    }
    
    return spheres;
  };

  // Layer 7 - Elegant Cross Pattern
  const renderElegantCrossPattern = (baseAltitude: number) => {
    const crosses = [];
    
    // Create cross formation
    for (let i = 0; i < 5; i++) {
      const offset = (i - 2) * 3;
      
      // Horizontal bar
      crosses.push(
        <mesh key={`h-${i}`} position={[offset, baseAltitude + 1, 0]}>
          <boxGeometry args={[2.5, 0.3, 0.3]} />
          <meshStandardMaterial 
            color="#ff1493" 
            emissive="#ff1493" 
            emissiveIntensity={0.4}
          />
        </mesh>
      );
      
      // Vertical bar
      crosses.push(
        <mesh key={`v-${i}`} position={[0, baseAltitude + 1, offset]}>
          <boxGeometry args={[0.3, 0.3, 2.5]} />
          <meshStandardMaterial 
            color="#ff1493" 
            emissive="#ff1493" 
            emissiveIntensity={0.4}
          />
        </mesh>
      );
    }
    
    return crosses;
  };

  // Layer 8 - Minimal Floating Cubes
  const renderMinimalFloatingCubes = (baseAltitude: number) => {
    const cubes = [];
    
    for (let i = 0; i < 9; i++) {
      const x = ((i % 3) - 1) * 5;
      const z = (Math.floor(i / 3) - 1) * 5;
      const bobHeight = Math.sin(timeRef.current * 0.5 + i) * 0.5;
      
      if (x !== 0 || z !== 0) { // Skip center
        cubes.push(
          <mesh key={`cube-${i}`} 
                position={[x, baseAltitude + 1 + bobHeight, z]}>
            <boxGeometry args={[1.2, 1.2, 1.2]} />
            <meshStandardMaterial 
              color="#ff69b4" 
              emissive="#ff69b4" 
              emissiveIntensity={0.3}
              transparent 
              opacity={0.8}
            />
          </mesh>
        );
      }
    }
    
    return cubes;
  };

  // Layer 9 - Simple Tetrahedron Ring
  const renderSimpleTetrahedronRing = (baseAltitude: number) => {
    const tetrahedrons = [];
    
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const radius = 6;
      
      tetrahedrons.push(
        <mesh key={`tetra-${i}`} 
              position={[
                Math.cos(angle) * radius,
                baseAltitude + 1,
                Math.sin(angle) * radius
              ]}
              rotation={[timeRef.current * 0.1, angle, 0]}>
          <tetrahedronGeometry args={[1]} />
          <meshStandardMaterial 
            color="#32cd32" 
            emissive="#32cd32" 
            emissiveIntensity={0.4}
          />
        </mesh>
      );
    }
    
    return tetrahedrons;
  };

  // Layer 10 - Central Obelisk
  const renderCentralObelisk = (baseAltitude: number) => {
    const elements = [];
    
    // Central obelisk
    elements.push(
      <mesh key="obelisk" position={[0, baseAltitude + 3, 0]}>
        <cylinderGeometry args={[0.5, 1, 6, 4]} />
        <meshStandardMaterial 
          color="#8b0000" 
          emissive="#ff4500" 
          emissiveIntensity={0.5}
        />
      </mesh>
    );
    
    // Orbiting satellites
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + timeRef.current * 0.2;
      const radius = 5;
      
      elements.push(
        <mesh key={`satellite-${i}`} 
              position={[
                Math.cos(angle) * radius,
                baseAltitude + 2,
                Math.sin(angle) * radius
              ]}>
          <octahedronGeometry args={[0.5]} />
          <meshStandardMaterial 
            color="#ffa500" 
            emissive="#ffa500" 
            emissiveIntensity={0.6}
          />
        </mesh>
      );
    }
    
    return elements;
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
        layerGeometry = renderCleanCrystalFormation(baseAltitude);
        break;
      case 3:
        layerGeometry = renderSimpleFloatingRings(baseAltitude);
        break;
      case 4:
        layerGeometry = renderMinimalGridPattern(baseAltitude);
        break;
      case 5:
        layerGeometry = renderCleanPillarFormation(baseAltitude);
        break;
      case 6:
        layerGeometry = renderSimpleOrbitalSpheres(baseAltitude);
        break;
      case 7:
        layerGeometry = renderElegantCrossPattern(baseAltitude);
        break;
      case 8:
        layerGeometry = renderMinimalFloatingCubes(baseAltitude);
        break;
      case 9:
        layerGeometry = renderSimpleTetrahedronRing(baseAltitude);
        break;
      case 10:
        layerGeometry = renderCentralObelisk(baseAltitude);
        break;
      default:
        layerGeometry = [];
    }

    return [basePlatform, ...layerGeometry];
  };

  // Generate complete layer environment
  const renderLayer = (layerId: number) => {
    if (layerId < 1 || layerId > 10) return null;

    // Space layers 20 units apart starting from layer 1 at Y=20
    const baseAltitude = layerId * 20;
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