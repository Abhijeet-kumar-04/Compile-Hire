"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Torus, Box, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function Core() {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const centerRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 0.5;
      ring1Ref.current.rotation.y += delta * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.3;
      ring2Ref.current.rotation.z += delta * 0.4;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x -= delta * 0.2;
      ring3Ref.current.rotation.z -= delta * 0.5;
    }
    if (centerRef.current) {
      centerRef.current.rotation.x += delta * 1.5;
      centerRef.current.rotation.y += delta * 1.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central "Tech" Core - A glowing wireframe box */}
      <Box ref={centerRef} args={[0.8, 0.8, 0.8]}>
        <meshStandardMaterial color="#818cf8" emissive="#6366f1" emissiveIntensity={2} wireframe />
      </Box>

      {/* Pulsing Liquid/Distorted Sphere around the core */}
      <Sphere args={[1.5, 64, 64]}>
        <MeshDistortMaterial
          color="#1e1b4b"
          emissive="#312e81"
          emissiveIntensity={1}
          attach="material"
          distort={0.5}
          speed={3}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.8}
        />
      </Sphere>

      {/* Orbiting Rings to create the 3D depth */}
      <Torus ref={ring1Ref} args={[2.8, 0.02, 16, 100]}>
        <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={2} />
      </Torus>
      
      <Torus ref={ring2Ref} args={[3.8, 0.015, 16, 100]} rotation={[Math.PI / 3, 0, 0]}>
        <meshStandardMaterial color="#818cf8" emissive="#6366f1" emissiveIntensity={1.5} />
      </Torus>

      <Torus ref={ring3Ref} args={[4.8, 0.01, 16, 100]} rotation={[0, Math.PI / 4, 0]}>
        <meshStandardMaterial color="#e2e8f0" emissive="#f8fafc" emissiveIntensity={1} />
      </Torus>
    </group>
  );
}

export default function Core3D() {
  return (
    <div className="w-full h-full relative z-10 flex items-center justify-center">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#818cf8" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#34d399" />
        <Core />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>
    </div>
  );
}
