
import React, { useMemo, useRef, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FANTASY_PORTAL_URL = 'https://raw.githubusercontent.com/jake222colostate/OK/main/fantasy_portal.glb';

// Fallback portal component using basic geometry
const FallbackPortal: React.FC<{ 
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

  return (
    <group ref={portalRef} position={position}>
      {/* Portal ring */}
      <mesh castShadow receiveShadow>
        <torusGeometry args={[2, 0.3, 16, 100]} />
        <meshStandardMaterial 
          color="#8B5CF6" 
          emissive="#4C1D95" 
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Inner energy field */}
      <mesh>
        <circleGeometry args={[1.8]} />
        <meshBasicMaterial 
          color="#DDA0DD" 
          transparent 
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Portal base */}
      <mesh position={[0, -2.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 2, 1]} />
        <meshStandardMaterial color="#696969" />
      </mesh>
      {/* Click/interaction area */}
      <mesh 
        visible={false}
        onClick={onTierProgression}
      >
        <sphereGeometry args={[4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

// Individual portal component with fallback
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
      console.warn('Fantasy portal scene not loaded, using fallback');
      return <FallbackPortal position={position} onTierProgression={onTierProgression} />;
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
    console.error('Failed to load fantasy portal model, using fallback:', error);
    return <FallbackPortal position={position} onTierProgression={onTierProgression} />;
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

// Don't preload the broken model
console.log('FantasyPortalSystem: Using fallback geometry for portals');
