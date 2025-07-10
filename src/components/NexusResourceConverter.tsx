import React, { useState } from 'react';
import { X, Crown, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStateStore } from '@/stores/useGameStateStore';

interface NexusResourceConverterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NexusResourceConverter: React.FC<NexusResourceConverterProps> = ({
  isOpen,
  onClose
}) => {
  const [manaToConvert, setManaToConvert] = useState(100);
  const [energyToConvert, setEnergyToConvert] = useState(100);
  
  const {
    mana,
    energyCredits,
    nexusShards,
    convertManaToShards,
    convertEnergyToShards
  } = useGameStateStore();

  const handleManaConversion = () => {
    if (convertManaToShards(manaToConvert)) {
      console.log(`Converted ${manaToConvert} mana to ${Math.floor(manaToConvert * 0.1)} nexus shards`);
    }
  };

  const handleEnergyConversion = () => {
    if (convertEnergyToShards(energyToConvert)) {
      console.log(`Converted ${energyToConvert} energy to ${Math.floor(energyToConvert * 0.1)} nexus shards`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-blue-900/95 to-cyan-800/95 backdrop-blur-xl rounded-xl border border-blue-400/30 overflow-hidden max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-400/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Crown className="text-blue-400" />
            Resource Converter
          </h2>
          <Button onClick={onClose} size="sm" variant="ghost" className="text-white hover:bg-white/10">
            <X size={16} />
          </Button>
        </div>

        {/* Current Resources */}
        <div className="p-4 bg-black/30 border-b border-blue-400/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-purple-400 font-bold">{mana}</div>
              <div className="text-xs text-white/70">Mana</div>
            </div>
            <div>
              <div className="text-cyan-400 font-bold">{energyCredits}</div>
              <div className="text-xs text-white/70">Energy</div>
            </div>
            <div>
              <div className="text-yellow-400 font-bold">{nexusShards}</div>
              <div className="text-xs text-white/70">Shards</div>
            </div>
          </div>
        </div>

        {/* Conversion Options */}
        <div className="p-4 space-y-4">
          {/* Mana to Shards */}
          <div className="bg-black/40 rounded-lg p-4 border border-purple-400/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Mana → Shards</h3>
              <div className="text-xs text-white/70">Rate: 10:1</div>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <input
                type="number"
                value={manaToConvert}
                onChange={(e) => setManaToConvert(Math.max(10, parseInt(e.target.value) || 10))}
                min="10"
                step="10"
                max={mana}
                className="flex-1 bg-black/50 border border-purple-400/30 rounded px-2 py-1 text-white text-sm"
              />
              <ArrowRight className="text-purple-400" size={16} />
              <div className="text-yellow-400 font-bold">
                {Math.floor(manaToConvert * 0.1)} <Crown size={12} className="inline" />
              </div>
            </div>
            
            <Button
              onClick={handleManaConversion}
              disabled={mana < manaToConvert}
              className="w-full h-8 text-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-700"
            >
              Convert Mana
            </Button>
          </div>

          {/* Energy to Shards */}
          <div className="bg-black/40 rounded-lg p-4 border border-cyan-400/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Energy → Shards</h3>
              <div className="text-xs text-white/70">Rate: 10:1</div>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <input
                type="number"
                value={energyToConvert}
                onChange={(e) => setEnergyToConvert(Math.max(10, parseInt(e.target.value) || 10))}
                min="10"
                step="10"
                max={energyCredits}
                className="flex-1 bg-black/50 border border-cyan-400/30 rounded px-2 py-1 text-white text-sm"
              />
              <ArrowRight className="text-cyan-400" size={16} />
              <div className="text-yellow-400 font-bold">
                {Math.floor(energyToConvert * 0.1)} <Crown size={12} className="inline" />
              </div>
            </div>
            
            <Button
              onClick={handleEnergyConversion}
              disabled={energyCredits < energyToConvert}
              className="w-full h-8 text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:bg-gray-700"
            >
              Convert Energy
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 bg-blue-900/30 text-xs text-white/70 text-center">
          Resources earned in Fantasy and Sci-Fi worlds automatically carry over to the Nexus World
        </div>
      </div>
    </div>
  );
};