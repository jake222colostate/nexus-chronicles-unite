import React from 'react';
import { useScifiLayerStore } from '@/stores/useScifiLayerStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
    teleportToLayer,
    resetProgress,
    unlockAllUpgrades
  } = useScifiLayerStore();

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const getNextLayerProgress = () => {
    const currentLayerBase = (currentLayer - 1) * 1000;
    const progressInLayer = altitude - currentLayerBase;
    return Math.min(progressInLayer / 1000, 1) * 100;
  };

  return (
    <div className="fixed top-4 right-4 z-20 space-y-2">
      {/* Main Layer Info */}
      <Card className="bg-slate-900/90 backdrop-blur-sm border-cyan-500/30">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-bold">Layer {currentLayer}</span>
              <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                Max: {highestLayer}
              </Badge>
            </div>
            
            <div className="text-xs text-slate-300">
              Altitude: {Math.floor(altitude)}m
            </div>
            
            <div className="text-xs text-slate-300">
              Time in Layer: {formatTime(timeInCurrentLayer)}
            </div>

            {/* Progress to next layer */}
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getNextLayerProgress()}%` }}
              />
            </div>
            <div className="text-xs text-center text-slate-400">
              {getNextLayerProgress().toFixed(1)}% to Layer {currentLayer + 1}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card className="bg-slate-900/90 backdrop-blur-sm border-orange-500/30">
        <CardContent className="p-3">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-300">Meteors:</span>
              <span className="text-orange-400">{meteorsDestroyed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Unlocks:</span>
              <span className="text-green-400">{unlockedUpgrades.length}/7</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Panel */}
      {showDebug && (
        <Card className="bg-red-900/90 backdrop-blur-sm border-red-500/30">
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="text-xs text-red-400 font-bold mb-2">DEBUG</div>
              
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-xs p-1 h-6"
                  onClick={() => teleportToLayer(2)}
                >
                  L2
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-xs p-1 h-6"
                  onClick={() => teleportToLayer(3)}
                >
                  L3
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-xs p-1 h-6"
                  onClick={() => teleportToLayer(5)}
                >
                  L5
                </Button>
              </div>
              
              <Button 
                size="sm" 
                variant="outline"
                className="text-xs w-full h-6"
                onClick={unlockAllUpgrades}
              >
                Unlock All
              </Button>
              
              <Button 
                size="sm" 
                variant="destructive"
                className="text-xs w-full h-6"
                onClick={resetProgress}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};