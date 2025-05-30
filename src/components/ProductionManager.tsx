
import React, { useEffect, useRef, useCallback } from 'react';
import { ProductionCalculator } from './ProductionCalculator';

interface ProductionManagerProps {
  gameState: any;
  onProductionUpdate: (manaRate: number, energyRate: number) => void;
  fantasyBuildingData: any[];
  scifiBuildingData: any[];
}

export const ProductionManager: React.FC<ProductionManagerProps> = ({
  gameState,
  onProductionUpdate,
  fantasyBuildingData,
  scifiBuildingData
}) => {
  // Stable callback that won't change
  const stableOnProductionUpdate = useCallback((manaRate: number, energyRate: number) => {
    onProductionUpdate(manaRate, energyRate);
  }, [onProductionUpdate]);

  // Only render the ProductionCalculator - no timers here
  return (
    <ProductionCalculator
      fantasyBuildings={gameState.fantasyBuildings || {}}
      scifiBuildings={gameState.scifiBuildings || {}}
      purchasedUpgrades={gameState.purchasedUpgrades || []}
      fantasyBuildingData={fantasyBuildingData}
      scifiBuildingData={scifiBuildingData}
      onProductionUpdate={stableOnProductionUpdate}
    />
  );
};
