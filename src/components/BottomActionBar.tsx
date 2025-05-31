
import React from 'react';
import { RealmToggleButtons } from './RealmToggleButtons';
import { EnhancedTapButton } from './EnhancedTapButton';
import { JourneyProgressBar } from './JourneyProgressBar';

interface BottomActionBarProps {
  currentRealm: 'fantasy' | 'scifi';
  onRealmChange: (realm: 'fantasy' | 'scifi') => void;
  onTap: () => void;
  isTransitioning?: boolean;
  playerDistance: number;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({
  currentRealm,
  onRealmChange,
  onTap,
  isTransitioning = false,
  playerDistance
}) => {
  return (
    <>
      {/* Journey Progress Bar */}
      <JourneyProgressBar distance={playerDistance} />
      
      {/* Main Action Bar */}
      <div className="absolute bottom-12 left-0 right-0 z-40">
        <div className="flex items-center justify-center px-4 pb-4">
          <div className="flex items-center gap-4 bg-black/70 backdrop-blur-xl rounded-2xl px-6 py-3 border border-white/20">
            {/* Realm Toggle */}
            <RealmToggleButtons
              currentRealm={currentRealm}
              onRealmChange={onRealmChange}
              disabled={isTransitioning}
            />
            
            {/* Tap Button */}
            <EnhancedTapButton
              realm={currentRealm}
              onTap={onTap}
              disabled={isTransitioning}
            />
          </div>
        </div>
      </div>
    </>
  );
};
