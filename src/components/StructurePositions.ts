
export interface StructurePosition {
  id: string;
  x: number;
  y: number;
  size: 'massive' | 'large' | 'medium' | 'small';
  tier: number;
}

export const structurePositions: Record<'fantasy' | 'scifi', StructurePosition[]> = {
  fantasy: [
    { id: 'temple', x: 50, y: 20, size: 'massive', tier: 1 },
    { id: 'grove', x: 25, y: 45, size: 'large', tier: 2 },
    { id: 'tower', x: 75, y: 45, size: 'medium', tier: 2 },
    { id: 'altar', x: 50, y: 75, size: 'small', tier: 3 },
  ],
  scifi: [
    { id: 'megastructure', x: 50, y: 20, size: 'massive', tier: 1 },
    { id: 'station', x: 25, y: 45, size: 'large', tier: 2 },
    { id: 'reactor', x: 75, y: 45, size: 'medium', tier: 2 },
    { id: 'generator', x: 50, y: 75, size: 'small', tier: 3 },
  ]
};
