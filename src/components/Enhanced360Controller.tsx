import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from 'three';
import { Vector3 } from 'three';

interface Enhanced360ControllerProps {
  position?: [number, number, number];
  onPositionChange?: (position: Vector3) => void;
}

export const Enhanced360Controller: React.FC<Enhanced360ControllerProps> = ({
  position = [0, 4, 5], // Updated Y position to 4 to spawn above ground between valley walls
  onPositionChange
}) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>();
  const moveSpeed = 8;
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false
  });

  const mouse = useRef({
    x: 0,
    y: 0,
    isPointerLocked: false
  });

  const velocity = useRef(new Vector3());
  const direction = useRef(new Vector3());

  useEffect(() => {
    const perspCamera = camera as PerspectiveCamera;
    perspCamera.position.set(...position);
    perspCamera.rotation.set(0, 0, 0);

    console.log(`Enhanced360Controller: Player spawned at position [${position.join(', ')}] - above ground in valley`);

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!mouse.current.isPointerLocked) return;

      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;

      perspCamera.rotation.y -= movementX * 0.002;
      perspCamera.rotation.x -= movementY * 0.002;
      perspCamera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, perspCamera.rotation.x));
    };

    const handlePointerLockChange = () => {
      mouse.current.isPointerLocked = document.pointerLockElement === gl.domElement;
    };

    const handleClick = () => {
      gl.domElement.requestPointerLock();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    gl.domElement.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      gl.domElement.removeEventListener('click', handleClick);
    };
  }, [camera, gl, position]);

  useFrame((_, delta) => {
    const perspCamera = camera as PerspectiveCamera;
    
    direction.current.set(0, 0, 0);

    if (keys.current.forward) direction.current.z -= 1;
    if (keys.current.backward) direction.current.z += 1;
    if (keys.current.left) direction.current.x -= 1;
    if (keys.current.right) direction.current.x += 1;

    if (direction.current.length() > 0) {
      direction.current.normalize();
      direction.current.applyQuaternion(perspCamera.quaternion);
      direction.current.y = 0;
      direction.current.normalize();
    }

    velocity.current.x -= velocity.current.x * 10.0 * delta;
    velocity.current.z -= velocity.current.z * 10.0 * delta;

    if (keys.current.forward || keys.current.backward || keys.current.left || keys.current.right) {
      velocity.current.x += direction.current.x * moveSpeed * delta;
      velocity.current.z += direction.current.z * moveSpeed * delta;
    }

    perspCamera.position.x += velocity.current.x;
    perspCamera.position.z += velocity.current.z;

    // Keep player at appropriate height above ground
    perspCamera.position.y = Math.max(1, perspCamera.position.y);

    if (onPositionChange) {
      onPositionChange(perspCamera.position);
    }
  });

  return null;
};
