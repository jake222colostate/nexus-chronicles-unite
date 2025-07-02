import React from 'react';
import { Button } from '../ui/button';
import { 
  MousePointer, 
  Plus, 
  Trash2, 
  Move, 
  RotateCw, 
  Scale,
  Undo2,
  Grid3x3,
  Save,
  FolderOpen,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { useMapEditorStore } from '../../stores/useMapEditorStore';
import { MapEditorElementPalette } from './MapEditorElementPalette';
import { useIsMobile } from '../../hooks/use-mobile';

export const MapEditorToolbar: React.FC = () => {
  const {
    selectedTool,
    setSelectedTool,
    snapToGrid,
    setSnapToGrid,
    showGrid,
    setShowGrid,
    clearMap,
    exportMap,
    undo,
    isEditorActive,
    setEditorActive,
    selectedElementType
  } = useMapEditorStore();
  
  const isMobile = useIsMobile();

  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'place', icon: Plus, label: 'Place' },
    { id: 'delete', icon: Trash2, label: 'Delete' },
    { id: 'move', icon: Move, label: 'Move' },
    { id: 'rotate', icon: RotateCw, label: 'Rotate' },
    { id: 'scale', icon: Scale, label: 'Scale' },
  ] as const;

  const handleExport = () => {
    const mapData = exportMap();
    const dataStr = JSON.stringify(mapData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'map-data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isEditorActive) {
    return (
      <div className={`fixed top-2 z-50 ${isMobile ? 'left-2' : 'top-4 left-4'}`}>
        <Button
          onClick={() => setEditorActive(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          size={isMobile ? "sm" : "default"}
        >
          {isMobile ? "Map Editor" : "Open Map Editor"}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className={`fixed z-50 bg-background/95 backdrop-blur border rounded-lg space-y-2 ${
        isMobile 
          ? 'top-2 left-2 right-2 p-2 max-h-[40vh] overflow-y-auto' 
          : 'top-4 left-4 p-4 w-64 space-y-4'
      }`}>
        <div className="flex items-center gap-2">
          <h3 className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>Map Editor</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditorActive(false)}
            className="ml-auto"
          >
            <EyeOff className="h-4 w-4" />
          </Button>
        </div>

        {!isMobile && (
          <div className="text-xs text-muted-foreground">
            <p>WASD: Move camera</p>
            <p>Q/E: Up/Down</p>
            <p>Shift: Speed boost</p>
            <p>Click: Place selected item</p>
            <p>Right-click: Select/Delete</p>
          </div>
        )}

        {/* Tools */}
        <div className="space-y-1">
          <h4 className="text-xs text-muted-foreground">Tools</h4>
          <div className={`grid gap-1 ${isMobile ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {tools.map((tool) => (
              <Button
                key={tool.id}
                size="sm"
                variant={selectedTool === tool.id ? 'default' : 'ghost'}
                onClick={() => setSelectedTool(tool.id as any)}
                className={`${isMobile ? 'p-1 text-xs' : 'justify-start'}`}
              >
                <tool.icon className={`h-4 w-4 ${!isMobile ? 'mr-2' : ''}`} />
                {!isMobile && tool.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Current Selection */}
        {selectedElementType && (
          <div className="space-y-2">
            <h4 className="text-xs text-muted-foreground">Selected</h4>
            <div className="text-xs bg-muted p-2 rounded">
              {selectedElementType.replace(/_/g, ' ').toUpperCase()}
            </div>
          </div>
        )}

        {/* Grid Controls */}
        <div className="space-y-2">
          <h4 className="text-xs text-muted-foreground">Grid</h4>
          <div className="flex flex-col gap-1">
            <Button
              size="sm"
              variant={snapToGrid ? 'default' : 'ghost'}
              onClick={() => setSnapToGrid(!snapToGrid)}
              className="justify-start"
            >
              <Grid3x3 className="h-4 w-4 mr-2" />
              Snap to Grid
            </Button>
            <Button
              size="sm"
              variant={showGrid ? 'default' : 'ghost'}
              onClick={() => setShowGrid(!showGrid)}
              className="justify-start"
            >
              <Eye className="h-4 w-4 mr-2" />
              Show Grid
            </Button>
          </div>
        </div>

        {/* File Operations */}
        <div className="space-y-2">
          <h4 className="text-xs text-muted-foreground">File</h4>
          <div className="flex flex-col gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={undo}
              className="justify-start"
            >
              <Undo2 className="h-4 w-4 mr-2" />
              Undo
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleExport}
              className="justify-start"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearMap}
              className="justify-start text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Map
            </Button>
          </div>
        </div>
      </div>

      <MapEditorElementPalette realm="fantasy" />
    </>
  );
};