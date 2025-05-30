
import React from 'react';
import { CrossRealmBuff, BuffIndicator } from '../types/GameTypes';
import { crossRealmBuffs } from '../data/CrossRealmBuffs';

interface CrossRealmBuffSystemProps {
  fantasyBuildings: { [key: string]: number };
  scifiBuildings: { [key: string]: number };
}

interface BuffSystemMethods {
  getActiveBuffs: () => BuffIndicator[];
  calculateBuildingMultiplier: (buildingId: string, realm: 'fantasy' | 'scifi') => { multiplier: number; flatBonus: number };
  getBuffsForBuilding: (buildingId: string, realm: 'fantasy' | 'scifi') => BuffIndicator[];
}

export const createBuffSystem = (
  fantasyBuildings: { [key: string]: number },
  scifiBuildings: { [key: string]: number }
): BuffSystemMethods => {
  
  const getActiveBuffs = (): BuffIndicator[] => {
    const activeBuffs: BuffIndicator[] = [];
    
    crossRealmBuffs.forEach(buff => {
      const sourceBuildings = buff.sourceRealm === 'fantasy' ? fantasyBuildings : scifiBuildings;
      const sourceCount = sourceBuildings[buff.sourceBuildingId] || 0;
      
      if (sourceCount >= buff.sourceRequirement) {
        activeBuffs.push({
          buildingId: buff.targetBuildingId,
          buffName: buff.name,
          buffValue: buff.buffValue,
          icon: buff.icon
        });
      }
    });
    
    return activeBuffs;
  };

  const calculateBuildingMultiplier = (buildingId: string, realm: 'fantasy' | 'scifi'): { multiplier: number; flatBonus: number } => {
    let multiplier = 1;
    let flatBonus = 0;
    
    crossRealmBuffs.forEach(buff => {
      if (buff.targetBuildingId === buildingId && buff.targetRealm === realm) {
        const sourceBuildings = buff.sourceRealm === 'fantasy' ? fantasyBuildings : scifiBuildings;
        const sourceCount = sourceBuildings[buff.sourceBuildingId] || 0;
        
        if (sourceCount >= buff.sourceRequirement) {
          if (buff.buffType === 'percentage') {
            multiplier *= (1 + buff.buffValue);
          } else {
            flatBonus += buff.buffValue * sourceCount;
          }
        }
      }
    });
    
    return { multiplier, flatBonus };
  };

  const getBuffsForBuilding = (buildingId: string, realm: 'fantasy' | 'scifi'): BuffIndicator[] => {
    return getActiveBuffs().filter(buff => 
      buff.buildingId === buildingId && 
      crossRealmBuffs.find(cb => cb.targetBuildingId === buildingId && cb.targetRealm === realm)
    );
  };

  return {
    getActiveBuffs,
    calculateBuildingMultiplier,
    getBuffsForBuilding
  };
};

export const useBuffSystem = (fantasyBuildings: { [key: string]: number }, scifiBuildings: { [key: string]: number }) => {
  return createBuffSystem(fantasyBuildings, scifiBuildings);
};

// Legacy component export for compatibility
export const CrossRealmBuffSystem: React.FC<CrossRealmBuffSystemProps> = () => {
  return null;
};
