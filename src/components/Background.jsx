import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

export default function Background() {
  const { scene } = useThree()

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 2
    canvas.height = 256
    const context = canvas.getContext('2d')

    const gradient = context.createLinearGradient(0, 0, 0, 256)
    gradient.addColorStop(0, '#000000') // Top (Black)
    gradient.addColorStop(0.5, '#3a3a3a') // More black (60% coverage)
    gradient.addColorStop(1, '#333333') // Bottom (Dark Grey)

    context.fillStyle = gradient
    context.fillRect(0, 0, 2, 256)

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  useEffect(() => {
    const oldBg = scene.background
    scene.background = texture
    return () => {
      scene.background = oldBg
    }
  }, [scene, texture])

  return null
}
