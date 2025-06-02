
import React, { Suspense } from 'react';
import { Environment } from '@react-three/drei';

interface FantasySkyboxSystemProps {
  realm: 'fantasy' | 'scifi';
}

export const FantasySkyboxSystem: React.FC<FantasySkyboxSystemProps> = ({
  realm
}) => {
  console.log('FantasySkyboxSystem render - Realm:', realm);

  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    console.log('FantasySkyboxSystem: Not fantasy realm, skipping');
    return null;
  }

  return (
    <Suspense fallback={null}>
      <Environment 
        background 
        preset="sunset"
      />
      {/* Add atmospheric fog for fantasy feel */}
      <fog 
        attach="fog" 
        args={['#8B5CF6', 50, 200]} 
      />
    </Suspense>
  );
};
