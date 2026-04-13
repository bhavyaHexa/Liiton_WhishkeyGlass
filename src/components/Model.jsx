import React, { useEffect, Suspense } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import Loader from './Loader'

function GlassModel({ url }) {
  const { scene } = useGLTF(url)

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        if (child.material) {
          child.material.transparent = true
          if (child.material.opacity === undefined || child.material.opacity === 1) {
            child.material.opacity = 0.9
          }

          if (!child.material.isMeshPhysicalMaterial) {
            child.material = new THREE.MeshPhysicalMaterial({
              color: '#ffffff',
              metalness: 0.05,
              roughness: 0.0,
              transmission: 1,
              ior: 2.086,
              thickness: 0.5,
              transparent: true,
              reflectivity: 0.88,
              side: THREE.DoubleSide,
              opacity: 0.3,
            })
          } else {
            child.material.transmission = Math.max(child.material.transmission || 0, 0.9)
            child.material.thickness = child.material.thickness || 0.5
            child.material.ior = child.material.ior || 2.086
            child.material.roughness = child.material.roughness || 0.05
          }
          child.material.depthWrite = false
          child.material.needsUpdate = true
        }
      }
    })
  }, [scene])

  return <primitive object={scene} position={[0, 0, 0]} />
}

export default function Model({ url }) {
  return (
    <Suspense fallback={<Loader />}>
      <group position={[0, 0, 0]}>
        <GlassModel url={url} />
      </group>
    </Suspense>
  )
}
