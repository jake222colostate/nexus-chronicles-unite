
import React, { useEffect, useState } from 'react';

interface UpgradeActivationIndicatorProps {
  upgrades: number;
  previousUpgrades: number;
}

export const UpgradeActivationIndicator: React.FC<UpgradeActivationIndicatorProps> = ({
  upgrades,
  previousUpgrades
}) => {
  const [showIndicator, setShowIndicator] = useState(false);
  const [indicatorText, setIndicatorText] = useState('');

  useEffect(() => {
    if (upgrades > previousUpgrades) {
      const newUpgrades = upgrades - previousUpgrades;
      setIndicatorText(`+${newUpgrades} Upgrade${newUpgrades > 1 ? 's' : ''} Activated!`);
      setShowIndicator(true);
      
      // Hide indicator after 3 seconds
      const timer = setTimeout(() => {
        setShowIndicator(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [upgrades, previousUpgrades]);

  if (!showIndicator) return null;

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <span className="font-bold text-lg">{indicatorText}</span>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};
