import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows, useHelper } from '@react-three/drei'
import { useControls } from 'leva'
import { easing } from 'maath'

export default function Lights() {
  const envRef = useRef()

  const { rotationX, rotationY, rotationZ } = useControls("Environment", {
    rotationX: { value: 0, min: 0, max: Math.PI * 2, step: 0.01 },
    rotationY: { value: 0, min: 0, max: Math.PI * 2, step: 0.01 },
    rotationZ: { value: 0, min: 0, max: Math.PI * 2, step: 0.01 },
  })



  return (
    <>
      <ambientLight intensity={1.0} />

      {/* Dynamic Environment from Code 1 */}
      <Environment frames={Infinity} preset="city" resolution={256} environmentIntensity={0.4} environmentRotation={[rotationX, rotationY, rotationZ]}>
        <Lightformer intensity={1} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
        <Lightformer intensity={1} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
        <group rotation={[Math.PI / 2, 1, 0]}>
          {[2, -2, 2, -4, 2, -5, 2, -9].map((x, i) => (
            <Lightformer key={i} intensity={1} rotation={[Math.PI / 4, 0, 0]} position={[x, 4, i * 4]} scale={[4, 1, 1]} />
          ))}
          <Lightformer intensity={0.5} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[50, 2, 1]} />
          <Lightformer intensity={0.5} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={[50, 2, 1]} />
          <Lightformer intensity={0.5} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[50, 2, 1]} />
        </group>
        <group ref={envRef}>
          <Lightformer intensity={0.5} form="ring" color="white" rotation-y={Math.PI / 2} position={[-5, 2, -1]} scale={[10, 10, 1]} />
        </group>
      </Environment>
      {/* <Environment 
        files={"/studio_kominka_01_1k.hdr"} 
        environmentIntensity={1.5} 
        environmentRotation={[rotationX, rotationY, rotationZ]}
      /> */}
      {/* Your original Contact shadows */}
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