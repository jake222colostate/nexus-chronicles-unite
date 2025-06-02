
import React from 'react';
import { Vector3 } from 'three';
import { useMovementControls } from '../hooks/useMovementControls';
import { useMouseLookControls } from '../hooks/useMouseLookControls';
import { useTouchControls } from '../hooks/useTouchControls';
import { useCameraMovement } from '../hooks/useCameraMovement';

interface Enhanced360ControllerProps {
  position: [number, number, number];
  onPositionChange: (position: Vector3) => void;
}

export const Enhanced360Controller: React.FC<Enhanced360ControllerProps> = ({
  position,
  onPositionChange
}) => {
  const keys = useMovementControls();
  const mouseControls = useMouseLookControls();
  
  useTouchControls({ keys, mouseControls });
  
  useCameraMovement({
    position,
    onPositionChange,
    keys,
    yawAngle: mouseControls.yawAngle,
    pitchAngle: mouseControls.pitchAngle
  });

  return null;
};
