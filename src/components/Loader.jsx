import React from 'react'
import { Html, useProgress } from '@react-three/drei'

export default function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="loader">{progress.toFixed(2)} % loaded</div>
    </Html>
  )
}
