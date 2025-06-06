
import { useCallback, useState } from 'react';

export interface EnemyDamageData {
  id: string;
  maxHealth: number;
  currentHealth: number;
  lastHitTime: number;
  hitFlash: boolean;
}

export const useEnemyDamageSystem = () => {
  const [enemyHealthMap, setEnemyHealthMap] = useState<Map<string, EnemyDamageData>>(new Map());

  const initializeEnemy = useCallback((enemyId: string, playerZ: number) => {
    const baseHealth = 20;
    const maxHealth = baseHealth + Math.floor(Math.abs(playerZ) / 100) * 5;
    
    const damageData: EnemyDamageData = {
      id: enemyId,
      maxHealth,
      currentHealth: maxHealth,
      lastHitTime: 0,
      hitFlash: false
    };

    setEnemyHealthMap(prev => new Map(prev.set(enemyId, damageData)));
    return damageData;
  }, []);

  const damageEnemy = useCallback((enemyId: string, damage: number) => {
    let result: { killed: boolean; reward: number } | null = null;
    
    setEnemyHealthMap(prev => {
      const newMap = new Map(prev);
      const enemyData = newMap.get(enemyId);
      
      if (enemyData) {
        const newHealth = Math.max(0, enemyData.currentHealth - damage);
        const updatedData = {
          ...enemyData,
          currentHealth: newHealth,
          lastHitTime: Date.now(),
          hitFlash: true
        };
        
        if (newHealth <= 0) {
          result = { killed: true, reward: 10 + Math.floor(enemyData.maxHealth / 5) };
          newMap.delete(enemyId);
        } else {
          result = { killed: false, reward: 0 };
          newMap.set(enemyId, updatedData);
          
          // Clear hit flash after 200ms
          setTimeout(() => {
            setEnemyHealthMap(current => {
              const flashMap = new Map(current);
              const flashData = flashMap.get(enemyId);
              if (flashData) {
                flashMap.set(enemyId, { ...flashData, hitFlash: false });
              }
              return flashMap;
            });
          }, 200);
        }
      }
      
      return newMap;
    });
    
    return result;
  }, []);

  const getEnemyHealth = useCallback((enemyId: string) => {
    return enemyHealthMap.get(enemyId);
  }, [enemyHealthMap]);

  const removeEnemy = useCallback((enemyId: string) => {
    setEnemyHealthMap(prev => {
      const newMap = new Map(prev);
      newMap.delete(enemyId);
      return newMap;
    });
  }, []);

  return {
    initializeEnemy,
    damageEnemy,
    getEnemyHealth,
    removeEnemy,
    enemyHealthMap
  };
};
