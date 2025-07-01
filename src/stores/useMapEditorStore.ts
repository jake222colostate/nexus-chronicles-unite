import { create } from 'zustand';
import { Vector3 } from 'three';

// Helper to load saved map elements from localStorage
const loadSavedElements = (): MapElement[] => {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem('nexusMapElements');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((el: any) => ({
      ...el,
      position: new Vector3(el.position.x, el.position.y, el.position.z),
      rotation: new Vector3(el.rotation.x, el.rotation.y, el.rotation.z),
      scale: new Vector3(el.scale.x, el.scale.y, el.scale.z)
    })) as MapElement[];
  } catch {
    return [];
  }
};

// Persist placed elements to localStorage
const saveElements = (elements: MapElement[]) => {
  if (typeof localStorage === 'undefined') return;
  const serialisable = elements.map(el => ({
    ...el,
    position: { x: el.position.x, y: el.position.y, z: el.position.z },
    rotation: { x: el.rotation.x, y: el.rotation.y, z: el.rotation.z },
    scale: { x: el.scale.x, y: el.scale.y, z: el.scale.z }
  }));
  localStorage.setItem('nexusMapElements', JSON.stringify(serialisable));
};

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
  history: MapElement[][];
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
  undo: () => void;
}

export const useMapEditorStore = create<MapEditorState & MapEditorActions>((set, get) => ({
  // State
  isEditorActive: false,
  selectedTool: 'select',
  selectedElementType: '',
  placedElements: loadSavedElements(),
  selectedElement: null,
  gridSize: 1,
  snapToGrid: true,
  showGrid: true,
  history: [],
  camera: {
    position: new Vector3(0, 10, 10),
    target: new Vector3(0, 0, 0),
  },

  // Actions
  setEditorActive: (active) => set({ isEditorActive: active }),
  
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  
  setSelectedElementType: (type) => set({ selectedElementType: type }),
  
  addElement: (element) => set((state) => {
    const updated = [...state.placedElements, element];
    saveElements(updated);
    return {
      history: [...state.history, state.placedElements],
      placedElements: updated
    };
  }),
  
  removeElement: (id) => set((state) => {
    const updated = state.placedElements.filter(el => el.id !== id);
    saveElements(updated);
    return {
      history: [...state.history, state.placedElements],
      placedElements: updated,
      selectedElement: state.selectedElement === id ? null : state.selectedElement
    };
  }),
  
  updateElement: (id, updates) => set((state) => {
    const updated = state.placedElements.map(el =>
      el.id === id ? { ...el, ...updates } : el
    );
    saveElements(updated);
    return {
      history: [...state.history, state.placedElements],
      placedElements: updated
    };
  }),
  
  setSelectedElement: (id) => set({ selectedElement: id }),
  
  setGridSize: (size) => set({ gridSize: size }),
  
  setSnapToGrid: (snap) => set({ snapToGrid: snap }),
  
  setShowGrid: (show) => set({ showGrid: show }),
  
  clearMap: () =>
    set((state) => {
      saveElements([]);
      return {
        history: [...state.history, state.placedElements],
        placedElements: [],
        selectedElement: null
      };
    }),
  
  loadMap: (elements) =>
    set((state) => {
      saveElements(elements);
      return {
        history: [...state.history, state.placedElements],
        placedElements: elements,
        selectedElement: null
      };
    }),
  
  exportMap: () => get().placedElements,

  undo: () =>
    set((state) => {
      if (state.history.length === 0) return state;
      const previous = state.history[state.history.length - 1];
      saveElements(previous);
      return {
        ...state,
        placedElements: previous,
        history: state.history.slice(0, -1),
        selectedElement: null
      } as MapEditorState;
    }),
}));
