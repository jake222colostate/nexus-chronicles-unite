
import { useRef, useEffect } from 'react';

export const useMouseLookControls = () => {
  const yawAngle = useRef(0);
  const pitchAngle = useRef(0);
  const isMouseDown = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) {
        isMouseDown.current = true;
        lastMouse.current = { x: event.clientX, y: event.clientY };
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isMouseDown.current) {
        const deltaX = event.clientX - lastMouse.current.x;
        const deltaY = event.clientY - lastMouse.current.y;
        
        yawAngle.current -= deltaX * 0.002;
        pitchAngle.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitchAngle.current - deltaY * 0.002));
        
        lastMouse.current = { x: event.clientX, y: event.clientY };
      }
    };

    const handleMouseUp = () => {
      isMouseDown.current = false;
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('mouseleave', handleMouseUp);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mouseleave', handleMouseUp);
      }
    };
  }, []);

  return {
    yawAngle,
    pitchAngle,
    isMouseDown,
    lastMouse
  };
};
