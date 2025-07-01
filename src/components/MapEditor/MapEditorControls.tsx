import React, { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useMapEditorStore } from '../../stores/useMapEditorStore';
import { Vector3 } from 'three';
import * as THREE from 'three';

export const MapEditorControls: React.FC = () => {
  const { camera, gl, mouse, raycaster, scene } = useThree();
  const {
    isEditorActive,
    selectedTool,
    selectedElementType,
    snapToGrid,
    gridSize,
    addElement,
    removeElement,
    placedElements,
    selectedElement,
    setSelectedElement
  } = useMapEditorStore();

  const isMouseDown = useRef(false);
  const lastMousePosition = useRef(new Vector3());

  const snapToGridValue = (value: number) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  const handlePointerDown = (event: PointerEvent) => {
    if (!isEditorActive) return;
    
    isMouseDown.current = true;
    
    // Update raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Raycast against the ground plane
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectPoint = new Vector3();
    raycaster.ray.intersectPlane(groundPlane, intersectPoint);
    
    if (!intersectPoint) return;

    // Snap to grid
    intersectPoint.x = snapToGridValue(intersectPoint.x);
    intersectPoint.z = snapToGridValue(intersectPoint.z);

    switch (selectedTool) {
      case 'place':
        if (selectedElementType) {
          const newElement = {
            id: `element_${Date.now()}_${Math.random()}`,
            type: selectedElementType.includes('upgrade') ? 'upgrade' : 
                  selectedElementType.includes('enemy') ? 'enemy' : 'decoration' as any,
            position: intersectPoint,
            rotation: new Vector3(0, 0, 0),
            scale: new Vector3(1, 1, 1),
            properties: { elementType: selectedElementType },
            realm: 'fantasy' as 'fantasy' | 'scifi' // This should be dynamic based on current realm
          };
          addElement(newElement);
        }
        break;

      case 'select':
        // Find closest element to click point
        let closestElement = null;
        let closestDistance = Infinity;
        
        placedElements.forEach(element => {
          const distance = element.position.distanceTo(intersectPoint);
          if (distance < 2 && distance < closestDistance) { // 2 unit selection radius
            closestDistance = distance;
            closestElement = element;
          }
        });
        
        setSelectedElement(closestElement?.id || null);
        break;

      case 'delete':
        // Find and delete closest element
        let elementToDelete = null;
        let deleteDistance = Infinity;
        
        placedElements.forEach(element => {
          const distance = element.position.distanceTo(intersectPoint);
          if (distance < 2 && distance < deleteDistance) {
            deleteDistance = distance;
            elementToDelete = element;
          }
        });
        
        if (elementToDelete) {
          removeElement(elementToDelete.id);
        }
        break;
    }
  };

  const handlePointerUp = () => {
    isMouseDown.current = false;
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!isEditorActive || !isMouseDown.current) return;
    
    // Handle dragging logic here for move tool
    if (selectedTool === 'move' && selectedElement) {
      // Update position of selected element
      // This would need more sophisticated implementation
    }
  };

  // Add event listeners
  React.useEffect(() => {
    if (!isEditorActive) return;

    const canvas = gl.domElement;
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointermove', handlePointerMove);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointermove', handlePointerMove);
    };
  }, [isEditorActive, selectedTool, selectedElementType, snapToGrid, gridSize]);

  return null; // This component handles events but doesn't render anything
};