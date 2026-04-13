import React from 'react'
import { Environment, ContactShadows } from '@react-three/drei'

export default function Lights() {
  return (
    <>
      <ambientLight intensity={0.4} />

      {/* Main Key Light */}
      <spotLight
        position={[5, 10, 5]}
        angle={0.25}
        penumbra={1}
        intensity={2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Rim Light / Back Light for edge highlights */}
      <spotLight
        position={[-5, 5, -5]}
        angle={0.5}
        penumbra={1}
        intensity={3}
        color="#88ccff"
      />

      {/* Fill Light */}
      <directionalLight
        position={[-5, 5, 5]}
        intensity={0.5}
        color="#ffcc88"
      />

      {/* Environment map provides the reflections necessary for glass */}
      <Environment files="/studio_small_09_1k.hdr" />

      {/* Contact shadows give a grounded feeling */}
      <ContactShadows
        position={[0, 0.01, 0]}
        resolution={1024}
        scale={10}
        blur={2.5}
        opacity={0.6}
        far={10}
        color="#000000"
      />
    </>
  )
}
