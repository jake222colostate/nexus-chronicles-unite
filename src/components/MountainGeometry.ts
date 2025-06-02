
import * as THREE from 'three';

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const createLowPolyMountainGeometry = (mountainSeed: number) => {
  // Create a more complex base geometry for the mountain profile
  const geometry = new THREE.ConeGeometry(8, 25, 8, 1, false); // Wider base, taller height
  const vertices = geometry.attributes.position.array as Float32Array;
  
  // Modify vertices to create the distinctive mountain shape
  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const y = vertices[i + 1];
    const z = vertices[i + 2];
    
    // Height factor from bottom (0) to top (1)
    const heightFactor = (y + 12.5) / 25;
    
    // Create the distinctive profile - wider at base, narrower at top
    // But also push the top further back (negative Z direction)
    if (heightFactor > 0.3) {
      // Push upper portions back farther from the path
      const backwardsPush = heightFactor * heightFactor * 15; // Quadratic falloff
      vertices[i + 2] = z - backwardsPush;
      
      // Add some randomness for natural variation
      const noise = seededRandom(mountainSeed + x * 10 + y * 10 + z * 10) - 0.5;
      vertices[i] += noise * 2 * heightFactor;
      vertices[i + 2] += noise * 3 * heightFactor;
    }
    
    // Create terraced/stepped appearance for low-poly look
    const stepHeight = Math.floor(y / 3) * 3;
    const stepFactor = (stepHeight + 12.5) / 25;
    vertices[i + 1] = stepHeight;
    
    // Add angular faceted details
    const facetNoise = Math.floor(seededRandom(mountainSeed + i) * 4) - 2;
    vertices[i] += facetNoise * 0.5 * stepFactor;
  }
  
  geometry.attributes.position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
};

export const createMountainBaseLayers = (baseSeed: number) => {
  const layers = [];
  
  // Multiple layers to create the wide base close to the path
  for (let layer = 0; layer < 4; layer++) {
    const layerHeight = 3 + layer * 2;
    const layerRadius = 12 - layer * 2; // Smaller as we go up
    const layerY = -1 + layer * 2;
    
    // Push base layers closer to the path
    const forwardPush = (4 - layer) * 3; // Closer layers pushed more towards path
    const layerZ = layer === 0 ? forwardPush : forwardPush * 0.7;
    
    layers.push({
      key: `base-layer-${layer}`,
      position: [0, layerY, layerZ] as [number, number, number],
      radius: layerRadius,
      height: layerHeight,
      color: layer === 0 ? "#4CAF50" : layer === 1 ? "#8D6E63" : layer === 2 ? "#A0522D" : "#8B7355"
    });
  }
  
  return layers;
};

export const createMountainPeaks = (seed: number) => {
  const peaks = [];
  
  for (let i = 0; i < 2 + Math.floor(seededRandom(seed) * 2); i++) {
    const peakSeed = seed + i * 47;
    const peakX = (seededRandom(peakSeed + 1) - 0.5) * 8;
    const peakY = 5 + seededRandom(peakSeed + 2) * 8;
    const peakZ = -5 - seededRandom(peakSeed + 3) * 12; // Position peaks further back
    const peakScale = 0.7 + seededRandom(peakSeed + 4) * 0.6;
    
    peaks.push({
      key: `peak-${i}`,
      position: [peakX, peakY, peakZ] as [number, number, number],
      scale: [peakScale, peakScale, peakScale] as [number, number, number],
      seed: peakSeed
    });
  }
  
  return peaks;
};

export const createRockyOutcroppings = (seed: number) => {
  const rocks = [];
  
  for (let i = 0; i < 6 + Math.floor(seededRandom(seed + 100) * 4); i++) {
    const rockSeed = seed + i * 73 + 1000;
    const rockX = (seededRandom(rockSeed) - 0.5) * 16;
    const rockY = -1 + seededRandom(rockSeed + 1) * 4;
    const rockZ = 8 + seededRandom(rockSeed + 2) * 8; // Position rocks closer to path
    const rockScale = 0.8 + seededRandom(rockSeed + 3) * 1.0;
    
    // Different rock types for variety
    const rockType = Math.floor(seededRandom(rockSeed + 4) * 3);
    
    rocks.push({
      key: `rock-${i}`,
      position: [rockX, rockY, rockZ] as [number, number, number],
      rotation: [
        seededRandom(rockSeed + 5) * 0.5,
        seededRandom(rockSeed + 6) * Math.PI * 2,
        seededRandom(rockSeed + 7) * 0.3
      ] as [number, number, number],
      scale: [rockScale, rockScale, rockScale] as [number, number, number],
      type: rockType,
      color: rockType === 0 ? "#4CAF50" : rockType === 1 ? "#8D6E63" : "#A0522D"
    });
  }
  
  return rocks;
};
