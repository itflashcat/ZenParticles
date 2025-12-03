import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Particles from './Particles';
import { ShapeType } from '../types';
import { CAMERA_FOV } from '../constants';

interface SceneProps {
  shape: ShapeType;
  tension: number;
  color: string;
}

const Scene: React.FC<SceneProps> = ({ shape, tension, color }) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: CAMERA_FOV }}
      className="w-full h-full"
      dpr={[1, 2]}
    >
      <color attach="background" args={['#050505']} />
      <ambientLight intensity={0.5} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Particles shape={shape} tension={tension} color={color} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
    </Canvas>
  );
};

export default Scene;
