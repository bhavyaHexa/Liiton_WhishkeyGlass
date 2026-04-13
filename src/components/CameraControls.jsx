import React from 'react'
import { CameraControls as CameraControlsImpl } from '@react-three/drei'

export default function CameraControls() {
  return (
    <CameraControlsImpl
      makeDefault
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 2}
    />
  )
}
