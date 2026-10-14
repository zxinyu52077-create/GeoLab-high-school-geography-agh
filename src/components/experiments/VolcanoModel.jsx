import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export default function VolcanoModel({ eruptionIndex, viscosity }) {
  const hostRef = useRef(null)
  const modelRef = useRef(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined

    const scene = new THREE.Scene()
    scene.background = null
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(11.5, -14, 11)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    host.appendChild(renderer.domElement)

    scene.add(new THREE.HemisphereLight('#f8fbff', '#667076', 2.1))
    const keyLight = new THREE.DirectionalLight('#fff1d8', 3.4)
    keyLight.position.set(-7, -8, 13)
    keyLight.castShadow = true
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight('#8ec4dc', 1.5)
    fillLight.position.set(8, 6, 8)
    scene.add(fillLight)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0, 2.7)
    controls.enableDamping = true
    controls.minDistance = 8
    controls.maxDistance = 25
    controls.maxPolarAngle = Math.PI * 0.48

    const resize = () => {
      const width = Math.max(1, host.clientWidth)
      const height = Math.max(1, host.clientHeight)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    resize()

    const loader = new GLTFLoader()
    loader.load('/picture/experiments/volcano-cutaway.glb', (gltf) => {
      modelRef.current = gltf.scene
      gltf.scene.traverse((object) => {
        if (!object.isMesh) return
        object.castShadow = true
        object.receiveShadow = true
        object.userData.baseScale = object.scale.clone()
      })
      scene.add(gltf.scene)
    }, undefined, () => setError(true))

    let frameId = 0
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
      controls.dispose()
      renderer.dispose()
      scene.traverse((object) => {
        if (!object.isMesh) return
        object.geometry.dispose()
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material) => material.dispose())
      })
      renderer.domElement.remove()
      modelRef.current = null
    }
  }, [])

  useEffect(() => {
    modelRef.current?.traverse((object) => {
      if (!object.isMesh) return
      if (!object.userData.baseScale) object.userData.baseScale = object.scale.clone()
      const base = object.userData.baseScale
      if (object.name.toLowerCase().includes('ash') || object.name.includes('Volcanic gas')) {
        const growth = 0.72 + eruptionIndex / 180
        object.scale.set(base.x * growth, base.y * growth, base.z * growth)
      }
      if (object.name === 'Lava flow' || object.name.startsWith('Lava flow.')) {
        object.visible = viscosity < 52
      }
    })
  }, [eruptionIndex, viscosity])

  return (
    <div className="volcano-model" ref={hostRef} aria-label="可旋转的火山三维剖面模型">
      <div className="volcano-model__caption">剖面模型 · 拖动旋转 · 滚轮缩放</div>
      {error && <div className="volcano-model__error">模型资源未能载入，请检查本地资源路径。</div>}
    </div>
  )
}
