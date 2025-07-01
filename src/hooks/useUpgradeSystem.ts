
import { useCallback } from 'react';
import { scifiUpgrades } from '../data/ScifiUpgrades';
import { fantasyUpgrades } from '../data/FantasyUpgrades';

interface UseUpgradeSystemProps {
  gameState: any;
  setGameState: React.Dispatch<React.SetStateAction<any>>;
}

export const useUpgradeSystem = ({ gameState, setGameState }: UseUpgradeSystemProps) => {
  
  const purchaseScifiUpgrade = useCallback((upgradeId: string) => {
    const upgrade = scifiUpgrades.find(u => u.id === upgradeId);
    if (!upgrade || upgrade.purchased || gameState.energyCredits < upgrade.cost) {
      return false;
    }

    // Check unlock requirements
    if (upgrade.unlockRequirement) {
      const fantasyUpgradeCount = fantasyUpgrades.filter(u => u.purchased).length;
      if (fantasyUpgradeCount < upgrade.unlockRequirement.fantasyUpgrades) {
        return false;
      }
    }

    setGameState(prev => {
      // Create new arrays instead of mutating originals
      const updatedScifiUpgrades = (prev.scifiUpgrades || scifiUpgrades).map(u => 
        u.id === upgradeId ? { ...u, purchased: true } : u
      );
      
      let nexusShards = prev.nexusShards || 0;
      
      // If this is a special upgrade, check if we should earn a nexus shard
      if (upgrade.isSpecial) {
        const hasFantasySpecial = fantasyUpgrades.some(u => u.isSpecial && u.purchased);
        if (hasFantasySpecial) {
          nexusShards += 1;
        }
      }

      return {
        ...prev,
        energyCredits: prev.energyCredits - upgrade.cost,
        energyPerSecond: prev.energyPerSecond + (upgrade.bonus.match(/\d+/) ? parseInt(upgrade.bonus.match(/\d+/)[0]) : 0),
        nexusShards,
        scifiUpgrades: updatedScifiUpgrades
      };
    });

    return true;
  }, [gameState.energyCredits, gameState.nexusShards, setGameState]);

  const purchaseFantasyUpgrade = useCallback((upgradeId: string) => {
    const upgrade = fantasyUpgrades.find(u => u.id === upgradeId);
    if (!upgrade || upgrade.purchased || gameState.mana < upgrade.cost) {
      return false;
    }

    setGameState(prev => {
      // Create new arrays instead of mutating originals
      const updatedFantasyUpgrades = (prev.fantasyUpgrades || fantasyUpgrades).map(u => 
        u.id === upgradeId ? { ...u, purchased: true } : u
      );
      
      let nexusShards = prev.nexusShards || 0;
      
      // If this is a special upgrade, check if we should earn a nexus shard
      if (upgrade.isSpecial) {
        const hasScifiSpecial = scifiUpgrades.some(u => u.isSpecial && u.purchased);
        if (hasScifiSpecial) {
          nexusShards += 1;
        }
      }

      return {
        ...prev,
        mana: prev.mana - upgrade.cost,
        manaPerSecond: prev.manaPerSecond + (upgrade.bonus.match(/\d+/) ? parseInt(upgrade.bonus.match(/\d+/)[0]) : 0),
        nexusShards,
        fantasyUpgrades: updatedFantasyUpgrades
      };
    });

    return true;
  }, [gameState.mana, gameState.nexusShards, setGameState]);

  const getFantasyUpgradeCount = useCallback(() => {
    return fantasyUpgrades.filter(u => u.purchased).length;
  }, []);

  return {
    purchaseScifiUpgrade,
    purchaseFantasyUpgrade,
    getFantasyUpgradeCount
  };
};
