
import React from 'react';

interface iPhoneFrameMinimalProps {
  children: React.ReactNode;
}

export const iPhoneFrameMinimal: React.FC<iPhoneFrameMinimalProps> = ({ children }) => {
  return (
    <div className="mx-auto max-w-sm bg-black rounded-[2.5rem] p-2 shadow-2xl">
      {/* iPhone frame without status bar */}
      <div className="bg-gray-900 rounded-[2rem] overflow-hidden relative">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-50"></div>
        
        {/* Screen content - starts immediately below notch */}
        <div className="w-[375px] h-[667px] relative overflow-hidden bg-black">
          {children}
        </div>
      </div>
    </div>
  );
};
