
import React, { useState, useCallback } from 'react';
import { BuildingUpgradeModal } from './BuildingUpgradeModal';
import { UpgradeFloatingTooltip } from './UpgradeFloatingTooltip';
import { structurePositions } from './StructurePositions';

interface UpgradeTooltip {
  id: number;
  buildingName: string;
  level: number;
  position: { x: number; y: number };
}

interface SelectedBuilding {
  building: any;
  count: number;
}

interface ModalManagerProps {
  realm: 'fantasy' | 'scifi';
  buildings: { [key: string]: number };
  buildingData: any[];
  currency: number;
  onBuyBuilding: (buildingId: string) => void;
}

export const useModalManager = ({
  realm,
  buildings,
  buildingData,
  currency,
  onBuyBuilding
}: ModalManagerProps) => {
  const [selectedBuilding, setSelectedBuilding] = useState<SelectedBuilding | null>(null);
  const [upgradeTooltips, setUpgradeTooltips] = useState<UpgradeTooltip[]>([]);

  // Handle building selection
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
  }, [selectedBuilding, onBuyBuilding, realm]);

  const removeUpgradeTooltip = useCallback((id: number) => {
    setUpgradeTooltips(prev => prev.filter(tooltip => tooltip.id !== id));
  }, []);

  // Close modal when clicking outside
  const handleModalBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedBuilding(null);
    }
  }, []);

  const renderModals = () => (
    <>
      {/* Enhanced Upgrade Tooltips */}
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleModalBackdropClick}
        >
          <div className="w-full max-w-[90%] max-h-[70vh]">
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
    </>
  );

  return {
    handleBuildingClick,
    renderModals
  };
};
