
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
  const orbRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (staffRef.current) {
      // Gentle idle sway
      const sway = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      staffRef.current.rotation.z = sway;
      staffRef.current.position.y = -0.5 + Math.sin(state.clock.elapsedTime * 0.3) * 0.01;
      
      // Attack animation - more pronounced
      if (isAttacking) {
        const attackTime = (state.clock.elapsedTime * 15) % (Math.PI * 2);
        staffRef.current.position.z = Math.sin(attackTime) * 0.15;
        staffRef.current.rotation.x = Math.sin(attackTime) * 0.1;
      }
    }

    if (crystalRef.current) {
      // Crystal glow animation
      crystalRef.current.rotation.y += 0.03;
      crystalRef.current.rotation.x += 0.01;
      const glowIntensity = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.8;
      crystalRef.current.scale.setScalar(glowIntensity);
    }

    if (orbRef.current) {
      // Floating orb around staff tip
      const orbTime = state.clock.elapsedTime * 2;
      orbRef.current.position.x = Math.sin(orbTime) * 0.3;
      orbRef.current.position.y = 0.5 + Math.cos(orbTime * 1.3) * 0.2;
      orbRef.current.position.z = Math.cos(orbTime) * 0.2;
    }
  });

  const renderStaff = () => (
    <group>
      {/* Staff handle - more detailed */}
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.04, 0.08, 2.4]} />
        <meshLambertMaterial color="#654321" />
      </mesh>
      
      {/* Handle grip */}
      <mesh position={[0, -1.8, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.4]} />
        <meshLambertMaterial color="#8b4513" />
      </mesh>
      
      {/* Staff crystal/orb - enhanced */}
      <mesh ref={crystalRef} position={[0, 0.3, 0]}>
        <octahedronGeometry args={[0.18]} />
        <meshPhongMaterial 
          color="#a855f7" 
          transparent 
          opacity={0.8}
          emissive="#4c1d95"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Crystal holder - golden ring */}
      <mesh position={[0, 0.1, 0]}>
        <torusGeometry args={[0.15, 0.03]} />
        <meshPhongMaterial 
          color="#ffd700" 
          emissive="#b45309"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Top ornament */}
      <mesh position={[0, 0.6, 0]}>
        <coneGeometry args={[0.05, 0.2]} />
        <meshPhongMaterial color="#ffd700" />
      </mesh>
      
      {/* Floating magic orb */}
      <mesh ref={orbRef} position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.04]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* Mana flow effects when attacking */}
      {isAttacking && (
        <group>
          <mesh position={[0, 0.6, 0]}>
            <sphereGeometry args={[0.08]} />
            <meshBasicMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.9}
            />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <sphereGeometry args={[0.05]} />
            <meshBasicMaterial 
              color="#a855f7" 
              transparent 
              opacity={0.7}
            />
          </mesh>
          <mesh position={[0, 1.0, 0]}>
            <sphereGeometry args={[0.03]} />
            <meshBasicMaterial 
              color="#7c3aed" 
              transparent 
              opacity={0.5}
            />
          </mesh>
        </group>
      )}
    </group>
  );

  return (
    <group 
      ref={staffRef}
      position={[1.4, -0.9, -1.2]} // Bottom-right first-person position
      rotation={[0.2, -0.3, 0.1]} // Angled for first-person feel
      scale={[0.9, 0.9, 0.9]}
    >
      {renderStaff()}
    </group>
  );
};
