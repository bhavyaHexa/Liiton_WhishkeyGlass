import * as THREE from "three";

export function svgToTexture(svgString) {
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  const texture = new THREE.TextureLoader().load(url, (tex) => {
    tex.anisotropy = 16;
    tex.needsUpdate = true;
  });
  texture.flipY = true;

  return texture;
}
