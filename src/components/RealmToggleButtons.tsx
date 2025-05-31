
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
  const handleRealmSwitch = (realm: 'fantasy' | 'scifi') => {
    if (realm !== currentRealm && !isTransitioning) {
      console.log(`Switching to ${realm} realm`);
      onRealmChange(realm);
    }
  };

  return (
    <div className="absolute bottom-32 right-8 z-30 mb-6">
      <div className="flex gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-white/30">
        {/* Fantasy Realm Button */}
        <Button
          onClick={() => handleRealmSwitch('fantasy')}
          disabled={isTransitioning}
          className={`relative h-8 px-3 rounded-full transition-all duration-500 hover:scale-105 active:scale-95 ${
            currentRealm === 'fantasy'
              ? 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/50 scale-105 border-2 border-purple-400'
              : 'bg-transparent border-2 border-purple-400/60 text-purple-300 hover:bg-purple-900/40 hover:border-purple-400'
          } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
        >
          <Sparkles 
            size={14} 
            className={`mr-1 transition-colors duration-300 ${
              currentRealm === 'fantasy' ? 'text-white' : 'text-purple-300'
            }`} 
          />
          <span className="text-xs font-medium">Fantasy</span>
          {currentRealm === 'fantasy' && (
            <div className="absolute inset-0 rounded-full bg-purple-400/20 animate-pulse" />
          )}
        </Button>

        {/* Sci-Fi Realm Button */}
        <Button
          onClick={() => handleRealmSwitch('scifi')}
          disabled={isTransitioning}
          className={`relative h-8 px-3 rounded-full transition-all duration-500 hover:scale-105 active:scale-95 ${
            currentRealm === 'scifi'
              ? 'bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/50 scale-105 border-2 border-cyan-400'
              : 'bg-transparent border-2 border-cyan-400/60 text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400'
          } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
        >
          <Zap 
            size={14} 
            className={`mr-1 transition-colors duration-300 ${
              currentRealm === 'scifi' ? 'text-white' : 'text-cyan-300'
            }`} 
          />
          <span className="text-xs font-medium">Sci-Fi</span>
          {currentRealm === 'scifi' && (
            <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-pulse" />
          )}
        </Button>
      </div>
    </div>
  );
};
