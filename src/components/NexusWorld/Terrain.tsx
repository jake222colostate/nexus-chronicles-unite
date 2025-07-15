import React, { useMemo } from 'react';
import { DataTexture, RedFormat, AlphaFormat, RGBAFormat } from 'three';

const generateNoiseTexture = (size = 256) => {
  const data = new Uint8Array(size * size);
  for (let i = 0; i < size * size; i++) {
    data[i] = Math.random() * 255;
  }
  
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    const format = gl ? RedFormat : AlphaFormat;
    const texture = new DataTexture(data, size, size, format);
    texture.needsUpdate = true;
    return texture;
  } catch (error) {
    console.warn('WebGL texture creation failed, using fallback:', error);
    // Fallback to simpler texture
    const texture = new DataTexture(data, size, size, RGBAFormat);
    texture.needsUpdate = true;
    return texture;
  }
};

const Terrain: React.FC = () => {
  const perlinTexture = useMemo(() => generateNoiseTexture(128), []);
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 30, 128, 128]} />
      <meshStandardMaterial
        color="#45aa45"
        displacementMap={perlinTexture}
        displacementScale={0.4}
        roughness={0.8}
      />
    </mesh>
  );
};

export default Terrain;
