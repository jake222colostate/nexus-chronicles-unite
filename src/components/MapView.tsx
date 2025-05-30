
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Structure } from './Structure';
import { NexusCore } from './NexusCore';
import { ParticleSystem } from './ParticleSystem';

interface MapViewProps {
  realm: 'fantasy' | 'scifi';
  buildings: { [key: string]: number };
  manaPerSecond: number;
  energyPerSecond: number;
  onBuyBuilding: (buildingId: string) => void;
  buildingData: any[];
  currency: number;
}

export const MapView: React.FC<MapViewProps> = ({
  realm,
  buildings,
  manaPerSecond,
  energyPerSecond,
  onBuyBuilding,
  buildingData,
  currency
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouch, setLastTouch] = useState({ x: 0, y: 0 });
  const [lastPinchDistance, setLastPinchDistance] = useState(0);

  // Structure positioning data for each realm
  const structurePositions = {
    fantasy: [
      { id: 'altar', x: 20, y: 70, size: 'small' },
      { id: 'tower', x: 45, y: 40, size: 'medium' },
      { id: 'grove', x: 70, y: 60, size: 'large' },
      { id: 'temple', x: 25, y: 20, size: 'massive' },
    ],
    scifi: [
      { id: 'generator', x: 15, y: 75, size: 'small' },
      { id: 'reactor', x: 50, y: 50, size: 'medium' },
      { id: 'station', x: 75, y: 30, size: 'large' },
      { id: 'megastructure', x: 30, y: 15, size: 'massive' },
    ]
  };

  const updateTransform = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.style.transform = `scale(${camera.zoom}) translate(${camera.x}px, ${camera.y}px)`;
    }
  }, [camera]);

  useEffect(() => {
    updateTransform();
  }, [updateTransform]);

  // Mouse wheel zoom (desktop)
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setCamera(prev => ({
      ...prev,
      zoom: Math.max(0.5, Math.min(3, prev.zoom * zoomFactor))
    }));
  }, []);

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
        
        setCamera(prev => ({
          ...prev,
          x: prev.x + deltaX / prev.zoom,
          y: prev.y + deltaY / prev.zoom
        }));
        
        setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      } else if (e.touches.length === 2) {
        // Pinch zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (lastPinchDistance > 0) {
          const zoomFactor = distance / lastPinchDistance;
          setCamera(prev => ({
            ...prev,
            zoom: Math.max(0.5, Math.min(3, prev.zoom * zoomFactor))
          }));
        }
        
        setLastPinchDistance(distance);
      }
    } else {
      // Mouse drag
      const deltaX = e.clientX - lastTouch.x;
      const deltaY = e.clientY - lastTouch.y;
      
      setCamera(prev => ({
        ...prev,
        x: prev.x + deltaX / prev.zoom,
        y: prev.y + deltaY / prev.zoom
      }));
      
      setLastTouch({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, lastTouch, lastPinchDistance]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setLastPinchDistance(0);
  }, []);

  useEffect(() => {
    const mapElement = mapRef.current;
    if (!mapElement) return;

    // Add event listeners
    mapElement.addEventListener('wheel', handleWheel, { passive: false });
    mapElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    mapElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    mapElement.addEventListener('touchend', handleTouchEnd);
    mapElement.addEventListener('mousedown', handleTouchStart);
    mapElement.addEventListener('mousemove', handleTouchMove);
    mapElement.addEventListener('mouseup', handleTouchEnd);
    mapElement.addEventListener('mouseleave', handleTouchEnd);

    return () => {
      mapElement.removeEventListener('wheel', handleWheel);
      mapElement.removeEventListener('touchstart', handleTouchStart);
      mapElement.removeEventListener('touchmove', handleTouchMove);
      mapElement.removeEventListener('touchend', handleTouchEnd);
      mapElement.removeEventListener('mousedown', handleTouchStart);
      mapElement.removeEventListener('mousemove', handleTouchMove);
      mapElement.removeEventListener('mouseup', handleTouchEnd);
      mapElement.removeEventListener('mouseleave', handleTouchEnd);
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div className={`relative w-full h-screen overflow-hidden transition-all duration-1000 ${
      realm === 'fantasy' 
        ? 'bg-gradient-to-br from-purple-900 via-indigo-800 to-violet-900' 
        : 'bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900'
    }`}>
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        {realm === 'fantasy' ? (
          <div className="stars-fantasy"></div>
        ) : (
          <div className="stars-scifi"></div>
        )}
      </div>

      {/* Nexus Core */}
      <NexusCore 
        manaFlow={manaPerSecond}
        energyFlow={energyPerSecond}
        realm={realm}
      />

      {/* Map Container */}
      <div 
        ref={mapRef}
        className="absolute inset-0 transition-transform duration-100 cursor-grab active:cursor-grabbing"
        style={{ 
          transform: `scale(${camera.zoom}) translate(${camera.x}px, ${camera.y}px)`,
          touchAction: 'none'
        }}
      >
        {/* Ground/Base Layer */}
        <div className={`absolute inset-0 ${
          realm === 'fantasy' 
            ? 'bg-gradient-to-t from-green-900/20 to-transparent' 
            : 'bg-gradient-to-t from-gray-800/20 to-transparent'
        }`} />

        {/* Structures */}
        {structurePositions[realm].map((position) => {
          const building = buildingData.find(b => b.id === position.id);
          const count = buildings[position.id] || 0;
          
          if (!building) return null;

          return (
            <Structure
              key={position.id}
              building={building}
              position={position}
              count={count}
              realm={realm}
              onBuy={() => onBuyBuilding(position.id)}
              canAfford={currency >= Math.floor(building.cost * Math.pow(building.costMultiplier, count))}
            />
          );
        })}

        {/* Particle Systems */}
        <ParticleSystem realm={realm} productionRate={realm === 'fantasy' ? manaPerSecond : energyPerSecond} />
      </div>

      {/* Mobile UI Overlay */}
      <div className="absolute bottom-4 left-4 right-4 text-white text-xs bg-black/20 p-2 rounded backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <div>
            <div className="sm:hidden">Pinch to zoom • Drag to pan</div>
            <div className="hidden sm:block">Mouse wheel: Zoom • Drag to pan</div>
            <div>Tap structures to upgrade</div>
          </div>
          <div className="text-right opacity-70">
            <div>Zoom: {(camera.zoom * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
