
import React, { useEffect, useState } from 'react';

interface UpgradeActivationOverlayProps {
  upgrades: number;
  previousUpgrades: number;
}

export const UpgradeActivationOverlay: React.FC<UpgradeActivationOverlayProps> = ({
  upgrades,
  previousUpgrades
}) => {
  const [showNotification, setShowNotification] = useState(false);
  const [newUpgradeCount, setNewUpgradeCount] = useState(0);

  useEffect(() => {
    if (upgrades > previousUpgrades) {
      const newCount = upgrades - previousUpgrades;
      setNewUpgradeCount(newCount);
      setShowNotification(true);
      
      // Hide notification after 3 seconds
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [upgrades, previousUpgrades]);

  if (!showNotification) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
      <div className="bg-green-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg border border-green-400/50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <span className="font-bold">
            {newUpgradeCount} New Upgrade{newUpgradeCount > 1 ? 's' : ''} Unlocked!
          </span>
        </div>
      </div>
    </div>
  );
};
