
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface StructureProps {
  building: {
    id: string;
    name: string;
    cost: number;
    production: number;
    costMultiplier: number;
    description: string;
    icon: string;
  };
  position: {
    id: string;
    x: number;
    y: number;
    size: string;
  };
  count: number;
  realm: 'fantasy' | 'scifi';
  onBuy: () => void;
  canAfford: boolean;
}

export const Structure: React.FC<StructureProps> = ({
  building,
  position,
  count,
  realm,
  onBuy,
  canAfford
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  const sizeClasses = {
    small: 'w-12 h-12 sm:w-16 sm:h-16',
    medium: 'w-16 h-16 sm:w-24 sm:h-24',
    large: 'w-20 h-20 sm:w-32 sm:h-32',
    massive: 'w-24 h-24 sm:w-40 sm:h-40'
  };

  const handleTouch = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  const handleBuy = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    setIsBuilding(true);
    onBuy();
    setTimeout(() => setIsBuilding(false), 1000);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return Math.floor(num).toString();
  };

  const cost = Math.floor(building.cost * Math.pow(building.costMultiplier, count));

  return (
    <div 
      className="absolute transform -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
    >
      {/* Structure Visual */}
      <div 
        className={`${sizeClasses[position.size]} relative cursor-pointer group transition-all duration-300 hover:scale-110 active:scale-95`}
        onTouchEnd={handleTouch}
        onClick={handleTouch}
        style={{ touchAction: 'manipulation' }}
      >
        {/* Base Structure */}
        <div className={`w-full h-full rounded-lg border-2 flex items-center justify-center relative overflow-hidden ${
          realm === 'fantasy'
            ? 'bg-purple-800/60 border-purple-400 shadow-purple-500/30'
            : 'bg-cyan-800/60 border-cyan-400 shadow-cyan-500/30'
        } shadow-lg backdrop-blur-sm ${count > 0 ? 'animate-pulse' : 'opacity-60'}`}>
          
          {/* Building Animation */}
          {isBuilding && (
            <div className="absolute inset-0 bg-yellow-400/30 animate-ping rounded-lg" />
          )}
          
          {/* Structure Icon */}
          <div className={`text-2xl sm:text-6xl transform transition-transform duration-300 ${
            count > 0 ? 'scale-100' : 'scale-75 opacity-50'
          }`}>
            {building.icon}
          </div>
          
          {/* Production Animation */}
          {count > 0 && (
            <div className="absolute inset-0">
              {realm === 'fantasy' ? (
                <div className="absolute top-1 left-1 sm:top-2 sm:left-2 w-1 h-1 sm:w-2 sm:h-2 bg-purple-400 rounded-full animate-bounce opacity-70" />
              ) : (
                <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-0.5 h-2 sm:w-1 sm:h-4 bg-cyan-400 animate-pulse opacity-70" />
              )}
            </div>
          )}
          
          {/* Count Indicator */}
          {count > 0 && (
            <div className={`absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              realm === 'fantasy' ? 'bg-purple-600 text-white' : 'bg-cyan-600 text-white'
            }`}>
              {count > 99 ? '99+' : count}
            </div>
          )}
        </div>

        {/* Resource Flow Effect */}
        {count > 0 && (
          <div className="absolute -top-4 sm:-top-8 left-1/2 transform -translate-x-1/2">
            <div className={`w-0.5 h-4 sm:w-1 sm:h-8 ${
              realm === 'fantasy' ? 'bg-gradient-to-t from-purple-400 to-transparent' : 'bg-gradient-to-t from-cyan-400 to-transparent'
            } animate-pulse opacity-60`} />
          </div>
        )}
      </div>

      {/* Details Panel - Mobile Optimized */}
      {showDetails && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-10">
          <Card className={`p-3 sm:p-4 w-56 sm:w-64 backdrop-blur-sm ${
            realm === 'fantasy'
              ? 'bg-purple-800/90 border-purple-400'
              : 'bg-cyan-800/90 border-cyan-400'
          }`}>
            <div className="text-white space-y-2">
              <h3 className="text-base sm:text-lg font-bold">{building.name}</h3>
              <p className="text-xs sm:text-sm opacity-80">{building.description}</p>
              <div className="space-y-1 text-xs sm:text-sm">
                <div>Owned: {count}</div>
                <div>Production: +{formatNumber(building.production * count)}/sec</div>
                <div>Next Cost: {formatNumber(cost)}</div>
              </div>
              <Button
                onTouchEnd={handleBuy}
                onClick={handleBuy}
                disabled={!canAfford}
                size="sm"
                className={`w-full ${
                  realm === 'fantasy'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-cyan-600 hover:bg-cyan-700'
                } disabled:opacity-50 text-xs sm:text-sm`}
                style={{ touchAction: 'manipulation' }}
              >
                {isBuilding ? 'Building...' : 'Upgrade'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
