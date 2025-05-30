
import React, { useCallback, useMemo } from 'react';
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
  // Memoize the callback to prevent unnecessary re-renders
  const stableOnProductionUpdate = useCallback((manaRate: number, energyRate: number) => {
    console.log('ProductionManager: Updating production rates', { manaRate, energyRate });
    onProductionUpdate(manaRate, energyRate);
  }, [onProductionUpdate]);

  // Memoize stable game state values
  const stableGameState = useMemo(() => ({
    fantasyBuildings: gameState?.fantasyBuildings || {},
    scifiBuildings: gameState?.scifiBuildings || {},
    purchasedUpgrades: gameState?.purchasedUpgrades || []
  }), [
    gameState?.fantasyBuildings,
    gameState?.scifiBuildings,
    gameState?.purchasedUpgrades
  ]);

  // Memoize building data to prevent re-renders
  const stableFantasyBuildingData = useMemo(() => fantasyBuildingData || [], [fantasyBuildingData]);
  const stableScifiBuildingData = useMemo(() => scifiBuildingData || [], [scifiBuildingData]);

  return (
    <ProductionCalculator
      fantasyBuildings={stableGameState.fantasyBuildings}
      scifiBuildings={stableGameState.scifiBuildings}
      purchasedUpgrades={stableGameState.purchasedUpgrades}
      fantasyBuildingData={stableFantasyBuildingData}
      scifiBuildingData={stableScifiBuildingData}
      onProductionUpdate={stableOnProductionUpdate}
    />
  );
};
