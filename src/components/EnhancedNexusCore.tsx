
import React from 'react';
import { Crown, Sparkles } from 'lucide-react';

interface EnhancedNexusCoreProps {
  manaFlow: number;
  energyFlow: number;
  realm: 'fantasy' | 'scifi';
  nexusShards?: number;
  convergenceProgress?: number;
  onNexusClick?: () => void;
}

export const EnhancedNexusCore: React.FC<EnhancedNexusCoreProps> = ({ 
  manaFlow, 
  energyFlow, 
  realm,
  nexusShards = 0,
  convergenceProgress = 0,
  onNexusClick
}) => {
  const totalFlow = manaFlow + energyFlow;
  const intensity = Math.min(totalFlow / 100, 1);
  const convergenceIntensity = Math.min(convergenceProgress / 100, 1);

  return (
    <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-30">
      <div className="relative">
        {/* Core Orb with Enhanced Effects */}
        <div 
          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 flex items-center justify-center backdrop-blur-sm transition-all duration-700 cursor-pointer ${
            realm === 'fantasy'
              ? 'bg-gradient-to-br from-purple-500/90 to-violet-800/90 border-purple-300'
              : 'bg-gradient-to-br from-cyan-500/90 to-blue-800/90 border-cyan-300'
          }`}
          onClick={onNexusClick}
          style={{
            boxShadow: `0 0 ${30 + intensity * 50 + convergenceIntensity * 30}px ${
              realm === 'fantasy' ? 'rgba(168, 85, 247, 0.8)' : 'rgba(34, 211, 238, 0.8)'
            }, inset 0 0 20px rgba(255, 255, 255, 0.1)`,
            animation: `pulse ${Math.max(0.8, 2.5 - intensity * 1.5)}s infinite alternate`
          }}
        >
          <Crown className="text-yellow-200" size={28} />
          
          {/* Inner Glow Effect */}
          <div className={`absolute inset-2 rounded-full ${
            realm === 'fantasy' 
              ? 'bg-gradient-to-br from-purple-400/30 to-violet-600/30' 
              : 'bg-gradient-to-br from-cyan-400/30 to-blue-600/30'
          } animate-pulse`} />

          {/* Convergence Progress Ring */}
          {convergenceProgress > 0 && (
            <div 
              className="absolute inset-0 rounded-full border-4 border-yellow-400/60"
              style={{
                background: `conic-gradient(from 0deg, transparent ${100 - convergenceProgress}%, rgba(255, 215, 0, 0.3) ${convergenceProgress}%)`
              }}
            />
          )}
        </div>

        {/* Enhanced Energy Rings */}
        {totalFlow > 0 && (
          <>
            {/* Primary Ring */}
            <div 
              className={`absolute inset-0 rounded-full border-3 ${
                realm === 'fantasy' ? 'border-purple-300/60' : 'border-cyan-300/60'
              }`}
              style={{
                animation: `spin ${Math.max(1.5, 4 - intensity * 2)}s linear infinite`,
                transform: 'scale(1.4)',
                filter: `blur(${0.5 + intensity}px)`
              }}
            />
            
            {/* Secondary Ring */}
            <div 
              className={`absolute inset-0 rounded-full border-2 border-dashed ${
                realm === 'fantasy' ? 'border-violet-200/40' : 'border-blue-200/40'
              }`}
              style={{
                animation: `spin ${Math.max(2, 6 - intensity * 3)}s linear infinite reverse`,
                transform: 'scale(1.8)'
              }}
            />
            
            {/* Outer Ring */}
            <div 
              className={`absolute inset-0 rounded-full border ${
                realm === 'fantasy' ? 'border-purple-400/30' : 'border-cyan-400/30'
              }`}
              style={{
                animation: `pulse ${Math.max(1, 3 - intensity)}s infinite`,
                transform: 'scale(2.2)'
              }}
            />
          </>
        )}

        {/* Floating Resource Particles */}
        {totalFlow > 0 && (
          <div className="absolute inset-0">
            {Array.from({ length: Math.min(8, Math.floor(totalFlow / 10)) }).map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 rounded-full ${
                  realm === 'fantasy' ? 'bg-purple-300' : 'bg-cyan-300'
                } animate-ping opacity-60`}
                style={{
                  left: `${50 + Math.cos(i * 45 * Math.PI / 180) * 60}%`,
                  top: `${50 + Math.sin(i * 45 * Math.PI / 180) * 60}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${2 + Math.random()}s`
                }}
              />
            ))}
          </div>
        )}

        {/* Nexus Shards Display */}
        {nexusShards > 0 && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-yellow-400/50">
              <Crown className="text-yellow-400" size={12} />
              <span className="text-yellow-400 font-bold text-xs">{nexusShards}</span>
            </div>
          </div>
        )}

        {/* Enhanced Flow Indicators */}
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
          <div className="bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg border border-white/20">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-purple-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <span className="text-xs font-bold">Mana: +{manaFlow.toFixed(1)}/s</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-300">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-xs font-bold">Energy: +{energyFlow.toFixed(1)}/s</span>
              </div>
              {convergenceProgress > 0 && (
                <div className="flex items-center gap-2 text-yellow-300">
                  <Sparkles size={8} className="animate-pulse" />
                  <span className="text-xs font-bold">Convergence: {convergenceProgress.toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
