
import React from 'react';
import { FantasyMagicalSkybox } from './FantasyMagicalSkybox';

interface FantasyScreenshotSkyboxProps {
  realm: 'fantasy' | 'scifi';
}

const FantasyScreenshotSkybox: React.FC<FantasyScreenshotSkyboxProps> = ({
  realm
}) => {
  console.log('FantasyScreenshotSkybox render - Realm:', realm);

  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    console.log('FantasyScreenshotSkybox: Not fantasy realm, skipping');
    return null;
  }

  return <FantasyMagicalSkybox realm={realm} />;
};

export { FantasyScreenshotSkybox };
