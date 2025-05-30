
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EnhancedStructureProps {
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

export const EnhancedStructure: React.FC<EnhancedStructureProps> = ({
  building,
  position,
  count,
  realm,
  onBuy,
  canAfford
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [showProduction, setShowProduction] = useState(false);

  const sizeClasses = {
    small: 'w-16 h-16 sm:w-20 sm:h-20',
    medium: 'w-20 h-20 sm:w-28 sm:h-28',
    large: 'w-24 h-24 sm:w-36 sm:h-36',
    massive: 'w-28 h-28 sm:w-44 sm:h-44'
  };

  // Production effect
  useEffect(() => {
    if (count > 0) {
      const interval = setInterval(() => {
        setShowProduction(true);
        setTimeout(() => setShowProduction(false), 1000);
      }, 3000 + Math.random() * 2000);
      
      return () => clearInterval(interval);
    }
  }, [count]);

  const handleTouch = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  const handleBuy = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    setIsBuilding(true);
    onBuy();
    setTimeout(() => setIsBuilding(false), 1200);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return Math.floor(num).toString();
  };

  const cost = Math.floor(building.cost * Math.pow(building.costMultiplier, count));
  const upgradeTier = Math.min(Math.floor(count / 5), 4);

  return (
    <div 
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
    >
      {/* Structure Visual */}
      <div 
        className={`${sizeClasses[position.size]} relative cursor-pointer group transition-all duration-500 hover:scale-110 active:scale-95`}
        onTouchEnd={handleTouch}
        onClick={handleTouch}
        style={{ touchAction: 'manipulation' }}
      >
        {/* Base Structure with Growing Effect */}
        <div className={`w-full h-full rounded-xl border-3 flex items-center justify-center relative overflow-hidden transition-all duration-700 ${
          realm === 'fantasy'
            ? 'bg-gradient-to-br from-purple-800/70 to-violet-900/80 border-purple-400 shadow-purple-500/40'
            : 'bg-gradient-to-br from-cyan-800/70 to-blue-900/80 border-cyan-400 shadow-cyan-500/40'
        } shadow-2xl backdrop-blur-sm ${count > 0 ? 'animate-pulse' : 'opacity-60'}`}
        style={{
          boxShadow: count > 0 ? `0 0 ${20 + count * 3}px ${realm === 'fantasy' ? 'rgba(168, 85, 247, 0.6)' : 'rgba(34, 211, 238, 0.6)'}` : undefined,
          transform: `scale(${1 + upgradeTier * 0.1})`
        }}>
          
          {/* Building Construction Animation */}
          {isBuilding && (
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-orange-400/40 to-red-400/30 animate-ping rounded-xl" />
          )}
          
          {/* Structure Icon with Upgrade Effects */}
          <div className={`text-3xl sm:text-7xl transform transition-all duration-500 ${
            count > 0 ? 'scale-100' : 'scale-75 opacity-50'
          } ${isBuilding ? 'animate-bounce' : ''}`}>
            {building.icon}
          </div>
          
          {/* Upgrade Tier Indicators */}
          {upgradeTier > 0 && (
            <div className="absolute top-1 left-1 flex">
              {Array.from({ length: upgradeTier }).map((_, i) => (
                <div key={i} className={`w-1 h-1 sm:w-2 sm:h-2 rounded-full mr-0.5 ${
                  realm === 'fantasy' ? 'bg-yellow-400' : 'bg-green-400'
                } animate-pulse`} style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          )}
          
          {/* Idle Production Animation */}
          {count > 0 && (
            <>
              {realm === 'fantasy' ? (
                <div className="absolute inset-0">
                  <div className="absolute top-2 left-2 w-1 h-1 sm:w-2 sm:h-2 bg-purple-400 rounded-full animate-bounce opacity-70" />
                  <div className="absolute bottom-2 right-2 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-violet-300 rounded-full animate-ping opacity-60" />
                </div>
              ) : (
                <div className="absolute inset-0">
                  <div className="absolute top-1 right-1 w-0.5 h-3 sm:w-1 sm:h-6 bg-cyan-400 animate-pulse opacity-70" />
                  <div className="absolute bottom-1 left-1 w-1 h-1 sm:w-2 sm:h-2 bg-blue-300 rounded-full animate-ping opacity-60" />
                </div>
              )}
            </>
          )}
          
          {/* Count Indicator with Glow */}
          {count > 0 && (
            <div className={`absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${
              realm === 'fantasy' 
                ? 'bg-gradient-to-r from-purple-600 to-violet-700 text-white border-2 border-purple-400' 
                : 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white border-2 border-cyan-400'
            }`}
            style={{
              boxShadow: `0 0 10px ${realm === 'fantasy' ? 'rgba(168, 85, 247, 0.8)' : 'rgba(34, 211, 238, 0.8)'}`
            }}>
              {count > 99 ? '99+' : count}
            </div>
          )}
        </div>

        {/* Resource Flow Effect */}
        {count > 0 && (
          <div className="absolute -top-6 sm:-top-10 left-1/2 transform -translate-x-1/2">
            <div className={`w-1 h-6 sm:w-2 sm:h-10 ${
              realm === 'fantasy' 
                ? 'bg-gradient-to-t from-purple-400 via-violet-300 to-transparent' 
                : 'bg-gradient-to-t from-cyan-400 via-blue-300 to-transparent'
            } animate-pulse opacity-70`} />
          </div>
        )}

        {/* Production Number Effect */}
        {showProduction && count > 0 && (
          <div className="absolute -top-8 sm:-top-12 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className={`text-xs sm:text-sm font-bold px-2 py-1 rounded ${
              realm === 'fantasy' ? 'bg-purple-600 text-purple-100' : 'bg-cyan-600 text-cyan-100'
            }`}>
              +{formatNumber(building.production)}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Details Panel */}
      {showDetails && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 z-20 animate-scale-in">
          <Card className={`p-4 w-64 sm:w-72 backdrop-blur-md border-2 ${
            realm === 'fantasy'
              ? 'bg-gradient-to-br from-purple-900/95 to-violet-800/95 border-purple-400'
              : 'bg-gradient-to-br from-cyan-900/95 to-blue-800/95 border-cyan-400'
          }`}
          style={{
            boxShadow: `0 8px 32px ${realm === 'fantasy' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(34, 211, 238, 0.3)'}`
          }}>
            <div className="text-white space-y-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="text-2xl">{building.icon}</span>
                {building.name}
              </h3>
              <p className="text-sm opacity-90">{building.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Owned:</span>
                  <span className="font-bold">{count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Production:</span>
                  <span className="font-bold text-green-400">+{formatNumber(building.production * count)}/sec</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Cost:</span>
                  <span className="font-bold text-yellow-400">{formatNumber(cost)}</span>
                </div>
              </div>
              <Button
                onTouchEnd={handleBuy}
                onClick={handleBuy}
                disabled={!canAfford}
                className={`w-full transition-all duration-300 ${
                  realm === 'fantasy'
                    ? 'bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-500 hover:to-violet-600'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600'
                } disabled:opacity-50 text-white font-bold py-3 ${
                  canAfford ? 'hover:scale-105 active:scale-95' : ''
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                {isBuilding ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Building...
                  </div>
                ) : (
                  `Upgrade (${formatNumber(cost)})`
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
