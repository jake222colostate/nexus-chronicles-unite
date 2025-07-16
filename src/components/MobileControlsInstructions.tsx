import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export const MobileControlsInstructions: React.FC = () => {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isMobile) {
      // Show instructions on first mobile visit
      const hasSeenInstructions = localStorage.getItem('mobile-controls-instructions');
      if (!hasSeenInstructions) {
        setIsVisible(true);
      }
    }
  }, [isMobile]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('mobile-controls-instructions', 'true');
  };

  if (!isMobile || !isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 border border-white/20 rounded-xl p-6 max-w-sm w-full backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Mobile Controls</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-white hover:bg-white/20"
          >
            <X size={18} />
          </Button>
        </div>
        
        <div className="space-y-4 text-white/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs">
              ↑↓←→
            </div>
            <div>
              <div className="font-medium">Movement</div>
              <div className="text-sm text-white/70">Use left joystick to move around</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs">
              👁
            </div>
            <div>
              <div className="font-medium">Look Around</div>
              <div className="text-sm text-white/70">Use right joystick to look around</div>
            </div>
          </div>
          
          <div className="text-sm text-white/60 bg-white/5 rounded-lg p-3">
            <div className="font-medium mb-1">Tips:</div>
            <ul className="text-xs space-y-1">
              <li>• Hold and drag the joysticks</li>
              <li>• Move forward to progress in your journey</li>
              <li>• Look around to aim at enemies</li>
              <li>• Use the UI buttons for upgrades</li>
            </ul>
          </div>
        </div>
        
        <Button
          onClick={handleClose}
          className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
        >
          Got it!
        </Button>
      </div>
    </div>
  );
};