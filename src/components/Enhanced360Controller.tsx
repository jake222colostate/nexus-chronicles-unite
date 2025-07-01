import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Enhanced360ControllerProps {
  camera?: any;
  minY?: number;
  maxY?: number;
  sensitivity?: number;
  realm?: 'fantasy' | 'scifi';
  maxRotation?: number; // Maximum rotation in radians
}

export const Enhanced360Controller: React.FC<Enhanced360ControllerProps> = ({
  camera,
  minY = -10,
  maxY = 20,
  sensitivity = 1.0,
  realm = 'fantasy',
  maxRotation = Math.PI / 6 // 30 degrees in radians
}) => {
  const { camera: threeCamera } = useThree();
  const activeCamera = camera || threeCamera;
  
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const targetY = useRef(0);
  const targetRotationY = useRef(0);
  const currentY = useRef(8);
  const currentRotationY = useRef(0);

  useEffect(() => {
    if (activeCamera) {
      currentY.current = activeCamera.position.y;
      targetY.current = activeCamera.position.y;
      
      // Initialize rotation based on current camera rotation
      currentRotationY.current = activeCamera.rotation.y;
      targetRotationY.current = activeCamera.rotation.y;
    }
  }, [activeCamera]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      isDragging.current = true;
      lastX.current = event.clientX;
      lastY.current = event.clientY;
      event.preventDefault();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging.current) return;
      
      const deltaX = event.clientX - lastX.current;
      const deltaY = event.clientY - lastY.current;
      
      // Vertical movement (existing functionality)
      const moveAmountY = deltaY * sensitivity * 0.01;
      targetY.current = Math.max(minY, Math.min(maxY, targetY.current - moveAmountY));
      
      // Horizontal rotation (new functionality for scifi realm)
      if (realm === 'scifi') {
        const rotateAmount = deltaX * sensitivity * 0.005; // More subtle rotation
        targetRotationY.current = Math.max(
          -maxRotation, 
          Math.min(maxRotation, targetRotationY.current - rotateAmount)
        );
      }
      
      lastX.current = event.clientX;
      lastY.current = event.clientY;
      event.preventDefault();
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('pointerdown', handlePointerDown);
      canvas.addEventListener('pointermove', handlePointerMove);
      canvas.addEventListener('pointerup', handlePointerUp);
      canvas.addEventListener('pointerleave', handlePointerUp);
      
      // Prevent context menu on right click
      canvas.addEventListener('contextmenu', (e) => e.preventDefault());
      
      // Set touch-action to prevent scrolling
      canvas.style.touchAction = 'none';
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('pointerdown', handlePointerDown);
        canvas.removeEventListener('pointermove', handlePointerMove);
        canvas.removeEventListener('pointerup', handlePointerUp);
        canvas.removeEventListener('pointerleave', handlePointerUp);
        canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
      }
    };
  }, [minY, maxY, sensitivity, realm, maxRotation]);

  useFrame(() => {
    if (activeCamera) {
      // Smooth interpolation to target position
      currentY.current += (targetY.current - currentY.current) * 0.1;
      activeCamera.position.y = currentY.current;
      
      // Smooth interpolation to target rotation (for scifi realm)
      if (realm === 'scifi') {
        currentRotationY.current += (targetRotationY.current - currentRotationY.current) * 0.1;
        activeCamera.rotation.y = currentRotationY.current;
      }
    }
  });

  return null;
};