
import React, { useRef, useEffect } from 'react';
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
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 });

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

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    cameraRef.current.zoom = Math.max(0.5, Math.min(2, cameraRef.current.zoom * zoomFactor));
    
    if (mapRef.current) {
      mapRef.current.style.transform = `scale(${cameraRef.current.zoom}) translate(${cameraRef.current.x}px, ${cameraRef.current.y}px)`;
    }
  };

  useEffect(() => {
    const mapElement = mapRef.current;
    if (mapElement) {
      mapElement.addEventListener('wheel', handleWheel);
      return () => mapElement.removeEventListener('wheel', handleWheel);
    }
  }, []);

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
        className="absolute inset-0 transition-transform duration-300"
        style={{ 
          transform: `scale(${cameraRef.current.zoom}) translate(${cameraRef.current.x}px, ${cameraRef.current.y}px)` 
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

      {/* UI Overlay */}
      <div className="absolute bottom-4 left-4 text-white text-sm bg-black/20 p-2 rounded backdrop-blur-sm">
        <div>Mouse wheel: Zoom</div>
        <div>Click structures to upgrade</div>
      </div>
    </div>
  );
};
