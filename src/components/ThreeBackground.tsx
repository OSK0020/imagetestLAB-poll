'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from './ThemeProvider';

function Particles({ count = 2000 }) {
  const mesh = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 15;
      temp[i * 3 + 1] = (Math.random() - 0.5) * 15;
      temp[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.getElapsedTime();
    mesh.current.rotation.y = time * 0.05;
    mesh.current.rotation.x = time * 0.02;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color={count === 4000 ? "#A855F7" : "#6366F1"}
        transparent
        opacity={count === 4000 ? 0.3 : 0.2}
        sizeAttenuation
      />
    </points>
  );
}

export default function ThreeBackground() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 -z-10 bg-slate-50 dark:bg-[#0F071A]" />;
  }

  return (
    <div className="fixed inset-0 -z-10 bg-slate-50 dark:bg-[#0F071A] w-full h-full overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 z-0 w-full h-full">
        <Canvas 
          camera={{ position: [0, 0, 10], fov: 60 }}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={theme === 'dark' ? 1.5 : 0.8} color={theme === 'dark' ? "#A855F7" : "#CBD5E1"} />
          <pointLight position={[20, 20, 20]} intensity={theme === 'dark' ? 2 : 1} color={theme === 'dark' ? "#8B5CF6" : "#94A3B8"} />
          <Particles count={4000} />
        </Canvas>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-100/20 dark:via-[#0F071A]/40 to-slate-200/50 dark:to-[#0F071A] pointer-events-none z-[1]" />
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-[2]" />
    </div>
  );
}
