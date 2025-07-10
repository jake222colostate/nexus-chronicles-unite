import React, { Suspense, lazy } from 'react';
import { Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// Lazy load the heavy 3D world to avoid blocking the initial render
const Nexus3DWorld = lazy(
  () => import('@/components/Nexus3DWorld').then((m) => ({ default: m.Nexus3DWorld }))
);
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { BottomActionBar } from '@/components/BottomActionBar';

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

  const handleUpgrade = (upgradeType: string) => {
    console.log(`Purchasing upgrade: ${upgradeType}`);
    onUpgrade(upgradeType);
  };

  const handleRealmChange = (realm: 'fantasy' | 'scifi') => {
    // Navigate back to main game with the selected realm
    navigate('/', { state: { selectedRealm: realm } });
  };

  return (
    <div className="h-full w-full relative overflow-hidden bg-black">
      {/* Header with transparent background */}
      <div className="absolute top-2 left-2 right-2 z-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-lg font-bold text-white/90 flex items-center gap-2">
            <Crown className="text-yellow-400" size={18} />
            Nexus World
            <Crown className="text-yellow-400" size={18} />
          </h1>
        </div>
      </div>

      {/* Resource Display */}
      <div className="absolute top-14 left-2 z-50">
        {/* Resource Display */}
        <div className="bg-black/60 backdrop-blur-md rounded-lg border border-white/20 p-2 text-xs">
          <div className="text-purple-300">Mana: {(gameState?.mana || 0).toLocaleString()}</div>
          <div className="text-cyan-300">Energy: {(gameState?.energyCredits || 0).toLocaleString()}</div>
          <div className="text-yellow-300">Shards: {gameState?.nexusShards || 0}</div>
          <div className="text-xs text-white/50 mt-1">Resources shared across realms</div>
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
      <div className="absolute inset-0 pt-12 pb-32">{/* Added bottom padding for navigation */}
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
            <Nexus3DWorld 
              gameState={gameState}
              onUpgrade={handleUpgrade}
            />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Bottom Action Bar - consistent with main game, no journey bar */}
      <BottomActionBar
        currentRealm="fantasy"
        onRealmChange={handleRealmChange}
        isTransitioning={false}
        playerDistance={0}
        hideJourneyBar={true}
        isNexusWorld={true}
      />
    </div>
  );
};

export default NexusWorld;