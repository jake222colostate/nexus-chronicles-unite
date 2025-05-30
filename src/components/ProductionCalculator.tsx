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
  const updateCallbackRef = useRef(onProductionUpdate);
  
  // Keep callback ref updated
  updateCallbackRef.current = onProductionUpdate;

  // Memoize stable values to prevent re-calculations
  const stableFantasyBuildings = useMemo(() => fantasyBuildings || {}, [fantasyBuildings]);
  const stableScifiBuildings = useMemo(() => scifiBuildings || {}, [scifiBuildings]);
  const stablePurchasedUpgrades = useMemo(() => purchasedUpgrades || [], [purchasedUpgrades]);
  const stableFantasyBuildingData = useMemo(() => fantasyBuildingData || [], [fantasyBuildingData]);
  const stableScifiBuildingData = useMemo(() => scifiBuildingData || [], [scifiBuildingData]);

  // Memoize the calculation to prevent unnecessary recalculations
  const calculatedRates = useMemo(() => {
    console.log('ProductionCalculator: Recalculating production rates');
    
    let manaRate = 0;
    let energyRate = 0;

    // Calculate base production from buildings
    stableFantasyBuildingData.forEach(building => {
      const count = stableFantasyBuildings[building.id] || 0;
      manaRate += count * (building.production || 0);
    });

    stableScifiBuildingData.forEach(building => {
      const count = stableScifiBuildings[building.id] || 0;
      energyRate += count * (building.production || 0);
    });

    // Apply upgrade bonuses
    let globalMultiplier = 1;
    stablePurchasedUpgrades.forEach(upgradeId => {
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
    stableFantasyBuildings,
    stableScifiBuildings,
    stablePurchasedUpgrades,
    stableFantasyBuildingData,
    stableScifiBuildingData
  ]);

  // Only call onProductionUpdate when the calculated rates actually change
  useEffect(() => {
    const { manaRate, energyRate } = calculatedRates;
    
    if (!lastResultRef.current || 
        Math.abs(lastResultRef.current.manaRate - manaRate) > 0.001 || 
        Math.abs(lastResultRef.current.energyRate - energyRate) > 0.001) {
      
      console.log('ProductionCalculator: Production rates changed', { manaRate, energyRate });
      lastResultRef.current = { manaRate, energyRate };
      updateCallbackRef.current(manaRate, energyRate);
    }
  }, [calculatedRates]);

  return null;
};
