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
  radius?: number; // Radius of circular movement
  centerPoint?: [number, number, number]; // Center point to orbit around
}

export const Enhanced360Controller: React.FC<Enhanced360ControllerProps> = ({
  camera,
  minY = -10,
  maxY = 20,
  sensitivity = 1.0,
  realm = 'fantasy',
  maxRotation = Math.PI / 6, // 30 degrees in radians
  radius = 10, // Default radius for circular movement
  centerPoint = [0, 4, 0] // Default center point at upgrade level
}) => {
  const { camera: threeCamera } = useThree();
  const activeCamera = camera || threeCamera;
  
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const targetY = useRef(0);
  const targetAngle = useRef(0); // Angle around the center point
  const currentY = useRef(8);
  const currentAngle = useRef(0);

  useEffect(() => {
    if (activeCamera) {
      currentY.current = activeCamera.position.y;
      targetY.current = activeCamera.position.y;
      
      // Calculate initial angle based on current camera position
      const dx = activeCamera.position.x - centerPoint[0];
      const dz = activeCamera.position.z - centerPoint[2];
      currentAngle.current = Math.atan2(dx, dz);
      targetAngle.current = currentAngle.current;
    }
  }, [activeCamera, centerPoint]);

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
      
      // Circular movement around center point (for scifi realm)
      if (realm === 'scifi') {
        const rotateAmount = deltaX * sensitivity * 0.005; // More subtle rotation
        const maxAngleChange = maxRotation / radius; // Convert max rotation to angular change
        targetAngle.current = Math.max(
          currentAngle.current - maxAngleChange,
          Math.min(currentAngle.current + maxAngleChange, targetAngle.current - rotateAmount)
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
  }, [minY, maxY, sensitivity, realm, maxRotation, radius, centerPoint, currentAngle]);

  useFrame(() => {
    if (activeCamera) {
      // Smooth interpolation to target vertical position
      currentY.current += (targetY.current - currentY.current) * 0.1;
      
      // Apply circular movement for scifi realm
      if (realm === 'scifi') {
        currentAngle.current += (targetAngle.current - currentAngle.current) * 0.1;
        
        // Calculate new camera position on the circle, preserving Y position
        const x = centerPoint[0] + Math.sin(currentAngle.current) * radius;
        const z = centerPoint[2] + Math.cos(currentAngle.current) * radius;
        
        activeCamera.position.set(x, currentY.current, z);
        
        // Make camera look at the center point at the same height as camera
        activeCamera.lookAt(centerPoint[0], currentY.current, centerPoint[2]);
      } else {
        // For fantasy realm, just apply vertical movement
        activeCamera.position.y = currentY.current;
      }
    }
  });

  return null;
};