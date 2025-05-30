
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
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUnlocked) {
      onClick();
    }
  };

  return (
    <div 
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      onClick={handleClick}
    >
      <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-xl transition-all duration-300 hover:scale-110 relative shadow-lg ${
        isPurchased
          ? 'bg-green-600/90 border-green-400 shadow-green-400/40'
          : isUnlocked && canAfford
          ? 'bg-gradient-to-br from-purple-600/90 to-cyan-600/90 border-purple-400 shadow-purple-400/40 hover:shadow-purple-400/60'
          : isUnlocked
          ? 'bg-gradient-to-br from-purple-800/70 to-cyan-800/70 border-purple-500/60 shadow-purple-500/30'
          : 'bg-gray-700/80 border-gray-500 opacity-60 shadow-gray-500/20'
      } backdrop-blur-sm`}
      style={{
        filter: `drop-shadow(0 4px 12px ${
          isPurchased 
            ? 'rgba(34, 197, 94, 0.3)' 
            : isUnlocked 
            ? 'rgba(168, 85, 247, 0.3)' 
            : 'rgba(0,0,0,0.2)'
        })`
      }}>
        
        {/* Enhanced glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/15 pointer-events-none rounded-full" />
        
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
    </div>
  );
};
