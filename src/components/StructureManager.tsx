
import React from 'react';
import { EnhancedStructure } from './EnhancedStructure';
import { structurePositions, StructurePosition } from './StructurePositions';

interface StructureManagerProps {
  realm: 'fantasy' | 'scifi';
  buildings: { [key: string]: number };
  buildingData: any[];
  currency: number;
  onBuildingClick: (buildingId: string) => void;
}

export const StructureManager: React.FC<StructureManagerProps> = ({
  realm,
  buildings,
  buildingData,
  currency,
  onBuildingClick
}) => {
  return (
    <>
      {structurePositions[realm].map((position) => {
        const building = buildingData.find(b => b.id === position.id);
        const count = buildings[position.id] || 0;
        
        if (!building) return null;

        return (
          <div
            key={`${realm}-${position.id}`}
            className="relative z-20"
          >
            <EnhancedStructure
              building={building}
              position={position}
              count={count}
              realm={realm}
              onBuy={() => onBuildingClick(position.id)}
              canAfford={currency >= Math.floor(building.cost * Math.pow(building.costMultiplier, count))}
            />
          </div>
        );
      })}
    </>
  );
};
