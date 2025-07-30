import React, { useState } from 'react';
import { useScifiLayerStore } from '@/stores/useScifiLayerStore';
import { SCIFI_LAYER_THEMES, getNextLayerProgress } from '@/data/ScifiLayerSystem';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SciFiUpgradeManager } from './SciFiUpgradeManager';

interface ScifiLayerHUDProps {
  showDebug?: boolean;
}

export const ScifiLayerHUD: React.FC<ScifiLayerHUDProps> = ({ showDebug = false }) => {
  const {
    altitude,
    currentLayer,
    highestLayer,
    timeInCurrentLayer,
    meteorsDestroyed,
    unlockedUpgrades,
    nexusInventory,
    defeatedBosses,
    debugMode,
    teleportToLayer,
    resetProgress,
    unlockAllUpgrades,
    toggleDebugMode
  } = useScifiLayerStore();

  const [showUpgradeManager, setShowUpgradeManager] = useState(false);

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const getLayerData = () => {
    return SCIFI_LAYER_THEMES[currentLayer] || {
      name: `Beyond Layer ${currentLayer}`,
      visual: { theme: 'unknown', primaryColor: '#dc2626' }
    };
  };

  const getNextLayerProgressLocal = () => {
    return getNextLayerProgress(altitude, currentLayer);
  };

  const layerData = getLayerData();

  return (
    <>
      <div className="fixed top-4 right-4 z-20 space-y-2">
        {/* Main Layer Info */}
        <Card className="bg-slate-900/90 backdrop-blur-sm border-cyan-500/30">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-cyan-400 font-bold">
                  <div>Layer {currentLayer}</div>
                  <div className="text-xs text-cyan-300 font-normal">
                    {layerData.name}
                  </div>
                  <div className="text-xs text-yellow-300 font-normal">
                    Altitude: {altitude.toFixed(1)}
                  </div>
                </div>
                <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                  Max: {highestLayer}
                </Badge>
            </div>
            
            {/* Visual theme indicator */}
            <div className="text-xs text-slate-400">
              Theme: {layerData.visual?.theme || 'unknown'}
            </div>

            {/* Progress to next layer */}
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getNextLayerProgressLocal()}%` }}
              />
            </div>
            <div className="text-xs text-center text-slate-400">
              {getNextLayerProgressLocal().toFixed(1)}% to Layer {currentLayer + 1}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Stats Card */}
      <Card className="bg-slate-900/90 backdrop-blur-sm border-orange-500/30">
        <CardContent className="p-3">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-300">Meteors:</span>
              <span className="text-orange-400">{meteorsDestroyed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Upgrades:</span>
              <span className="text-green-400">{unlockedUpgrades.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Nexus Relics:</span>
              <span className="text-purple-400">{nexusInventory.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Bosses:</span>
              <span className="text-red-400">{defeatedBosses.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Manager Button */}
      <Card className="bg-slate-900/90 backdrop-blur-sm border-green-500/30">
        <CardContent className="p-3">
          <Button
            onClick={() => setShowUpgradeManager(true)}
            className="w-full text-xs bg-green-600/20 hover:bg-green-600/30 border-green-500"
            variant="outline"
          >
            🔧 Upgrade Manager
          </Button>
        </CardContent>
      </Card>

      {/* Enhanced Debug Panel */}
      {(showDebug || debugMode) && (
        <Card className="bg-red-900/90 backdrop-blur-sm border-red-500/30">
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="text-xs text-red-400 font-bold mb-2">
                🔧 DEV TOOLS
              </div>
              
              <Button 
                size="sm" 
                variant="outline"
                className="text-xs w-full h-6"
                onClick={toggleDebugMode}
              >
                {debugMode ? 'Disable' : 'Enable'} Debug
              </Button>
              
              <div className="grid grid-cols-3 gap-1">
                {[2, 3, 4, 5, 6, 7, 8].map(layer => (
                  <Button 
                    key={layer}
                    size="sm" 
                    variant="outline"
                    className="text-xs p-1 h-6"
                    onClick={() => teleportToLayer(layer)}
                  >
                    L{layer}
                  </Button>
                ))}
              </div>
              
              <Button 
                size="sm" 
                variant="outline"
                className="text-xs w-full h-6"
                onClick={unlockAllUpgrades}
              >
                🎯 Unlock All
              </Button>
              
              <Button 
                size="sm" 
                variant="destructive"
                className="text-xs w-full h-6"
                onClick={resetProgress}
              >
                🔄 Reset All
              </Button>
              
              {/* Live debug info */}
              {debugMode && (
                <div className="text-xs text-yellow-400 space-y-1 border-t border-red-500/30 pt-2">
                  <div>Alt: {Math.floor(altitude)}m</div>
                  <div>Time: {formatTime(timeInCurrentLayer)}</div>
                  <div>Theme: {layerData.visual?.theme}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>

    {/* Upgrade Manager Modal */}
    <SciFiUpgradeManager 
      isOpen={showUpgradeManager}
      onClose={() => setShowUpgradeManager(false)}
    />
    </>
  );
};