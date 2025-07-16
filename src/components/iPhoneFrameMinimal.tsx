
import React from 'react';

interface iPhoneFrameMinimalProps {
  children: React.ReactNode;
}

export const iPhoneFrameMinimal: React.FC<iPhoneFrameMinimalProps> = ({ children }) => {
  return (
    <div className="w-full h-full bg-black">
      <div className="relative w-full h-full bg-gray-900 overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-50" />
        {/* Screen content */}
        <div className="relative w-full h-full overflow-hidden bg-black">
          {children}
        </div>
      </div>
    </div>
  );
};
