import React, { Suspense, lazy, useState } from 'react';
import { Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameStateStore } from '@/stores/useGameStateStore';
// Lazy load the heavy 3D world to avoid blocking the initial render
const Nexus3DWorld = lazy(
  () => import('@/components/Nexus3DWorld').then((m) => ({ default: m.Nexus3DWorld }))
);
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { BottomActionBar } from '@/components/BottomActionBar';
import { TopHUD } from '@/components/TopHUD';
import { QuickHelpModal } from '@/components/QuickHelpModal';

interface NexusWorldProps {
  gameState?: any;
  onUpgrade?: (upgradeId: string) => void;
}

const NexusWorld: React.FC<NexusWorldProps> = ({ 
  onUpgrade = () => {}
}) => {
  const navigate = useNavigate();
  const gameStateStore = useGameStateStore();
  const { mana, energyCredits, nexusShards, manaPerSecond, energyPerSecond, convergenceCount, convergenceProgress } = gameStateStore;
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

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
      {/* TopHUD - consistent with main game */}
      <TopHUD
        realm="fantasy"
        mana={mana}
        energyCredits={energyCredits}
        nexusShards={nexusShards}
        convergenceProgress={convergenceProgress}
        manaPerSecond={manaPerSecond}
        energyPerSecond={energyPerSecond}
        onHelpClick={() => setIsHelpModalOpen(true)}
      />

      {/* Header with transparent background */}
      <div className="absolute top-16 left-2 right-2 z-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-lg font-bold text-white/90 flex items-center gap-2">
            <Crown className="text-yellow-400" size={18} />
            Nexus World
            <Crown className="text-yellow-400" size={18} />
          </h1>
        </div>
      </div>

      {/* 3D Nexus World */}
      <div className="absolute inset-0 pt-20 pb-32">{/* Added top padding for TopHUD */}
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
              gameState={{
                mana,
                energyCredits, 
                nexusShards,
                manaPerSecond,
                energyPerSecond,
                convergenceCount,
                convergenceProgress
              }}
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

      {/* Quick Help Modal */}
      <QuickHelpModal 
        isOpen={isHelpModalOpen} 
        onClose={() => setIsHelpModalOpen(false)} 
      />
    </div>
  );
};

export default NexusWorld;