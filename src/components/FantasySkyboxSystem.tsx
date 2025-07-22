
import React from 'react';
import { SimpleSkybox } from './SimpleSkybox';

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

  return <SimpleSkybox realm={realm} />;
};
