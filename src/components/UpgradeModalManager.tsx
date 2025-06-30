
import React from 'react';
import { BuildingUpgradeModal } from './BuildingUpgradeModal';
import { HybridUpgradeModal } from './HybridUpgradeModal';
import { Fantasy3DUpgradeModal } from './Fantasy3DUpgradeModal';
import { ScifiUpgradeMenu } from './ScifiUpgradeMenu';
import { NexusShardShop } from './NexusShardShop';
import { enhancedHybridUpgrades } from '../data/EnhancedHybridUpgrades';
import { scifiUpgrades } from '../data/ScifiUpgrades';
import { fantasyUpgrades } from '../data/FantasyUpgrades';
import { nexusShardUpgrades } from '../data/NexusShardUpgrades';

interface UpgradeModalManagerProps {
  selectedBuilding: { building: any; count: number } | null;
  selectedUpgrade: string | null;
  selected3DUpgrade: string | null;
  selectedScifiUpgrade: string | null;
  selectedFantasyUpgrade: string | null;
  showNexusShardShop: boolean;
  realm: 'fantasy' | 'scifi';
  currency: number;
  gameState: any;
  onCloseBuilding: () => void;
  onCloseUpgrade: () => void;
  onClose3DUpgrade: () => void;
  onCloseScifiUpgrade: () => void;
  onCloseFantasyUpgrade: () => void;
  onCloseNexusShardShop: () => void;
  onPurchaseUpgrade: () => void;
  onPurchase3DUpgrade: () => void;
  onPurchaseScifiUpgrade: (upgradeId: string) => void;
  onPurchaseFantasyUpgrade: (upgradeId: string) => void;
  onPurchaseNexusShardUpgrade: (upgradeId: string) => void;
}

export const UpgradeModalManager: React.FC<UpgradeModalManagerProps> = ({
  selectedBuilding,
  selectedUpgrade,
  selected3DUpgrade,
  selectedScifiUpgrade,
  selectedFantasyUpgrade,
  showNexusShardShop,
  realm,
  currency,
  gameState,
  onCloseBuilding,
  onCloseUpgrade,
  onClose3DUpgrade,
  onCloseScifiUpgrade,
  onCloseFantasyUpgrade,
  onCloseNexusShardShop,
  onPurchaseUpgrade,
  onPurchase3DUpgrade,
  onPurchaseScifiUpgrade,
  onPurchaseFantasyUpgrade,
  onPurchaseNexusShardUpgrade
}) => {
  const handleModalBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCloseBuilding();
      onCloseUpgrade();
      onClose3DUpgrade();
      onCloseScifiUpgrade();
      onCloseFantasyUpgrade();
      onCloseNexusShardShop();
    }
  };

  // Check if special upgrades are purchased
  const hasFantasySpecial = fantasyUpgrades.some(u => u.isSpecial && u.purchased);
  const hasScifiSpecial = scifiUpgrades.some(u => u.isSpecial && u.purchased);

  const selectedScifiUpgradeData = selectedScifiUpgrade ? scifiUpgrades.find(u => u.id === selectedScifiUpgrade) : null;
  const selectedFantasyUpgradeData = selectedFantasyUpgrade ? fantasyUpgrades.find(u => u.id === selectedFantasyUpgrade) : null;

  // Count fantasy upgrades for sci-fi unlock requirements
  const fantasyUpgradeCount = fantasyUpgrades.filter(u => u.purchased).length;

  return (
    <>
      {/* Building Upgrade Modal */}
      {selectedBuilding && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleModalBackdropClick}
        >
          <div className="w-full max-w-[90%] max-h-[70vh]">
            <BuildingUpgradeModal
              building={selectedBuilding.building}
              count={selectedBuilding.count}
              realm={realm}
              currency={currency}
              onBuy={() => {}}
              onClose={onCloseBuilding}
            />
          </div>
        </div>
      )}

      {/* Hybrid Upgrade Modal */}
      {selectedUpgrade && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleModalBackdropClick}
        >
          <div className="w-full max-w-[90%] max-h-[70vh]">
            <HybridUpgradeModal
              upgrade={enhancedHybridUpgrades.find(u => u.id === selectedUpgrade)!}
              gameState={gameState}
              onPurchase={onPurchaseUpgrade}
              onClose={onCloseUpgrade}
            />
          </div>
        </div>
      )}

      {/* 3D Fantasy Upgrade Modal */}
      {selected3DUpgrade && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleModalBackdropClick}
        >
          <div className="w-full max-w-sm">
            <Fantasy3DUpgradeModal
              upgradeName={selected3DUpgrade}
              onClose={onClose3DUpgrade}
              onPurchase={onPurchase3DUpgrade}
              upgradeData={{
                cost: 100,
                manaPerSecond: 10,
                purchased: false
              }}
            />
          </div>
        </div>
      )}

      {/* Sci-Fi Upgrade Modal */}
      {selectedScifiUpgradeData && (
        <ScifiUpgradeMenu
          upgrade={selectedScifiUpgradeData}
          energyCredits={gameState.energyCredits}
          fantasyUpgradeCount={fantasyUpgradeCount}
          onPurchase={onPurchaseScifiUpgrade}
          onClose={onCloseScifiUpgrade}
        />
      )}

      {/* Fantasy Upgrade Modal - Using same purple style as sci-fi */}
      {selectedFantasyUpgradeData && (
        <ScifiUpgradeMenu
          upgrade={{
            ...selectedFantasyUpgradeData,
            cost: selectedFantasyUpgradeData.cost
          }}
          energyCredits={gameState.mana}
          fantasyUpgradeCount={fantasyUpgradeCount}
          onPurchase={onPurchaseFantasyUpgrade}
          onClose={onCloseFantasyUpgrade}
        />
      )}

      {/* Nexus Shard Shop */}
      {showNexusShardShop && (
        <NexusShardShop
          upgrades={nexusShardUpgrades}
          nexusShards={gameState.nexusShards || 0}
          hasFantasySpecial={hasFantasySpecial}
          hasScifiSpecial={hasScifiSpecial}
          onPurchase={onPurchaseNexusShardUpgrade}
          onClose={onCloseNexusShardShop}
        />
      )}
    </>
  );
};
