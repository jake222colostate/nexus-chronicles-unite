
import { useState, useCallback, useMemo, useRef } from 'react';

export interface EnemyHealth {
  id: string;
  currentHealth: number;
  maxHealth: number;
  position: [number, number, number];
  lastHitTime: number;
}

interface UseEnemyDamageSystemProps {
  playerZ: number;
  upgradeLevel: number;
}

export const useEnemyDamageSystem = ({ playerZ, upgradeLevel }: UseEnemyDamageSystemProps) => {
  const [enemyHealths, setEnemyHealths] = useState<Map<string, EnemyHealth>>(new Map());
  const lastPlayerZ = useRef(playerZ);
  const lastUpgradeLevel = useRef(upgradeLevel);
  const stablePlayerZ = useRef(Math.floor(playerZ / 50) * 50); // Much more stable

  // Only update when there's a significant change
  const shouldUpdate = Math.abs(playerZ - lastPlayerZ.current) > 50 || upgradeLevel !== lastUpgradeLevel.current;
  
  if (shouldUpdate) {
    lastPlayerZ.current = playerZ;
    lastUpgradeLevel.current = upgradeLevel;
    stablePlayerZ.current = Math.floor(playerZ / 50) * 50;
  }

  // Stable calculation functions
  const calculateMaxHealth = useCallback((enemyZ: number) => {
    const baseHealth = 50;
    const distanceBonus = Math.floor(Math.abs(enemyZ) / 30) * 10;
    return baseHealth + distanceBonus;
  }, []);

  const projectileDamage = useMemo(() => {
    const baseDamage = 5;
    const upgradeBonus = lastUpgradeLevel.current * 2;
    return baseDamage + upgradeBonus;
  }, [lastUpgradeLevel.current]);

  const initializeEnemy = useCallback((enemyId: string, position: [number, number, number]) => {
    setEnemyHealths(prev => {
      // Prevent duplicate initialization
      if (prev.has(enemyId)) {
        return prev;
      }
      
      const maxHealth = calculateMaxHealth(position[2]);
      const enemyHealth: EnemyHealth = {
        id: enemyId,
        currentHealth: maxHealth,
        maxHealth,
        position,
        lastHitTime: 0
      };
      
      const newMap = new Map(prev);
      newMap.set(enemyId, enemyHealth);
      console.log(`EnemyDamageSystem: Initialized enemy ${enemyId} with health ${maxHealth}`);
      return newMap;
    });
  }, [calculateMaxHealth]);

  const damageEnemy = useCallback((enemyId: string, damage?: number) => {
    const actualDamage = damage || projectileDamage;
    
    setEnemyHealths(prev => {
      const enemy = prev.get(enemyId);
      if (!enemy || enemy.currentHealth <= 0) {
        return prev;
      }
      
      const newHealth = Math.max(0, enemy.currentHealth - actualDamage);
      const newMap = new Map(prev);
      newMap.set(enemyId, {
        ...enemy,
        currentHealth: newHealth,
        lastHitTime: Date.now()
      });
      
      console.log(`EnemyDamageSystem: Enemy ${enemyId} hit for ${actualDamage} damage. Health: ${newHealth}/${enemy.maxHealth}`);
      return newMap;
    });
  }, [projectileDamage]);

  const removeEnemy = useCallback((enemyId: string) => {
    setEnemyHealths(prev => {
      if (!prev.has(enemyId)) {
        return prev;
      }
      const newMap = new Map(prev);
      newMap.delete(enemyId);
      console.log(`EnemyDamageSystem: Removed enemy ${enemyId}`);
      return newMap;
    });
  }, []);

  const getEnemyHealth = useCallback((enemyId: string): EnemyHealth | undefined => {
    return enemyHealths.get(enemyId);
  }, [enemyHealths]);

  const isEnemyDead = useCallback((enemyId: string): boolean => {
    const enemy = enemyHealths.get(enemyId);
    return !enemy || enemy.currentHealth <= 0;
  }, [enemyHealths]);

  const getLivingEnemies = useCallback((): EnemyHealth[] => {
    return Array.from(enemyHealths.values()).filter(enemy => enemy.currentHealth > 0);
  }, [enemyHealths]);

  return {
    initializeEnemy,
    damageEnemy,
    removeEnemy,
    getEnemyHealth,
    isEnemyDead,
    getLivingEnemies,
    projectileDamage,
    enemyHealths: Array.from(enemyHealths.values())
  };
};
