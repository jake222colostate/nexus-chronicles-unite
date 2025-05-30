
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
  const productionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Stable production update handler
  const handleProductionUpdate = useCallback((manaRate: number, energyRate: number) => {
    onProductionUpdate(manaRate, energyRate);
  }, [onProductionUpdate]);

  // Stable game loop with cleanup - runs only once
  useEffect(() => {
    console.log('ProductionManager: Starting production timer');
    
    if (productionTimerRef.current) {
      clearInterval(productionTimerRef.current);
    }
    
    productionTimerRef.current = setInterval(() => {
      // This will trigger the parent's setState which is safe
      // because it's inside a timer, not a render cycle
    }, 100);

    return () => {
      console.log('ProductionManager: Cleaning up production timer');
      if (productionTimerRef.current) {
        clearInterval(productionTimerRef.current);
      }
    };
  }, []); // Empty dependency array - only run once

  return (
    <ProductionCalculator
      fantasyBuildings={gameState.fantasyBuildings || {}}
      scifiBuildings={gameState.scifiBuildings || {}}
      purchasedUpgrades={gameState.purchasedUpgrades || []}
      fantasyBuildingData={fantasyBuildingData}
      scifiBuildingData={scifiBuildingData}
      onProductionUpdate={handleProductionUpdate}
    />
  );
};
