
import React, { useRef, useEffect, useCallback } from 'react';
import { AnimatedBackground } from './AnimatedBackground';
import { ParticleSystem } from './ParticleSystem';
import { TapResourceEffect } from './TapResourceEffect';
import { useCameraController } from './CameraController';
import { StructureManager } from './StructureManager';
import { useModalManager } from './ModalManager';

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

  // Camera controller hook
  const updateTransform = useCallback((camera: { x: number; y: number; zoom: number }) => {
    if (mapRef.current) {
      mapRef.current.style.transform = `scale(${camera.zoom}) translate(${camera.x}px, ${camera.y}px)`;
    }
  }, []);

  const { camera, handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd } = useCameraController({
    onCameraUpdate: updateTransform
  });

  // Modal manager hook
  const { handleBuildingClick, renderModals } = useModalManager({
    realm,
    buildings,
    buildingData,
    currency,
    onBuyBuilding
  });

  // Event listeners setup
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
      {/* Simplified background for sci-fi realm */}
      <div className={`absolute inset-0 transition-all duration-700 ${
        isTransitioning ? 'opacity-50 scale-105' : 'opacity-100 scale-100'
      }`}>
        {realm === 'fantasy' && <AnimatedBackground realm={realm} />}
        {/* Simple gradient background for sci-fi to reduce texture load */}
        {realm === 'scifi' && (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900" />
        )}
        {/* Simplified gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 pointer-events-none" />
      </div>

      {/* Map Container */}
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
        {/* Simplified ground layer for sci-fi realm */}
        <div className={`absolute inset-0 transition-all duration-700 ${
          realm === 'fantasy' 
            ? 'bg-gradient-to-t from-purple-900/30 via-violet-800/15 to-transparent' 
            : 'bg-gradient-to-t from-slate-800/20 via-blue-800/10 to-transparent'
        }`} />

        {/* Enhanced Structures */}
        <StructureManager
          realm={realm}
          buildings={buildings}
          buildingData={buildingData}
          currency={currency}
          onBuildingClick={handleBuildingClick}
        />

        {/* Reduced particle systems for sci-fi realm */}
        <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-20' : realm === 'scifi' ? 'opacity-30' : 'opacity-60'}`}>
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

      {/* Render all modals */}
      {renderModals()}
    </div>
  );
};
