import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NexusWorldGrid } from '@/components/NexusWorldGrid';
import { BottomActionBar } from '@/components/BottomActionBar';

interface NexusWorldProps {
  gameState?: any;
  onUpgrade?: (upgradeId: string) => void;
}

const NexusWorld: React.FC<NexusWorldProps> = ({ 
  onUpgrade = () => {}
}) => {
  const navigate = useNavigate();

  const handleRealmChange = (realm: 'fantasy' | 'scifi') => {
    // Navigate back to main game with the selected realm
    navigate('/', { state: { selectedRealm: realm } });
  };

  return (
    <div className="h-full w-full relative overflow-hidden bg-gradient-to-b from-slate-900 to-green-900">
      {/* 3D Nexus World Grid */}
      <div className="absolute inset-0 pb-20">
        <NexusWorldGrid />
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