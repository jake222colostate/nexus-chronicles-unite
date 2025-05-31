
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
    <div className="flex justify-center">
      <Button 
        onClick={onTap}
        className={`h-16 w-16 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 font-bold text-lg backdrop-blur-xl border-2 relative overflow-hidden shadow-2xl ${
          realm === 'fantasy'
            ? 'bg-gradient-to-br from-purple-500/90 to-violet-600/90 hover:from-purple-400/90 hover:to-violet-500/90 border-purple-300/60 text-white'
            : 'bg-gradient-to-br from-cyan-500/90 to-blue-600/90 hover:from-cyan-400/90 hover:to-blue-500/90 border-cyan-300/60 text-white'
        }`}
        style={{
          boxShadow: `0 0 20px ${realm === 'fantasy' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(34, 211, 238, 0.4)'}, 0 8px 24px rgba(0,0,0,0.3)`
        }}
      >
        {/* Enhanced glassmorphism inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 pointer-events-none rounded-full" />
        
        <span className="relative z-10 text-2xl">
          {realm === 'fantasy' ? '✨' : '⚡'}
        </span>
        
        {/* Enhanced pulse animation */}
        <div className={`absolute inset-0 rounded-full animate-pulse opacity-20 ${
          realm === 'fantasy' 
            ? 'bg-purple-300' 
            : 'bg-cyan-300'
        }`} />
      </Button>
    </div>
  );
};
