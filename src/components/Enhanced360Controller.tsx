
import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, PerspectiveCamera } from 'three';
import { useMovementControls } from '../hooks/useMovementControls';
import { useMouseLookControls } from '../hooks/useMouseLookControls';
import { useTouchControls } from '../hooks/useTouchControls';

interface Enhanced360ControllerProps {
  position: [number, number, number];
  onPositionChange: (position: Vector3) => void;
  enemyPositions?: Vector3[];
  enemyRadius?: number;
}

export const Enhanced360Controller: React.FC<Enhanced360ControllerProps> = ({
  position,
  onPositionChange,
  enemyPositions = [],
  enemyRadius = 1.5
}) => {
  const { camera } = useThree();
  const keys = useMovementControls();
  const mouseControls = useMouseLookControls();
  const { yawAngle, pitchAngle } = mouseControls;
  
  const targetPosition = useRef(new Vector3());
  const velocity = useRef(new Vector3());
  const lastNotifiedPosition = useRef(new Vector3());
  const frameCount = useRef(0);

  // Initialize camera at safe position
  useEffect(() => {
    const safePosition = new Vector3(0, 2, 10);
    targetPosition.current.copy(safePosition);
    camera.position.copy(safePosition);
    
    if (camera instanceof PerspectiveCamera) {
      camera.fov = 60; // OPTIMIZED: Reduced FOV
      camera.updateProjectionMatrix();
    }
    
    lastNotifiedPosition.current.copy(safePosition);
    console.log('Enhanced360Controller: Camera initialized for sci-fi realm');
  }, [camera]);

  // Setup touch controls
  useTouchControls({ keys, mouseControls });

  useFrame((state, delta) => {
    if (!camera || !camera.position || delta <= 0) return;

    frameCount.current++;
    
    // OPTIMIZED: Increased movement speed and responsiveness
    const moveSpeed = 25;
    const acceleration = 0.4;
    const damping = 0.8;
    
    // Calculate movement direction
    const forward = new Vector3(-Math.sin(yawAngle.current), 0, -Math.cos(yawAngle.current));
    const right = new Vector3(Math.cos(yawAngle.current), 0, -Math.sin(yawAngle.current));
    
    const moveVector = new Vector3();
    let isMoving = false;
    
    if (keys.current.forward) {
      moveVector.add(forward);
      isMoving = true;
    }
    if (keys.current.backward) {
      moveVector.sub(forward);
      isMoving = true;
    }
    if (keys.current.left) {
      moveVector.sub(right);
      isMoving = true;
    }
    if (keys.current.right) {
      moveVector.add(right);
      isMoving = true;
    }
    
    // Update velocity
    if (moveVector.length() > 0) {
      moveVector.normalize().multiplyScalar(moveSpeed);
      velocity.current.lerp(moveVector, acceleration);
    } else {
      velocity.current.multiplyScalar(damping);
    }
    
    // Calculate new position
    const newPosition = targetPosition.current.clone().add(velocity.current.clone().multiplyScalar(delta));
    
    // SIMPLIFIED: Basic boundary check
    newPosition.x = Math.max(-100, Math.min(100, newPosition.x));
    newPosition.y = Math.max(1.5, Math.min(8, newPosition.y));
    newPosition.z = Math.max(-100, Math.min(100, newPosition.z));
    
    targetPosition.current.copy(newPosition);
    
    // Update camera
    camera.position.copy(targetPosition.current);
    camera.rotation.set(pitchAngle.current, yawAngle.current, 0, 'YXZ');
    
    // OPTIMIZED: Less frequent position notifications
    if (frameCount.current % 5 === 0) {
      const distanceMoved = targetPosition.current.distanceTo(lastNotifiedPosition.current);
      if (distanceMoved > 0.5) {
        lastNotifiedPosition.current.copy(targetPosition.current);
        onPositionChange(targetPosition.current.clone());
      }
    }
    
    // OPTIMIZED: Less frequent movement logging
    if (isMoving && frameCount.current % 60 === 0) {
      console.log('Enhanced360Controller: Moving in sci-fi realm at:', targetPosition.current);
    }
  });

  return null;
};
