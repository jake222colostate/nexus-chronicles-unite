import React from 'react';

interface TopHUDProps {
  realm: 'fantasy' | 'scifi';
  mana: number;
  energyCredits: number;
  nexusShards: number;
  convergenceProgress: number;
  manaPerSecond: number;
  energyPerSecond: number;
  onHelpClick: () => void;
  onCombatUpgradesClick: () => void;
  enemyCount: number;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  realm,
  mana,
  energyCredits,
  nexusShards,
  convergenceProgress,
  manaPerSecond,
  energyPerSecond,
  onHelpClick,
  onCombatUpgradesClick,
  enemyCount
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return Math.floor(num).toString();
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 via-black/60 to-transparent backdrop-blur-sm">
      <div className="flex items-center justify-between p-4 pb-6">
        {/* Left Side - Resources */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-blue-900/30 border border-blue-500/50">
            <span className="text-blue-400 text-sm font-medium">
              {realm === 'fantasy' ? 'Mana:' : 'Energy:'}
            </span>
            <span className="text-blue-200 font-bold">{formatNumber(realm === 'fantasy' ? mana : energyCredits)}</span>
            <span className="text-blue-300 text-xs">
              (+{formatNumber(realm === 'fantasy' ? manaPerSecond : energyPerSecond)}/s)
            </span>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-purple-900/30 border border-purple-500/50">
            <span className="text-purple-400 text-sm font-medium">Nexus:</span>
            <span className="text-purple-200 font-bold">{formatNumber(nexusShards)}</span>
          </div>
        </div>

        {/* Center - Enemy Count with 3D styling */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-red-900/30 border border-red-500/50">
          <span className="text-red-400 text-sm font-medium">👾 3D Enemies:</span>
          <span className="text-red-200 font-bold">{enemyCount}</span>
        </div>

        {/* Right Side - Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onCombatUpgradesClick}
            className="px-4 py-2 rounded-lg bg-green-900/30 border border-green-500/50 text-green-300 hover:bg-green-800/40 transition-colors duration-200 text-sm font-medium"
          >
            Combat
          </button>
          <button
            onClick={onHelpClick}
            className="px-4 py-2 rounded-lg bg-gray-900/30 border border-gray-500/50 text-gray-300 hover:bg-gray-800/40 transition-colors duration-200 text-sm font-medium"
          >
            Help
          </button>
        </div>
      </div>
    </div>
  );
};
