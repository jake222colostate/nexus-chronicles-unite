
import { useRef, useEffect } from 'react';

export const useMouseLookControls = () => {
  const yawAngle = useRef(0);
  const pitchAngle = useRef(0);
  const isMouseDown = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) { // Left click only
        isMouseDown.current = true;
        lastMouse.current = { x: event.clientX, y: event.clientY };
        event.preventDefault();
        console.log('Mouse down detected');
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isMouseDown.current) {
        const deltaX = event.clientX - lastMouse.current.x;
        const deltaY = event.clientY - lastMouse.current.y;
        
        yawAngle.current -= deltaX * 0.002;
        pitchAngle.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitchAngle.current - deltaY * 0.002));
        
        lastMouse.current = { x: event.clientX, y: event.clientY };
        event.preventDefault();
      }
    };

    const handleMouseUp = () => {
      if (isMouseDown.current) {
        console.log('Mouse up detected');
      }
      isMouseDown.current = false;
    };

    // Wait for canvas to be available
    const setupEventListeners = () => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        console.log('Canvas found, setting up mouse controls');
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseUp);
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Ensure canvas can receive focus
        canvas.tabIndex = 0;
        canvas.style.outline = 'none';
        canvas.style.cursor = 'grab';
        
        return canvas;
      }
      return null;
    };

    // Try to setup immediately
    let canvas = setupEventListeners();
    
    // If canvas not found, try again after a short delay
    if (!canvas) {
      const timeout = setTimeout(() => {
        canvas = setupEventListeners();
      }, 100);
      
      return () => {
        clearTimeout(timeout);
        if (canvas) {
          canvas.removeEventListener('mousedown', handleMouseDown);
          canvas.removeEventListener('mousemove', handleMouseMove);
          canvas.removeEventListener('mouseup', handleMouseUp);
          canvas.removeEventListener('mouseleave', handleMouseUp);
          canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
        }
      };
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mouseleave', handleMouseUp);
        canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
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
