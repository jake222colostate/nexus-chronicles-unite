import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { useMapEditorStore } from '../../stores/useMapEditorStore';
import * as THREE from 'three';

export const MapEditorGrid: React.FC = () => {
  const { showGrid, gridSize, isEditorActive } = useMapEditorStore();

  const gridLines = useMemo(() => {
    if (!showGrid || !isEditorActive) return [];

    const lines: Array<{ points: [number, number, number][] }> = [];
    const size = 50; // Grid extends 50 units in each direction
    const step = gridSize;

    // Horizontal lines
    for (let i = -size; i <= size; i += step) {
      lines.push({
        points: [
          [-size, 0, i],
          [size, 0, i]
        ]
      });
    }

    // Vertical lines
    for (let i = -size; i <= size; i += step) {
      lines.push({
        points: [
          [i, 0, -size],
          [i, 0, size]
        ]
      });
    }

    return lines;
  }, [showGrid, gridSize, isEditorActive]);

  if (!showGrid || !isEditorActive) return null;

  return (
    <group>
      {gridLines.map((line, index) => (
        <Line
          key={index}
          points={line.points}
          color="#666666"
          lineWidth={1}
          transparent
          opacity={0.3}
        />
      ))}
      
      {/* Center axes with different colors */}
      <Line
        points={[[-50, 0, 0], [50, 0, 0]]}
        color="#ff0000"
        lineWidth={2}
        transparent
        opacity={0.6}
      />
      <Line
        points={[[0, 0, -50], [0, 0, 50]]}
        color="#0000ff"
        lineWidth={2}
        transparent
        opacity={0.6}
      />
    </group>
  );
};