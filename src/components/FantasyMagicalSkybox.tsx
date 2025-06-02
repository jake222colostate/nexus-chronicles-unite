
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FantasyMagicalSkyboxProps {
  realm: 'fantasy' | 'scifi';
}

const FloatingNebula: React.FC<{ position: [number, number, number]; seed: number }> = ({ position, seed }) => {
  const nebulaRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (nebulaRef.current) {
      const time = state.clock.elapsedTime + seed;
      nebulaRef.current.rotation.z = time * 0.1;
      const material = nebulaRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.2 + Math.sin(time * 0.5) * 0.1;
    }
  });

  return (
    <mesh ref={nebulaRef} position={position}>
      <planeGeometry args={[20, 15]} />
      <meshBasicMaterial 
        color="#9c27b0"
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const PulsingLight: React.FC<{ position: [number, number, number]; seed: number }> = ({ position, seed }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    if (lightRef.current) {
      const time = state.clock.elapsedTime + seed;
      lightRef.current.intensity = 0.2 + Math.sin(time * 0.3) * 0.2;
    }
  });

  return (
    <pointLight 
      ref={lightRef}
      position={position}
      color="#ffffff"
      intensity={0.2}
      distance={50}
    />
  );
};

export const FantasyMagicalSkybox: React.FC<FantasyMagicalSkyboxProps> = ({ realm }) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  // Generate random star positions
  const stars = useMemo(() => {
    return Array.from({ length: 200 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 400,
        30 + Math.random() * 100,
        (Math.random() - 0.5) * 400
      ] as [number, number, number],
      scale: 0.02 + Math.random() * 0.03
    }));
  }, []);

  // Generate nebula positions
  const nebulae = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 300,
        40 + Math.random() * 60,
        (Math.random() - 0.5) * 300
      ] as [number, number, number],
      seed: i * 123
    }));
  }, []);

  // Generate pulsing lights
  const lights = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 200,
        50 + Math.random() * 40,
        (Math.random() - 0.5) * 200
      ] as [number, number, number],
      seed: i * 456
    }));
  }, []);

  return (
    <group>
      {/* Main gradient skybox sphere */}
      <mesh>
        <sphereGeometry args={[200, 32, 32]} />
        <meshBasicMaterial 
          side={THREE.BackSide}
        >
          <primitive 
            object={new THREE.CanvasTexture((() => {
              const canvas = document.createElement('canvas');
              canvas.width = 1024;
              canvas.height = 1024;
              const ctx = canvas.getContext('2d')!;
              
              // Create magical gradient: bottom #260c63, top #4c1b70
              const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
              gradient.addColorStop(0, '#4c1b70'); // Top
              gradient.addColorStop(0.4, '#3d1a58'); // Mid-upper
              gradient.addColorStop(0.7, '#2e1340'); // Mid-lower
              gradient.addColorStop(1, '#260c63'); // Bottom
              
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // Add magical shimmer and texture
              ctx.fillStyle = 'rgba(156, 39, 176, 0.1)';
              for (let i = 0; i < 150; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const size = Math.random() * 6;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
              }
              
              return canvas;
            })())}
          />
        </meshBasicMaterial>
      </mesh>

      {/* Scattered stars */}
      {stars.map((star, i) => (
        <mesh key={`star_${i}`} position={star.position} scale={star.scale}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial 
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}

      {/* Floating nebula effects */}
      {nebulae.map((nebula, i) => (
        <FloatingNebula
          key={`nebula_${i}`}
          position={nebula.position}
          seed={nebula.seed}
        />
      ))}

      {/* Pulsing magical lights */}
      {lights.map((light, i) => (
        <PulsingLight
          key={`light_${i}`}
          position={light.position}
          seed={light.seed}
        />
      ))}

      {/* Additional atmospheric elements */}
      <group>
        {Array.from({ length: 12 }, (_, i) => (
          <mesh 
            key={`atmosphere_${i}`} 
            position={[
              (Math.random() - 0.5) * 150,
              20 + Math.random() * 30,
              (Math.random() - 0.5) * 150
            ]}
            rotation={[0, Math.random() * Math.PI * 2, 0]}
          >
            <planeGeometry args={[25, 8]} />
            <meshBasicMaterial 
              color={i % 2 === 0 ? '#9c27b0' : '#673ab7'}
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
