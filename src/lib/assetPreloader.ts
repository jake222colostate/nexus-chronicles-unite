import { useGLTF } from '@react-three/drei';
import { preloadCriticalAssets, checkAssetSize } from '@/components/GLBModelLoader';

// Critical assets - must be under 15MB each
const CRITICAL_ASSETS = [
  '/assets/Path.glb', // Main walking surface
  '/assets/upgrades/Podiums.glb',
  '/assets/upgrades/LargeObelisk.glb',
];

// Fantasy realm assets
const FANTASY_ASSETS = [
  '/assets/terrain/FantasyTree.glb',
  '/assets/environment/MagicalCrystal.glb',
  '/assets/characters/SkeletonWarrior.glb',
];

// Initialize complete GLB loading system
export const initializeGLBSystem = async () => {
  console.log('🎮 Initializing GLB Loading System...');
  
  try {
    // 1. Check asset sizes
    console.log('📊 Checking asset sizes...');
    const sizeChecks = await Promise.allSettled([
      ...CRITICAL_ASSETS.map(path => checkAssetSize(path)),
      ...FANTASY_ASSETS.map(path => checkAssetSize(path))
    ]);
    
    // 2. Preload critical assets immediately
    console.log('⚡ Preloading critical assets...');
    preloadCriticalAssets(CRITICAL_ASSETS);
    
    // 3. Lazy preload fantasy assets
    setTimeout(() => {
      console.log('🧙 Lazy loading fantasy assets...');
      preloadCriticalAssets(FANTASY_ASSETS);
    }, 2000);
    
    console.log('✅ GLB Loading System initialized');
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
    preloadCriticalAssets(FANTASY_ASSETS);
  }
  // Add scifi assets when needed
};