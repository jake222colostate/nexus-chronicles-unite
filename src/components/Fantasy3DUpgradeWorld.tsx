
import React, { Suspense, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Vector3 } from 'three';

interface Fantasy3DUpgradeWorldProps {
  onUpgradeClick: (upgradeName: string) => void;
  showTapEffect?: boolean;
  onTapEffectComplete?: () => void;
}

// Placeholder upgrade models with geometric shapes
const upgradeModels = [
  { name: 'Mana Altar', description: 'Ancient stones that channel mystical energy' },
  { name: 'Magic Tree', description: 'Enchanted tree pulsing with natural magic' },
  { name: 'Arcane Lab', description: 'Laboratory for magical research and experiments' },
  { name: 'Crystal Tower', description: 'Towering spire of crystallized magic' },
  { name: 'Dream Gate', description: 'Portal to mystical realms beyond' },
];

// Simple 3D Upgrade Component using basic geometries
const PlaceholderUpgrade: React.FC<{
  name: string;
  position: [number, number, number];
  onClick: () => void;
  upgradeIndex: number;
}> = ({ name, position, onClick, upgradeIndex }) => {
  const meshRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
      // Gentle rotation when hovered
      if (hovered) {
        meshRef.current.rotation.y += 0.01;
      }
    }
  });

  // Different shapes for different upgrades
  const getGeometry = () => {
    switch (upgradeIndex) {
      case 0: return <octahedronGeometry args={[0.8]} />; // Mana Altar
      case 1: return <coneGeometry args={[0.6, 1.5, 8]} />; // Magic Tree
      case 2: return <boxGeometry args={[1, 0.8, 1]} />; // Arcane Lab
      case 3: return <cylinderGeometry args={[0.3, 0.5, 2, 6]} />; // Crystal Tower
      case 4: return <torusGeometry args={[0.8, 0.3, 8, 16]} />; // Dream Gate
      default: return <sphereGeometry args={[0.8]} />;
    }
  };

  const getColor = () => {
    const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ec4899'];
    return colors[upgradeIndex] || '#8b5cf6';
  };

  return (
    <group position={position}>
      {/* Main upgrade shape */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        {getGeometry()}
        <meshLambertMaterial
          color={getColor()}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Glow effect */}
      {hovered && (
        <mesh scale={1.3}>
          <sphereGeometry args={[0.9]} />
          <meshBasicMaterial
            color={getColor()}
            transparent
            opacity={0.2}
          />
        </mesh>
      )}

      {/* Name label */}
      <mesh position={[0, 1.5, 0]}>
        <planeGeometry args={[3, 0.5]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
    </group>
  );
};

// Camera controller for smooth scrolling
const CameraController: React.FC<{ targetY: number }> = ({ targetY }) => {
  const { camera } = useThree();
  const targetPosition = useRef(new Vector3(0, targetY, 5));

  useFrame(() => {
    // Smooth camera movement
    camera.position.lerp(targetPosition.current, 0.1);
    camera.lookAt(0, targetY, 0);
  });

  // Update target when targetY changes
  React.useEffect(() => {
    targetPosition.current.set(0, targetY, 5);
  }, [targetY]);

  return null;
};

export const Fantasy3DUpgradeWorld: React.FC<Fantasy3DUpgradeWorldProps> = ({
  onUpgradeClick,
  showTapEffect,
  onTapEffectComplete
}) => {
  const [cameraY, setCameraY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouchY, setLastTouchY] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Handle touch/mouse scroll for vertical movement
  const handleTouchStart = useCallback((e: TouchEvent | MouseEvent) => {
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setLastTouchY(clientY);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = (lastTouchY - clientY) * 0.01; // Adjust sensitivity

    setCameraY(prev => {
      // Constrain camera movement to model positions
      const minY = -(upgradeModels.length - 1) * 3;
      const maxY = 0;
      return Math.max(minY, Math.min(maxY, prev + deltaY));
    });

    setLastTouchY(clientY);
  }, [isDragging, lastTouchY]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle wheel scroll for desktop
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const deltaY = e.deltaY * 0.001;

    setCameraY(prev => {
      const minY = -(upgradeModels.length - 1) * 3;
      const maxY = 0;
      return Math.max(minY, Math.min(maxY, prev + deltaY));
    });
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Add event listeners
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('mousedown', handleTouchStart);
    canvas.addEventListener('mousemove', handleTouchMove);
    canvas.addEventListener('mouseup', handleTouchEnd);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('mousedown', handleTouchStart);
      canvas.removeEventListener('mousemove', handleTouchMove);
      canvas.removeEventListener('mouseup', handleTouchEnd);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleWheel]);

  return (
    <div ref={canvasRef} className="absolute inset-0 w-full h-full">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 60 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          {/* Camera controller for smooth scrolling */}
          <CameraController targetY={cameraY} />

          {/* Lighting setup */}
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <pointLight position={[-5, 5, 5]} intensity={0.5} color="#8b5cf6" />

          {/* Environment for better lighting */}
          <Environment preset="dawn" />

          {/* Ground shadows */}
          <ContactShadows 
            position={[0, -1, 0]} 
            opacity={0.3} 
            scale={10} 
            blur={2} 
            far={4} 
          />

          {/* Display placeholder upgrade models */}
          {upgradeModels.map((upgrade, index) => (
            <PlaceholderUpgrade
              key={upgrade.name}
              name={upgrade.name}
              position={[0, -index * 3, 0]}
              onClick={() => onUpgradeClick(upgrade.name)}
              upgradeIndex={index}
            />
          ))}

          {/* Fog for depth */}
          <fog attach="fog" args={['#000428', 10, 20]} />
        </Suspense>
      </Canvas>

      {/* Scroll indicator */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-2 pointer-events-none">
        {upgradeModels.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              Math.abs(cameraY + index * 3) < 1.5
                ? 'bg-purple-400 scale-125'
                : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Instructions overlay */}
      <div className="absolute bottom-24 left-4 right-4 text-center pointer-events-none">
        <p className="text-white/70 text-sm">
          Scroll or swipe to explore magical upgrades
        </p>
      </div>
    </div>
  );
};
