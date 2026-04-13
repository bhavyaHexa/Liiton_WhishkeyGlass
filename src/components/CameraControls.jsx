import React, { useEffect, useRef } from 'react'
import { CameraControls as CameraControlsImpl } from '@react-three/drei'

export default function CameraControls() {
  const controlsRef = useRef()

  useEffect(() => {
    if (controlsRef.current) {
      // Force the controls to synchronize with the initial camera position
      // Position: [0, 0, 1], Target: [0, 0, 0]
      controlsRef.current.setLookAt(0, 0, 1, 0, 0, 0, false)
    }
  }, [])

  return (
    <CameraControlsImpl
      ref={controlsRef}
      makeDefault
      // minPolarAngle = 60 degrees (30 degrees up from eye-level)
      // maxPolarAngle = 90 degrees (eye-level)
      minPolarAngle={Math.PI / 3}
      maxPolarAngle={Math.PI / 2}
      // Zoom limits
      minDistance={0.5}
      maxDistance={1.5}
    />
  )
}
