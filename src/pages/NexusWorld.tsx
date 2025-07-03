import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Crown, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EnhancedNexusCore } from '@/components/EnhancedNexusCore';
import { NexusShardShop } from '@/components/NexusShardShop';

interface NexusWorldProps {
  gameState?: any;
  onUpgrade?: (upgradeId: string) => void;
}

const NexusWorld: React.FC<NexusWorldProps> = ({ 
  gameState = { 
    mana: 1000, 
    energyCredits: 800, 
    nexusShards: 25, 
    manaPerSecond: 15, 
    energyPerSecond: 12,
    convergenceCount: 3,
    convergenceProgress: 45
  },
  onUpgrade = () => {}
}) => {
  const navigate = useNavigate();

  const handleBackToGame = () => {
    navigate('/');
  };

  const handleNexusClick = () => {
    // Handle nexus core interaction
    console.log('Nexus core clicked!');
  };

  return (
    <div className="h-full w-full relative overflow-hidden bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-cyan-900/90">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-indigo-800/20 to-cyan-600/20 animate-pulse" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/40 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-2 left-2 right-2 z-40 flex items-center justify-between">
        <Button
          onClick={handleBackToGame}
          variant="ghost"
          size="sm"
          className="text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Game
        </Button>
        
        <div className="text-center">
          <h1 className="text-xl font-bold text-white/90 flex items-center gap-2">
            <Crown className="text-yellow-400" size={20} />
            Nexus World
            <Crown className="text-yellow-400" size={20} />
          </h1>
        </div>
        
        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="absolute inset-0 pt-16 pb-4">
        {/* Enhanced Nexus Core - Centered */}
        <div className="relative h-full flex flex-col items-center">
          {/* Nexus Core */}
          <div className="relative mt-8 mb-8">
            <EnhancedNexusCore
              manaFlow={gameState.manaPerSecond}
              energyFlow={gameState.energyPerSecond}
              realm="fantasy"
              nexusShards={gameState.nexusShards}
              convergenceProgress={gameState.convergenceProgress || 0}
              onNexusClick={handleNexusClick}
              canEarnShards={true}
            />
          </div>

          {/* Nexus Stats */}
          <div className="w-full max-w-sm px-4 mb-6">
            <div className="bg-black/60 backdrop-blur-md rounded-lg border border-white/20 p-4">
              <h3 className="text-white/90 font-bold text-center mb-3 flex items-center justify-center gap-2">
                <Sparkles className="text-yellow-400" size={16} />
                Nexus Statistics
                <Sparkles className="text-yellow-400" size={16} />
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-purple-300 text-sm">Total Mana:</span>
                  <span className="text-white font-bold">{gameState.mana?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyan-300 text-sm">Total Energy:</span>
                  <span className="text-white font-bold">{gameState.energyCredits?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-300 text-sm">Nexus Shards:</span>
                  <span className="text-yellow-400 font-bold">{gameState.nexusShards || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-300 text-sm">Convergences:</span>
                  <span className="text-green-400 font-bold">{gameState.convergenceCount || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nexus Actions */}
          <div className="w-full max-w-sm px-4 space-y-3">
            <Button 
              className="w-full bg-gradient-to-r from-purple-600/90 to-violet-700/90 hover:from-purple-500/90 hover:to-violet-600/90 text-white border border-purple-400/50 backdrop-blur-md"
              onClick={() => console.log('Meditate at Nexus')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Meditate at Nexus (+10 Mana/sec)
            </Button>
            
            <Button 
              className="w-full bg-gradient-to-r from-cyan-600/90 to-blue-700/90 hover:from-cyan-500/90 hover:to-blue-600/90 text-white border border-cyan-400/50 backdrop-blur-md"
              onClick={() => console.log('Channel Energy')}
            >
              <Zap className="w-4 h-4 mr-2" />
              Channel Energy (+8 Energy/sec)
            </Button>
            
            <Button 
              className="w-full bg-gradient-to-r from-yellow-600/90 to-orange-700/90 hover:from-yellow-500/90 hover:to-orange-600/90 text-white border border-yellow-400/50 backdrop-blur-md"
              onClick={() => console.log('Initiate Convergence')}
            >
              <Crown className="w-4 h-4 mr-2" />
              Initiate Convergence
            </Button>
          </div>

          {/* Nexus Shard Shop Preview */}
          <div className="w-full max-w-sm px-4 mt-4">
            <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-yellow-400/30 p-3">
              <h4 className="text-yellow-400 font-bold text-center text-sm mb-2">Nexus Shard Shop</h4>
              <p className="text-white/70 text-xs text-center">
                Spend Nexus Shards on powerful cross-realm upgrades
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NexusWorld;