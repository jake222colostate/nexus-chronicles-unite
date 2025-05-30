
import { useEffect, useRef } from 'react';
import { enhancedHybridUpgrades } from '../data/EnhancedHybridUpgrades';

interface Building {
  id: string;
  production: number;
}

interface ProductionCalculatorProps {
  fantasyBuildings: { [key: string]: number };
  scifiBuildings: { [key: string]: number };
  purchasedUpgrades: string[];
  fantasyBuildingData: Building[];
  scifiBuildingData: Building[];
  onProductionUpdate: (manaRate: number, energyRate: number) => void;
}

export const ProductionCalculator: React.FC<ProductionCalculatorProps> = ({
  fantasyBuildings,
  scifiBuildings,
  purchasedUpgrades,
  fantasyBuildingData,
  scifiBuildingData,
  onProductionUpdate
}) => {
  // Use refs to prevent recalculation loops
  const lastCalculationRef = useRef<{
    fantasyCount: number;
    scifiCount: number;
    upgradesCount: number;
    result: { manaRate: number; energyRate: number };
  } | null>(null);

  const calculationTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timer
    if (calculationTimerRef.current) {
      clearTimeout(calculationTimerRef.current);
    }

    // Calculate current counts to check if recalculation is needed
    const fantasyCount = Object.keys(fantasyBuildings || {}).length;
    const scifiCount = Object.keys(scifiBuildings || {}).length;
    const upgradesCount = (purchasedUpgrades || []).length;
    
    // Only recalculate if counts actually changed
    if (lastCalculationRef.current && 
        fantasyCount === lastCalculationRef.current.fantasyCount && 
        scifiCount === lastCalculationRef.current.scifiCount &&
        upgradesCount === lastCalculationRef.current.upgradesCount) {
      return;
    }
    
    // Debounce the calculation to prevent rapid recalculations
    calculationTimerRef.current = setTimeout(() => {
      console.log('ProductionCalculator: Performing calculation');
      
      let manaRate = 0;
      let energyRate = 0;

      // Calculate base production from buildings
      (fantasyBuildingData || []).forEach(building => {
        const count = (fantasyBuildings || {})[building.id] || 0;
        manaRate += count * (building.production || 0);
      });

      (scifiBuildingData || []).forEach(building => {
        const count = (scifiBuildings || {})[building.id] || 0;
        energyRate += count * (building.production || 0);
      });

      // Apply upgrade bonuses
      let globalMultiplier = 1;
      (purchasedUpgrades || []).forEach(upgradeId => {
        const upgrade = enhancedHybridUpgrades.find(u => u.id === upgradeId);
        if (upgrade?.effects) {
          if (upgrade.effects.globalProductionBonus) {
            globalMultiplier *= (1 + upgrade.effects.globalProductionBonus);
          }
          if (upgrade.effects.manaProductionBonus) {
            manaRate += upgrade.effects.manaProductionBonus;
          }
          if (upgrade.effects.energyProductionBonus) {
            energyRate += upgrade.effects.energyProductionBonus;
          }
        }
      });

      // Cross-realm bonuses
      const fantasyBonus = 1 + (energyRate * 0.01);
      const scifiBonus = 1 + (manaRate * 0.01);

      const finalManaRate = manaRate * fantasyBonus * globalMultiplier;
      const finalEnergyRate = energyRate * scifiBonus * globalMultiplier;

      // Cache the calculation result
      lastCalculationRef.current = {
        fantasyCount,
        scifiCount,
        upgradesCount,
        result: { manaRate: finalManaRate, energyRate: finalEnergyRate }
      };

      onProductionUpdate(finalManaRate, finalEnergyRate);
    }, 50); // Small debounce delay

    return () => {
      if (calculationTimerRef.current) {
        clearTimeout(calculationTimerRef.current);
      }
    };
  }, [
    Object.keys(fantasyBuildings || {}).length,
    Object.keys(scifiBuildings || {}).length,
    (purchasedUpgrades || []).length,
    fantasyBuildingData,
    scifiBuildingData,
    onProductionUpdate
  ]);

  return null;
};
