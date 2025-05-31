
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
    <div className="absolute bottom-36 left-1/2 transform -translate-x-1/2 z-30">
      <Button 
        onClick={onTap}
        className={`h-12 px-6 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 font-medium text-sm backdrop-blur-xl border relative overflow-hidden ${
          realm === 'fantasy'
            ? 'bg-gradient-to-r from-purple-600/80 to-violet-700/80 hover:from-purple-500/80 hover:to-violet-600/80 border-purple-400/50 text-purple-100'
            : 'bg-gradient-to-r from-cyan-600/80 to-blue-700/80 hover:from-cyan-500/80 hover:to-blue-600/80 border-cyan-400/50 text-cyan-100'
        }`}
        style={{
          boxShadow: `0 0 15px ${realm === 'fantasy' ? 'rgba(168, 85, 247, 0.25)' : 'rgba(34, 211, 238, 0.25)'}, 0 4px 16px rgba(0,0,0,0.3)`
        }}
      >
        {/* Enhanced glassmorphism inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/10 pointer-events-none rounded-full" />
        
        <span className="flex items-center gap-2 relative z-10">
          {realm === 'fantasy' ? '✨' : '⚡'}
          Tap for {realm === 'fantasy' ? 'Mana' : 'Energy'}
        </span>
        
        {/* Reduced pulse animation */}
        <div className={`absolute inset-0 rounded-full animate-pulse opacity-15 ${
          realm === 'fantasy' 
            ? 'bg-purple-400/20' 
            : 'bg-cyan-400/20'
        }`} />
      </Button>
    </div>
  );
};
