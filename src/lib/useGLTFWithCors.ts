import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

export const useGLTFWithCors = (url: string) => {
  return useLoader(GLTFLoader, url, loader => {
    // Ensure textures load correctly when served from a different origin
    (loader as any).setCrossOrigin?.('anonymous');
    // Fallback for older three.js versions
    if ('crossOrigin' in loader) {
      (loader as any).crossOrigin = 'anonymous';
    }
  }) as GLTF;
};
