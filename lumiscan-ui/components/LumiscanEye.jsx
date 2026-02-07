import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Torus, Sphere, Octahedron } from '@react-three/drei';
import * as THREE from 'three';

export function LumiscanEye({ dangerLevel = 0, isShutterClosed = false }) {
  const outerRing = useRef();
  const midRing = useRef();
  const core = useRef();
  
  // COLORS: "Warm Guardian" (Gold/Flare) -> "Angry God" (Crimson)
  const SAFE_COLOR = new THREE.Color("#FF5F1F"); // Flare Orange (Warmth)
  const DANGER_COLOR = new THREE.Color("#FF0000"); // Red (Warning)
  
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    // 1. DIVINE ROTATION (Slow, Majestic)
    outerRing.current.rotation.z += delta * 0.1;
    midRing.current.rotation.x -= delta * 0.15;
    midRing.current.rotation.y += delta * 0.05;
    
    // 2. BREATHING (The "Life" of the system)
    const pulse = Math.sin(time * 2) * 0.05;
    core.current.scale.setScalar(1 + pulse + (dangerLevel * 0.3));
    
    // 3. COLOR SHIFT
    const targetColor = dangerLevel > 0.5 ? DANGER_COLOR : SAFE_COLOR;
    outerRing.current.material.color.lerp(targetColor, 0.05);
    midRing.current.material.color.lerp(targetColor, 0.05);
    core.current.material.color.lerp(targetColor, 0.05);
    
    // 4. THE SHUTTER (The "Shield" activating)
    // When closed, the rings align to form a cage
    if (isShutterClosed) {
        outerRing.current.rotation.x = THREE.MathUtils.lerp(outerRing.current.rotation.x, Math.PI / 2, 0.1);
        midRing.current.rotation.y = THREE.MathUtils.lerp(midRing.current.rotation.y, 0, 0.1);
    }
  });

  return (
    <group rotation={[0.5, 0, 0]}> 
      {/* THE HALO (Outer Ring) */}
      <Torus ref={outerRing} args={[3.5, 0.02, 16, 100]}>
        <meshStandardMaterial emissiveIntensity={1} toneMapped={false} transparent opacity={0.5} />
      </Torus>
      
      {/* THE GUARDIAN (Middle Ring) */}
      <Torus ref={midRing} args={[2.5, 0.05, 16, 100]}>
        <meshStandardMaterial emissiveIntensity={2} toneMapped={false} wireframe />
      </Torus>

      {/* THE SOUL (The Core Light) */}
      <Octahedron ref={core} args={[1.2, 0]}>
         <meshStandardMaterial wireframe emissiveIntensity={4} toneMapped={false} />
      </Octahedron>
      
      {/* The "Light Source" inside */}
      <pointLight distance={10} decay={2} intensity={5} color={isShutterClosed ? "#FF0000" : "#FF5F1F"} />
    </group>
  );
}