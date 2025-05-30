
import { useMemo, useRef } from 'react';
import { createBuffSystem } from '../components/CrossRealmBuffSystem';

export const useStableBuffSystem = (
  fantasyBuildings: { [key: string]: number },
  scifiBuildings: { [key: string]: number }
) => {
  // Use refs to track previous building counts
  const previousBuildingsRef = useRef<{
    fantasyCount: number;
    scifiCount: number;
  }>({ fantasyCount: 0, scifiCount: 0 });
  
  const buffSystemRef = useRef<any>(null);

  // Calculate current building counts
  const currentFantasyCount = Object.keys(fantasyBuildings || {}).length;
  const currentScifiCount = Object.keys(scifiBuildings || {}).length;

  // Only recreate buff system if building counts actually changed
  if (!buffSystemRef.current || 
      currentFantasyCount !== previousBuildingsRef.current.fantasyCount ||
      currentScifiCount !== previousBuildingsRef.current.scifiCount) {
    
    console.log('useStableBuffSystem: Building counts changed, creating new buff system');
    buffSystemRef.current = createBuffSystem(
      fantasyBuildings || {},
      scifiBuildings || {}
    );
    
    previousBuildingsRef.current = {
      fantasyCount: currentFantasyCount,
      scifiCount: currentScifiCount
    };
  }

  return { 
    buffSystem: buffSystemRef.current,
    buildingsKey: `${currentFantasyCount}-${currentScifiCount}`
  };
};
