
import { useEffect, useRef, useMemo } from 'react';
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
  const lastResultRef = useRef<{ manaRate: number; energyRate: number } | null>(null);

  // Memoize the calculation to prevent unnecessary recalculations
  const calculatedRates = useMemo(() => {
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

    return { manaRate: finalManaRate, energyRate: finalEnergyRate };
  }, [
    JSON.stringify(fantasyBuildings || {}),
    JSON.stringify(scifiBuildings || {}),
    JSON.stringify(purchasedUpgrades || []),
    fantasyBuildingData,
    scifiBuildingData
  ]);

  // Only call onProductionUpdate when the calculated rates actually change
  useEffect(() => {
    const { manaRate, energyRate } = calculatedRates;
    
    if (!lastResultRef.current || 
        lastResultRef.current.manaRate !== manaRate || 
        lastResultRef.current.energyRate !== energyRate) {
      
      lastResultRef.current = { manaRate, energyRate };
      onProductionUpdate(manaRate, energyRate);
    }
  }, [calculatedRates, onProductionUpdate]);

  return null;
};
