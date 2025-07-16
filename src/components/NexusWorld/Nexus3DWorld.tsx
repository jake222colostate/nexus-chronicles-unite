import React, { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stage, Sparkles, useGLTF, FirstPersonControls } from '@react-three/drei';
import * as THREE from 'three';

// Movement controller component
function MovementController() {
  const controlsRef = useRef<any>(null);
  
  return (
    <FirstPersonControls
      ref={controlsRef}
      movementSpeed={5}
      lookSpeed={0.1}
      lookVertical={true}
      constrainVertical={true}
      verticalMin={1.1}
      verticalMax={2.2}
      activeLook={true}
    />
  );
}

function CrystalObelisk() {
  const { scene: crystal } = useGLTF('./models/crystal_obelisk.glb');
  const { scene: fountain } = useGLTF('./models/bottle.glb');
  const crystalRef = useRef<THREE.Group>(null);
  const fountainClone = useMemo(() => fountain.clone(), [fountain]);
  const crystalClone = useMemo(() => crystal.clone(), [crystal]);

  useFrame((_, delta) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group>
      {/* GLB fountain base */}
      <primitive object={fountainClone} scale={[3, 1, 3]} position={[0, 0, 0]} />
      
      {/* GLB crystal obelisk */}
      <group ref={crystalRef} position={[0, 1.5, 0]}>
        <primitive object={crystalClone} scale={2} />
        <Sparkles count={30} scale={3} size={3} color="#88e5ff" />
        <pointLight position={[0, 2, 0]} intensity={3} color="#88e5ff" distance={8} />
      </group>
    </group>
  );
}

function VendorStall({ position, canopyColor, item }: { position: [number, number, number]; canopyColor: string; item: 'coin' | 'gems'; }) {
  const { scene: stallScene } = useGLTF('./models/lantern.glb');
  const { scene: coinScene } = useGLTF('./models/dice.glb');
  const { scene: gemScene } = useGLTF('./models/avocado.glb');
  
  const stallClone = useMemo(() => stallScene.clone(), [stallScene]);
  const itemClone = useMemo(() => {
    const scene = item === 'coin' ? coinScene : gemScene;
    return scene.clone();
  }, [item, coinScene, gemScene]);

  // Apply color to the stall
  useMemo(() => {
    stallClone.traverse((child: any) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
        child.material.color = new THREE.Color(canopyColor);
      }
    });
  }, [stallClone, canopyColor]);

  return (
    <group position={position}>
      <primitive object={stallClone} scale={1.5} />
      <primitive object={itemClone} position={[0, 1.2, 0]} scale={0.8} />
    </group>
  );
}

function FenceRing() {
  const { scene: fenceScene } = useGLTF('./models/simple_box.glb');
  const radius = 6;
  const segments = 20;
  
  return (
    <group>
      {Array.from({ length: segments }).map((_, i) => {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const fenceClone = fenceScene.clone();
        
        return (
          <primitive
            key={i}
            object={fenceClone}
            position={[x, 0.8, z]}
            rotation={[0, angle + Math.PI / 2, 0]}
            scale={[0.2, 1.5, 0.2]}
          />
        );
      })}
    </group>
  );
}

function ResponsiveCanvas() {
  const { gl, camera } = useThree();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      gl.setSize(width, height);
      if ('aspect' in camera) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gl, camera]);

  return null;
}

function StonePath() {
  const { scene: stoneScene } = useGLTF('./models/box_colors.glb');
  
  return (
    <group>
      {Array.from({ length: 8 }).map((_, i) => {
        const stoneClone = stoneScene.clone();
        
        return (
          <primitive
            key={i}
            object={stoneClone}
            position={[0, 0.05, 3.5 - i * 1.0]}
            scale={[2.5, 0.15, 0.8]}
          />
        );
      })}
    </group>
  );
}

function Trees() {
  const { scene: treeScene } = useGLTF('./models/helmet.glb');
  const radius = 9;
  const treePositions = [
    [0, 0], [45, 0], [90, 0], [135, 0], [180, 0], [225, 0], [270, 0], [315, 0],
    [22.5, 1.5], [67.5, 1.5], [112.5, 1.5], [157.5, 1.5], [202.5, 1.5], [247.5, 1.5], [292.5, 1.5], [337.5, 1.5]
  ];
  
  return (
    <group>
      {treePositions.map(([angle, radiusOffset], i) => {
        const rad = (angle * Math.PI) / 180;
        const treeRadius = radius + radiusOffset;
        const x = Math.cos(rad) * treeRadius;
        const z = Math.sin(rad) * treeRadius;
        const treeClone = treeScene.clone();
        
        // Apply green color to make it look more tree-like
        treeClone.traverse((child: any) => {
          if (child.isMesh && child.material) {
            child.material = child.material.clone();
            child.material.color = new THREE.Color('#32cd32');
          }
        });
        
        return (
          <primitive
            key={i}
            object={treeClone}
            position={[x, 1.5, z]}
            scale={[1.5, 2, 1.5]}
          />
        );
      })}
    </group>
  );
}

// Horizontal ground plane
function EnhancedGround() {
  return (
    <group>
      {/* Main horizontal ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#4caf50" roughness={0.9} />
      </mesh>
      
      {/* Additional circular grass area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <circleGeometry args={[12, 64]} />
        <meshStandardMaterial color="#66bb6a" roughness={0.9} />
      </mesh>
    </group>
  );
}

const SceneContent = () => (
  <group>
    <EnhancedGround />
    <StonePath />
    <CrystalObelisk />
    <VendorStall position={[-4, 0, 1]} canopyColor="#8b5cf6" item="coin" />
    <VendorStall position={[4, 0, 1]} canopyColor="#60a5fa" item="gems" />
    <FenceRing />
    <Trees />
  </group>
);

const Nexus3DWorld: React.FC = () => (
  <Canvas camera={{ position: [0, 2, 8], fov: 75 }} shadows style={{ height: '100%', width: '100%' }}>
    <ResponsiveCanvas />
    <Suspense fallback={null}>
      {/* Enhanced lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />
      
      {/* Sky color */}
      <fog attach="fog" args={['#87CEEB', 20, 100]} />
      
      <SceneContent />
      
      {/* Movement controller */}
      <MovementController />
    </Suspense>
  </Canvas>
);

export default Nexus3DWorld;
