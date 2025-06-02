
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const AuroraStrip: React.FC<{ position: [number, number, number]; seed: number }> = ({ position, seed }) => {
  const auroraRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (auroraRef.current) {
      const time = state.clock.elapsedTime + seed;
      const material = auroraRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 + Math.sin(time * 0.5) * 0.2;
      auroraRef.current.rotation.z = Math.sin(time * 0.2) * 0.1;
    }
  });

  return (
    <mesh ref={auroraRef} position={position} rotation={[0, 0, seed]}>
      <planeGeometry args={[60, 20]} />
      <meshBasicMaterial 
        color={new THREE.Color().setHSL(0.6 + Math.sin(seed) * 0.2, 0.8, 0.6)}
        transparent
        opacity={0.4}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

export const FantasySkybox: React.FC = () => {
  // Generate stars
  const stars = useMemo(() => {
    return Array.from({ length: 300 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 800,
        Math.random() * 200 + 50,
        (Math.random() - 0.5) * 800
      ] as [number, number, number],
      scale: 0.5 + Math.random() * 1.5
    }));
  }, []);

  // Generate aurora positions
  const auroras = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 400,
        80 + Math.random() * 40,
        (Math.random() - 0.5) * 400
      ] as [number, number, number],
      seed: i * 123.456
    }));
  }, []);

  return (
    <group>
      {/* Main skybox sphere */}
      <mesh>
        <sphereGeometry args={[400, 32, 32]} />
        <meshBasicMaterial 
          side={THREE.BackSide}
        >
          <primitive 
            object={(() => {
              const canvas = document.createElement('canvas');
              canvas.width = 512;
              canvas.height = 512;
              const ctx = canvas.getContext('2d')!;
              
              // Create gradient from reference image
              const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
              gradient.addColorStop(0, '#2d1b69'); // Top - deep purple
              gradient.addColorStop(0.3, '#4a2c84'); // Upper mid
              gradient.addColorStop(0.6, '#5c3699'); // Lower mid
              gradient.addColorStop(0.8, '#7b4fb8'); // Near horizon
              gradient.addColorStop(1, '#9a6dd4'); // Horizon - lighter purple
              
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // Add subtle nebula effects
              ctx.fillStyle = 'rgba(100, 255, 255, 0.08)';
              for (let i = 0; i < 50; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const size = Math.random() * 20 + 5;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
              }
              
              return new THREE.CanvasTexture(canvas);
            })()}
          />
        </meshBasicMaterial>
      </mesh>

      {/* Stars */}
      {stars.map((star, i) => (
        <mesh key={`star-${i}`} position={star.position} scale={star.scale}>
          <sphereGeometry args={[0.3, 6, 6]} />
          <meshStandardMaterial 
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}

      {/* Aurora effects */}
      {auroras.map((aurora, i) => (
        <AuroraStrip
          key={`aurora-${i}`}
          position={aurora.position}
          seed={aurora.seed}
        />
      ))}

      {/* Horizon glow */}
      <mesh position={[0, -10, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[100, 200, 32]} />
        <meshBasicMaterial 
          color="#9a6dd4"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
