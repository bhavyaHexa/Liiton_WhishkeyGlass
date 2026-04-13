import React from 'react'
import { Canvas } from '@react-three/fiber'
import Lights from './components/Lights'
import Model from './components/Model'
import CameraControls from './components/CameraControls'
import { SceneEnvController, ToneMappingController } from './components/SceneControllers'

export default function App() {
  return (
    <div className="app-container">
      <Canvas camera={{ position: [0, 1, 1], fov: 10 }} shadows>
        {/* Scene Configuration & Controllers */}
        <SceneEnvController />
        <ToneMappingController />
        <color attach="background" args={['#000000']} />

        {/* Global Lights & Environment */}
        <Lights />

        {/* 3D Model with Model-specific Loader */}
        <Model url="/01.glb" />

        {/* Interaction Controls */}
        <CameraControls />
      </Canvas>
    </div>
  )
}