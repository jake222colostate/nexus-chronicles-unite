
import React, { useMemo, useRef, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FANTASY_PORTAL_URL = 'https://github.com/jake222colostate/HIGHPOLY/raw/main/fantasy_portal.glb';

// Individual portal component
const FantasyPortal: React.FC<{ 
  position: [number, number, number]; 
  onTierProgression?: () => void;
}> = ({ position, onTierProgression }) => {
  const portalRef = useRef<THREE.Group>(null);
  
  // Rotate the portal continuously
  useFrame((state, delta) => {
    if (portalRef.current) {
      portalRef.current.rotation.y += delta * 0.5;
    }
  });

  try {
    const { scene } = useGLTF(FANTASY_PORTAL_URL);
    
    if (!scene) {
      console.error('Fantasy portal scene not loaded');
      return null;
    }

    console.log('Fantasy portal loaded successfully - Position:', position);
    
    // Clone the scene to avoid sharing geometry between instances
    const clonedScene = scene.clone();
    
    // Ensure all meshes have proper materials and effects
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.needsUpdate = true;
        }
      }
    });
    
    return (
      <group ref={portalRef} position={position}>
        <primitive 
          object={clonedScene} 
          castShadow 
          receiveShadow 
        />
        {/* Add a click/interaction area */}
        <mesh 
          visible={false}
          onClick={onTierProgression}
        >
          <sphereGeometry args={[4]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>
    );
  } catch (error) {
    console.error('Failed to load fantasy portal model:', error);
    return null;
  }
};

interface FantasyPortalSystemProps {
  playerPosition: [number, number, number];
  maxUnlockedUpgrade: number;
  upgradeSpacing: number;
  realm: 'fantasy' | 'scifi';
  onTierProgression?: () => void;
}

export const FantasyPortalSystem: React.FC<FantasyPortalSystemProps> = ({
  playerPosition,
  maxUnlockedUpgrade,
  upgradeSpacing,
  realm,
  onTierProgression
}) => {
  console.log('FantasyPortalSystem render - Realm:', realm, 'Max unlocked:', maxUnlockedUpgrade);

  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    console.log('FantasyPortalSystem: Not fantasy realm, skipping');
    return null;
  }

  // Generate portal positions every 150 meters
  const portalPositions = useMemo(() => {
    const positions = [];
    const portalSpacing = 150; // Every 150 meters as requested
    
    // Place portals based on player position
    const playerZ = playerPosition[2];
    const startZ = Math.floor(playerZ / portalSpacing) * portalSpacing;
    
    // Generate portals in a range around the player
    for (let i = -3; i <= 3; i++) {
      const portalZ = startZ + (i * portalSpacing);
      
      // Only show portals that are within render distance
      const distance = Math.abs(portalZ - playerPosition[2]);
      if (distance < 500) { // Increased render distance for portals
        positions.push({
          x: 0,
          y: 2,
          z: portalZ,
          index: i
        });
      }
    }
    
    console.log(`Total fantasy portals generated: ${positions.length}`);
    return positions;
  }, [playerPosition]);

  return (
    <group>
      {portalPositions.map((pos, index) => {
        return (
          <Suspense key={`fantasy-portal-${pos.index}`} fallback={null}>
            <FantasyPortal
              position={[pos.x, pos.y, pos.z]}
              onTierProgression={onTierProgression}
            />
          </Suspense>
        );
      })}
    </group>
  );
};

// Preload the model for better performance
console.log('Attempting to preload fantasy portal model:', FANTASY_PORTAL_URL);
try {
  useGLTF.preload(FANTASY_PORTAL_URL);
} catch (error) {
  console.error('Failed to preload fantasy portal model:', error);
}
