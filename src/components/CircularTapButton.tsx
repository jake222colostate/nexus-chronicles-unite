
import React from 'react';
import { Button } from '@/components/ui/button';

interface CircularTapButtonProps {
  realm: 'fantasy' | 'scifi';
  onTap: () => void;
}

export const CircularTapButton: React.FC<CircularTapButtonProps> = ({
  realm,
  onTap
}) => {
  return (
    <Button 
      onClick={onTap}
      className={`h-16 w-16 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 font-medium text-lg backdrop-blur-xl border-2 relative overflow-hidden shadow-lg ${
        realm === 'fantasy'
          ? 'bg-gradient-to-br from-purple-600/90 to-violet-700/90 hover:from-purple-500/90 hover:to-violet-600/90 border-purple-400/60 text-purple-100'
          : 'bg-gradient-to-br from-cyan-600/90 to-blue-700/90 hover:from-cyan-500/90 hover:to-blue-600/90 border-cyan-400/60 text-cyan-100'
      }`}
      style={{
        boxShadow: `0 0 20px ${realm === 'fantasy' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(34, 211, 238, 0.4)'}, 0 4px 16px rgba(0,0,0,0.3)`
      }}
      title="Tap to generate Mana"
    >
      {/* Enhanced glassmorphism inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 pointer-events-none rounded-full" />
      
      <span className="relative z-10 text-2xl">✨</span>
      
      {/* Gentle pulse animation */}
      <div className={`absolute inset-0 rounded-full animate-pulse opacity-20 ${
        realm === 'fantasy' 
          ? 'bg-purple-400/30' 
          : 'bg-cyan-400/30'
      }`} />
    </Button>
  );
};
