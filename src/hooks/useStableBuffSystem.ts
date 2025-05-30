
import { useMemo } from 'react';
import { createBuffSystem } from '../components/CrossRealmBuffSystem';

export const useStableBuffSystem = (
  fantasyBuildings: { [key: string]: number },
  scifiBuildings: { [key: string]: number }
) => {
  // Create a stable key for buildings to prevent unnecessary recalculations
  const buildingsKey = useMemo(() => {
    // Safely handle undefined buildings with fallbacks
    const safeFantasy = fantasyBuildings || {};
    const safeScifi = scifiBuildings || {};
    
    return JSON.stringify({
      fantasy: safeFantasy,
      scifi: safeScifi
    });
  }, [
    JSON.stringify(fantasyBuildings || {}),
    JSON.stringify(scifiBuildings || {})
  ]);

  // Memoize the buff system with stable dependencies
  const buffSystem = useMemo(() => {
    console.log('useStableBuffSystem: Creating new buff system');
    return createBuffSystem(
      fantasyBuildings || {},
      scifiBuildings || {}
    );
  }, [buildingsKey]); // Use stable string key instead of objects

  return { buffSystem, buildingsKey };
};
