
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
  // Use refs to prevent unnecessary recalculations
  const lastBuildingsRef = useRef<string>('');
  const lastUpgradesRef = useRef<string>('');

  useEffect(() => {
    const buildingsKey = JSON.stringify({
      fantasy: fantasyBuildings,
      scifi: scifiBuildings
    });
    const upgradesKey = JSON.stringify(purchasedUpgrades);
    
    // Only recalculate if buildings or upgrades actually changed
    if (buildingsKey === lastBuildingsRef.current && upgradesKey === lastUpgradesRef.current) {
      return;
    }
    
    lastBuildingsRef.current = buildingsKey;
    lastUpgradesRef.current = upgradesKey;
    
    console.log('ProductionCalculator: Recalculating production rates');
    
    let manaRate = 0;
    let energyRate = 0;

    // Calculate base production from buildings
    fantasyBuildingData.forEach(building => {
      const count = fantasyBuildings[building.id] || 0;
      manaRate += count * building.production;
    });

    scifiBuildingData.forEach(building => {
      const count = scifiBuildings[building.id] || 0;
      energyRate += count * building.production;
    });

    // Apply upgrade bonuses
    let globalMultiplier = 1;
    purchasedUpgrades.forEach(upgradeId => {
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

    onProductionUpdate(finalManaRate, finalEnergyRate);
  }, [fantasyBuildings, scifiBuildings, purchasedUpgrades, fantasyBuildingData, scifiBuildingData, onProductionUpdate]);

  return null; // This is a logic-only component
};
