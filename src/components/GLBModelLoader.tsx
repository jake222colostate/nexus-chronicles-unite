
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Mesh, Group } from 'three';

interface GLBModelProps {
  modelUrl: string;
  position: [number, number, number];
  scale?: number;
  onClick: () => void;
  name: string;
  isUnlocked: boolean;
  isWithinRange: boolean;
  isPurchased?: boolean;
  cost: number;
  canAfford: boolean;
  opacity?: number;
}

// Clean GLB Model component with no visual artifacts
const SafeGLBModel: React.FC<GLBModelProps> = ({ 
  modelUrl, 
  position, 
  scale = 1,
  onClick, 
  name, 
  isUnlocked, 
  isWithinRange,
  isPurchased = false,
  cost,
  canAfford,
  opacity = 1
}) => {
  const groupRef = useRef<Group>(null);
  const glowRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [loadError, setLoadError] = useState(false);
  
  // Load GLB model with proper error handling
  let gltfScene = null;
  try {
    const gltf = useGLTF(modelUrl);
    gltfScene = gltf.scene;
  } catch (error) {
    console.log(`Failed to load model for ${name}:`, error);
    setLoadError(true);
  }
  
  // Enhanced click handler with better debugging
  const handleClick = (event: any) => {
    event.stopPropagation();
    console.log(`Clicked on ${name}. Within range: ${isWithinRange}, Can afford: ${canAfford}`);
    onClick();
  };
  
  useFrame((state) => {
    if (groupRef.current) {
      // Simple floating animation
      if (isPurchased) {
        groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.1;
        groupRef.current.rotation.y += 0.002;
      } else {
        groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.2;
        groupRef.current.rotation.y += 0.005;
      }
      
      // Simple hover effects
      if (hovered && isWithinRange) {
        const hoverScale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
        groupRef.current.scale.setScalar(scale * hoverScale);
      } else {
        groupRef.current.scale.setScalar(scale);
      }
    }

    // Simple glow effect
    if (glowRef.current) {
      if (isPurchased) {
        const purchasedGlow = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.8;
        glowRef.current.scale.setScalar(purchasedGlow * 1.2);
      } else if (canAfford && isWithinRange) {
        const activeGlow = Math.sin(state.clock.elapsedTime * 3) * 0.4 + 1;
        glowRef.current.scale.setScalar(activeGlow);
      } else {
        const defaultGlow = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.7;
        glowRef.current.scale.setScalar(defaultGlow);
      }
    }
  });

  // Clean bright fallback - no black/grey elements
  if (loadError || !gltfScene) {
    return (
      <group
        ref={groupRef}
        position={position}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Invisible interaction sphere */}
        <mesh>
          <sphereGeometry args={[scale * 6]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {/* Bright crystal - no dark elements */}
        <mesh>
          <octahedronGeometry args={[scale * 1.2]} />
          <meshLambertMaterial 
            color={
              isPurchased ? "#10b981" : 
              canAfford ? "#a855f7" : 
              "#c084fc"
            } 
            transparent 
            opacity={0.8 * opacity} 
          />
        </mesh>
        
        {/* Simple bright glow */}
        <mesh ref={glowRef} position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[scale * 2]} />
          <meshBasicMaterial
            color="#a855f7"
            transparent
            opacity={0.3 * opacity}
          />
        </mesh>
      </group>
    );
  }

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Invisible interaction sphere */}
      <mesh>
        <sphereGeometry args={[scale * 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Clean glow beneath model */}
      <mesh ref={glowRef} position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[scale * 2.5]} />
        <meshBasicMaterial
          color={
            isPurchased ? "#10b981" : 
            canAfford ? "#c084fc" : 
            "#a855f7"
          }
          transparent
          opacity={0.4 * opacity}
        />
      </mesh>

      {/* Main 3D model with opacity applied */}
      <group>
        <primitive 
          object={gltfScene.clone()} 
          scale={scale * (isPurchased ? 1.1 : canAfford ? 1 : 0.8)}
        />
        {gltfScene.clone().traverse((child: any) => {
          if (child.isMesh && child.material) {
            child.material.transparent = true;
            child.material.opacity = opacity;
          }
        })}
      </group>
      
      {/* Simple purchase indicator */}
      {isPurchased && (
        <mesh position={[0, scale * 2.5, 0]}>
          <sphereGeometry args={[0.15]} />
          <meshBasicMaterial color="#10b981" transparent opacity={opacity} />
        </mesh>
      )}
      
      {/* Simple interaction indicator */}
      {isWithinRange && !isPurchased && (
        <mesh position={[0, scale * 2.2, 0]}>
          <ringGeometry args={[0.3, 0.4]} />
          <meshBasicMaterial 
            color={canAfford ? "#ffffff" : "#ff6b6b"} 
            transparent 
            opacity={0.8 * opacity} 
          />
        </mesh>
      )}
    </group>
  );
};

// Error boundary component for GLB models
class GLBModelErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.warn('GLB Model Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Main export component with error boundary
export const GLBModel: React.FC<GLBModelProps> = (props) => {
  const fallbackComponent = (
    <group
      position={props.position}
      onClick={props.onClick}
    >
      <mesh>
        <octahedronGeometry args={[props.scale || 1]} />
        <meshLambertMaterial 
          color="#a855f7"
          transparent 
          opacity={0.7} 
        />
      </mesh>
    </group>
  );

  return (
    <GLBModelErrorBoundary fallback={fallbackComponent}>
      <SafeGLBModel {...props} />
    </GLBModelErrorBoundary>
  );
};

// Updated model URLs using the correct GitHub path
const workingModelUrls = [
  'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb',
  'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb',
  'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_03.glb',
  'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_05.glb'
];

// Preload only confirmed working models
workingModelUrls.forEach(url => {
  try {
    useGLTF.preload(url);
    console.log(`Preloading model: ${url}`);
  } catch (error) {
    console.warn(`Failed to preload model: ${url}`, error);
  }
});
