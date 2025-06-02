
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FantasyMagicalSkyboxProps {
  realm: 'fantasy' | 'scifi';
}

const AuroraRibbon: React.FC<{ position: [number, number, number]; seed: number; color: string }> = ({ position, seed, color }) => {
  const ribbonRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ribbonRef.current) {
      const time = state.clock.elapsedTime + seed;
      ribbonRef.current.rotation.z = time * 0.1;
      const material = ribbonRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 + Math.sin(time * 0.8) * 0.2;
    }
  });

  return (
    <mesh ref={ribbonRef} position={position}>
      <planeGeometry args={[40, 12]} />
      <meshBasicMaterial 
        color={color}
        transparent
        opacity={0.4}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export const FantasyMagicalSkybox: React.FC<FantasyMagicalSkyboxProps> = ({ realm }) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  // Generate magical stars
  const stars = useMemo(() => {
    return Array.from({ length: 300 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 500,
        40 + Math.random() * 150,
        (Math.random() - 0.5) * 500
      ] as [number, number, number],
      scale: 0.02 + Math.random() * 0.04,
      color: Math.random() > 0.5 ? '#FFFFFF' : '#FFD700'
    }));
  }, []);

  // Generate aurora ribbons
  const auroraRibbons = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 200,
        60 + Math.random() * 40,
        (Math.random() - 0.5) * 200
      ] as [number, number, number],
      seed: i * 234,
      color: i % 3 === 0 ? '#00FFFF' : i % 3 === 1 ? '#FF69B4' : '#9932CC'
    }));
  }, []);

  return (
    <group>
      {/* Main gradient skybox sphere - matching reference colors */}
      <mesh>
        <sphereGeometry args={[300, 32, 32]} />
        <meshBasicMaterial 
          side={THREE.BackSide}
        >
          <primitive 
            object={new THREE.CanvasTexture((() => {
              const canvas = document.createElement('canvas');
              canvas.width = 1024;
              canvas.height = 1024;
              const ctx = canvas.getContext('2d')!;
              
              // Create magical gradient matching reference: deep blue to purple with aurora hints
              const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
              gradient.addColorStop(0, '#1E1B4B'); // Deep indigo at top
              gradient.addColorStop(0.3, '#4338CA'); // Royal blue
              gradient.addColorStop(0.6, '#7C3AED'); // Purple
              gradient.addColorStop(0.8, '#A855F7'); // Light purple
              gradient.addColorStop(1, '#EC4899'); // Pink at horizon
              
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // Add aurora-like streaks
              ctx.globalCompositeOperation = 'lighter';
              for (let i = 0; i < 20; i++) {
                const auroraGradient = ctx.createLinearGradient(
                  Math.random() * canvas.width, 0,
                  Math.random() * canvas.width, canvas.height * 0.6
                );
                auroraGradient.addColorStop(0, 'rgba(0, 255, 255, 0.1)');
                auroraGradient.addColorStop(0.5, 'rgba(255, 105, 180, 0.2)');
                auroraGradient.addColorStop(1, 'rgba(147, 51, 234, 0.1)');
                
                ctx.fillStyle = auroraGradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
              }
              
              return canvas;
            })())}
          />
        </meshBasicMaterial>
      </mesh>

      {/* Scattered magical stars */}
      {stars.map((star, i) => (
        <mesh key={`star_${i}`} position={star.position} scale={star.scale}>
          <sphereGeometry args={[1, 6, 4]} />
          <meshStandardMaterial 
            color={star.color}
            emissive={star.color}
            emissiveIntensity={0.9}
          />
        </mesh>
      ))}

      {/* Aurora ribbon effects */}
      {auroraRibbons.map((aurora, i) => (
        <AuroraRibbon
          key={`aurora_${i}`}
          position={aurora.position}
          seed={aurora.seed}
          color={aurora.color}
        />
      ))}

      {/* Additional floating magical effects */}
      <group>
        {Array.from({ length: 20 }, (_, i) => (
          <mesh 
            key={`magic_${i}`} 
            position={[
              (Math.random() - 0.5) * 150,
              30 + Math.random() * 50,
              (Math.random() - 0.5) * 150
            ]}
            rotation={[0, Math.random() * Math.PI * 2, 0]}
          >
            <ringGeometry args={[3, 5, 8]} />
            <meshBasicMaterial 
              color={i % 2 === 0 ? '#00FFFF' : '#FF69B4'}
              transparent
              opacity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
