
import { useRef, useEffect } from 'react';

interface MovementKeys {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

interface MouseControls {
  yawAngle: React.MutableRefObject<number>;
  pitchAngle: React.MutableRefObject<number>;
  isMouseDown: React.MutableRefObject<boolean>;
  lastMouse: React.MutableRefObject<{ x: number; y: number }>;
}

interface TouchControlsProps {
  keys: React.MutableRefObject<MovementKeys>;
  mouseControls: MouseControls;
}

export const useTouchControls = ({ keys, mouseControls }: TouchControlsProps) => {
  const { yawAngle, pitchAngle, isMouseDown, lastMouse } = mouseControls;

  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        lastMouse.current = { x: touch.clientX, y: touch.clientY };
        isMouseDown.current = true;
      } else if (event.touches.length === 2) {
        // Two finger touch for movement
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const touch1 = event.touches[0];
        
        if (touch1.clientY < rect.height * 0.5) {
          keys.current.forward = true;
        }
        if (touch1.clientX < rect.width * 0.5) {
          keys.current.left = true;
        } else {
          keys.current.right = true;
        }
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 1 && isMouseDown.current) {
        const touch = event.touches[0];
        const deltaX = touch.clientX - lastMouse.current.x;
        const deltaY = touch.clientY - lastMouse.current.y;
        
        yawAngle.current -= deltaX * 0.003;
        pitchAngle.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitchAngle.current - deltaY * 0.003));
        
        lastMouse.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    const handleTouchEnd = () => {
      isMouseDown.current = false;
      keys.current = { forward: false, backward: false, left: false, right: false };
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
      canvas.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [keys, yawAngle, pitchAngle, isMouseDown, lastMouse]);
};
