import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Button } from '@/components/ui/button';
import { NexusShardShop } from './NexusShardShop';
import { nexusShardUpgrades, NexusShardUpgrade } from '../data/NexusShardUpgrades';

interface NexusWorldModalProps {
  isOpen: boolean;
  nexusShards: number;
  purchasedUpgrades: string[];
  onPurchaseUpgrade: (upgradeId: string) => void;
  onBuyShards: (amount: number) => void;
  onClose: () => void;
}

export const NexusWorldModal: React.FC<NexusWorldModalProps> = ({
  isOpen,
  nexusShards,
  purchasedUpgrades,
  onPurchaseUpgrade,
  onBuyShards,
  onClose
}) => {
  if (!isOpen) return null;

  const upgrades: NexusShardUpgrade[] = nexusShardUpgrades.map(u => ({
    ...u,
    purchased: purchasedUpgrades.includes(u.id)
  }));

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="w-full h-60 rounded-lg overflow-hidden bg-gray-900">
          <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
            <ambientLight intensity={0.7} />
            <pointLight position={[5, 5, 5]} />
            <mesh rotation={[0.5, 0.5, 0]}>
              <boxGeometry args={[2, 2, 2]} />
              <meshStandardMaterial color="#a855f7" />
            </mesh>
          </Canvas>
        </div>
        <div className="flex justify-center gap-2">
          <Button size="sm" onClick={() => onBuyShards(1)}>
            Buy 1 Shard (100 Mana)
          </Button>
          <Button size="sm" onClick={() => onBuyShards(10)}>
            Buy 10 Shards (1000 Mana)
          </Button>
        </div>
        <NexusShardShop
          upgrades={upgrades}
          nexusShards={nexusShards}
          hasFantasySpecial={true}
          hasScifiSpecial={true}
          onPurchase={onPurchaseUpgrade}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default NexusWorldModal;
