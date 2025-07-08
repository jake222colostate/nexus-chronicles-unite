
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Package, Crown } from 'lucide-react';
import { MinecraftInventory } from './MinecraftInventory';
import { useNavigate } from 'react-router-dom';

interface BottomActionBarProps {
  currentRealm: 'fantasy' | 'scifi';
  onRealmChange: (realm?: 'fantasy' | 'scifi') => void;
  isTransitioning?: boolean;
  playerDistance?: number;
  hideJourneyBar?: boolean;
  isNexusWorld?: boolean;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({
  currentRealm,
  onRealmChange,
  isTransitioning = false,
  playerDistance = 0,
  hideJourneyBar = false,
  isNexusWorld = false
}) => {
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleRealmSwitch = (realm: 'fantasy' | 'scifi') => {
    // Always switch to the specified realm, regardless of current state
    if (!isTransitioning) {
      onRealmChange(realm);
    }
  };

  const handleNexusWorld = () => {
    navigate('/nexus-world');
  };

  return (
    <>
      <MinecraftInventory 
        isOpen={isInventoryOpen} 
        onClose={() => setIsInventoryOpen(false)} 
      />
      
      <div className="absolute bottom-0 left-0 right-0 z-30">
      {/* Small inventory toggle button */}
      <div className="absolute bottom-20 right-4">
        <Button
          onClick={() => setIsInventoryOpen(!isInventoryOpen)}
          className="h-10 w-10 rounded-lg bg-amber-600/90 hover:bg-amber-700/90 border border-amber-400/60 text-amber-100 transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-md p-0"
          style={{
            boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)'
          }}
        >
          <Package className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Simple Journey Progress Bar - hidden in Nexus World */}
      {!hideJourneyBar && (
        <div className="px-4 pb-2">
          <div className="text-center mb-1">
            <span className="text-white/90 text-xs font-medium">
              Journey: {Math.floor(playerDistance)}m | Realm: {currentRealm === 'fantasy' ? 'Fantasy' : 'Sci-Fi'}
            </span>
          </div>
          <div className="w-full bg-gray-800/60 rounded-full h-1 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 to-cyan-500 h-1 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (playerDistance % 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Control Bar - Lower positioning */}
      <div className="bg-black/95 backdrop-blur-xl border-t border-white/20 py-6">
        <div className="flex items-center justify-center px-6">
          <div className="flex items-center justify-center w-full max-w-lg gap-6">
            {/* Fantasy Realm Button */}
            <Button
              onClick={() => handleRealmSwitch('fantasy')}
              disabled={isTransitioning}
              className={`h-14 px-8 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden font-medium border-2 flex-shrink-0 ${
                currentRealm === 'fantasy'
                  ? 'bg-purple-600/95 hover:bg-purple-700/95 border-purple-400/80 text-purple-100 scale-105'
                  : 'bg-black/70 border-purple-400/60 text-purple-300 hover:bg-purple-900/50 hover:border-purple-400/80 hover:text-purple-200'
              } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
              style={{
                boxShadow: currentRealm === 'fantasy' 
                  ? '0 4px 20px rgba(168, 85, 247, 0.6), 0 2px 10px rgba(0,0,0,0.4)' 
                  : '0 2px 10px rgba(0,0,0,0.3)'
              }}
            >
              <span className="relative z-10 text-sm font-bold">Fantasy</span>
              {currentRealm === 'fantasy' && (
                <div className="absolute inset-0 bg-purple-400/25 animate-pulse rounded-xl" />
              )}
            </Button>

            {/* Nexus World Button - Centered and properly sized */}
            <Button 
              onClick={handleNexusWorld}
              className="h-12 px-6 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 font-medium text-base backdrop-blur-xl border-2 relative overflow-hidden bg-gradient-to-br from-yellow-600/95 to-orange-700/95 hover:from-yellow-500/95 hover:to-orange-600/95 border-yellow-400/80 text-yellow-100"
              style={{
                boxShadow: '0 4px 20px rgba(251, 191, 36, 0.6), 0 2px 10px rgba(0,0,0,0.4)',
              }}
            >
              <Crown className="w-4 h-4 mr-2" />
              <span className="font-bold">Nexus World</span>
            </Button>

            {/* Sci-Fi Realm Button */}
            <Button
              onClick={() => handleRealmSwitch('scifi')}
              disabled={isTransitioning}
              className={`h-14 px-8 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden font-medium border-2 flex-shrink-0 ${
                currentRealm === 'scifi'
                  ? 'bg-cyan-600/95 hover:bg-cyan-700/95 border-cyan-400/80 text-cyan-100 scale-105'
                  : 'bg-black/70 border-cyan-400/60 text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-400/80 hover:text-cyan-200'
              } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
              style={{
                boxShadow: currentRealm === 'scifi' 
                  ? '0 4px 20px rgba(34, 211, 238, 0.6), 0 2px 10px rgba(0,0,0,0.4)' 
                  : '0 2px 10px rgba(0,0,0,0.3)'
              }}
            >
              <span className="relative z-10 text-sm font-bold">Sci-Fi</span>
              {currentRealm === 'scifi' && (
                <div className="absolute inset-0 bg-cyan-400/25 animate-pulse rounded-xl" />
              )}
            </Button>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};
