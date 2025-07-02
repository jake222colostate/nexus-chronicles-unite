import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useMapEditorStore } from '../../stores/useMapEditorStore';

interface ElementType {
  id: string;
  name: string;
  category: 'upgrade' | 'decoration' | 'structure' | 'enemy';
  realm: 'fantasy' | 'scifi' | 'both';
  icon?: string;
  preview?: string;
}

const elementTypes: ElementType[] = [
  // Fantasy Upgrades
  { id: 'mana_fountain', name: 'Mana Fountain', category: 'upgrade', realm: 'fantasy' },
  { id: 'arcane_beacon', name: 'Arcane Beacon', category: 'upgrade', realm: 'fantasy' },
  { id: 'crystal_tower', name: 'Crystal Tower', category: 'upgrade', realm: 'fantasy' },
  
  // Sci-fi Upgrades
  { id: 'quantum_drive', name: 'Quantum Drive', category: 'upgrade', realm: 'scifi' },
  { id: 'nano_reactor', name: 'Nano Reactor', category: 'upgrade', realm: 'scifi' },
  { id: 'energy_core', name: 'Energy Core', category: 'upgrade', realm: 'scifi' },
  
  // Decorations
  { id: 'tree', name: 'Tree', category: 'decoration', realm: 'fantasy' },
  { id: 'rock', name: 'Rock', category: 'decoration', realm: 'both' },
  { id: 'crystal', name: 'Crystal', category: 'decoration', realm: 'fantasy' },
  { id: 'asteroid', name: 'Asteroid', category: 'decoration', realm: 'scifi' },

  // Structures
  { id: 'mountain', name: 'Mountain', category: 'structure', realm: 'both' },
  
  // Enemies
  { id: 'leech', name: 'Leech', category: 'enemy', realm: 'fantasy' },
  { id: 'meteor', name: 'Meteor', category: 'enemy', realm: 'scifi' },
];

export const MapEditorElementPalette: React.FC<{ realm: 'fantasy' | 'scifi' }> = ({ realm }) => {
  const {
    selectedElementType,
    setSelectedElementType,
    isEditorActive,
    setSelectedTool
  } = useMapEditorStore();

  if (!isEditorActive) return null;

  const filteredElements = elementTypes.filter(
    element => element.realm === realm || element.realm === 'both'
  );

  const groupedElements = filteredElements.reduce((acc, element) => {
    if (!acc[element.category]) {
      acc[element.category] = [];
    }
    acc[element.category].push(element);
    return acc;
  }, {} as Record<string, ElementType[]>);

  return (
    <Card className="fixed top-4 right-4 z-50 w-64 bg-background/95 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Element Palette</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="upgrade" className="w-full">
          <TabsList className="grid w-full grid-cols-4 text-xs">
            <TabsTrigger value="upgrade">Upgrades</TabsTrigger>
            <TabsTrigger value="decoration">Decor</TabsTrigger>
            <TabsTrigger value="structure">Struct</TabsTrigger>
            <TabsTrigger value="enemy">Enemy</TabsTrigger>
          </TabsList>
          
          {Object.entries(groupedElements).map(([category, elements]) => (
            <TabsContent key={category} value={category} className="mt-2">
              <div className="grid grid-cols-2 gap-1">
                {elements.map((element) => (
                  <Button
                    key={element.id}
                    size="sm"
                    variant={selectedElementType === element.id ? 'default' : 'ghost'}
                    onClick={() => {
                      setSelectedElementType(element.id);
                      setSelectedTool('place');
                    }}
                    className="h-12 flex flex-col justify-center p-1 text-xs"
                  >
                    <div className="w-6 h-6 bg-muted rounded mb-1" />
                    <span className="truncate">{element.name}</span>
                  </Button>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};