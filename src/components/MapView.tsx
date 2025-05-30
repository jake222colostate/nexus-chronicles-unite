
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { EnhancedStructure } from './EnhancedStructure';
import { EnhancedNexusCore } from './EnhancedNexusCore';
import { AnimatedBackground } from './AnimatedBackground';
import { ParticleSystem } from './ParticleSystem';

interface MapViewProps {
  realm: 'fantasy' | 'scifi';
  buildings: { [key: string]: number };
  manaPerSecond: number;
  energyPerSecond: number;
  onBuyBuilding: (buildingId: string) => void;
  buildingData: any[];
  currency: number;
  isTransitioning?: boolean;
  nexusShards?: number;
  convergenceProgress?: number;
  onNexusClick?: () => void;
  buffSystem?: any;
}

export const MapView: React.FC<MapViewProps> = ({
  realm,
  buildings,
  manaPerSecond,
  energyPerSecond,
  onBuyBuilding,
  buildingData,
  currency,
  isTransitioning = false,
  nexusShards = 0,
  convergenceProgress = 0,
  onNexusClick,
  buffSystem
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 0.85 }); // Default 85% zoom for better overview
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouch, setLastTouch] = useState({ x: 0, y: 0 });
  const [lastPinchDistance, setLastPinchDistance] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  // Hide instructions after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowInstructions(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Enhanced structure positioning for both realms
  const structurePositions = {
    fantasy: [
      { id: 'altar', x: 25, y: 75, size: 'small' },
      { id: 'tower', x: 55, y: 45, size: 'medium' },
      { id: 'grove', x: 75, y: 65, size: 'large' },
      { id: 'temple', x: 35, y: 25, size: 'massive' },
    ],
    scifi: [
      { id: 'generator', x: 20, y: 80, size: 'small' },
      { id: 'reactor', x: 60, y: 55, size: 'medium' },
      { id: 'station', x: 80, y: 35, size: 'large' },
      { id: 'megastructure', x: 30, y: 20, size: 'massive' },
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
    <div className="relative w-full h-full overflow-hidden">
      {/* Enhanced Animated Background with realm-specific parallax */}
      <AnimatedBackground realm={realm} />

      {/* Enhanced Nexus Core with new functionality */}
      <EnhancedNexusCore 
        manaFlow={manaPerSecond}
        energyFlow={energyPerSecond}
        realm={realm}
        nexusShards={nexusShards}
        convergenceProgress={convergenceProgress}
        onNexusClick={onNexusClick}
      />

      {/* Map Container */}
      <div 
        ref={mapRef}
        className={`absolute inset-0 transition-all duration-500 cursor-grab active:cursor-grabbing ${
          isTransitioning ? 'opacity-30 scale-95' : 'opacity-100 scale-100'
        }`}
        style={{ 
          transform: `scale(${camera.zoom}) translate(${camera.x}px, ${camera.y}px)`,
          touchAction: 'none'
        }}
      >
        {/* Ground/Base Layer with realm-specific styling */}
        <div className={`absolute inset-0 transition-all duration-500 ${
          realm === 'fantasy' 
            ? 'bg-gradient-to-t from-green-900/30 via-purple-900/20 to-transparent' 
            : 'bg-gradient-to-t from-gray-800/30 via-cyan-900/20 to-transparent'
        }`} />

        {/* Enhanced Structures with buff indicators */}
        {structurePositions[realm].map((position) => {
          const building = buildingData.find(b => b.id === position.id);
          const count = buildings[position.id] || 0;
          
          if (!building) return null;

          // Get buffs for this building
          const buffs = buffSystem ? buffSystem.getBuffsForBuilding(position.id, realm) : [];

          return (
            <EnhancedStructure
              key={position.id}
              building={building}
              position={position}
              count={count}
              realm={realm}
              onBuy={() => onBuyBuilding(position.id)}
              canAfford={currency >= Math.floor(building.cost * Math.pow(building.costMultiplier, count))}
              buffs={buffs}
            />
          );
        })}

        {/* Enhanced Particle Systems */}
        <ParticleSystem realm={realm} productionRate={realm === 'fantasy' ? manaPerSecond : energyPerSecond} />
      </div>

      {/* iPhone UI Overlay with collapsible instructions */}
      {showInstructions && (
        <div className="absolute bottom-4 left-4 right-4 text-white text-xs bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/20 iphone-safe-bottom animate-fade-in">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span>Pinch to zoom • Drag to pan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Tap structures to upgrade • Tap Nexus for Convergence</span>
              </div>
              {nexusShards > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  <span>🔁 = Cross-realm buffs active</span>
                </div>
              )}
            </div>
            <div className="text-right opacity-80">
              <div className="bg-white/10 px-2 py-1 rounded text-xs">
                {(camera.zoom * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Realm indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className={`px-4 py-2 rounded-full backdrop-blur-md border transition-all duration-500 ${
          realm === 'fantasy'
            ? 'bg-purple-800/60 border-purple-400 text-purple-100'
            : 'bg-cyan-800/60 border-cyan-400 text-cyan-100'
        }`}>
          <span className="text-sm font-medium">
            {realm === 'fantasy' ? '🏰 Fantasy Realm' : '🚀 Sci-Fi Realm'}
          </span>
        </div>
      </div>
    </div>
  );
};
