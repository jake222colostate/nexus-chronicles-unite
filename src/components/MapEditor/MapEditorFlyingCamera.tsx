import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useMapEditorStore } from '../../stores/useMapEditorStore';

export const MapEditorFlyingCamera: React.FC = () => {
  const { camera } = useThree();
  const { isEditorActive } = useMapEditorStore();
  
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    q: false, // down
    e: false, // up
    shift: false
  });
  
  const velocity = useRef(new Vector3());
  const direction = useRef(new Vector3());

  useEffect(() => {
    if (!isEditorActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key in keys.current) {
        keys.current[key as keyof typeof keys.current] = true;
      }
      if (key === 'shift') {
        keys.current.shift = true;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key in keys.current) {
        keys.current[key as keyof typeof keys.current] = false;
      }
      if (key === 'shift') {
        keys.current.shift = false;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isEditorActive]);

  useFrame((state, delta) => {
    if (!isEditorActive) return;

    const speed = keys.current.shift ? 20 : 10; // Faster with shift
    
    // Reset direction
    direction.current.set(0, 0, 0);
    
    // Get camera forward/right vectors
    const forward = new Vector3();
    const right = new Vector3();
    
    camera.getWorldDirection(forward);
    right.crossVectors(forward, camera.up).normalize();
    
    // Movement based on camera orientation
    if (keys.current.w) direction.current.add(forward);
    if (keys.current.s) direction.current.sub(forward);
    if (keys.current.a) direction.current.sub(right);
    if (keys.current.d) direction.current.add(right);
    if (keys.current.q) direction.current.y -= 1; // Down
    if (keys.current.e) direction.current.y += 1; // Up
    
    // Apply movement
    if (direction.current.length() > 0) {
      direction.current.normalize().multiplyScalar(speed * delta);
      camera.position.add(direction.current);
    }
  });

  return null;
};