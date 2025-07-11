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
  minZoom?: number; // Minimum zoom distance
  maxZoom?: number; // Maximum zoom distance
}

export const Enhanced360Controller: React.FC<Enhanced360ControllerProps> = ({
  camera,
  minY = -10,
  maxY = 20,
  sensitivity = 1.0,
  realm = 'fantasy',
  maxRotation = Math.PI * 2, // Full 360 degrees in radians
  radius = 10, // Default radius for circular movement
  centerPoint = [0, 4, 0], // Default center point at upgrade level
  minZoom = 5, // Minimum zoom distance
  maxZoom = 25 // Maximum zoom distance
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
  
  // Zoom state management
  const targetRadius = useRef(radius);
  const currentRadius = useRef(radius);
  
  // Pinch-to-zoom state
  const isPinching = useRef(false);
  const lastPinchDistance = useRef(0);

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

  // Touch event handling for pinch-to-zoom and dragging
  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        // Single touch - dragging
        isDragging.current = true;
        lastX.current = event.touches[0].clientX;
        lastY.current = event.touches[0].clientY;
      } else if (event.touches.length === 2 && realm === 'scifi') {
        // Two touches - pinch zoom for sci-fi realm only
        isPinching.current = true;
        isDragging.current = false;
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;
        lastPinchDistance.current = Math.sqrt(dx * dx + dy * dy);
      }
      event.preventDefault();
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 1 && isDragging.current) {
        // Single touch drag
        const deltaX = event.touches[0].clientX - lastX.current;
        const deltaY = event.touches[0].clientY - lastY.current;
        
        // Vertical movement - 2x faster for fantasy realm
        const fantasySensitivityMultiplier = realm === 'fantasy' ? 2.0 : 1.0;
        const moveAmountY = deltaY * sensitivity * 0.01 * fantasySensitivityMultiplier;
        targetY.current = Math.max(minY, Math.min(maxY, targetY.current - moveAmountY));
        
        // Circular movement around center point (for scifi realm)
        if (realm === 'scifi') {
          const rotateAmount = deltaX * sensitivity * 0.005;
          targetAngle.current -= rotateAmount; // Remove rotation limits for full 360
        }
        
        lastX.current = event.touches[0].clientX;
        lastY.current = event.touches[0].clientY;
      } else if (event.touches.length === 2 && isPinching.current && realm === 'scifi') {
        // Pinch zoom for sci-fi realm
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (lastPinchDistance.current > 0) {
          const pinchDelta = distance - lastPinchDistance.current;
          const zoomSpeed = 0.01;
          targetRadius.current = Math.max(minZoom, Math.min(maxZoom, targetRadius.current - pinchDelta * zoomSpeed));
        }
        
        lastPinchDistance.current = distance;
      }
      event.preventDefault();
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
      isPinching.current = false;
      lastPinchDistance.current = 0;
    };

    // Mouse/pointer events
    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') {
        isDragging.current = true;
        lastX.current = event.clientX;
        lastY.current = event.clientY;
        event.preventDefault();
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging.current || event.pointerType === 'touch') return;
      
      const deltaX = event.clientX - lastX.current;
      const deltaY = event.clientY - lastY.current;
      
      // Vertical movement - 2x faster for fantasy realm
      const fantasySensitivityMultiplier = realm === 'fantasy' ? 2.0 : 1.0;
      const moveAmountY = deltaY * sensitivity * 0.01 * fantasySensitivityMultiplier;
      targetY.current = Math.max(minY, Math.min(maxY, targetY.current - moveAmountY));
      
      // Circular movement around center point (for scifi realm)
      if (realm === 'scifi') {
        const rotateAmount = deltaX * sensitivity * 0.005;
        targetAngle.current -= rotateAmount; // Remove rotation limits for full 360
      }
      
      lastX.current = event.clientX;
      lastY.current = event.clientY;
      event.preventDefault();
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    // Scroll wheel zoom for sci-fi realm
    const handleWheel = (event: WheelEvent) => {
      if (realm === 'scifi') {
        event.preventDefault();
        const zoomSpeed = 0.002;
        const zoomDelta = event.deltaY * zoomSpeed;
        targetRadius.current = Math.max(minZoom, Math.min(maxZoom, targetRadius.current + zoomDelta));
      }
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      // Touch events
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
      
      // Pointer events
      canvas.addEventListener('pointerdown', handlePointerDown);
      canvas.addEventListener('pointermove', handlePointerMove);
      canvas.addEventListener('pointerup', handlePointerUp);
      canvas.addEventListener('pointerleave', handlePointerUp);
      
      // Scroll wheel
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      
      // Prevent context menu on right click
      canvas.addEventListener('contextmenu', (e) => e.preventDefault());
      
      // Set touch-action to prevent scrolling
      canvas.style.touchAction = 'none';
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
        canvas.removeEventListener('pointerdown', handlePointerDown);
        canvas.removeEventListener('pointermove', handlePointerMove);
        canvas.removeEventListener('pointerup', handlePointerUp);
        canvas.removeEventListener('pointerleave', handlePointerUp);
        canvas.removeEventListener('wheel', handleWheel);
        canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
      }
    };
  }, [minY, maxY, sensitivity, realm, maxRotation, minZoom, maxZoom]);

  useFrame(() => {
    if (activeCamera) {
      // Smooth interpolation to target vertical position
      currentY.current += (targetY.current - currentY.current) * 0.1;
      
      // Apply circular movement for scifi realm
      if (realm === 'scifi') {
        currentAngle.current += (targetAngle.current - currentAngle.current) * 0.1;
        currentRadius.current += (targetRadius.current - currentRadius.current) * 0.1;
        
        // Calculate new camera position on the circle using dynamic radius
        const x = centerPoint[0] + Math.sin(currentAngle.current) * currentRadius.current;
        const z = centerPoint[2] + Math.cos(currentAngle.current) * currentRadius.current;
        
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