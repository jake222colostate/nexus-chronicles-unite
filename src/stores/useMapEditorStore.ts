import { create } from 'zustand';
import { Vector3 } from 'three';

export interface MapElement {
  id: string;
  type: 'upgrade' | 'decoration' | 'structure' | 'enemy';
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  properties: Record<string, any>;
  realm: 'fantasy' | 'scifi';
}

interface MapEditorState {
  isEditorActive: boolean;
  selectedTool: 'select' | 'place' | 'delete' | 'move' | 'rotate' | 'scale';
  selectedElementType: string;
  placedElements: MapElement[];
  selectedElement: string | null;
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  camera: {
    position: Vector3;
    target: Vector3;
  };
}

interface MapEditorActions {
  setEditorActive: (active: boolean) => void;
  setSelectedTool: (tool: MapEditorState['selectedTool']) => void;
  setSelectedElementType: (type: string) => void;
  addElement: (element: MapElement) => void;
  removeElement: (id: string) => void;
  updateElement: (id: string, updates: Partial<MapElement>) => void;
  setSelectedElement: (id: string | null) => void;
  setGridSize: (size: number) => void;
  setSnapToGrid: (snap: boolean) => void;
  setShowGrid: (show: boolean) => void;
  clearMap: () => void;
  loadMap: (elements: MapElement[]) => void;
  exportMap: () => MapElement[];
}

export const useMapEditorStore = create<MapEditorState & MapEditorActions>((set, get) => ({
  // State
  isEditorActive: false,
  selectedTool: 'select',
  selectedElementType: '',
  placedElements: [],
  selectedElement: null,
  gridSize: 1,
  snapToGrid: true,
  showGrid: true,
  camera: {
    position: new Vector3(0, 10, 10),
    target: new Vector3(0, 0, 0),
  },

  // Actions
  setEditorActive: (active) => set({ isEditorActive: active }),
  
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  
  setSelectedElementType: (type) => set({ selectedElementType: type }),
  
  addElement: (element) => set((state) => ({
    placedElements: [...state.placedElements, element]
  })),
  
  removeElement: (id) => set((state) => ({
    placedElements: state.placedElements.filter(el => el.id !== id),
    selectedElement: state.selectedElement === id ? null : state.selectedElement
  })),
  
  updateElement: (id, updates) => set((state) => ({
    placedElements: state.placedElements.map(el =>
      el.id === id ? { ...el, ...updates } : el
    )
  })),
  
  setSelectedElement: (id) => set({ selectedElement: id }),
  
  setGridSize: (size) => set({ gridSize: size }),
  
  setSnapToGrid: (snap) => set({ snapToGrid: snap }),
  
  setShowGrid: (show) => set({ showGrid: show }),
  
  clearMap: () => set({ placedElements: [], selectedElement: null }),
  
  loadMap: (elements) => set({ placedElements: elements, selectedElement: null }),
  
  exportMap: () => get().placedElements,
}));