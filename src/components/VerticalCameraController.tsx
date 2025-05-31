
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

interface VerticalCameraControllerProps {
  camera?: any;
  minY?: number;
  maxY?: number;
  sensitivity?: number;
}

export const VerticalCameraController: React.FC<VerticalCameraControllerProps> = ({
  camera,
  minY = -10,
  maxY = 20,
  sensitivity = 1.0
}) => {
  const { camera: threeCamera } = useThree();
  const activeCamera = camera || threeCamera;
  
  const isDragging = useRef(false);
  const lastY = useRef(0);
  const targetY = useRef(0);
  const currentY = useRef(8); // Start at default position

  useEffect(() => {
    if (activeCamera) {
      currentY.current = activeCamera.position.y;
      targetY.current = activeCamera.position.y;
    }
  }, [activeCamera]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      isDragging.current = true;
      lastY.current = event.clientY;
      event.preventDefault();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging.current) return;
      
      const deltaY = event.clientY - lastY.current;
      const moveAmount = deltaY * sensitivity * 0.01;
      
      // Invert movement for natural feel (drag up = move up)
      targetY.current = Math.max(minY, Math.min(maxY, targetY.current - moveAmount));
      
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
  }, [minY, maxY, sensitivity]);

  useFrame(() => {
    if (activeCamera) {
      // Smooth interpolation to target position
      currentY.current += (targetY.current - currentY.current) * 0.1;
      activeCamera.position.y = currentY.current;
    }
  });

  return null;
};
