
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';

interface WizardStaff3DProps {
  modelPath?: string;
  isAttacking: boolean;
  onMuzzleFlash: () => void;
}

export const WizardStaff3D: React.FC<WizardStaff3DProps> = ({ 
  modelPath, 
  isAttacking,
  onMuzzleFlash 
}) => {
  const staffRef = useRef<Group>(null);
  const crystalRef = useRef<Mesh>(null);
  const [loadError, setLoadError] = useState(!modelPath);

  useFrame((state) => {
    if (staffRef.current) {
      // Gentle idle sway
      const sway = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      staffRef.current.rotation.z = sway;
      staffRef.current.position.y = -0.5 + Math.sin(state.clock.elapsedTime * 0.3) * 0.01;
      
      // Attack animation
      if (isAttacking) {
        const attackTime = (state.clock.elapsedTime * 10) % (Math.PI * 2);
        staffRef.current.position.z = Math.sin(attackTime) * 0.1;
      }
    }

    if (crystalRef.current) {
      // Crystal glow animation
      crystalRef.current.rotation.y += 0.02;
      const glowIntensity = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7;
      crystalRef.current.scale.setScalar(glowIntensity);
    }
  });

  const renderPlaceholder = () => (
    <group>
      {/* Staff handle */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 2]} />
        <meshLambertMaterial color="#8b4513" />
      </mesh>
      
      {/* Staff crystal/orb */}
      <mesh ref={crystalRef} position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.15]} />
        <meshLambertMaterial 
          color="#a855f7" 
          transparent 
          opacity={0.8} 
        />
      </mesh>
      
      {/* Crystal holder */}
      <mesh position={[0, 0, 0]}>
        <ringGeometry args={[0.12, 0.18]} />
        <meshLambertMaterial color="#ffd700" />
      </mesh>
      
      {/* Mana flow effect when attacking */}
      {isAttacking && (
        <group>
          <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.05]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <sphereGeometry args={[0.03]} />
            <meshBasicMaterial color="#a855f7" transparent opacity={0.7} />
          </mesh>
        </group>
      )}
    </group>
  );

  return (
    <group 
      ref={staffRef}
      position={[1.2, -0.8, -1]} // Bottom-right first-person position
      rotation={[0.2, -0.3, 0.1]} // Angled for first-person feel
      scale={[0.8, 0.8, 0.8]}
    >
      {renderPlaceholder()}
    </group>
  );
};
