import React, { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMovementControls } from '@/hooks/useMovementControls';
import { useMouseLookControls } from '@/hooks/useMouseLookControls';
import { MobileControls } from './MobileControls';

interface EnhancedFirstPersonControllerProps {
  position: [number, number, number];
  onPositionChange: (position: Vector3) => void;
  canMoveForward: boolean;
}

export const EnhancedFirstPersonController: React.FC<EnhancedFirstPersonControllerProps> = ({
  position,
  onPositionChange,
  canMoveForward
}) => {
  const { camera } = useThree();
  const isMobile = useIsMobile();
  const velocity = useRef(new Vector3());
  const currentPosition = useRef(new Vector3(...position));
  
  // Desktop controls
  const keyboardKeys = useMovementControls();
  const mouseControls = useMouseLookControls();
  
  // Mobile controls state
  const mobileMovement = useRef({ forward: false, backward: false, left: false, right: false });
  const mobileYaw = useRef(0);
  const mobilePitch = useRef(0);

  // Handle mobile movement updates
  const handleMobileMovementChange = useCallback((movement: { forward: boolean; backward: boolean; left: boolean; right: boolean }) => {
    mobileMovement.current = movement;
  }, []);

  // Handle mobile look updates
  const handleMobileLookChange = useCallback((deltaX: number, deltaY: number) => {
    mobileYaw.current -= deltaX;
    mobilePitch.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, mobilePitch.current - deltaY));
  }, []);

  // Movement logic
  useFrame((state, delta) => {
    // Get movement input based on device
    const keys = isMobile ? mobileMovement.current : keyboardKeys.current;
    const yawAngle = isMobile ? mobileYaw.current : mouseControls.yawAngle.current;
    const pitchAngle = isMobile ? mobilePitch.current : mouseControls.pitchAngle.current;

    // Calculate movement direction
    const forward = new Vector3(-Math.sin(yawAngle), 0, -Math.cos(yawAngle));
    const right = new Vector3(Math.cos(yawAngle), 0, -Math.sin(yawAngle));
    const moveDirection = new Vector3();

    if (keys.forward && canMoveForward) moveDirection.add(forward);
    if (keys.backward) moveDirection.sub(forward);
    if (keys.left) moveDirection.sub(right);
    if (keys.right) moveDirection.add(right);

    // Apply movement
    if (moveDirection.length() > 0) {
      moveDirection.normalize();
      const speed = isMobile ? 4 : 5; // Slightly slower on mobile for better control
      moveDirection.multiplyScalar(speed);
      velocity.current.lerp(moveDirection, 0.2);
    } else {
      velocity.current.multiplyScalar(0.8);
    }

    // Update position
    currentPosition.current.add(velocity.current.clone().multiplyScalar(delta));
    
    // Update camera position and rotation
    camera.position.copy(currentPosition.current);
    camera.rotation.set(pitchAngle, yawAngle, 0, 'YXZ');

    // Notify parent of position change
    onPositionChange(currentPosition.current.clone());
  });

  // Initialize position
  useEffect(() => {
    currentPosition.current.set(...position);
    camera.position.copy(currentPosition.current);
  }, [position, camera]);

  return (
    <>
      {/* Mobile controls overlay */}
      <MobileControls
        onMovementChange={handleMobileMovementChange}
        onLookChange={handleMobileLookChange}
        isVisible={isMobile}
      />
    </>
  );
};