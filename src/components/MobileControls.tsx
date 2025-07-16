import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileControlsProps {
  onMovementChange: (movement: { forward: boolean; backward: boolean; left: boolean; right: boolean }) => void;
  onLookChange: (deltaX: number, deltaY: number) => void;
  isVisible: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMovementChange,
  onLookChange,
  isVisible
}) => {
  const isMobile = useIsMobile();
  const [isMoving, setIsMoving] = useState(false);
  const [isLooking, setIsLooking] = useState(false);
  const [movement, setMovement] = useState({ forward: false, backward: false, left: false, right: false });
  
  const movementRef = useRef<HTMLDivElement>(null);
  const lookRef = useRef<HTMLDivElement>(null);
  const movementTouchId = useRef<number | null>(null);
  const lookTouchId = useRef<number | null>(null);
  const lastLookPosition = useRef({ x: 0, y: 0 });

  const handleMovementStart = useCallback((clientX: number, clientY: number, touchId?: number) => {
    if (!movementRef.current || movementTouchId.current !== null) return;
    
    setIsMoving(true);
    if (touchId !== undefined) {
      movementTouchId.current = touchId;
    }
    
    const rect = movementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    const newMovement = {
      forward: deltaY < -20,
      backward: deltaY > 20,
      left: deltaX < -20,
      right: deltaX > 20
    };
    
    setMovement(newMovement);
    onMovementChange(newMovement);
  }, [onMovementChange]);

  const handleMovementMove = useCallback((clientX: number, clientY: number, touchId?: number) => {
    if (!movementRef.current || !isMoving) return;
    if (touchId !== undefined && movementTouchId.current !== touchId) return;
    
    const rect = movementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    const newMovement = {
      forward: deltaY < -20,
      backward: deltaY > 20,
      left: deltaX < -20,
      right: deltaX > 20
    };
    
    setMovement(newMovement);
    onMovementChange(newMovement);
  }, [isMoving, onMovementChange]);

  const handleMovementEnd = useCallback((touchId?: number) => {
    if (touchId !== undefined && movementTouchId.current !== touchId) return;
    
    setIsMoving(false);
    movementTouchId.current = null;
    
    const newMovement = { forward: false, backward: false, left: false, right: false };
    setMovement(newMovement);
    onMovementChange(newMovement);
  }, [onMovementChange]);

  const handleLookStart = useCallback((clientX: number, clientY: number, touchId?: number) => {
    if (!lookRef.current || lookTouchId.current !== null) return;
    
    setIsLooking(true);
    if (touchId !== undefined) {
      lookTouchId.current = touchId;
    }
    
    lastLookPosition.current = { x: clientX, y: clientY };
  }, []);

  const handleLookMove = useCallback((clientX: number, clientY: number, touchId?: number) => {
    if (!isLooking) return;
    if (touchId !== undefined && lookTouchId.current !== touchId) return;
    
    const deltaX = clientX - lastLookPosition.current.x;
    const deltaY = clientY - lastLookPosition.current.y;
    
    onLookChange(deltaX * 0.003, deltaY * 0.003);
    
    lastLookPosition.current = { x: clientX, y: clientY };
  }, [isLooking, onLookChange]);

  const handleLookEnd = useCallback((touchId?: number) => {
    if (touchId !== undefined && lookTouchId.current !== touchId) return;
    
    setIsLooking(false);
    lookTouchId.current = null;
  }, []);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const target = e.currentTarget as HTMLElement;
      
      if (target.classList.contains('movement-control')) {
        handleMovementStart(touch.clientX, touch.clientY, touch.identifier);
      } else if (target.classList.contains('look-control')) {
        handleLookStart(touch.clientX, touch.clientY, touch.identifier);
      }
    }
  }, [handleMovementStart, handleLookStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const target = e.currentTarget as HTMLElement;
      
      if (target.classList.contains('movement-control')) {
        handleMovementMove(touch.clientX, touch.clientY, touch.identifier);
      } else if (target.classList.contains('look-control')) {
        handleLookMove(touch.clientX, touch.clientY, touch.identifier);
      }
    }
  }, [handleMovementMove, handleLookMove]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const target = e.currentTarget as HTMLElement;
      
      if (target.classList.contains('movement-control')) {
        handleMovementEnd(touch.identifier);
      } else if (target.classList.contains('look-control')) {
        handleLookEnd(touch.identifier);
      }
    }
  }, [handleMovementEnd, handleLookEnd]);

  // Mouse event handlers for desktop testing
  const handleMouseDown = useCallback((e: React.MouseEvent, type: 'movement' | 'look') => {
    e.preventDefault();
    
    if (type === 'movement') {
      handleMovementStart(e.clientX, e.clientY);
    } else {
      handleLookStart(e.clientX, e.clientY);
    }
  }, [handleMovementStart, handleLookStart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isMoving) {
      handleMovementMove(e.clientX, e.clientY);
    }
    if (isLooking) {
      handleLookMove(e.clientX, e.clientY);
    }
  }, [isMoving, isLooking, handleMovementMove, handleLookMove]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isMoving) {
      handleMovementEnd();
    }
    if (isLooking) {
      handleLookEnd();
    }
  }, [isMoving, isLooking, handleMovementEnd, handleLookEnd]);

  // Add global mouse event listeners for desktop
  useEffect(() => {
    if (!isMobile) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (isMoving) {
          handleMovementMove(e.clientX, e.clientY);
        }
        if (isLooking) {
          handleLookMove(e.clientX, e.clientY);
        }
      };

      const handleGlobalMouseUp = () => {
        if (isMoving) {
          handleMovementEnd();
        }
        if (isLooking) {
          handleLookEnd();
        }
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isMobile, isMoving, isLooking, handleMovementMove, handleLookMove, handleMovementEnd, handleLookEnd]);

  if (!isMobile || !isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Movement Control (Left Side) */}
      <div
        ref={movementRef}
        className="movement-control absolute bottom-20 left-6 w-24 h-24 pointer-events-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={(e) => handleMouseDown(e, 'movement')}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full bg-white/20 border-2 border-white/30 backdrop-blur-sm">
          {/* Inner knob */}
          <div 
            className={`absolute w-8 h-8 rounded-full bg-white/60 border border-white/70 transition-all duration-75 ${
              isMoving ? 'shadow-lg' : 'shadow-md'
            }`}
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) ${
                movement.forward ? 'translateY(-12px)' : 
                movement.backward ? 'translateY(12px)' : ''
              } ${
                movement.left ? 'translateX(-12px)' : 
                movement.right ? 'translateX(12px)' : ''
              }`
            }}
          />
        </div>
        
        {/* Direction indicators */}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-white/70 text-xs font-bold">
          ↑
        </div>
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-white/70 text-xs font-bold">
          ↓
        </div>
        <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 text-white/70 text-xs font-bold">
          ←
        </div>
        <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 text-white/70 text-xs font-bold">
          →
        </div>
      </div>

      {/* Look Control (Right Side) */}
      <div
        ref={lookRef}
        className="look-control absolute bottom-20 right-6 w-24 h-24 pointer-events-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={(e) => handleMouseDown(e, 'look')}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full bg-white/20 border-2 border-white/30 backdrop-blur-sm">
          {/* Inner area */}
          <div className="absolute inset-2 rounded-full bg-white/10 flex items-center justify-center">
            <div className="text-white/70 text-xs font-bold">👁</div>
          </div>
        </div>
        
        {/* Look indicator */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-white/70 text-xs font-bold">
          LOOK
        </div>
      </div>

      {/* Control labels */}
      <div className="absolute bottom-6 left-6 text-white/70 text-xs font-bold">
        MOVE
      </div>
      <div className="absolute bottom-6 right-6 text-white/70 text-xs font-bold">
        LOOK
      </div>
    </div>
  );
};