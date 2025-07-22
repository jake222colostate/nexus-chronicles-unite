console.log('🚀 Main.tsx starting...');
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { useGLTF } from '@react-three/drei'
import { initializeGLBSystem } from './lib/assetPreloader'
console.log('✅ All imports loaded successfully');

// Load Draco decoder from CDN so compressed models load correctly
useGLTF.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')

// Initialize comprehensive GLB loading system
initializeGLBSystem().then((success) => {
  // console.log('🎮 GLB Loading System:', success ? 'Ready' : 'Failed');
});

createRoot(document.getElementById("root")!).render(<App />);
