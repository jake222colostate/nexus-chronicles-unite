import React, { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useMapEditorStore } from '../../stores/useMapEditorStore';
import { Vector3 } from 'three';
import * as THREE from 'three';

export const MapEditorControls: React.FC = () => {
  const { camera, gl, size } = useThree();
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

  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const snapToGridValue = (value: number) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  const handleClick = (event: MouseEvent) => {
    if (!isEditorActive || selectedTool !== 'place') return;
    
    const rect = gl.domElement.getBoundingClientRect();
    
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Update raycaster
    raycaster.current.setFromCamera(mouse.current, camera);
    
    // Create a ground plane at y=0
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectPoint = new Vector3();
    
    // Find intersection with ground plane
    const intersects = raycaster.current.ray.intersectPlane(groundPlane, intersectPoint);
    
    if (!intersects) return;

    // Snap to grid if enabled
    if (snapToGrid) {
      intersectPoint.x = snapToGridValue(intersectPoint.x);
      intersectPoint.z = snapToGridValue(intersectPoint.z);
    }

    // Place element if in place mode and element type is selected
    if (selectedTool === 'place' && selectedElementType) {
      const newElement = {
        id: `element_${Date.now()}_${Math.random()}`,
        type: selectedElementType.includes('upgrade') ? 'upgrade' : 
              selectedElementType.includes('enemy') ? 'enemy' : 'decoration' as any,
        position: intersectPoint,
        rotation: new Vector3(0, 0, 0),
        scale: new Vector3(1, 1, 1),
        properties: { elementType: selectedElementType },
        realm: 'fantasy' as 'fantasy' | 'scifi'
      };
      addElement(newElement);
      console.log('Placed element:', newElement);
    }
  };

  const handleRightClick = (event: MouseEvent) => {
    if (!isEditorActive) return;
    event.preventDefault();
    
    const rect = gl.domElement.getBoundingClientRect();
    
    // Calculate mouse position
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.current.setFromCamera(mouse.current, camera);
    
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectPoint = new Vector3();
    
    if (!raycaster.current.ray.intersectPlane(groundPlane, intersectPoint)) return;

    // Find and select/delete closest element
    let closestElement = null;
    let closestDistance = Infinity;
    
    placedElements.forEach(element => {
      const distance = element.position.distanceTo(intersectPoint);
      if (distance < 2 && distance < closestDistance) {
        closestDistance = distance;
        closestElement = element;
      }
    });
    
    if (closestElement) {
      if (selectedTool === 'delete') {
        removeElement(closestElement.id);
        console.log('Deleted element:', closestElement.id);
      } else {
        setSelectedElement(closestElement.id);
        console.log('Selected element:', closestElement.id);
      }
    }
  };

  // Add event listeners
  useEffect(() => {
    if (!isEditorActive) return;

    const canvas = gl.domElement;
    
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('contextmenu', handleRightClick);

    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('contextmenu', handleRightClick);
    };
  }, [isEditorActive, selectedTool, selectedElementType, snapToGrid, gridSize, placedElements]);

  return null;
};