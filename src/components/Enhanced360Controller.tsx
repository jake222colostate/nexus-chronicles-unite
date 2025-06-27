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

// Simple mountain collision zones - basic box collision
const checkSimpleCollision = (x: number, z: number) => {
  // Basic mountain boundaries to keep player in valley
  if (x < -120 || x > 120) return true;
  
  // Simple mountain positions for basic collision
  const mountainZones = [
    { minX: -90, maxX: -70, minZ: z - 100, maxZ: z + 50 },
    { minX: 70, maxX: 90, minZ: z - 100, maxZ: z + 50 },
    { minX: -45, maxX: -25, minZ: z - 100, maxZ: z + 50 },
    { minX: 25, maxX: 45, minZ: z - 100, maxZ: z + 50 }
  ];
  
  for (const zone of mountainZones) {
    if (x >= zone.minX && x <= zone.maxX && z >= zone.minZ && z <= zone.maxZ) {
      return true;
    }
  }
  
  return false;
};

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
    camera.lookAt(0, 1, 0);
    
    if (camera instanceof PerspectiveCamera) {
      camera.fov = 65;
      camera.updateProjectionMatrix();
    }
    
    lastNotifiedPosition.current.copy(safePosition);
    console.log('Enhanced360Controller: Camera initialized at safe position:', safePosition);
  }, [camera]);

  // Setup touch controls
  useTouchControls({ keys, mouseControls });

  useFrame((state, delta) => {
    // Safety checks
    if (!camera || !camera.position || !state || delta <= 0) {
      return;
    }

    frameCount.current++;
    
    const moveSpeed = 20;
    const acceleration = 0.3;
    const damping = 0.85;
    
    // Calculate movement direction based on camera orientation
    const forward = new Vector3(-Math.sin(yawAngle.current), 0, -Math.cos(yawAngle.current));
    const right = new Vector3(Math.cos(yawAngle.current), 0, -Math.sin(yawAngle.current));
    
    // Apply movement based on key presses
    const moveVector = new Vector3();
    let isMoving = false;
    
    if (keys.current.forward) {
      moveVector.add(forward);
      isMoving = true;
      console.log('Enhanced360Controller: Moving forward');
    }
    if (keys.current.backward) {
      moveVector.sub(forward);
      isMoving = true;
      console.log('Enhanced360Controller: Moving backward');
    }
    if (keys.current.left) {
      moveVector.sub(right);
      isMoving = true;
      console.log('Enhanced360Controller: Moving left');
    }
    if (keys.current.right) {
      moveVector.add(right);
      isMoving = true;
      console.log('Enhanced360Controller: Moving right');
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
    
    // Simple collision check - don't let complex collision system crash movement
    let canMove = true;
    try {
      canMove = !checkSimpleCollision(newPosition.x, newPosition.z);
    } catch (error) {
      // If collision check fails, allow movement anyway
      console.log('Enhanced360Controller: Collision check failed, allowing movement');
      canMove = true;
    }
    
    // Simple enemy avoidance
    if (canMove && enemyPositions.length > 0) {
      try {
        for (const enemyPos of enemyPositions) {
          if (enemyPos && enemyPos instanceof Vector3) {
            const distance = newPosition.distanceTo(enemyPos);
            if (distance < enemyRadius) {
              canMove = false;
              break;
            }
          }
        }
      } catch (error) {
        // If enemy collision fails, continue anyway
        console.log('Enhanced360Controller: Enemy collision check failed, continuing');
      }
    }
    
    if (canMove) {
      targetPosition.current.copy(newPosition);
    }
    
    // Keep within reasonable bounds
    targetPosition.current.x = Math.max(-120, Math.min(120, targetPosition.current.x));
    targetPosition.current.y = Math.max(1.5, Math.min(8, targetPosition.current.y));
    
    // Validate position before applying
    if (isNaN(targetPosition.current.x) || isNaN(targetPosition.current.y) || isNaN(targetPosition.current.z)) {
      console.log('Enhanced360Controller: Invalid position detected, resetting');
      targetPosition.current.set(0, 2, 10);
    }
    
    // Update camera position and rotation
    camera.position.copy(targetPosition.current);
    camera.rotation.set(pitchAngle.current, yawAngle.current, 0, 'YXZ');
    
    // Notify position changes more frequently for responsiveness
    const distanceMoved = targetPosition.current.distanceTo(lastNotifiedPosition.current);
    
    if ((frameCount.current % 10 === 0 && distanceMoved > 0.1) || distanceMoved > 2) {
      lastNotifiedPosition.current.copy(targetPosition.current);
      try {
        onPositionChange(targetPosition.current.clone());
      } catch (error) {
        console.log('Enhanced360Controller: Position change callback failed');
      }
    }
    
    if (isMoving && frameCount.current % 30 === 0) {
      console.log('Enhanced360Controller: Player moving at position:', targetPosition.current);
    }
  });

  return null;
};
