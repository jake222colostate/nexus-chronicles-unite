
import React, { useState } from 'react';
import { Crown, Lock } from 'lucide-react';

interface SkillTreeNodeProps {
  upgrade: any;
  position: { x: number; y: number; tier: number };
  isUnlocked: boolean;
  isPurchased: boolean;
  canAfford: boolean;
  onClick: () => void;
}

export const SkillTreeNode: React.FC<SkillTreeNodeProps> = ({
  upgrade,
  position,
  isUnlocked,
  isPurchased,
  canAfford,
  onClick
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUnlocked) {
      onClick();
    }
  };

  const handleTooltipToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTooltip(!showTooltip);
  };

  return (
    <>
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30"
        style={{ left: `${position.x}%`, top: `${position.y}%` }}
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-xl transition-all duration-300 hover:scale-110 relative shadow-lg ${
          isPurchased
            ? 'bg-green-600/90 border-green-400 shadow-green-400/40'
            : isUnlocked && canAfford
            ? 'bg-gradient-to-br from-purple-600/90 to-cyan-600/90 border-purple-400 shadow-purple-400/40 hover:shadow-purple-400/60'
            : isUnlocked
            ? 'bg-gradient-to-br from-purple-800/70 to-cyan-800/70 border-purple-500/60 shadow-purple-500/30'
            : 'bg-gray-700/80 border-gray-500 opacity-60 shadow-gray-500/20'
        } backdrop-blur-sm`}>
          
          {/* Icon */}
          <span className="relative z-10 drop-shadow-sm">{upgrade.icon}</span>
          
          {/* Status indicators */}
          {isPurchased && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border border-green-300 shadow-md">
              <Crown size={8} className="text-white" />
            </div>
          )}
          
          {!isUnlocked && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center border border-gray-400 shadow-md">
              <Lock size={8} className="text-white" />
            </div>
          )}

          {/* Tier indicator */}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-black/80 rounded-full flex items-center justify-center border border-white/40 shadow-md">
            <span className="text-xs text-white font-bold">{position.tier}</span>
          </div>

          {/* Glow effect for unlocked nodes */}
          {isUnlocked && !isPurchased && (
            <div className={`absolute inset-0 rounded-full animate-pulse ${
              canAfford 
                ? 'bg-gradient-to-br from-purple-400/30 to-cyan-400/30' 
                : 'bg-gradient-to-br from-purple-600/20 to-cyan-600/20'
            }`} />
          )}
        </div>

        {/* Enhanced tooltip */}
        {showTooltip && (
          <div 
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 px-3 py-2 bg-black/90 text-white text-xs rounded-lg border border-white/30 shadow-xl backdrop-blur-sm pointer-events-none z-50 max-w-48 animate-fade-in"
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
            }}
          >
            <div className="font-semibold text-purple-300 mb-1">{upgrade.name}</div>
            <div className="text-gray-300 text-xs leading-relaxed">{upgrade.description}</div>
            <div className="mt-1 text-yellow-300 font-medium">Cost: {upgrade.cost} 💎</div>
            
            {/* Tooltip arrow */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-black/90"></div>
          </div>
        )}
      </div>

      {/* Dismissible overlay when tooltip is open */}
      {showTooltip && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowTooltip(false)}
        />
      )}
    </>
  );
};
