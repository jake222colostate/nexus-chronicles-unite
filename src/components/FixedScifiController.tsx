import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, PerspectiveCamera } from 'three';
import { useMovementControls } from '../hooks/useMovementControls';

interface FixedScifiControllerProps {
  position: [number, number, number];
  onPositionChange: (position: Vector3) => void;
  enemyPositions?: Vector3[];
}

export const FixedScifiController: React.FC<FixedScifiControllerProps> = ({
  position,
  onPositionChange,
  enemyPositions = []
}) => {
  const { camera } = useThree();
  const keys = useMovementControls();
  const targetPosition = useRef(new Vector3());
  const velocity = useRef(new Vector3());
  const lastNotifiedPosition = useRef(new Vector3());

  // Initialize camera at fixed position and orientation
  useEffect(() => {
    const safePosition = new Vector3(0, 2, 10);
    targetPosition.current.copy(safePosition);
    camera.position.copy(safePosition);
    
    // Fixed camera orientation - looking straight ahead
    camera.rotation.set(0, 0, 0);
    
    if (camera instanceof PerspectiveCamera) {
      camera.fov = 60;
      camera.updateProjectionMatrix();
    }
    
    lastNotifiedPosition.current.copy(safePosition);
    console.log('FixedScifiController: Camera initialized with fixed orientation');
  }, [camera]);

  useFrame((state, delta) => {
    if (!camera || !camera.position || delta <= 0) return;
    
    const moveSpeed = 15;
    const acceleration = 0.3;
    const damping = 0.85;
    
    // Only forward/backward movement, no strafing or rotation
    const moveVector = new Vector3();
    let isMoving = false;
    
    if (keys.current.forward) {
      moveVector.z = -moveSpeed; // Move forward along Z-axis
      isMoving = true;
    }
    if (keys.current.backward) {
      moveVector.z = moveSpeed; // Move backward along Z-axis
      isMoving = true;
    }
    
    // Update velocity
    if (moveVector.length() > 0) {
      velocity.current.lerp(moveVector, acceleration);
    } else {
      velocity.current.multiplyScalar(damping);
    }
    
    // Calculate new position
    const newPosition = targetPosition.current.clone().add(velocity.current.clone().multiplyScalar(delta));
    
    // Basic boundary check
    newPosition.x = 0; // Lock X position to center
    newPosition.y = 2; // Lock Y position
    newPosition.z = Math.max(-100, Math.min(100, newPosition.z));
    
    targetPosition.current.copy(newPosition);
    
    // Update camera position but keep fixed rotation
    camera.position.copy(targetPosition.current);
    camera.rotation.set(0, 0, 0); // Always look straight ahead
    
    // Notify position changes
    const distanceMoved = targetPosition.current.distanceTo(lastNotifiedPosition.current);
    if (distanceMoved > 0.5) {
      lastNotifiedPosition.current.copy(targetPosition.current);
      onPositionChange(targetPosition.current.clone());
    }
    
    if (isMoving) {
      console.log('FixedScifiController: Moving with fixed camera at:', targetPosition.current);
    }
  });

  return null;
};
