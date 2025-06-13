
import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, PerspectiveCamera } from 'three';

interface MovementKeys {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

interface CameraMovementProps {
  position: [number, number, number];
  onPositionChange: (position: Vector3) => void;
  keys: React.MutableRefObject<MovementKeys>;
  yawAngle: React.MutableRefObject<number>;
  pitchAngle: React.MutableRefObject<number>;
}

export const useCameraMovement = ({
  position,
  onPositionChange,
  keys,
  yawAngle,
  pitchAngle
}: CameraMovementProps) => {
  const { camera, viewport } = useThree();
  const targetPosition = useRef(new Vector3(...position));
  const velocity = useRef(new Vector3());

  // Initialize camera at lower position with iPhone aspect ratio constraints
  useEffect(() => {
    targetPosition.current.set(0, 2, 12);
    camera.position.copy(targetPosition.current);
    
    // Set proper aspect ratio for iPhone screen (375/667) only for PerspectiveCamera
    if (camera instanceof PerspectiveCamera) {
      camera.aspect = 375 / 667;
      camera.updateProjectionMatrix();
    }
    
    console.log('Camera initialized at position:', camera.position);
  }, [camera]);

  useFrame((state, delta) => {
    const moveSpeed = 12;
    const acceleration = 0.15;
    const damping = 0.85;
    
    // Calculate movement direction based on camera orientation
    const forward = new Vector3(-Math.sin(yawAngle.current), 0, -Math.cos(yawAngle.current));
    const right = new Vector3(Math.cos(yawAngle.current), 0, -Math.sin(yawAngle.current));
    
    // Apply movement based on keys
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
    
    // Normalize and apply speed
    if (moveVector.length() > 0) {
      moveVector.normalize().multiplyScalar(moveSpeed);
      velocity.current.lerp(moveVector, acceleration);
    } else {
      velocity.current.multiplyScalar(damping);
    }
    
    // Update position with boundary constraints for iPhone screen
    targetPosition.current.add(velocity.current.clone().multiplyScalar(delta));
    
    // Keep camera within reasonable bounds for iPhone viewport
    targetPosition.current.x = Math.max(-20, Math.min(20, targetPosition.current.x));
    targetPosition.current.y = Math.max(1.5, Math.min(4, targetPosition.current.y));
    targetPosition.current.z = Math.max(-50, Math.min(50, targetPosition.current.z));
    
    // Update camera position and rotation
    camera.position.copy(targetPosition.current);
    camera.rotation.set(pitchAngle.current, yawAngle.current, 0, 'YXZ');
    
    // Ensure aspect ratio stays correct for iPhone only for PerspectiveCamera
    if (camera instanceof PerspectiveCamera) {
      camera.aspect = 375 / 667;
      camera.updateProjectionMatrix();
    }
    
    // Notify parent of position changes
    onPositionChange(camera.position);
    
    // Log movement for debugging
    if (isMoving) {
      console.log('Camera moving to:', targetPosition.current);
    }
  });
};
