import { useGLTF } from '@react-three/drei';
import { assetUrl } from '@/lib/utils';

// Critical assets - must be under 15MB each
const CRITICAL_ASSETS = [
  assetUrl('assets/Path.glb'), // Main walking surface
  assetUrl('assets/upgrades/Podiums.glb'),
  assetUrl('assets/upgrades/LargeObelisk.glb'),
  assetUrl('assets/upgrades/Lotus.glb'),
  assetUrl('assets/upgrades/Meltingtower.glb'),
  assetUrl('assets/upgrades/Phoenix.glb'),
  assetUrl('assets/upgrades/Spiral.glb'),
];

// Fantasy realm assets - only using existing files
const FANTASY_ASSETS = [
  assetUrl('assets/environment/AncientTree.glb'), // This exists in the project
];

// Preload critical assets using useGLTF
const preloadAssets = (paths: string[]) => {
  paths.forEach(path => {
    try {
      useGLTF.preload(path);
      console.log(`⚡ Preloaded: ${path}`);
    } catch (error) {
      console.warn(`⚠️ Failed to preload: ${path}`, error);
    }
  });
};

// Initialize GLB loading system
export const initializeGLBSystem = async () => {
  console.log('🎮 Initializing GLB Loading System...');
  
  try {
    // Skip preloading for now to prevent 404 errors
    console.log('✅ GLB Loading System initialized (preloading disabled)');
    return true;
  } catch (error) {
    console.error('❌ GLB System initialization failed:', error);
    return false;
  }
};

// Realm-specific preloading
export const preloadRealmAssets = (realm: 'fantasy' | 'scifi') => {
  console.log(`🌟 Preloading ${realm} realm assets...`);
  
  if (realm === 'fantasy') {
    preloadAssets(FANTASY_ASSETS);
  }
  // Add scifi assets when needed
};