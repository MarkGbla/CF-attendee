"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/* ─── Sparkle Particles (tiny candy-colored glitter) ─── */
function Sparkles({ count = 120 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    const candyColors = [
      "#FF6B9D", "#FFD700", "#FF85B3", "#FFA3C4",
      "#FF4081", "#E040FB", "#FFAB40", "#69F0AE",
    ];
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 24,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 8 - 2,
      ] as [number, number, number],
      scale: Math.random() * 0.08 + 0.02,
      speed: Math.random() * 0.4 + 0.1,
      twinkleOffset: Math.random() * Math.PI * 2,
      color: new THREE.Color(
        candyColors[Math.floor(Math.random() * candyColors.length)]
      ),
    }));
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    const dummy = new THREE.Object3D();

    particles.forEach((p, i) => {
      const twinkle = Math.sin(time * 2 + p.twinkleOffset) * 0.5 + 0.5;
      dummy.position.set(
        p.position[0] + Math.sin(time * p.speed + i) * 0.8,
        p.position[1] + Math.cos(time * p.speed * 0.7 + i * 0.5) * 0.6,
        p.position[2] + Math.sin(time * 0.3 + i) * 0.3
      );
      dummy.scale.setScalar(p.scale * (0.5 + twinkle * 0.8));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#FFD700" transparent opacity={0.7} />
    </instancedMesh>
  );
}

/* ─── Floating Candy Orbs (lollipops / candy balls in the sky) ─── */
function CandyOrbs() {
  const candyConfigs = useMemo(
    () => [
      { color: "#FF6B9D", size: 0.5, pos: [-5, 8, -6] as [number, number, number] },
      { color: "#FFD700", size: 0.35, pos: [6, -4, -5] as [number, number, number] },
      { color: "#FF85B3", size: 0.6, pos: [-7, -10, -7] as [number, number, number] },
      { color: "#E040FB", size: 0.4, pos: [8, 5, -4] as [number, number, number] },
      { color: "#FFAB40", size: 0.45, pos: [-3, 14, -6] as [number, number, number] },
      { color: "#69F0AE", size: 0.3, pos: [4, -12, -5] as [number, number, number] },
      { color: "#FF4081", size: 0.55, pos: [7, 12, -8] as [number, number, number] },
      { color: "#FFA3C4", size: 0.38, pos: [-8, 0, -6] as [number, number, number] },
    ],
    []
  );

  return (
    <>
      {candyConfigs.map((candy, i) => (
        <Float
          key={i}
          speed={0.8 + Math.random() * 0.5}
          rotationIntensity={0.3}
          floatIntensity={2.5}
          position={candy.pos}
        >
          <group>
            {/* Candy sphere with glossy look */}
            <mesh>
              <sphereGeometry args={[candy.size, 16, 16]} />
              <meshBasicMaterial
                color={candy.color}
                transparent
                opacity={0.35}
              />
            </mesh>
            {/* Inner brighter core */}
            <mesh>
              <sphereGeometry args={[candy.size * 0.6, 12, 12]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.15}
              />
            </mesh>
          </group>
        </Float>
      ))}
    </>
  );
}

/* ─── Candy Cane Streaks (thin rotating lines) ─── */
function CandyCaneStreaks() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  const streaks = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        y: -15 + i * 6,
        x: (i % 2 === 0 ? -1 : 1) * (3 + Math.random() * 4),
        length: 2 + Math.random() * 3,
        color: i % 3 === 0 ? "#FF6B9D" : i % 3 === 1 ? "#FFD700" : "#FF85B3",
      })),
    []
  );

  return (
    <group ref={groupRef}>
      {streaks.map((s, i) => (
        <Float key={i} speed={0.5} floatIntensity={1}>
          <mesh position={[s.x, s.y, -10]} rotation={[0, 0, Math.PI * 0.15 * (i % 2 === 0 ? 1 : -1)]}>
            <cylinderGeometry args={[0.03, 0.03, s.length, 6]} />
            <meshBasicMaterial color={s.color} transparent opacity={0.2} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/* ─── Main Background Canvas ─── */
export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        gl={{ alpha: true, antialias: false }}
        style={{ background: "transparent" }}
      >
        <Sparkles count={120} />
        <CandyOrbs />
        <CandyCaneStreaks />
      </Canvas>
    </div>
  );
}
