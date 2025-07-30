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

    const baseAltitude = layerId * 25; // Increased spacing for visibility
    const platformElements = renderLayerPlatform(layerId, baseAltitude);

    return (
      <group key={`layer-${layerId}`} position={[0, baseAltitude, 0]}>
        {platformElements}
        
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

  // Render all layers for visibility
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