
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap } from 'lucide-react';

interface RealmToggleButtonsProps {
  currentRealm: 'fantasy' | 'scifi';
  onRealmChange: (realm: 'fantasy' | 'scifi') => void;
  isTransitioning?: boolean;
}

export const RealmToggleButtons: React.FC<RealmToggleButtonsProps> = ({
  currentRealm,
  onRealmChange,
  isTransitioning = false
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 iphone-safe-bottom">
      <div className="flex gap-3 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/20">
        {/* Fantasy Realm Button */}
        <Button
          onClick={() => onRealmChange('fantasy')}
          disabled={isTransitioning}
          className={`relative h-12 px-4 rounded-full transition-all duration-300 ${
            currentRealm === 'fantasy'
              ? 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/50 scale-105'
              : 'bg-transparent border-2 border-purple-400/50 text-purple-300 hover:bg-purple-900/30 hover:border-purple-400'
          }`}
        >
          <Sparkles 
            size={18} 
            className={`mr-2 ${currentRealm === 'fantasy' ? 'text-white' : 'text-purple-300'}`} 
          />
          <span className="text-sm font-medium">Fantasy</span>
          {currentRealm === 'fantasy' && (
            <div className="absolute inset-0 rounded-full bg-purple-400/20 animate-pulse" />
          )}
        </Button>

        {/* Sci-Fi Realm Button */}
        <Button
          onClick={() => onRealmChange('scifi')}
          disabled={isTransitioning}
          className={`relative h-12 px-4 rounded-full transition-all duration-300 ${
            currentRealm === 'scifi'
              ? 'bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/50 scale-105'
              : 'bg-transparent border-2 border-cyan-400/50 text-cyan-300 hover:bg-cyan-900/30 hover:border-cyan-400'
          }`}
        >
          <Zap 
            size={18} 
            className={`mr-2 ${currentRealm === 'scifi' ? 'text-white' : 'text-cyan-300'}`} 
          />
          <span className="text-sm font-medium">Sci-Fi</span>
          {currentRealm === 'scifi' && (
            <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-pulse" />
          )}
        </Button>
      </div>
    </div>
  );
};
