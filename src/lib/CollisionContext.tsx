import React, { createContext, useContext, useRef } from 'react';
import { Vector3 } from 'three';

export interface Collider {
  id: string;
  position: Vector3;
  radius: number;
}

interface CollisionContextValue {
  colliders: React.MutableRefObject<Map<string, Collider>>;
  registerCollider: (collider: Collider) => void;
  updateCollider: (id: string, position: Vector3) => void;
  removeCollider: (id: string) => void;
}

const CollisionContext = createContext<CollisionContextValue | null>(null);

export const useCollisionContext = () => useContext(CollisionContext);

export const CollisionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colliders = useRef<Map<string, Collider>>(new Map());

  const registerCollider = (collider: Collider) => {
    colliders.current.set(collider.id, collider);
  };

  const updateCollider = (id: string, position: Vector3) => {
    const col = colliders.current.get(id);
    if (col) {
      col.position.copy(position);
    }
  };

  const removeCollider = (id: string) => {
    colliders.current.delete(id);
  };

  return (
    <CollisionContext.Provider value={{ colliders, registerCollider, updateCollider, removeCollider }}>
      {children}
    </CollisionContext.Provider>
  );
};

export const useRegisterCollider = (
  id: string,
  position: Vector3,
  radius: number
) => {
  const context = useCollisionContext();
  const posRef = useRef(position.clone());

  React.useEffect(() => {
    if (!context) return;
    context.registerCollider({ id, position: posRef.current, radius });
    return () => {
      context.removeCollider(id);
    };
  }, [id, context]);

  React.useEffect(() => {
    if (!context) return;
    posRef.current.copy(position);
    context.updateCollider(id, position);
  }, [position.x, position.y, position.z, context, id]);
};
