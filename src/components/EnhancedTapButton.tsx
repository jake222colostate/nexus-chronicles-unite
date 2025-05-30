
import React from 'react';
import { Button } from '@/components/ui/button';

interface EnhancedTapButtonProps {
  realm: 'fantasy' | 'scifi';
  onTap: () => void;
}

export const EnhancedTapButton: React.FC<EnhancedTapButtonProps> = ({
  realm,
  onTap
}) => {
  return (
    <div className="absolute bottom-[72px] left-1/2 transform -translate-x-1/2 z-30">
      <Button 
        onClick={onTap}
        className={`h-12 px-6 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 font-medium text-sm backdrop-blur-xl border relative overflow-hidden ${
          realm === 'fantasy'
            ? 'bg-gradient-to-r from-purple-600/90 to-violet-700/90 hover:from-purple-500/90 hover:to-violet-600/90 border-purple-400/70 text-purple-100'
            : 'bg-gradient-to-r from-cyan-600/90 to-blue-700/90 hover:from-cyan-500/90 hover:to-blue-600/90 border-cyan-400/70 text-cyan-100'
        }`}
        style={{
          boxShadow: `0 0 20px ${realm === 'fantasy' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(34, 211, 238, 0.4)'}, 0 4px 16px rgba(0,0,0,0.3)`
        }}
      >
        {/* Enhanced glassmorphism inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 pointer-events-none rounded-full" />
        
        <span className="flex items-center gap-2 relative z-10">
          {realm === 'fantasy' ? '✨' : '⚡'}
          Tap for {realm === 'fantasy' ? 'Mana' : 'Energy'}
        </span>
        
        {/* Subtle pulse animation */}
        <div className={`absolute inset-0 rounded-full animate-pulse opacity-20 ${
          realm === 'fantasy' 
            ? 'bg-purple-400/30' 
            : 'bg-cyan-400/30'
        }`} />
      </Button>
    </div>
  );
};
