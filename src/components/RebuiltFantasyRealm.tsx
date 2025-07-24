import React from 'react';
import { ValleyFantasyEnvironment } from './ValleyFantasyEnvironment';
import * as THREE from 'three';

interface RebuiltFantasyRealmProps {
  playerPosition: THREE.Vector3;
}

export const RebuiltFantasyRealm: React.FC<RebuiltFantasyRealmProps> = ({ playerPosition }) => {
  return <ValleyFantasyEnvironment playerPosition={playerPosition} />;
};

