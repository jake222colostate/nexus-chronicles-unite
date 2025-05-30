
import React from 'react';

interface iPhoneFrameProps {
  children: React.ReactNode;
}

export const iPhoneFrame: React.FC<iPhoneFrameProps> = ({ children }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      {/* iPhone Device Frame */}
      <div className="relative bg-black rounded-[3rem] p-3 shadow-2xl max-w-sm w-full">
        {/* iPhone Outer Frame */}
        <div className="bg-black rounded-[2.5rem] p-1">
          {/* iPhone Screen Bezel */}
          <div className="bg-gray-900 rounded-[2rem] p-2">
            {/* iPhone Screen */}
            <div className="bg-black rounded-[1.5rem] overflow-hidden relative">
              {/* Dynamic Island */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-50 border border-gray-800"></div>
              
              {/* Status Bar */}
              <div className="absolute top-0 left-0 right-0 h-12 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-between px-6 pt-3">
                <div className="flex items-center space-x-1 text-white text-sm font-medium">
                  <span>9:41</span>
                </div>
                <div className="flex items-center space-x-1">
                  {/* Signal Bars */}
                  <div className="flex space-x-0.5">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-2 bg-white rounded-full"></div>
                    <div className="w-1 h-3 bg-white rounded-full"></div>
                    <div className="w-1 h-3 bg-white rounded-full"></div>
                  </div>
                  {/* WiFi Icon */}
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.613 12.21l-.985.985a1 1 0 01-1.414 0l-.985-.985a1 1 0 010-1.414l.985-.985a1 1 0 011.414 0l.985.985a1 1 0 010 1.414z"/>
                    <path d="M14.142 9.798l-2.827-2.827a1 1 0 00-1.414 0L7.074 9.798a1 1 0 000 1.414l2.827 2.827a1 1 0 001.414 0l2.827-2.827a1 1 0 000-1.414z"/>
                  </svg>
                  {/* Battery */}
                  <div className="relative w-6 h-3">
                    <div className="w-5 h-3 border border-white rounded-sm">
                      <div className="w-4 h-2 bg-white rounded-sm m-0.5"></div>
                    </div>
                    <div className="absolute -right-0.5 top-1 w-0.5 h-1 bg-white rounded-r"></div>
                  </div>
                </div>
              </div>
              
              {/* Game Content */}
              <div className="h-[667px] w-full relative overflow-hidden">
                {children}
              </div>
              
              {/* Home Indicator */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-60"></div>
            </div>
          </div>
        </div>
        
        {/* Side Buttons */}
        <div className="absolute left-0 top-20 w-1 h-8 bg-gray-700 rounded-l"></div>
        <div className="absolute left-0 top-32 w-1 h-12 bg-gray-700 rounded-l"></div>
        <div className="absolute left-0 top-48 w-1 h-12 bg-gray-700 rounded-l"></div>
        <div className="absolute right-0 top-32 w-1 h-16 bg-gray-700 rounded-r"></div>
      </div>
    </div>
  );
};
