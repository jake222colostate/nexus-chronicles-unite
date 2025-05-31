
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FANTASY_PORTAL_URL = 'https://raw.githubusercontent.com/jake222colostate/HIGHPOLY/main/fantasy_portal.glb';

// Fallback portal using basic geometry
const FallbackPortal: React.FC<{ 
  position: [number, number, number]; 
  rotation: number;
}> = ({ position, rotation }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Portal frame */}
      <mesh>
        <torusGeometry args={[3, 0.3, 8, 16]} />
        <meshStandardMaterial 
          color="#8B5CF6" 
          emissive="#4C1D95" 
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Portal energy */}
      <mesh>
        <circleGeometry args={[2.8]} />
        <meshBasicMaterial 
          color="#DDA0DD" 
          transparent 
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// Individual portal component
const FantasyPortal: React.FC<{ 
  position: [number, number, number]; 
  useFallback: boolean;
  onTierProgression?: () => void;
}> = ({ position, useFallback, onTierProgression }) => {
  const portalRef = useRef<THREE.Group>(null);
  
  // Rotate the portal continuously
  useFrame((state, delta) => {
    if (portalRef.current) {
      portalRef.current.rotation.y += delta * 0.5;
    }
  });

  if (useFallback) {
    return (
      <group ref={portalRef}>
        <FallbackPortal position={position} rotation={0} />
      </group>
    );
  }

  try {
    const { scene } = useGLTF(FANTASY_PORTAL_URL);
    
    if (!scene) {
      console.warn('Fantasy portal scene not loaded, using fallback');
      return (
        <group ref={portalRef}>
          <FallbackPortal position={position} rotation={0} />
        </group>
      );
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
    return (
      <group ref={portalRef}>
        <FallbackPortal position={position} rotation={0} />
      </group>
    );
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
  const [modelLoadFailed, setModelLoadFailed] = useState(false);
  const loadAttempted = useRef(false);

  console.log('FantasyPortalSystem render - Realm:', realm, 'Max unlocked:', maxUnlockedUpgrade);

  // Test model loading on mount
  useEffect(() => {
    if (!loadAttempted.current && realm === 'fantasy') {
      loadAttempted.current = true;
      
      const testLoad = async () => {
        try {
          console.log('FantasyPortalSystem: Testing portal model load...');
          const response = await fetch(FANTASY_PORTAL_URL);
          if (!response.ok) {
            console.error('FantasyPortalSystem: Portal model URL not accessible:', response.status);
            setModelLoadFailed(true);
          } else {
            console.log('FantasyPortalSystem: Portal model URL is accessible');
          }
        } catch (error) {
          console.error('FantasyPortalSystem: Portal model URL test failed:', error);
          setModelLoadFailed(true);
        }
      };
      
      testLoad();
    }
  }, [realm]);

  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    console.log('FantasyPortalSystem: Not fantasy realm, skipping');
    return null;
  }

  // Generate portal positions based on upgrade tiers
  const portalPositions = useMemo(() => {
    const positions = [];
    
    // Place portals at the end of each upgrade tier
    // Tiers typically span multiple upgrades
    const upgradesPerTier = 5; // Adjust based on your upgrade system
    const currentTier = Math.floor(maxUnlockedUpgrade / upgradesPerTier);
    
    for (let tier = 0; tier <= currentTier + 1; tier++) {
      const portalZ = -(tier * upgradesPerTier * upgradeSpacing + upgradeSpacing * 2);
      
      // Only show portals that are within render distance
      const distance = Math.abs(portalZ - playerPosition[2]);
      if (distance < 200) {
        positions.push({
          x: 0,
          y: 2,
          z: portalZ,
          tier: tier
        });
      }
    }
    
    console.log(`Total fantasy portals generated: ${positions.length}`);
    return positions;
  }, [maxUnlockedUpgrade, upgradeSpacing, playerPosition]);

  return (
    <group>
      {portalPositions.map((pos, index) => {
        return (
          <FantasyPortal
            key={`fantasy-portal-tier-${pos.tier}`}
            position={[pos.x, pos.y, pos.z]}
            useFallback={modelLoadFailed}
            onTierProgression={onTierProgression}
          />
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
  console.warn('Failed to preload fantasy portal model, will use fallback portals:', error);
}
