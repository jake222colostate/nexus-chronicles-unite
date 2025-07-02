
import React, { useEffect, useState } from 'react';

interface UpgradeActivationOverlayProps {
  upgrades: number;
  previousUpgrades: number;
  currentMana?: number;
}

export const UpgradeActivationOverlay: React.FC<UpgradeActivationOverlayProps> = ({
  upgrades,
  previousUpgrades,
  currentMana = 0
}) => {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState<{
    type: 'unlocked' | 'nextCost';
    count?: number;
    nextCost?: number;
  }>({ type: 'unlocked' });

  useEffect(() => {
    if (upgrades > previousUpgrades) {
      const newCount = upgrades - previousUpgrades;
      setNotificationData({ type: 'unlocked', count: newCount });
      setShowNotification(true);
      
      // Hide notification after 3 seconds
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [upgrades, previousUpgrades]);

  // Calculate next upgrade cost based on infinite upgrade formula
  const getNextUpgradeCost = () => {
    const nextUpgradeId = upgrades + 1;
    const tier = Math.floor(nextUpgradeId / 8);
    const tierMultiplier = Math.pow(10, tier);
    const costMultiplier = Math.pow(2, nextUpgradeId);
    const isSpecial = (nextUpgradeId + 1) % 10 === 0;
    const specialMultiplier = isSpecial ? 5 : 1;
    
    return Math.floor(50 * costMultiplier * tierMultiplier * specialMultiplier);
  };

  // Show next upgrade cost on component mount and when upgrades change
  useEffect(() => {
    if (upgrades >= 0) {
      const nextCost = getNextUpgradeCost();
      if (currentMana < nextCost) {
        setNotificationData({ type: 'nextCost', nextCost });
        setShowNotification(true);
        
        const timer = setTimeout(() => {
          setShowNotification(false);
        }, 4000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [upgrades, currentMana]);

  if (!showNotification) return null;

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };

  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
      {notificationData.type === 'unlocked' ? (
        <div className="bg-green-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg border border-green-400/50 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <span className="font-bold">
              {notificationData.count} New Upgrade{(notificationData.count || 0) > 1 ? 's' : ''} Unlocked!
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-blue-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg border border-blue-400/50 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="font-bold">
              Next Upgrade: {formatNumber(notificationData.nextCost || 0)} Mana
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
