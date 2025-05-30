import React, { useRef, useEffect, useState, useCallback } from 'react';
import { EnhancedStructure } from './EnhancedStructure';
import { AnimatedBackground } from './AnimatedBackground';
import { ParticleSystem } from './ParticleSystem';
import { TapResourceEffect } from './TapResourceEffect';
import { UpgradeFloatingTooltip } from './UpgradeFloatingTooltip';
import { BuildingUpgradeModal } from './BuildingUpgradeModal';
import { SkillTreeNode } from './SkillTreeNode';
import { HybridUpgradeModal } from './HybridUpgradeModal';
import { enhancedHybridUpgrades } from '../data/EnhancedHybridUpgrades';

interface MapSkillTreeViewProps {
  realm: 'fantasy' | 'scifi';
  buildings: { [key: string]: number };
  manaPerSecond: number;
  energyPerSecond: number;
  onBuyBuilding: (buildingId: string) => void;
  buildingData: any[];
  currency: number;
  isTransitioning?: boolean;
  gameState: any;
  onPurchaseUpgrade: (upgradeId: string) => void;
  showTapEffect?: boolean;
  onTapEffectComplete?: () => void;
}

export const MapSkillTreeView: React.FC<MapSkillTreeViewProps> = ({
  realm,
  buildings,
  manaPerSecond,
  energyPerSecond,
  onBuyBuilding,
  buildingData,
  currency,
  isTransitioning = false,
  gameState,
  onPurchaseUpgrade,
  showTapEffect = false,
  onTapEffectComplete
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 0.85 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouch, setLastTouch] = useState({ x: 0, y: 0 });
  const [lastPinchDistance, setLastPinchDistance] = useState(0);
  const [selectedBuilding, setSelectedBuilding] = useState<{
    building: any;
    count: number;
  } | null>(null);
  const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null);
  const [upgradeTooltips, setUpgradeTooltips] = useState<Array<{
    id: number;
    buildingName: string;
    level: number;
    position: { x: number; y: number };
  }>>([]);

  // Enhanced structure positioning - moved higher to avoid skill tree collision
  const structurePositions = {
    fantasy: [
      { id: 'altar', x: 20, y: 10, size: 'small', tier: 1 },
      { id: 'tower', x: 80, y: 15, size: 'medium', tier: 2 },
      { id: 'grove', x: 15, y: 30, size: 'large', tier: 3 },
      { id: 'temple', x: 85, y: 35, size: 'massive', tier: 4 },
    ],
    scifi: [
      { id: 'generator', x: 20, y: 10, size: 'small', tier: 1 },
      { id: 'reactor', x: 80, y: 15, size: 'medium', tier: 2 },
      { id: 'station', x: 15, y: 30, size: 'large', tier: 3 },
      { id: 'megastructure', x: 85, y: 35, size: 'massive', tier: 4 },
    ]
  };

  // Enhanced vertical skill tree with proper spacing and no overlaps
  const skillTreePositions = [
    // Tier 1 - Starting node
    { id: 'arcane_ai', x: 50, y: 50, tier: 1 },
    
    // Tier 2 - Two branches
    { id: 'mana_fountain', x: 35, y: 60, tier: 2 },
    { id: 'quantum_drive', x: 65, y: 60, tier: 2 },
    
    // Tier 3 - Expanded with proper spacing
    { id: 'arcane_beacon', x: 20, y: 70, tier: 3 },
    { id: 'cyber_dragon', x: 40, y: 70, tier: 3 },
    { id: 'nano_reactor', x: 60, y: 70, tier: 3 },
    { id: 'crystal_matrix', x: 80, y: 70, tier: 3 },
    { id: 'void_engine', x: 30, y: 80, tier: 3 },
    
    // Tier 4 - Elite upgrades
    { id: 'rift_core', x: 40, y: 90, tier: 4 },
    { id: 'time_nexus', x: 60, y: 90, tier: 4 },
    
    // Tier 5 - Ultimate upgrade
    { id: 'reality_engine', x: 50, y: 100, tier: 5 }
  ];

  const checkUpgradeUnlocked = useCallback((upgrade: any): boolean => {
    const { requirements } = upgrade;
    
    if (requirements.mana && gameState.mana < requirements.mana) return false;
    if (requirements.energy && gameState.energyCredits < requirements.energy) return false;
    if (requirements.nexusShards && gameState.nexusShards < requirements.nexusShards) return false;
    if (requirements.convergenceCount && gameState.convergenceCount < requirements.convergenceCount) return false;
    
    return true;
  }, [gameState]);

  const updateTransform = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.style.transform = `scale(${camera.zoom}) translate(${camera.x}px, ${camera.y}px)`;
    }
  }, [camera]);

  useEffect(() => {
    updateTransform();
  }, [updateTransform]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setCamera(prev => ({
      ...prev,
      zoom: Math.max(0.5, Math.min(2, prev.zoom * zoomFactor))
    }));
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent | MouseEvent) => {
    setIsDragging(true);
    
    if ('touches' in e) {
      if (e.touches.length === 1) {
        setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      } else if (e.touches.length === 2) {
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
        const deltaX = e.touches[0].clientX - lastTouch.x;
        const deltaY = e.touches[0].clientY - lastTouch.y;
        
        setCamera(prev => ({
          ...prev,
          x: prev.x + deltaX / prev.zoom,
          y: prev.y + deltaY / prev.zoom
        }));
        
        setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (lastPinchDistance > 0) {
          const zoomFactor = distance / lastPinchDistance;
          setCamera(prev => ({
            ...prev,
            zoom: Math.max(0.5, Math.min(2, prev.zoom * zoomFactor))
          }));
        }
        
        setLastPinchDistance(distance);
      }
    } else {
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

  const handleBuildingClick = useCallback((buildingId: string) => {
    const building = buildingData.find(b => b.id === buildingId);
    const count = buildings[buildingId] || 0;
    
    setUpgradeTooltips([]);
    
    if (building) {
      setSelectedBuilding({ building, count });
    }
  }, [buildingData, buildings]);

  const handleBuildingPurchase = useCallback(() => {
    if (selectedBuilding) {
      const position = structurePositions[realm].find(p => p.id === selectedBuilding.building.id);
      if (position) {
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

  const handleUpgradeClick = useCallback((upgradeId: string) => {
    setSelectedUpgrade(upgradeId);
  }, []);

  const handleUpgradePurchase = useCallback(() => {
    if (selectedUpgrade) {
      onPurchaseUpgrade(selectedUpgrade);
      setSelectedUpgrade(null);
    }
  }, [selectedUpgrade, onPurchaseUpgrade]);

  const removeUpgradeTooltip = useCallback((id: number) => {
    setUpgradeTooltips(prev => prev.filter(tooltip => tooltip.id !== id));
  }, []);

  const handleModalBackdropClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      setSelectedBuilding(null);
      setSelectedUpgrade(null);
    }
  }, []);

  useEffect(() => {
    const mapElement = mapRef.current;
    if (!mapElement) return;

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
      {/* Enhanced Background with vertical fade */}
      <div className={`absolute inset-0 transition-all duration-700 ${
        isTransitioning ? 'opacity-50 scale-105' : 'opacity-100 scale-100'
      }`}>
        <AnimatedBackground realm={realm} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
      </div>

      {/* Scrollable Map Container with proper height for skill tree */}
      <div 
        ref={mapRef}
        className={`absolute inset-0 transition-all duration-500 cursor-grab active:cursor-grabbing ${
          isTransitioning ? 'opacity-70 blur-sm' : 'opacity-100 blur-0'
        }`}
        style={{ 
          transform: `scale(${camera.zoom}) translate(${camera.x}px, ${camera.y}px)`,
          touchAction: 'none',
          minHeight: '300%'
        }}
      >
        {/* Tier dividers for visual separation */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" style={{ top: '55%' }} />
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" style={{ top: '65%' }} />
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" style={{ top: '85%' }} />
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" style={{ top: '95%' }} />
        </div>

        {/* Enhanced Skill Tree Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* Tier connections with proper coordinates */}
          <line x1="50%" y1="50%" x2="35%" y2="60%" stroke="rgba(168, 85, 247, 0.5)" strokeWidth="2" className="drop-shadow-sm" />
          <line x1="50%" y1="50%" x2="65%" y2="60%" stroke="rgba(168, 85, 247, 0.5)" strokeWidth="2" className="drop-shadow-sm" />
          
          <line x1="35%" y1="60%" x2="20%" y2="70%" stroke="rgba(168, 85, 247, 0.5)" strokeWidth="2" className="drop-shadow-sm" />
          <line x1="35%" y1="60%" x2="40%" y2="70%" stroke="rgba(168, 85, 247, 0.5)" strokeWidth="2" className="drop-shadow-sm" />
          <line x1="65%" y1="60%" x2="60%" y2="70%" stroke="rgba(168, 85, 247, 0.5)" strokeWidth="2" className="drop-shadow-sm" />
          <line x1="65%" y1="60%" x2="80%" y2="70%" stroke="rgba(168, 85, 247, 0.5)" strokeWidth="2" className="drop-shadow-sm" />
          <line x1="40%" y1="70%" x2="30%" y2="80%" stroke="rgba(168, 85, 247, 0.5)" strokeWidth="2" className="drop-shadow-sm" />
          
          <line x1="40%" y1="70%" x2="40%" y2="90%" stroke="rgba(168, 85, 247, 0.5)" strokeWidth="2" className="drop-shadow-sm" />
          <line x1="60%" y1="70%" x2="60%" y2="90%" stroke="rgba(168, 85, 247, 0.5)" strokeWidth="2" className="drop-shadow-sm" />
          
          <line x1="40%" y1="90%" x2="50%" y2="100%" stroke="rgba(168, 85, 247, 0.5)" strokeWidth="2" className="drop-shadow-sm" />
          <line x1="60%" y1="90%" x2="50%" y2="100%" stroke="rgba(168, 85, 247, 0.5)" strokeWidth="2" className="drop-shadow-sm" />
        </svg>

        {/* Skill Tree Nodes */}
        {skillTreePositions.map((position) => {
          const upgrade = enhancedHybridUpgrades.find(u => u.id === position.id);
          if (!upgrade) return null;

          return (
            <SkillTreeNode
              key={upgrade.id}
              upgrade={upgrade}
              position={position}
              isUnlocked={checkUpgradeUnlocked(upgrade)}
              isPurchased={gameState.purchasedUpgrades?.includes(upgrade.id) || false}
              canAfford={gameState.nexusShards >= upgrade.cost}
              onClick={() => handleUpgradeClick(upgrade.id)}
            />
          );
        })}

        {/* Enhanced Structures */}
        {structurePositions[realm].map((position) => {
          const building = buildingData.find(b => b.id === position.id);
          const count = buildings[position.id] || 0;
          
          if (!building) return null;

          return (
            <div key={`${realm}-${position.id}`} className="relative z-20">
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

        {/* Particle Systems */}
        <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-20' : 'opacity-50'}`}>
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

      {/* Upgrade Tooltips */}
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
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={handleModalBackdropClick}
        >
          <div className="w-full max-w-[90%] max-h-[70vh] animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <BuildingUpgradeModal
              building={selectedBuilding.building}
              count={selectedBuilding.count}
              realm={realm}
              currency={currency}
              onBuy={handleBuildingPurchase}
              onClose={() => setSelectedBuilding(null)}
            />
          </div>
        </div>
      )}

      {/* Hybrid Upgrade Modal */}
      {selectedUpgrade && (
        <HybridUpgradeModal
          upgrade={enhancedHybridUpgrades.find(u => u.id === selectedUpgrade)!}
          gameState={gameState}
          onPurchase={handleUpgradePurchase}
          onClose={() => setSelectedUpgrade(null)}
        />
      )}
    </div>
  );
};
