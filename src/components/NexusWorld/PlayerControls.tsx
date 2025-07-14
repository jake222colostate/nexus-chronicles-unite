import { PointerLockControls } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';
import { useMovementControls } from '@/hooks/useMovementControls';
import { useMouseLookControls } from '@/hooks/useMouseLookControls';

const PlayerControls: React.FC = () => {
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const keys = useMovementControls();
  const { yawAngle, pitchAngle } = useMouseLookControls();

  useFrame((_state, delta) => {
    const forward = new THREE.Vector3(-Math.sin(yawAngle.current), 0, -Math.cos(yawAngle.current));
    const right = new THREE.Vector3(Math.cos(yawAngle.current), 0, -Math.sin(yawAngle.current));
    const dir = new THREE.Vector3();
    if (keys.current.forward) dir.add(forward);
    if (keys.current.backward) dir.sub(forward);
    if (keys.current.left) dir.sub(right);
    if (keys.current.right) dir.add(right);

    if (dir.length() > 0) {
      dir.normalize().multiplyScalar(5);
      velocity.current.lerp(dir, 0.2);
    } else {
      velocity.current.multiplyScalar(0.8);
    }

    camera.position.add(velocity.current.clone().multiplyScalar(delta));
    camera.rotation.set(pitchAngle.current, yawAngle.current, 0, 'YXZ');
  });

  return <PointerLockControls />;
};

export default PlayerControls;
