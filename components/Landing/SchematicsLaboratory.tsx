"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, ContactShadows, Environment } from "@react-three/drei";
import { Suspense, useState, useRef, ReactNode } from "react";
import * as THREE from "three";
import Model from "@/public/3D/Mecha.jsx";

interface FollowModelProps {
  children: ReactNode;
}

const FollowModel = ({ children }: FollowModelProps) => {
  const groupRef = useRef<THREE.Group>(null);

  // Track mouse position
  useFrame((state) => {
    if (!groupRef.current) return;

    // Get pointer position from state (modern approach)
    const x = state.pointer.x;
    const y = state.pointer.y;

    // 1. Mouse Follow Logic (Rotation) - Fixed Y-axis inversion
    const targetRotationX = -y * 0.2;
    const targetRotationY = x * 0.5;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotationX,
      0.1
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotationY,
      0.1
    );

    // 2. Subtle Floating Animation (Y-axis)
    const time = state.clock.getElapsedTime();
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      -2 + Math.sin(time) * 0.1,
      0.1
    );
  });

  return <group ref={groupRef} position={[0, -5, 0]}>{children}</group>;
};

interface LoraLabelProps {
  position: [number, number, number];
  tag: string;
  description: string;
  color?: string;
  delay?: number;
}

const LoraLabel = ({ position, tag, description, color = "#00ffff", delay = 0 }: LoraLabelProps) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <Html position={position} center distanceFactor={8}>
      <div 
        className="flex items-center gap-3 transition-all duration-300 pointer-events-auto animate-in fade-in zoom-in"
        style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div 
          className="w-4 h-4 rounded-full border-2 border-black flex items-center justify-center bg-white cursor-crosshair transition-transform duration-300"
          style={{ transform: hovered ? 'scale(1.3)' : 'scale(1)' }}
        >
          <div 
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: hovered ? color : '#000' }}
          />
        </div>
        
        <div 
          className={`
            overflow-hidden transition-all duration-500 ease-in-out flex flex-col
            border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
            ${hovered ? 'max-w-[220px] opacity-100 p-3 translate-x-0' : 'max-w-0 opacity-0 p-0 -translate-x-4 pointer-events-none'}
          `}
        >
          <span className="text-[10px] font-black uppercase text-gray-400">Parameter Node</span>
          <span className="text-sm font-bold text-black border-b-2 border-black/5 pb-1 mb-1 whitespace-nowrap">{tag}</span>
          <span className="text-[11px] leading-tight text-gray-600 font-medium italic">{description}</span>
        </div>
      </div>
    </Html>
  );
};

const SchematicsLaboratory = () => {
  return (
    <div className="w-full h-screen relative overflow-hidden select-none">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(#000 1.5px, transparent 1.5px), linear-gradient(90deg, #000 1.5px, transparent 1.5px)`, 
          backgroundSize: '40px 40px' 
        }} 
      />

      {/* Header UI */}
      <header className="absolute top-0 left-0 w-full p-10 flex justify-between items-start z-20 pointer-events-none">
        <div>
          <h2 className="text-7xl font-black uppercase tracking-wider text-black font-druk-condensed">
            LORA <span className="opacity-30">TAGS</span>
          </h2>
          <div className="mt-6 flex items-center gap-3 pointer-events-auto">
             <div className="h-2 w-8 bg-black" />
          </div>
        </div>
      </header>

      <Canvas camera={{ position: [0, 0, 8], fov: 40 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Environment preset="city" />
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />

          <FollowModel>
              <Model scale={3} />
              
              {/* Added staggered delays for a 'loading' effect */}
              <LoraLabel position={[0, 1.8, 0]} tag="1girl" description="Primary Subject Core" color="#ff69b4" delay={500} />
              <LoraLabel position={[-1.3, 1.4, 0.4]} tag="mecha_musume" description="Mechanical Integration" color="#00ffff" delay={700} />
              <LoraLabel position={[1.3, 0.8, 0.4]} tag="white_armor" description="Material: Ceramic-Alloy" color="#ffffff" delay={900} />
              <LoraLabel position={[0, -0.5, 0.8]} tag="masterpiece" description="Refinement Protocol" color="#facc15" delay={1100} />
          </FollowModel>
          
          <ContactShadows opacity={0.2} scale={15} blur={2.5} far={10} color="#222222" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default SchematicsLaboratory;