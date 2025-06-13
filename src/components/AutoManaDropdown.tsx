
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { useAutoClickerStore } from '@/stores/useAutoClickerStore';

interface AutoManaDropdownProps {
  currentMana: number;
  onUpgrade: (cost: number) => void;
}

export const AutoManaDropdown: React.FC<AutoManaDropdownProps> = ({
  currentMana,
  onUpgrade
}) => {
  const { level, upgradeCost, upgrade, manaPerSecond } = useAutoClickerStore();
  const [isOpen, setIsOpen] = useState(false);

  const canAfford = currentMana >= upgradeCost;

  const handleUpgrade = () => {
    if (canAfford) {
      onUpgrade(upgradeCost);
      upgrade();
      setIsOpen(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          className="h-10 w-10 rounded-xl bg-gradient-to-r from-purple-500/95 to-violet-500/95 hover:from-purple-600/95 hover:to-violet-600/95 backdrop-blur-xl border border-purple-400/70 transition-all duration-300 font-bold shadow-lg shadow-purple-500/30 p-0"
        >
          🧙‍♂️
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-64 bg-gradient-to-br from-purple-900/95 to-violet-800/95 backdrop-blur-xl border border-purple-400/50 shadow-2xl"
        align="center"
        sideOffset={5}
      >
        <div className="p-3">
          <div className="text-white font-bold text-sm mb-2 text-center">
            Auto Mana System
          </div>
          
          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-xs">
              <span className="text-purple-200">Current Level:</span>
              <span className="text-white font-bold">{level}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-purple-200">Production:</span>
              <span className="text-green-400">+{formatNumber(manaPerSecond)}/sec</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-purple-200">Upgrade Cost:</span>
              <span className="text-yellow-400">{formatNumber(upgradeCost)} Mana</span>
            </div>
          </div>

          <DropdownMenuItem asChild>
            <Button
              onClick={handleUpgrade}
              disabled={!canAfford}
              className={`w-full text-xs font-bold transition-all duration-300 ${
                canAfford
                  ? 'bg-gradient-to-r from-purple-600/95 to-violet-600/95 hover:from-purple-700/95 hover:to-violet-700/95 text-white'
                  : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
              }`}
            >
              {canAfford ? `Upgrade to Level ${level + 1}` : 'Insufficient Mana'}
            </Button>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
