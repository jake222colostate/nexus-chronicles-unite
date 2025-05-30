
import { useMemo } from 'react';
import { createBuffSystem } from '../components/CrossRealmBuffSystem';

export const useStableBuffSystem = (
  fantasyBuildings: { [key: string]: number },
  scifiBuildings: { [key: string]: number }
) => {
  // Create a stable key for buildings to prevent unnecessary recalculations
  const buildingsKey = useMemo(() => {
    return JSON.stringify({
      fantasy: fantasyBuildings,
      scifi: scifiBuildings
    });
  }, [fantasyBuildings, scifiBuildings]);

  // Memoize the buff system with stable dependencies
  const buffSystem = useMemo(() => {
    return createBuffSystem(fantasyBuildings, scifiBuildings);
  }, [buildingsKey]);

  return { buffSystem, buildingsKey };
};
