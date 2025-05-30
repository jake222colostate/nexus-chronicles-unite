
import React from 'react';
import { Crown } from 'lucide-react';

interface NexusCoreProps {
  manaFlow: number;
  energyFlow: number;
  realm: 'fantasy' | 'scifi';
}

export const NexusCore: React.FC<NexusCoreProps> = ({ manaFlow, energyFlow, realm }) => {
  const totalFlow = manaFlow + energyFlow;
  const intensity = Math.min(totalFlow / 100, 1); // Cap at 100 for max intensity

  return (
    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-20">
      <div className="relative">
        {/* Core Orb */}
        <div 
          className={`w-16 h-16 rounded-full border-4 flex items-center justify-center backdrop-blur-sm transition-all duration-500 ${
            realm === 'fantasy'
              ? 'bg-gradient-to-br from-purple-600/80 to-violet-800/80 border-purple-400'
              : 'bg-gradient-to-br from-cyan-600/80 to-blue-800/80 border-cyan-400'
          }`}
          style={{
            boxShadow: `0 0 ${20 + intensity * 30}px ${
              realm === 'fantasy' ? 'rgba(168, 85, 247, 0.5)' : 'rgba(34, 211, 238, 0.5)'
            }`,
            animation: `pulse ${Math.max(0.5, 2 - intensity)}s infinite alternate`
          }}
        >
          <Crown className="text-yellow-300" size={24} />
        </div>

        {/* Energy Rings */}
        {totalFlow > 0 && (
          <>
            <div 
              className={`absolute inset-0 rounded-full border-2 animate-spin ${
                realm === 'fantasy' ? 'border-purple-400/50' : 'border-cyan-400/50'
              }`}
              style={{
                animation: `spin ${Math.max(1, 4 - intensity * 2)}s linear infinite`,
                transform: 'scale(1.5)'
              }}
            />
            <div 
              className={`absolute inset-0 rounded-full border border-dashed animate-spin ${
                realm === 'fantasy' ? 'border-violet-300/30' : 'border-blue-300/30'
              }`}
              style={{
                animation: `spin ${Math.max(2, 6 - intensity * 3)}s linear infinite reverse`,
                transform: 'scale(2)'
              }}
            />
          </>
        )}

        {/* Flow Indicators */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
            <div className="text-purple-300">Mana: +{manaFlow.toFixed(1)}/s</div>
            <div className="text-cyan-300">Energy: +{energyFlow.toFixed(1)}/s</div>
          </div>
        </div>
      </div>
    </div>
  );
};
