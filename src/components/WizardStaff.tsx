
import React, { useEffect, useMemo, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface WizardStaffProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  visible?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  [key: string]: any;
}

export const WizardStaff: React.FC<WizardStaffProps> = React.memo((props) => {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Load the model with error handling
  const gltfResult = useGLTF('https://raw.githubusercontent.com/jake222colostate/weapons_enemies/main/wizard_staff.glb', true);
  
  const { 
    position, 
    rotation, 
    scale, 
    visible, 
    castShadow, 
    receiveShadow,
    ...otherProps 
  } = props;
  
  // Only pass explicitly known Three.js properties
  const validThreeProps = useMemo(() => {
    const allowed: any = {};
    
    if (visible !== undefined) allowed.visible = visible;
    if (castShadow !== undefined) allowed.castShadow = castShadow;
    if (receiveShadow !== undefined) allowed.receiveShadow = receiveShadow;
    
    return allowed;
  }, [visible, castShadow, receiveShadow]);
  
  // Memoize the cloned scene with better material setup
  const clonedScene = useMemo(() => {
    if (!gltfResult.scene) {
      console.error('WizardStaff: No scene found in GLTF');
      return null;
    }

    try {
      const clone = gltfResult.scene.clone();
      
      // Ensure the staff is visible and properly configured
      clone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.visible = true;
          child.castShadow = false;
          child.receiveShadow = false;
          
          // Ensure materials are visible and bright
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => {
                mat.transparent = false;
                mat.opacity = 1;
                if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshLambertMaterial) {
                  mat.emissive = new THREE.Color(0x333333);
                  mat.emissiveIntensity = 0.2;
                }
              });
            } else {
              child.material.transparent = false;
              child.material.opacity = 1;
              if (child.material instanceof THREE.MeshStandardMaterial || child.material instanceof THREE.MeshLambertMaterial) {
                child.material.emissive = new THREE.Color(0x333333);
                child.material.emissiveIntensity = 0.2;
              }
            }
          }
        }
      });
      
      setModelLoaded(true);
      return clone;
    } catch (error) {
      console.error('WizardStaff: Error processing model:', error);
      setLoadError(error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }, [gltfResult.scene]);

  return (
    <group>
      {/* Local lighting for the staff */}
      <pointLight 
        position={[2, -1, -2]} 
        intensity={1.5} 
        color="#ffffff"
        distance={5}
      />
      
      {/* The actual staff model */}
      {clonedScene ? (
        <primitive 
          object={clonedScene} 
          position={position || [2.2, -1.8, -3]} 
          rotation={rotation || [0.3, -Math.PI / 6, 0.2]}
          scale={scale || [2.0, 2.0, 2.0]}
          {...validThreeProps}
        />
      ) : (
        /* Simple fallback if model fails to load */
        <mesh position={position || [2.2, -1.8, -3]}>
          <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
          <meshBasicMaterial color="#8B4513" />
        </mesh>
      )}
    </group>
  );
});

WizardStaff.displayName = 'WizardStaff';

// Preload the model
useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/weapons_enemies/main/wizard_staff.glb');
