import React, { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SimpleNexusWorld } from '@/components/SimpleNexusWorld';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface NexusWorldProps {
  gameState?: any;
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
  }
}) => {
  const navigate = useNavigate();

  const handleBackToGame = () => {
    navigate('/');
  };


  return (
    <div className="h-full w-full relative overflow-hidden bg-black">
      {/* Header with transparent background */}
      <div className="absolute top-2 left-2 right-2 z-50 flex items-center justify-between">
        <Button
          onClick={handleBackToGame}
          variant="ghost"
          size="sm"
          className="text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Game
        </Button>
        
        <div className="text-center">
          <h1 className="text-lg font-bold text-white/90 flex items-center gap-2">
            <Crown className="text-yellow-400" size={18} />
            Nexus World
            <Crown className="text-yellow-400" size={18} />
          </h1>
        </div>
        
        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      {/* Resource Display */}
      <div className="absolute top-14 left-2 z-50">
        <div className="bg-black/60 backdrop-blur-md rounded-lg border border-white/20 p-2 text-xs">
          <div className="text-purple-300">Mana: {(gameState?.mana || 0).toLocaleString()}</div>
          <div className="text-cyan-300">Energy: {(gameState?.energyCredits || 0).toLocaleString()}</div>
          <div className="text-yellow-300">Shards: {gameState?.nexusShards || 0}</div>
        </div>
      </div>

      {/* Controls Instructions */}
      <div className="absolute top-14 right-2 z-50">
        <div className="bg-black/60 backdrop-blur-md rounded-lg border border-white/20 p-2 text-xs text-white/70">
          <div>WASD/Arrows: Move</div>
          <div>Mouse: Look around</div>
          <div>Click: Toggle mouse look</div>
          <div>Tap Stands: Purchase</div>
        </div>
      </div>

      {/* 3D Nexus World */}
      <div className="absolute inset-0 pt-12">
        <ErrorBoundary fallback={
          <div className="flex items-center justify-center h-full w-full bg-black text-white">
            <div className="text-center">
              <h2 className="text-xl mb-2">Loading Nexus World...</h2>
              <p className="text-gray-400">Initializing 3D environment</p>
            </div>
          </div>
        }>
          <Suspense fallback={
            <div className="flex items-center justify-center h-full w-full bg-black text-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading 3D world...</p>
              </div>
            </div>
          }>
            {/* Simplified 3D world with just a floor */}
            <SimpleNexusWorld />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default NexusWorld;