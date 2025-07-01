import React from 'react';
import { useMapEditorStore, MapElement } from '../../stores/useMapEditorStore';
import { Box, Sphere, Cone, useGLTF } from '@react-three/drei';

const ElementPreview: React.FC<{ element: MapElement; isSelected: boolean }> = ({
  element,
  isSelected
}) => {
  const { properties } = element;
  const { setSelectedElement } = useMapEditorStore();
  const mountainModel = useGLTF('/newassets/Mountain.glb');

  const handleClick = (e: any) => {
    e.stopPropagation();
    setSelectedElement(element.id);
  };

  // Simple shapes for different element types
  const renderElement = () => {
    switch (properties.elementType) {
      case 'mana_fountain':
      case 'arcane_beacon':
      case 'crystal_tower':
        return (
          <Cone args={[0.5, 2, 8]} onClick={handleClick}>
            <meshStandardMaterial color="#4a90e2" />
          </Cone>
        );
      
      case 'quantum_drive':
      case 'nano_reactor':
      case 'energy_core':
        return (
          <Box args={[1, 1, 1]} onClick={handleClick}>
            <meshStandardMaterial color="#e74c3c" />
          </Box>
        );
      
      case 'tree':
        return (
          <group onClick={handleClick}>
            <Box args={[0.2, 2, 0.2]} position={[0, 1, 0]}>
              <meshStandardMaterial color="#8B4513" />
            </Box>
            <Sphere args={[1]} position={[0, 2.5, 0]}>
              <meshStandardMaterial color="#228B22" />
            </Sphere>
          </group>
        );
      
      case 'rock':
        return (
          <Box args={[1, 0.5, 1]} onClick={handleClick}>
            <meshStandardMaterial color="#696969" />
          </Box>
        );
      
      case 'crystal':
        return (
          <Cone args={[0.3, 1.5, 6]} onClick={handleClick}>
            <meshStandardMaterial color="#9b59b6" />
          </Cone>
        );
      
      case 'asteroid':
        return (
          <Sphere args={[0.8]} onClick={handleClick}>
            <meshStandardMaterial color="#8B4513" />
          </Sphere>
        );

      case 'mountain':
        return (
          <primitive object={mountainModel.scene.clone()} onClick={handleClick} />
        );
      
      case 'leech':
      case 'meteor':
        return (
          <Sphere args={[0.5]} onClick={handleClick}>
            <meshStandardMaterial color="#ff6b6b" />
          </Sphere>
        );
      
      default:
        return (
          <Box args={[1, 1, 1]} onClick={handleClick}>
            <meshStandardMaterial color="#cccccc" />
          </Box>
        );
    }
  };

  return (
    <group
      position={[element.position.x, element.position.y, element.position.z]}
      rotation={[element.rotation.x, element.rotation.y, element.rotation.z]}
      scale={[element.scale.x, element.scale.y, element.scale.z]}
    >
      {renderElement()}
      
      {/* Selection indicator */}
      {isSelected && (
        <Box args={[2, 0.1, 2]} position={[0, -0.5, 0]}>
          <meshBasicMaterial color="#ffff00" transparent opacity={0.3} />
        </Box>
      )}
    </group>
  );
};

export const MapEditorElementRenderer: React.FC = () => {
  const { placedElements, selectedElement, isEditorActive } = useMapEditorStore();

  if (!isEditorActive) return null;

  return (
    <group>
      {placedElements.map((element) => (
        <ElementPreview
          key={element.id}
          element={element}
          isSelected={selectedElement === element.id}
        />
      ))}
    </group>
  );
};

useGLTF.preload('/newassets/Mountain.glb');
