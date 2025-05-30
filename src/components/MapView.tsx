import React, { useRef, useEffect, useState, useCallback } from 'react';
import { EnhancedStructure } from './EnhancedStructure';
import { EnhancedNexusCore } from './EnhancedNexusCore';
import { AnimatedBackground } from './AnimatedBackground';
import { ParticleSystem } from './ParticleSystem';
import { TapResourceEffect } from './TapResourceEffect';
import { UpgradeFloatingTooltip } from './UpgradeFloatingTooltip';
import { BuildingUpgradeModal } from './BuildingUpgradeModal';
import { Button } from '@/components/ui/button';

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
  onRealmChange?: (realm: 'fantasy' | 'scifi') => void;
  showTapEffect?: boolean;
  onTapEffectComplete?: () => void;
  onTapResource?: () => void;
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
  buffSystem,
  onRealmChange,
  showTapEffect = false,
  onTapEffectComplete,
  onTapResource
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 0.9 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouch, setLastTouch] = useState({ x: 0, y: 0 });
  const [lastPinchDistance, setLastPinchDistance] = useState(0);
  const [selectedBuilding, setSelectedBuilding] = useState<{
    building: any;
    count: number;
  } | null>(null);
  const [upgradeTooltips, setUpgradeTooltips] = useState<Array<{
    id: number;
    buildingName: string;
    level: number;
    position: { x: number; y: number };
  }>>([]);

  // Optimized structure positioning for the remaining map area (centered in right 2/3)
  const structurePositions = {
    fantasy: [
      { id: 'altar', x: 25, y: 75, size: 'small' },
      { id: 'tower', x: 55, y: 45, size: 'medium' },
      { id: 'grove', x: 75, y: 65, size: 'large' },
      { id: 'temple', x: 40, y: 25, size: 'massive' },
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

  // Handle building selection - Clear all tooltips when selecting a new building
  const handleBuildingClick = useCallback((buildingId: string) => {
    const building = buildingData.find(b => b.id === buildingId);
    const count = buildings[buildingId] || 0;
    
    // Clear all existing tooltips first
    setUpgradeTooltips([]);
    
    if (building) {
      setSelectedBuilding({ building, count });
    }
  }, [buildingData, buildings]);

  // Handle building purchase with scale animation
  const handleBuildingPurchase = useCallback(() => {
    if (selectedBuilding) {
      const position = structurePositions[realm].find(p => p.id === selectedBuilding.building.id);
      if (position) {
        // Clear existing tooltips and add new one
        setUpgradeTooltips([{
          id: Date.now(),
          buildingName: selectedBuilding.building.name,
          level: selectedBuilding.count + 1,
          position: { x: position.x, y: position.y }
        }]);
      }
      
      onBuyBuilding(selectedBuilding.building.id);
      setSelectedBuilding(null);
    }
  }, [selectedBuilding, onBuyBuilding, realm, structurePositions]);

  const removeUpgradeTooltip = useCallback((id: number) => {
    setUpgradeTooltips(prev => prev.filter(tooltip => tooltip.id !== id));
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
      {/* Enhanced Background with subtle gradient */}
      <div className={`absolute inset-0 transition-all duration-700 ${
        isTransitioning ? 'opacity-50 scale-105' : 'opacity-100 scale-100'
      }`}>
        <AnimatedBackground realm={realm} />
        {/* Subtle top-to-bottom gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/20 pointer-events-none" />
      </div>

      {/* Enhanced Nexus Core - Perfectly centered */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <EnhancedNexusCore 
          manaFlow={manaPerSecond}
          energyFlow={energyPerSecond}
          realm={realm}
          nexusShards={nexusShards}
          convergenceProgress={convergenceProgress}
          onNexusClick={onNexusClick}
        />
      </div>

      {/* Map Container with enhanced interaction and proper spacing */}
      <div 
        ref={mapRef}
        className={`absolute inset-0 transition-all duration-500 cursor-grab active:cursor-grabbing ${
          isTransitioning ? 'opacity-70 blur-sm' : 'opacity-100 blur-0'
        }`}
        style={{ 
          transform: `scale(${camera.zoom}) translate(${camera.x}px, ${camera.y}px)`,
          touchAction: 'none'
        }}
      >
        {/* Ground/Base Layer with enhanced realm-specific styling */}
        <div className={`absolute inset-0 transition-all duration-700 ${
          realm === 'fantasy' 
            ? 'bg-gradient-to-t from-purple-900/30 via-violet-800/15 to-transparent' 
            : 'bg-gradient-to-t from-cyan-900/30 via-blue-800/15 to-transparent'
        }`} />

        {/* Enhanced Structures with proper spacing */}
        {structurePositions[realm].map((position) => {
          const building = buildingData.find(b => b.id === position.id);
          const count = buildings[position.id] || 0;
          
          if (!building) return null;

          return (
            <div
              key={`${realm}-${position.id}`}
              className="relative z-20"
            >
              <EnhancedStructure
                building={building}
                position={position}
                count={count}
                realm={realm}
                onBuy={() => handleBuildingClick(position.id)}
                canAfford={currency >= Math.floor(building.cost * Math.pow(building.costMultiplier, count))}
              />
            </div>
          );
        })}

        {/* Enhanced Particle Systems */}
        <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-30' : 'opacity-100'}`}>
          <ParticleSystem 
            realm={realm} 
            productionRate={realm === 'fantasy' ? manaPerSecond : energyPerSecond} 
          />
        </div>
      </div>

      {/* Tap Resource Effect */}
      {showTapEffect && onTapEffectComplete && (
        <TapResourceEffect
          realm={realm}
          onComplete={onTapEffectComplete}
        />
      )}

      {/* Enhanced Tap to Generate Button - Properly spaced above bottom bar */}
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-30">
        <Button 
          onClick={onTapResource}
          className={`h-14 px-8 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 font-bold text-base backdrop-blur-xl shadow-2xl ${
            realm === 'fantasy'
              ? 'bg-gradient-to-r from-purple-600/80 to-violet-700/80 hover:from-purple-500/80 hover:to-violet-600/80 border-2 border-purple-400/60 text-purple-100 shadow-purple-500/40'
              : 'bg-gradient-to-r from-cyan-600/80 to-blue-700/80 hover:from-cyan-500/80 hover:to-blue-600/80 border-2 border-cyan-400/60 text-cyan-100 shadow-cyan-500/40'
          }`}
        >
          {/* Glassmorphism inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none rounded-2xl" />
          
          <span className="flex items-center gap-2 relative z-10">
            {realm === 'fantasy' ? '✨' : '⚡'}
            Tap to Generate {realm === 'fantasy' ? 'Mana' : 'Energy'}
          </span>
        </Button>
      </div>

      {/* Enhanced Upgrade Tooltips - Only one at a time, smart positioning */}
      {upgradeTooltips.map((tooltip) => (
        <UpgradeFloatingTooltip
          key={tooltip.id}
          buildingName={tooltip.buildingName}
          level={tooltip.level}
          realm={realm}
          position={tooltip.position}
          onComplete={() => removeUpgradeTooltip(tooltip.id)}
        />
      ))}

      {/* Building Upgrade Modal */}
      {selectedBuilding && (
        <BuildingUpgradeModal
          building={selectedBuilding.building}
          count={selectedBuilding.count}
          realm={realm}
          currency={currency}
          onBuy={handleBuildingPurchase}
          onClose={() => setSelectedBuilding(null)}
        />
      )}
    </div>
  );
};
