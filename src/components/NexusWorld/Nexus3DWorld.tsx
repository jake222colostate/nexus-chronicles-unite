import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sparkles, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Simple fallback component if GLB loading fails
function SimpleCrystalObelisk() {
  const crystalRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group>
      {/* Stone fountain base */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2, 2, 0.4, 32]} />
        <meshStandardMaterial color="#666666" roughness={0.8} />
      </mesh>
      
      {/* Crystal obelisk */}
      <group ref={crystalRef} position={[0, 1.2, 0]}>
        <mesh>
          <octahedronGeometry args={[0.8]} />
          <meshStandardMaterial 
            color="#00e5ff" 
            emissive="#0088cc" 
            emissiveIntensity={0.3}
            transparent 
            opacity={0.9}
          />
        </mesh>
        <Sparkles count={30} scale={3} size={3} color="#88e5ff" />
        <pointLight position={[0, 2, 0]} intensity={3} color="#88e5ff" distance={8} />
      </group>
    </group>
  );
}

function CrystalObelisk() {
  try {
    const { scene: crystal } = useGLTF('/models/crystal_obelisk.glb');
    const { scene: fountain } = useGLTF('/models/bottle.glb');
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
  } catch (error) {
    console.warn('Failed to load GLB models, using fallback:', error);
    return <SimpleCrystalObelisk />;
  }
}

function SimpleVendorStall({ position, canopyColor, item }: { position: [number, number, number]; canopyColor: string; item: 'coin' | 'gems'; }) {
  return (
    <group position={position}>
      {/* Wooden base */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.6, 1.4]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>

      {/* Awning */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.05, 1.6]} />
        <meshStandardMaterial color={canopyColor} />
      </mesh>

      {/* Item display */}
      <mesh position={[0, 0.8, 0.5]} castShadow>
        {item === 'coin' ? (
          <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
        ) : (
          <octahedronGeometry args={[0.25]} />
        )}
        <meshStandardMaterial color={item === 'coin' ? "#ffd700" : "#8b5cf6"} />
      </mesh>
    </group>
  );
}

function VendorStall({ position, canopyColor, item }: { position: [number, number, number]; canopyColor: string; item: 'coin' | 'gems'; }) {
  try {
    const { scene: stallScene } = useGLTF('/models/lantern.glb');
    const { scene: coinScene } = useGLTF('/models/dice.glb');
    const { scene: gemScene } = useGLTF('/models/avocado.glb');
    
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
  } catch (error) {
    console.warn('Failed to load vendor stall GLB models, using fallback:', error);
    return <SimpleVendorStall position={position} canopyColor={canopyColor} item={item} />;
  }
}

function SimpleFenceRing() {
  const radius = 6;
  const segments = 16;
  
  return (
    <group>
      {Array.from({ length: segments }).map((_, i) => {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <mesh
            key={i}
            position={[x, 0.8, z]}
            rotation={[0, angle + Math.PI / 2, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.2, 1.5, 0.2]} />
            <meshStandardMaterial color="#8b4513" roughness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
}

function FenceRing() {
  try {
    const { scene: fenceScene } = useGLTF('/models/simple_box.glb');
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
  } catch (error) {
    console.warn('Failed to load fence GLB models, using fallback:', error);
    return <SimpleFenceRing />;
  }
}

function SimpleStonePath() {
  return (
    <group>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, 0.05, 3.5 - i * 1.0]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 0.15, 0.8]} />
          <meshStandardMaterial color="#daa520" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function StonePath() {
  try {
    const { scene: stoneScene } = useGLTF('/models/box_colors.glb');
    
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
  } catch (error) {
    console.warn('Failed to load stone path GLB models, using fallback:', error);
    return <SimpleStonePath />;
  }
}

function SimpleTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Tree trunk */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.3, 3, 8]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>
      
      {/* Tree foliage */}
      <mesh position={[0, 2.8, 0]} castShadow receiveShadow>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshStandardMaterial color="#32cd32" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Trees() {
  const radius = 9;
  const treePositions = [
    [0, 0], [45, 0], [90, 0], [135, 0], [180, 0], [225, 0], [270, 0], [315, 0],
    [22.5, 1.5], [67.5, 1.5], [112.5, 1.5], [157.5, 1.5], [202.5, 1.5], [247.5, 1.5], [292.5, 1.5], [337.5, 1.5]
  ];
  
  try {
    const { scene: treeScene } = useGLTF('/models/helmet.glb');
    
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
  } catch (error) {
    console.warn('Failed to load tree GLB models, using fallback:', error);
    return (
      <group>
        {treePositions.map(([angle, radiusOffset], i) => {
          const rad = (angle * Math.PI) / 180;
          const treeRadius = radius + radiusOffset;
          const x = Math.cos(rad) * treeRadius;
          const z = Math.sin(rad) * treeRadius;
          
          return (
            <SimpleTree key={i} position={[x, 0, z]} />
          );
        })}
      </group>
    );
  }
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
  <Canvas camera={{ position: [0, 3, 10], fov: 75 }} shadows style={{ height: '100%', width: '100%' }}>
    <Suspense fallback={null}>
      {/* Enhanced lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
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
      
      {/* Orbit controls for movement */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={3}
        maxDistance={20}
        target={[0, 0, 0]}
      />
    </Suspense>
  </Canvas>
);

export default Nexus3DWorld;
