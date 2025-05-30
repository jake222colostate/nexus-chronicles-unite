
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
  // Use refs to prevent unnecessary recalculations and track stable state
  const lastCalculationRef = useRef<{
    buildingsKey: string;
    upgradesKey: string;
    result: { manaRate: number; energyRate: number };
  } | null>(null);

  useEffect(() => {
    // SAFE: Create stable keys to prevent infinite recalculation
    const buildingsKey = JSON.stringify({
      fantasy: fantasyBuildings || {},
      scifi: scifiBuildings || {}
    });
    const upgradesKey = JSON.stringify(purchasedUpgrades || []);
    
    // CRITICAL: Only recalculate if buildings or upgrades actually changed
    if (lastCalculationRef.current && 
        buildingsKey === lastCalculationRef.current.buildingsKey && 
        upgradesKey === lastCalculationRef.current.upgradesKey) {
      return;
    }
    
    console.log('ProductionCalculator: Recalculating production rates');
    
    let manaRate = 0;
    let energyRate = 0;

    // SAFE: Calculate base production from buildings with null checks
    (fantasyBuildingData || []).forEach(building => {
      const count = (fantasyBuildings || {})[building.id] || 0;
      manaRate += count * (building.production || 0);
    });

    (scifiBuildingData || []).forEach(building => {
      const count = (scifiBuildings || {})[building.id] || 0;
      energyRate += count * (building.production || 0);
    });

    // SAFE: Apply upgrade bonuses with null checks
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

    // SAFE: Cross-realm bonuses with null checks
    const fantasyBonus = 1 + (energyRate * 0.01);
    const scifiBonus = 1 + (manaRate * 0.01);

    const finalManaRate = manaRate * fantasyBonus * globalMultiplier;
    const finalEnergyRate = energyRate * scifiBonus * globalMultiplier;

    // Cache the calculation result
    lastCalculationRef.current = {
      buildingsKey,
      upgradesKey,
      result: { manaRate: finalManaRate, energyRate: finalEnergyRate }
    };

    // SAFE: This callback is stable and won't cause re-renders
    onProductionUpdate(finalManaRate, finalEnergyRate);
  }, [
    JSON.stringify(fantasyBuildings || {}),
    JSON.stringify(scifiBuildings || {}),
    JSON.stringify(purchasedUpgrades || []),
    fantasyBuildingData,
    scifiBuildingData,
    onProductionUpdate
  ]);

  return null; // This is a logic-only component
};
