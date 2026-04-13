import React, { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useControls } from 'leva'

export function SceneEnvController() {
  const { scene } = useThree()
  const { intensity, rotationX, rotationY, rotationZ } = useControls('Environment', {
    intensity: { value: 1, min: 0, max: 10, step: 0.1 },
    rotationX: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
    rotationY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
    rotationZ: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
  })

  useEffect(() => {
    scene.environmentIntensity = intensity
    if (scene.environmentRotation) {
      scene.environmentRotation.set(rotationX, rotationY, rotationZ)
    }
  }, [scene, intensity, rotationX, rotationY, rotationZ])

  return null
}

export function ToneMappingController() {
  const { gl, scene } = useThree()

  const { toneMapping, exposure } = useControls('Tone Mapping', {
    toneMapping: {
      options: {
        NoToneMapping: THREE.NoToneMapping,
        LinearToneMapping: THREE.LinearToneMapping,
        ReinhardToneMapping: THREE.ReinhardToneMapping,
        CineonToneMapping: THREE.CineonToneMapping,
        ACESFilmicToneMapping: THREE.ACESFilmicToneMapping,
        AgXToneMapping: THREE.AgXToneMapping,
        NeutralToneMapping: THREE.NeutralToneMapping,
      },
      value: THREE.NoToneMapping,
    },
    exposure: { value: 1, min: 0, max: 10, step: 0.1 },
  })

  useEffect(() => {
    gl.toneMapping = toneMapping
    gl.toneMappingExposure = exposure

    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.needsUpdate = true
      }
    })
  }, [toneMapping, exposure, gl, scene])

  return null
}
