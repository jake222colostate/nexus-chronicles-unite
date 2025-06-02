
import { useState, useCallback, useRef, useEffect } from 'react';

interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

interface CameraControllerProps {
  onCameraUpdate: (camera: CameraState) => void;
}

export const useCameraController = ({ onCameraUpdate }: CameraControllerProps) => {
  const [camera, setCamera] = useState<CameraState>({ x: 0, y: 0, zoom: 0.9 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouch, setLastTouch] = useState({ x: 0, y: 0 });
  const [lastPinchDistance, setLastPinchDistance] = useState(0);

  // Mouse wheel zoom (desktop)
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setCamera(prev => {
      const newCamera = {
        ...prev,
        zoom: Math.max(0.5, Math.min(3, prev.zoom * zoomFactor))
      };
      onCameraUpdate(newCamera);
      return newCamera;
    });
  }, [onCameraUpdate]);

  // Touch/mouse drag handling
  const handleTouchStart = useCallback((e: TouchEvent | MouseEvent) => {
    setIsDragging(true);
    
    if ('touches' in e) {
      if (e.touches.length === 1) {
        setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      } else if (e.touches.length === 2) {
        // Pinch zoom setup
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        setLastPinchDistance(Math.sqrt(dx * dx + dy * dy));
      }
    } else {
      setLastTouch({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    if ('touches' in e) {
      if (e.touches.length === 1) {
        // Single touch drag
        const deltaX = e.touches[0].clientX - lastTouch.x;
        const deltaY = e.touches[0].clientY - lastTouch.y;
        
        setCamera(prev => {
          const newCamera = {
            ...prev,
            x: prev.x + deltaX / prev.zoom,
            y: prev.y + deltaY / prev.zoom
          };
          onCameraUpdate(newCamera);
          return newCamera;
        });
        
        setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      } else if (e.touches.length === 2) {
        // Pinch zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (lastPinchDistance > 0) {
          const zoomFactor = distance / lastPinchDistance;
          setCamera(prev => {
            const newCamera = {
              ...prev,
              zoom: Math.max(0.5, Math.min(3, prev.zoom * zoomFactor))
            };
            onCameraUpdate(newCamera);
            return newCamera;
          });
        }
        
        setLastPinchDistance(distance);
      }
    } else {
      // Mouse drag
      const deltaX = e.clientX - lastTouch.x;
      const deltaY = e.clientY - lastTouch.y;
      
      setCamera(prev => {
        const newCamera = {
          ...prev,
          x: prev.x + deltaX / prev.zoom,
          y: prev.y + deltaY / prev.zoom
        };
        onCameraUpdate(newCamera);
        return newCamera;
      });
      
      setLastTouch({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, lastTouch, lastPinchDistance, onCameraUpdate]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setLastPinchDistance(0);
  }, []);

  return {
    camera,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
};
