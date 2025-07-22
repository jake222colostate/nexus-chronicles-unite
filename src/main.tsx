import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { useGLTF } from '@react-three/drei'

// Load Draco decoder from CDN so compressed models like the bat load correctly
useGLTF.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')

createRoot(document.getElementById("root")!).render(<App />);
