
import { useState, useCallback, useMemo } from 'react';

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

  // Calculate base health based on player progression
  const calculateMaxHealth = useCallback((enemyZ: number) => {
    const baseHealth = 100; // Increased base health for 1/5 damage system
    const distanceBonus = Math.floor(Math.abs(enemyZ) / 10) * 10;
    return baseHealth + distanceBonus;
  }, []);

  // Calculate damage - each hit does 1/5 of max health
  const projectileDamage = useMemo(() => {
    return 20; // 20 damage = 1/5 of 100 health
  }, []);

  // Initialize enemy health when spawned
  const initializeEnemy = useCallback((enemyId: string, position: [number, number, number]) => {
    const maxHealth = calculateMaxHealth(position[2]);
    const enemyHealth: EnemyHealth = {
      id: enemyId,
      currentHealth: maxHealth,
      maxHealth,
      position,
      lastHitTime: 0
    };
    
    setEnemyHealths(prev => {
      const newMap = new Map(prev);
      newMap.set(enemyId, enemyHealth);
      return newMap;
    });
  }, [calculateMaxHealth]);

  // Deal damage to enemy
  const damageEnemy = useCallback((enemyId: string, damage?: number) => {
    const actualDamage = damage || projectileDamage;
    
    setEnemyHealths(prev => {
      const newMap = new Map(prev);
      const enemy = newMap.get(enemyId);
      
      if (enemy && enemy.currentHealth > 0) {
        const newHealth = Math.max(0, enemy.currentHealth - actualDamage);
        newMap.set(enemyId, {
          ...enemy,
          currentHealth: newHealth,
          lastHitTime: Date.now()
        });
        
        console.log(`Enemy ${enemyId} hit for ${actualDamage} damage. Health: ${newHealth}/${enemy.maxHealth}`);
      }
      
      return newMap;
    });
  }, [projectileDamage]);

  // Remove dead enemies
  const removeEnemy = useCallback((enemyId: string) => {
    setEnemyHealths(prev => {
      const newMap = new Map(prev);
      newMap.delete(enemyId);
      return newMap;
    });
  }, []);

  // Get enemy health data
  const getEnemyHealth = useCallback((enemyId: string): EnemyHealth | undefined => {
    return enemyHealths.get(enemyId);
  }, [enemyHealths]);

  // Check if enemy is dead
  const isEnemyDead = useCallback((enemyId: string): boolean => {
    const enemy = enemyHealths.get(enemyId);
    return !enemy || enemy.currentHealth <= 0;
  }, [enemyHealths]);

  // Get all living enemies
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
