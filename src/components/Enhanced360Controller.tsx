
import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useCollisionContext } from '@/lib/CollisionContext';

interface Enhanced360ControllerProps {
  position: [number, number, number];
  onPositionChange: (position: Vector3) => void;
  enemyPositions?: Vector3[];
  enemyRadius?: number;
}

interface MovementKeys {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

// Define mountain collision zones based on the mountain system positions
const getMountainCollisionZones = (playerZ: number) => {
  const zones = [];
  
  // Based on InfiniteEnvironmentSystem mountains at ±80
  zones.push({ minX: -90, maxX: -70, minZ: playerZ - 200, maxZ: playerZ + 50 });
  zones.push({ minX: 70, maxX: 90, minZ: playerZ - 200, maxZ: playerZ + 50 });
  
  // Based on CenteredMountainSystem mountains at ±180
  zones.push({ minX: -190, maxX: -170, minZ: playerZ - 200, maxZ: playerZ + 50 });
  zones.push({ minX: 170, maxX: 190, minZ: playerZ - 200, maxZ: playerZ + 50 });
  
  // Based on OptimizedMountainSystem mountains at ±35
  zones.push({ minX: -45, maxX: -25, minZ: playerZ - 200, maxZ: playerZ + 50 });
  zones.push({ minX: 25, maxX: 45, minZ: playerZ - 200, maxZ: playerZ + 50 });
  
  // Based on RealisticMountainSystem mountains at ±45, ±65
  zones.push({ minX: -75, maxX: -35, minZ: playerZ - 200, maxZ: playerZ + 50 });
  zones.push({ minX: 35, maxX: 75, minZ: playerZ - 200, maxZ: playerZ + 50 });
  
  // Based on BoundaryMountainSystem mountains at ±22-28
  zones.push({ minX: -35, maxX: -15, minZ: playerZ - 200, maxZ: playerZ + 50 });
  zones.push({ minX: 15, maxX: 35, minZ: playerZ - 200, maxZ: playerZ + 50 });
  
  return zones;
};

// Check if a position would collide with any mountain
const checkMountainCollision = (x: number, z: number) => {
  const zones = getMountainCollisionZones(z);
  
  for (const zone of zones) {
    if (x >= zone.minX && x <= zone.maxX && z >= zone.minZ && z <= zone.maxZ) {
      return true;
    }
  }
  
  return false;
};

// Find the nearest safe position if collision is detected
const findSafePosition = (
  targetX: number,
  targetZ: number,
  currentX: number,
  currentZ: number,
  enemies: Vector3[] = [],
  enemyRadius = 1.5,
  colliders: { position: Vector3; radius: number }[] = []
) => {
  // If no collision, return target position
  if (!checkMountainCollision(targetX, targetZ)) {
    let blocked = false;
    for (const e of enemies) {
      const dx = targetX - e.x;
      const dz = targetZ - e.z;
      if (Math.sqrt(dx * dx + dz * dz) < enemyRadius) {
        blocked = true;
        break;
      }
    }
    if (!blocked) {
      for (const c of colliders) {
        const dx = targetX - c.position.x;
        const dz = targetZ - c.position.z;
        if (Math.sqrt(dx * dx + dz * dz) < enemyRadius + c.radius) {
          blocked = true;
          break;
        }
      }
    }
    if (!blocked) return { x: targetX, z: targetZ };
  }
  
  // Try moving back towards current position incrementally
  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    const factor = i / steps;
    const testX = targetX + (currentX - targetX) * factor;
    const testZ = targetZ + (currentZ - targetZ) * factor;
    
    if (!checkMountainCollision(testX, testZ)) {
      return { x: testX, z: testZ };
    }
  }
  
  // If still colliding, keep current position
  return { x: currentX, z: currentZ };
};

export const Enhanced360Controller: React.FC<Enhanced360ControllerProps> = ({
  position,
  onPositionChange,
  enemyPositions = [],
  enemyRadius = 1.5
}) => {
  const { camera } = useThree();
  const keys = useRef<MovementKeys>({
    forward: false,
    backward: false,
    left: false,
    right: false
  });
  
  const yawAngle = useRef(0);
  const pitchAngle = useRef(0);
  const targetPosition = useRef(new Vector3());
  const velocity = useRef(new Vector3());
  const lastNotifiedPosition = useRef(new Vector3());
  const isMousePressed = useRef(false);
  const frameCount = useRef(0);
  const collision = useCollisionContext();
  const playerColliderId = 'player';

  useEffect(() => {
    if (collision) {
      collision.registerCollider({ id: playerColliderId, position: camera.position.clone(), radius: 1 });
      return () => collision.removeCollider(playerColliderId);
    }
  }, [collision]);

  // Initialize camera at optimal position for iPhone screen and staff visibility
  useEffect(() => {
    const safePosition = new Vector3(0, 2, 10); // Higher up and farther back for better staff visibility
    targetPosition.current.copy(safePosition);
    camera.position.copy(safePosition);
    camera.lookAt(0, 1, 0); // Look slightly down toward center
    camera.fov = 65; // Wider field of view for iPhone
    camera.updateProjectionMatrix();
    lastNotifiedPosition.current.copy(safePosition);
    console.log('Camera initialized for optimal staff visibility:', safePosition);
  }, [camera]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      if (['w', 's', 'a', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        event.preventDefault();
      }
      
      switch (key) {
        case 'w':
        case 'arrowup':
          keys.current.forward = true;
          console.log('Forward movement activated');
          break;
        case 's':
        case 'arrowdown':
          keys.current.backward = true;
          console.log('Backward movement activated');
          break;
        case 'a':
        case 'arrowleft':
          keys.current.left = true;
          console.log('Left movement activated');
          break;
        case 'd':
        case 'arrowright':
          keys.current.right = true;
          console.log('Right movement activated');
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      switch (key) {
        case 'w':
        case 'arrowup':
          keys.current.forward = false;
          break;
        case 's':
        case 'arrowdown':
          keys.current.backward = false;
          break;
        case 'a':
        case 'arrowleft':
          keys.current.left = false;
          break;
        case 'd':
        case 'arrowright':
          keys.current.right = false;
          break;
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) {
        isMousePressed.current = true;
        event.preventDefault();
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 0) {
        isMousePressed.current = false;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isMousePressed.current) {
        const sensitivity = 0.002;
        yawAngle.current -= event.movementX * sensitivity;
        pitchAngle.current -= event.movementY * sensitivity;
        pitchAngle.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitchAngle.current));
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('contextmenu', (e) => e.preventDefault());
    };
  }, []);

  useFrame((state, delta) => {
    frameCount.current++;
    
    const moveSpeed = 20; // Increased speed for better responsiveness
    const acceleration = 0.3; // Increased acceleration
    const damping = 0.85; // Slightly more damping for control
    
    // Calculate movement direction
    const forward = new Vector3(-Math.sin(yawAngle.current), 0, -Math.cos(yawAngle.current));
    const right = new Vector3(Math.cos(yawAngle.current), 0, -Math.sin(yawAngle.current));
    
    // Apply movement
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
    
    // Apply velocity and movement
    if (moveVector.length() > 0) {
      moveVector.normalize().multiplyScalar(moveSpeed);
      velocity.current.lerp(moveVector, acceleration);
    } else {
      velocity.current.multiplyScalar(damping);
    }
    
    // Calculate new target position
    const newTargetPosition = targetPosition.current.clone().add(velocity.current.clone().multiplyScalar(delta));
    
    // Check for mountain collision and find safe position
    const additionalColliders = collision
      ? Array.from(collision.colliders.current.values()).filter(c => c.id !== playerColliderId)
      : [];
    const safePosition = findSafePosition(
      newTargetPosition.x,
      newTargetPosition.z,
      targetPosition.current.x,
      targetPosition.current.z,
      enemyPositions,
      enemyRadius,
      additionalColliders
    );

    let blocked = false;
    for (const col of additionalColliders) {
      const dx = safePosition.x - col.position.x;
      const dz = safePosition.z - col.position.z;
      if (Math.sqrt(dx * dx + dz * dz) < 1 + col.radius) {
        blocked = true;
        break;
      }
    }

    if (!blocked) {
      targetPosition.current.x = safePosition.x;
      targetPosition.current.z = safePosition.z;
    }
    
    // Keep within the wide valley bounds (mountains are at ±140, so allow ±120 for safety)
    targetPosition.current.x = Math.max(-120, Math.min(120, targetPosition.current.x));
    targetPosition.current.y = Math.max(1.5, Math.min(8, targetPosition.current.y)); // Better height range for staff visibility
    
    // Update camera
    camera.position.copy(targetPosition.current);
    camera.rotation.set(pitchAngle.current, yawAngle.current, 0, 'YXZ');
    if (collision) {
      collision.updateCollider(playerColliderId, targetPosition.current);
    }
    
    // More responsive position updates
    const distanceMoved = targetPosition.current.distanceTo(lastNotifiedPosition.current);
    
    // Notify every 20 frames (more frequent) OR when moved significantly
    if ((frameCount.current % 20 === 0 && distanceMoved > 0.05) || distanceMoved > 5) {
      lastNotifiedPosition.current.copy(targetPosition.current);
      onPositionChange(targetPosition.current.clone());
      console.log('Camera position updated for staff visibility:', targetPosition.current);
    }
    
    if (isMoving && frameCount.current % 40 === 0) {
      console.log('Player moving with staff in view at position:', targetPosition.current);
    }
  });

  return null;
};
