import React, { useRef } from 'react';

interface VirtualJoystickProps {
  onMove: (dx: number, dy: number) => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const move = (clientX: number, clientY: number) => {
    if (!containerRef.current || !knobRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;
    const radius = rect.width / 2;
    const distance = Math.min(Math.sqrt(x * x + y * y), radius);
    const angle = Math.atan2(y, x);
    const nx = (distance * Math.cos(angle)) / radius;
    const ny = (distance * Math.sin(angle)) / radius;
    knobRef.current.style.transform = `translate(${nx * radius}px, ${ny * radius}px)`;
    onMove(nx, ny);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    move(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    move(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    dragging.current = false;
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(-50%, -50%)';
    }
    onMove(0, 0);
  };

  return (
    <div
      ref={containerRef}
      className="absolute bottom-4 left-4 h-24 w-24 rounded-full bg-gray-700 bg-opacity-50 select-none touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div
        ref={knobRef}
        className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300 bg-opacity-80"
      />
    </div>
  );
};
