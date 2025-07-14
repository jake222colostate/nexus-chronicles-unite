import React from 'react';
import { Sky } from '@react-three/drei';

const BackgroundElements: React.FC = () => {
  return (
    <group>
      <Sky distance={450000} sunPosition={[5, 1, 8]} inclination={0} azimuth={0.25} />
    </group>
  );
};

export default BackgroundElements;
