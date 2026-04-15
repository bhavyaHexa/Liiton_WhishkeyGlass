import React, { useRef } from 'react'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'
import { useControls } from 'leva'
import { isDebugMode } from '../utils/debug'

export default function Lights() {
  const envRef = useRef();
  const isDebug = isDebugMode();

  const { envEnabled, envIntensity, envRotationX, envRotationY, envRotationZ } = useControls('Debug.Environment', {
    envEnabled: { value: true, label: 'Enable Environment' },
    envIntensity: { value: 0.4, min: 0, max: 10, step: 0.1 },
    envRotationX: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
    envRotationY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
    envRotationZ: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
  }, { hidden: !isDebug, collapsed: true });

  return (
    <>
      <ambientLight intensity={1.0} />

      {/* Dynamic Environment from Code 1 */}
      {envEnabled && (
        <Environment
          frames={Infinity}
          preset="city"
          resolution={256}
          environmentIntensity={envIntensity}
          environmentRotation={[envRotationX, envRotationY, envRotationZ]}
        >
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
      )}
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