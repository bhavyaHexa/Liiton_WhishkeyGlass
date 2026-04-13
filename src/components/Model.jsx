import React, { useEffect, Suspense } from 'react'
import { useGLTF, Center } from '@react-three/drei'
import * as THREE from 'three'
import Loader from './Loader'

function GlassModel({ url }) {
  const { scene } = useGLTF(url)

  useEffect(() => {
    if (!scene) return

    scene.traverse((child) => {
      if (child.isMesh) {
        // --- CRITICAL FIX 1: SMOOTH SHADING ---
        // This recalculates the geometry to use vertex normals instead of 
        // face normals, which forces the mesh to shade smoothly and removes 
        // the vertical faceted lines seen in image_0.png.
        child.geometry.computeVertexNormals()

        // Replace the material with a perfectly smooth, volumetric glass
        child.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#ffffff'), // Pure base color for max transmission

          // --- FIX 2: SURFACE SMOOTHNESS ---
          roughness: 0.0,            // **MUST BE ZERO** for a smooth surface reflection.
          metalness: 0.0,            // Glass is non-metallic.

          // --- FIX 3: TRANSMISSION (REFRACTION) ---
          transmission: 1.0,         // Pure light transmission.
          ior: 1.45,                 // Normal glass index of refraction. (Fix from 2.0).
          thickness: 1.0,           // Simulated depth for the attenuation effect.




          // --- TECHNICAL SETTINGS FOR CORRECT TRANSPARENCY ---
          transparent: true,
          opacity: 1.0,              // Must be 1.0 for transmission to work correctly.
          side: THREE.FrontSide,     // Standard transparency often handles FrontSide better, DoubleSide is optional.
          depthWrite: false,         // Often improves sorting artifacts, but can cause overlap issues.

          // Add a Clearcoat layer for extra specular depth
          clearcoat: 1.0,
          clearcoatRoughness: 0.0
        })

        child.material.needsUpdate = true
      }
    })
  }, [scene])

  return <primitive object={scene} />
}

export default function Model({ url }) {
  return (
    <Suspense fallback={<Loader />}>
      {/* IMPORTANT: This material depends heavily on an environment map 
        to calculate smooth reflections and refraction. Add one 
        in your Canvas component using @react-three/drei's <Environment />
      */}
      <group position={[0, 0, 0]}>
        <Center>
          <GlassModel url={url} />
        </Center>
      </group>
    </Suspense>
  )
}