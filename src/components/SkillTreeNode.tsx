
import React from 'react';
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
  return (
    <div 
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      onClick={onClick}
    >
      <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 relative ${
        isPurchased
          ? 'bg-green-600/90 border-green-400 shadow-lg shadow-green-400/40'
          : isUnlocked && canAfford
          ? 'bg-gradient-to-br from-purple-600/90 to-cyan-600/90 border-purple-400 shadow-lg shadow-purple-400/40 hover:shadow-purple-400/60'
          : isUnlocked
          ? 'bg-gradient-to-br from-purple-800/70 to-cyan-800/70 border-purple-500/60 shadow-md shadow-purple-500/30'
          : 'bg-gray-700/80 border-gray-500 opacity-60 shadow-md'
      } backdrop-blur-sm`}>
        
        {/* Icon */}
        <span className="relative z-10">{upgrade.icon}</span>
        
        {/* Status indicators */}
        {isPurchased && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border border-green-300">
            <Crown size={10} className="text-white" />
          </div>
        )}
        
        {!isUnlocked && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center border border-gray-400">
            <Lock size={10} className="text-white" />
          </div>
        )}

        {/* Tier indicator */}
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-black/70 rounded-full flex items-center justify-center border border-white/30">
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

      {/* Node name tooltip on hover */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap backdrop-blur-sm border border-white/20">
        {upgrade.name}
      </div>
    </div>
  );
};
