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
      const angle = (i / 6) * Math.PI * 2 + timeRef.current * 0.05; // Much slower rotation
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
              rotation={[0, timeRef.current * 0.05, 0]}>
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
      const angle = (i / 6) * Math.PI * 2 + timeRef.current * 0.1;
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
      const bobHeight = Math.sin(timeRef.current * 0.1 + i) * 0.3;
      
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
              rotation={[timeRef.current * 0.03, angle, 0]}>
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
      const angle = (i / 4) * Math.PI * 2 + timeRef.current * 0.08;
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
      case 2: // Simple floating debris
        for (let i = 0; i < 8; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 20 + Math.random() * 10;
          const height = Math.random() * 5 - 2.5;
          backgroundElements.push(
            <mesh key={`debris-bg-${i}`} 
                  position={[
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius
                  ]}
                  rotation={[0, 0, 0]}>
              <boxGeometry args={[0.8, 0.8, 0.8]} />
              <meshStandardMaterial color="#666666" />
            </mesh>
          );
        }
        break;

      case 3: // Distant crystals
        for (let i = 0; i < 5; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 25 + Math.random() * 10;
          const height = Math.random() * 4 - 2;
          backgroundElements.push(
            <mesh key={`crystal-bg-${i}`} 
                  position={[
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius
                  ]}>
              <octahedronGeometry args={[1]} />
              <meshStandardMaterial 
                color="#a855f7" 
                transparent 
                opacity={0.6}
                emissive="#c084fc"
                emissiveIntensity={0.2}
              />
            </mesh>
          );
        }
        break;

      case 4: // Floating orange cubes
        for (let i = 0; i < 10; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 18 + Math.random() * 15;
          const height = Math.random() * 8 - 4;
          backgroundElements.push(
            <mesh key={`cube-bg-${i}`} 
                  position={[
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius
                  ]}>
              <boxGeometry args={[0.6, 0.6, 0.6]} />
              <meshStandardMaterial 
                color="#ff8800" 
                emissive="#ff8800" 
                emissiveIntensity={0.2}
              />
            </mesh>
          );
        }
        break;

      case 5: // Purple diamond scatter
        for (let i = 0; i < 12; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 20 + Math.random() * 12;
          const height = Math.random() * 6 - 3;
          backgroundElements.push(
            <mesh key={`diamond-bg-${i}`} 
                  position={[
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius
                  ]}
                  rotation={[0, 0, 0]}>
              <octahedronGeometry args={[0.8]} />
              <meshStandardMaterial 
                color="#9370db" 
                emissive="#9370db" 
                emissiveIntensity={0.3}
              />
            </mesh>
          );
        }
        break;

      case 6: // Cyan floating spheres
        for (let i = 0; i < 8; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 22 + Math.random() * 10;
          const height = Math.random() * 4 - 2;
          backgroundElements.push(
            <mesh key={`sphere-bg-${i}`} 
                  position={[
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius
                  ]}>
              <sphereGeometry args={[0.5]} />
              <meshStandardMaterial 
                color="#00ffff" 
                emissive="#00ffff" 
                emissiveIntensity={0.4}
              />
            </mesh>
          );
        }
        break;

      case 7: // Pink scattered triangles
        for (let i = 0; i < 15; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 16 + Math.random() * 18;
          const height = Math.random() * 10 - 5;
          backgroundElements.push(
            <mesh key={`tri-bg-${i}`} 
                  position={[
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius
                  ]}
                  rotation={[0, 0, 0]}>
              <coneGeometry args={[0.4, 0.1, 3]} />
              <meshStandardMaterial 
                color="#ff1493" 
                emissive="#ff1493" 
                emissiveIntensity={0.3}
              />
            </mesh>
          );
        }
        break;

      case 8: // Multi-colored geometric mix
        for (let i = 0; i < 14; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 19 + Math.random() * 14;
          const height = Math.random() * 7 - 3.5;
          const colors = ['#ff69b4', '#00ff88', '#ffaa00', '#40e0d0'];
          const color = colors[i % 4];
          backgroundElements.push(
            <mesh key={`mix-bg-${i}`} 
                  position={[
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius
                  ]}>
              <dodecahedronGeometry args={[0.6]} />
              <meshStandardMaterial 
                color={color} 
                emissive={color} 
                emissiveIntensity={0.2}
              />
            </mesh>
          );
        }
        break;

      case 9: // Green tetrahedron field
        for (let i = 0; i < 11; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 17 + Math.random() * 16;
          const height = Math.random() * 9 - 4.5;
          backgroundElements.push(
            <mesh key={`tetra-bg-${i}`} 
                  position={[
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius
                  ]}
                  rotation={[0, 0, 0]}>
              <tetrahedronGeometry args={[0.7]} />
              <meshStandardMaterial 
                color="#32cd32" 
                emissive="#32cd32" 
                emissiveIntensity={0.35}
              />
            </mesh>
          );
        }
        break;

      case 10: // Dark red/orange fragments
        for (let i = 0; i < 9; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 21 + Math.random() * 12;
          const height = Math.random() * 5 - 2.5;
          backgroundElements.push(
            <mesh key={`frag-bg-${i}`} 
                  position={[
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius
                  ]}
                  rotation={[0, 0, 0]}>
              <boxGeometry args={[1.2, 0.3, 0.8]} />
              <meshStandardMaterial 
                color="#8b0000" 
                emissive="#ff4500" 
                emissiveIntensity={0.25}
              />
            </mesh>
          );
        }
        break;

      default:
        // No background elements for layer 1 and 3
        break;
    }

    return backgroundElements;
  };

  // Main platform renderer
  const renderLayerPlatform = (layerId: number, baseAltitude: number) => {
    // Base platform with teal color matching the screenshot
    const basePlatform = (
      <group key="base-platform">
        {/* Main hexagonal platform surface */}
        <mesh position={[0, baseAltitude - 1, 0]}>
          <cylinderGeometry args={[15, 15, 0.8, 6]} />
          <meshStandardMaterial 
            color="#4fd1c7" 
            emissive="#4fd1c7" 
            emissiveIntensity={0.1}
          />
        </mesh>
        
        {/* Hexagonal platform rim */}
        <mesh position={[0, baseAltitude - 0.6, 0]}>
          <cylinderGeometry args={[15.2, 14.8, 0.2, 6]} />
          <meshStandardMaterial 
            color="#2a9d8f" 
            emissive="#2a9d8f" 
            emissiveIntensity={0.05}
          />
        </mesh>
        
        {/* Dark cannon mount points */}
        {Array.from({length: 8}).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const radius = 10;
          return (
            <mesh key={`mount-${i}`} 
                  position={[
                    Math.cos(angle) * radius,
                    baseAltitude - 0.3,
                    Math.sin(angle) * radius
                  ]}>
              <cylinderGeometry args={[1.5, 1.5, 0.4]} />
              <meshStandardMaterial color="#2c3e50" />
            </mesh>
          );
        })}
      </group>
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
