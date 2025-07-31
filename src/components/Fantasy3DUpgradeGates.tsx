import React from 'react';
import { Vector3 } from 'three';
import { UpgradeGate } from './UpgradeGateSystem';

interface Fantasy3DUpgradeGatesProps {
  gates: any[];
  cameraPosition: Vector3;
  onGateInteract?: (gateId: number) => void;
}

export const Fantasy3DUpgradeGates: React.FC<Fantasy3DUpgradeGatesProps> = ({
  gates,
  cameraPosition,
  onGateInteract = () => {}
}) => {
  return (
    <>
      {gates.map((gate) => {
        if (!gate) return null;
        
        const distance = cameraPosition.distanceTo(new Vector3(...gate.position));
        if (distance > 150) return null; // Don't render gates too far away
        
        return (
          <UpgradeGate
            key={gate.id}
            position={gate.position}
            gateId={gate.id}
            isUnlocked={gate.isUnlocked}
            requiredUpgrades={gate.requiredUpgrades}
            completedUpgrades={gate.completedUpgrades}
            onInteract={() => onGateInteract(gate.id)}
          />
        );
      })}
    </>
  );
};