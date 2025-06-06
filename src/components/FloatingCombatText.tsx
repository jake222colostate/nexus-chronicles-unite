
import React, { useState, useEffect } from 'react';
import { Vector3 } from 'three';

interface FloatingTextData {
  id: string;
  text: string;
  position: Vector3;
  color: string;
  startTime: number;
}

interface FloatingCombatTextProps {
  texts: FloatingTextData[];
}

export const FloatingCombatText: React.FC<FloatingCombatTextProps> = ({ texts }) => {
  return (
    <group>
      {texts.map(textData => {
        const elapsed = (Date.now() - textData.startTime) / 1000;
        const opacity = Math.max(0, 1 - elapsed / 2); // Fade over 2 seconds
        const yOffset = elapsed * 2; // Float upward
        
        if (opacity <= 0) return null;
        
        return (
          <mesh 
            key={textData.id}
            position={[
              textData.position.x, 
              textData.position.y + yOffset, 
              textData.position.z
            ]}
          >
            <planeGeometry args={[0.8, 0.3]} />
            <meshBasicMaterial 
              color={textData.color}
              transparent 
              opacity={opacity}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// Hook for managing floating combat text
export const useFloatingCombatText = () => {
  const [texts, setTexts] = useState<FloatingTextData[]>([]);

  const addText = (text: string, position: Vector3, color: string = "#FFD700") => {
    const newText: FloatingTextData = {
      id: `text_${Date.now()}_${Math.random()}`,
      text,
      position: position.clone(),
      color,
      startTime: Date.now()
    };
    
    setTexts(prev => [...prev, newText]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setTexts(prev => prev.filter(t => t.id !== newText.id));
    }, 3000);
  };

  return { texts, addText };
};
