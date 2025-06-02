
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface BuildingUpgradeModalProps {
  building: {
    id: string;
    name: string;
    cost: number;
    production: number;
    costMultiplier: number;
    description: string;
    icon: string;
  } | null;
  count: number;
  realm: 'fantasy' | 'scifi';
  currency: number;
  onBuy: () => void;
  onClose: () => void;
}

export const BuildingUpgradeModal: React.FC<BuildingUpgradeModalProps> = ({
  building,
  count,
  realm,
  currency,
  onBuy,
  onClose
}) => {
  if (!building) return null;

  const formatNumber = (num: number): string => {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return Math.floor(num).toString();
  };

  const cost = Math.floor(building.cost * Math.pow(building.costMultiplier, count));
  const canAfford = currency >= cost;
  const currentProduction = building.production * count;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box'
      }}
    >
      <Card 
        className={`backdrop-blur-md border-2 overflow-hidden flex flex-col ${
          realm === 'fantasy'
            ? 'bg-gradient-to-br from-purple-900/95 to-violet-800/95 border-purple-400'
            : 'bg-gradient-to-br from-cyan-900/95 to-blue-800/95 border-cyan-400'
        }`}
        style={{
          maxWidth: '90vw',
          width: '100%',
          maxHeight: '70vh',
          overflowX: 'hidden',
          boxSizing: 'border-box',
          borderRadius: '12px'
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{building.icon}</span>
            <div>
              <h2 className="text-lg font-bold text-white">{building.name}</h2>
              <p className="text-sm text-white/70">Level {count}</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 p-1 h-8 w-8 rounded-full flex-shrink-0"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Content */}
        <div 
          className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-hide"
          style={{
            maxHeight: 'calc(70vh - 120px)',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          <p className="text-sm text-white/80">{building.description}</p>
          
          {/* Stats */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">Current Production:</span>
              <span className="font-bold text-green-400 text-sm">
                {currentProduction > 0 ? `+${formatNumber(currentProduction)}/sec` : 'Not built'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">Next Level Bonus:</span>
              <span className="font-bold text-yellow-400 text-sm">
                +{formatNumber(building.production)}/sec
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">Upgrade Cost:</span>
              <span className={`font-bold text-sm ${canAfford ? 'text-white' : 'text-red-400'}`}>
                {formatNumber(cost)}
              </span>
            </div>
          </div>
        </div>

        {/* Upgrade Button - Fixed at bottom */}
        <div className="p-4 border-t border-white/20 flex-shrink-0">
          <Button
            onClick={onBuy}
            disabled={!canAfford}
            className={`w-full transition-all duration-300 py-3 font-bold text-sm ${
              realm === 'fantasy'
                ? 'bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-500 hover:to-violet-600'
                : 'bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600'
            } disabled:opacity-50 text-white ${
              canAfford ? 'hover:scale-105 active:scale-95' : ''
            }`}
          >
            {count === 0 ? 'Build' : 'Upgrade'} ({formatNumber(cost)})
          </Button>
        </div>
      </Card>
    </div>
  );
};
