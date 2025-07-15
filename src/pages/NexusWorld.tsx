import React, { Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
// Lazy load the 3D scene component to avoid blocking the initial render
const NexusWorldScene = lazy(
  () => import('@/components/NexusWorld/Nexus3DWorld').then((m) => ({ default: m.default }))
);
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { BottomActionBar } from '@/components/BottomActionBar';

interface NexusWorldProps {
  gameState?: any;
  onUpgrade?: (upgradeId: string) => void;
}

const NexusWorld: React.FC<NexusWorldProps> = ({ 
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
      {/* Simple HUD */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 text-white bg-black/60">
        <div className="flex gap-4 text-sm font-bold">
          <span className="flex items-center gap-1"><span className="text-lg">🧙‍♂️</span>2.6M</span>
          <span className="flex items-center gap-1"><span className="text-lg">⚡</span>7.1M</span>
          <span className="flex items-center gap-1"><span className="text-lg">💎</span>145</span>
        </div>
        <h1 className="text-lg font-bold">Nexus World</h1>
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
            <NexusWorldScene />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Bottom Action Bar */}
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