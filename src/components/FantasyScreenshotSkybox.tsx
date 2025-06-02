
import React from 'react';
import { FantasyMagicalSkybox } from './FantasyMagicalSkybox';

interface FantasyScreenshotSkyboxProps {
  realm: 'fantasy' | 'scifi';
}

export const FantasyScreenshotSkybox: React.FC<FantasyScreenshotSkyboxProps> = ({
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  return <FantasyMagicalSkybox realm={realm} />;
};
