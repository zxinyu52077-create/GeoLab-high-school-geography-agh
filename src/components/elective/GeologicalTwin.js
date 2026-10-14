import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export const TWIN_ASSETS = '/picture/experiments/twin/'
export function textureMaterial(tile = 2, options = {}) {
  const map = new THREE.TextureLoader().load(`${TWIN_ASSETS}geological-albedo-atlas.png`)
  map.colorSpace = THREE.SRGBColorSpace
  map.offset.set((tile % 2) * .5 + .004, tile >= 2 ? .004 : .504)
  map.repeat.set(.492, .492)
  map.anisotropy = 8
  return new THREE.MeshStandardMaterial({ map, bumpMap: map, bumpScale: .035, roughness: .92, ...options })
}
let sharedGround
export function groundTexture() {
  if(!sharedGround) { sharedGround=new THREE.TextureLoader().load(`${TWIN_ASSETS}upland-albedo.png`); sharedGround.colorSpace=THREE.SRGBColorSpace; sharedGround.flipY=false; sharedGround.anisotropy=8 }
  return sharedGround
}
export function addVegetation(root, sample, count=85) {
  const map=new THREE.TextureLoader().load(`${TWIN_ASSETS}broadleaf-tree.png`);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4
  const geometry=new THREE.PlaneGeometry(.8,1);geometry.translate(0,.5,0)
  const material=new THREE.MeshStandardMaterial({map,alphaTest:.4,alphaToCoverage:true,side:THREE.DoubleSide,roughness:1})
  const trees=new THREE.InstancedMesh(geometry,material,count*2);trees.castShadow=true;trees.receiveShadow=true;trees.frustumCulled=false;root.add(trees)
  const matrix=new THREE.Matrix4(), q=new THREE.Quaternion(), up=new THREE.Vector3(0,1,0), position=new THREE.Vector3(),scale=new THREE.Vector3()
  const seeds=Array.from({length:count},(_,i)=>({x:Math.sin(i*43.31+1)*5.7,z:Math.sin(i*27.91+2)*3.1,h:.3+(Math.sin(i*7.1)+1)*.18,a:i*2.71}))
  return { update(nextSample=sample) { seeds.forEach((seed,i)=>{const y=nextSample(seed.x,seed.z,i),size=y===null?0:seed.h
    for(let side=0;side<2;side++){q.setFromAxisAngle(up,seed.a+side*Math.PI/2);position.set(seed.x,y??0,seed.z);scale.setScalar(size);matrix.compose(position,q,scale);trees.setMatrixAt(i*2+side,matrix)}
  });trees.instanceMatrix.needsUpdate=true },mesh:trees }
}
let sharedAtlas
export function atlasTexture() {
  if (!sharedAtlas) { sharedAtlas = new THREE.TextureLoader().load(`${TWIN_ASSETS}geological-albedo-atlas.png`); sharedAtlas.colorSpace = THREE.SRGBColorSpace; sharedAtlas.flipY = false; sharedAtlas.anisotropy = 8 }
  return sharedAtlas
}
export function prepareTexturedMesh(object) {
  if (!object.isMesh) return
  object.castShadow = true; object.receiveShadow = true
  if(object.userData.role==='water') {
    object.material=new THREE.MeshPhysicalMaterial({color:'#234e50',roughness:.24,metalness:.04,clearcoat:.8,envMapIntensity:.45,transparent:true,opacity:.92})
    object.material.onBeforeCompile=shader=>{shader.uniforms.processTime={value:0};object.userData.waterUniforms=shader.uniforms;shader.vertexShader='uniform float processTime;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.y += sin(position.z * 12.0 - processTime * 3.0) * .008 + cos(position.x * 16.0 + processTime) * .006;')}
  }
  if (['landcover','watershed'].includes(object.userData.role)) {
    object.material.map = groundTexture()
    const uv=object.geometry.attributes.uv
    if(uv&&!object.userData.ground_uv_normalized) {
      for(let i=0;i<uv.count;i++)uv.setXY(i,(uv.getX(i)-.004)/.492,(uv.getY(i)-.504)/.492)
      uv.needsUpdate=true;object.userData.ground_uv_normalized=true
    }
  } else if (object.userData.role && !['magma','water'].includes(object.userData.role)) object.material.map=atlasTexture()
  if (['volcano','seabed'].includes(object.userData.role)) {
    object.material.onBeforeCompile=shader=>{
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>', `#ifdef USE_MAP
        vec2 stoneUv=vec2(.504)+fract((vMapUv-vec2(.504))/.492*6.0)*.492;
        diffuseColor *= texture2D(map,stoneUv);
      #endif`)
    }
    object.material.customProgramCacheKey=()=> 'geosim-fine-basalt'
  }
  if (object.material.map) {
    object.material.map.anisotropy = 8
    object.material.bumpMap = object.material.map
    object.material.bumpScale = object.userData.role === 'landcover' ? .007 : .014
    object.material.roughness = .93
    object.material.metalness = 0
    object.material.needsUpdate = true
  }
}

// Coordinates are teaching-scale units, not surveyed metres. Beds are clipped
// by the same erosion surface, so erosion exposes older beds without inversion.
export function foldAt(x, stress) { return 1.45 * stress / 100 * Math.cos(x * .72) * Math.exp(-x * x / 48) }
export function faultAt(x, v) { return v.mode === 'fault' && x > .35 ? -v.fault / 100 * 1.5 : 0 }
export function surfaceAt(x, z, v) {
  const rough = .018 * Math.sin(x * 12 - z * 9) + .010 * Math.cos(x * 21 + z * 13)
  const incision = 2.85 * v.erosion / 100 * Math.exp(-x * x / 1.65)
  return 1.5 + foldAt(x, v.stress) + .11 * Math.sin(-z * 1.4 + x * .65) + rough - incision + faultAt(x, v)
}
export function geologyObservation(v, x = 0, z = 0) {
  const surface = surfaceAt(x, z, v)
  const cutDepth = Math.max(0, 1.5 + foldAt(x, v.stress) + faultAt(x, v) - surface)
  const exposed = Math.min(6, 1 + Math.floor(cutDepth / .6))
  return { surface, exposed, valley: surfaceAt(0, 0, v) < Math.min(surfaceAt(-2, 0, v), surfaceAt(2, 0, v)) }
}

export function buildGeologicalTwin(scene, onStatus = () => {}) {
  const root = new THREE.Group(); scene.add(root)
  let ready = false; let disposed = false; let signature = ''; let lastValues = null
  const beds = []; const covers = []; const pickTargets = []
  const vegetation=addVegetation(root,()=>null)
  const water = new THREE.Mesh(new THREE.PlaneGeometry(.18, 6.8, 3, 140), new THREE.MeshPhysicalMaterial({ color: '#3a8793', roughness: .2, metalness: .06, transparent: true, opacity: .85, clearcoat: 1 }))
  water.rotation.x = -Math.PI / 2; root.add(water)
  const faultTrace = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: '#db7748', transparent: true, opacity: .8 })); root.add(faultTrace)
  // A section ruler is an interpretation aid, separate from the natural scene.
  const ruler = new THREE.Group(); root.add(ruler)
  for (let i = 0; i <= 6; i++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(.08, .012, .012), new THREE.MeshBasicMaterial({ color: '#33454e' }))
    bar.position.set(6.2, 1.5 - i * .6, .025); ruler.add(bar)
  }
  new GLTFLoader().load(`${TWIN_ASSETS}tectonic-landscape-v2.glb`, (gltf) => {
    if (disposed) { gltf.scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose() }); return }
    gltf.scene.traverse((o) => {
      if (!o.isMesh) return
      prepareTexturedMesh(o)
      o.userData.rest = o.geometry.attributes.position.array.slice()
      o.userData.half = Number(o.userData.half)
      if (o.userData.role === 'stratum') { beds.push(o); pickTargets.push(o) }
      if (o.userData.role === 'landcover') {
        covers.push(o); pickTargets.push(o)
        const exposure = new THREE.BufferAttribute(new Float32Array(o.geometry.attributes.position.count), 1)
        o.geometry.setAttribute('rockExposure', exposure)
        o.material = o.material.clone()
        o.material.onBeforeCompile = (shader) => {
          shader.uniforms.rockAtlas={value:atlasTexture()}
          shader.vertexShader = 'attribute float rockExposure; varying float vRockExposure;\n' + shader.vertexShader
          shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvRockExposure = rockExposure;')
          shader.fragmentShader = 'uniform sampler2D rockAtlas; varying float vRockExposure;\n' + shader.fragmentShader
          shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
#ifdef USE_MAP
  vec4 grass = texture2D(map, vMapUv);
  vec4 rock = texture2D(rockAtlas, vec2(vMapUv.x * .492 + .004, vMapUv.y * .492 + .004));
  diffuseColor *= mix(grass, rock, vRockExposure);
#endif`)
        }
        o.material.customProgramCacheKey = () => 'geosim-landcover-exposure-v2'
      }
    })
    root.add(gltf.scene); ready = true; signature = ''; onStatus('ready')
  }, undefined, () => onStatus('error'))
  onStatus('loading')
  return {
    pickTargets,
    inspect(object, point) {
      if (!lastValues) return null
      const observation = geologyObservation(lastValues, point.x, point.z)
      const layer = object.userData.role === 'stratum' ? Number(object.userData.level) + 1 : observation.exposed
      return { title: `地层 ${layer} · ${layer % 2 ? '砂岩' : '灰岩'}`, detail: `编号自上而下由新到老；此处相对高程 ${point.y.toFixed(2)}，地表出露地层 ${observation.exposed}。先比较两翼层序，再判断背斜或向斜。` }
    },
    update(v, _t) {
      lastValues = v
      if (!ready) return
      const key = [v.stress, v.erosion, v.fault, v.mode, v.section].join(':')
      ruler.visible = !!v.section
      water.visible = v.erosion > 12
      water.geometry.setDrawRange(0, v.section ? water.geometry.index.count/2 : water.geometry.index.count)
      if (key === signature) return
      signature = key
      vegetation.update((x,z)=>v.section&&z>0?null:Math.abs(x)<1.15||geologyObservation(v,x,z).exposed>1?null:surfaceAt(x,z,v)+.035)
      for (const mesh of [...beds, ...covers]) {
        mesh.visible = !(v.section && mesh.userData.half === 0)
        const p = mesh.geometry.attributes.position; const rest = mesh.userData.rest
        const surface = mesh.userData.role === 'landcover'; const exposure = mesh.geometry.attributes.rockExposure
        for (let i = 0; i < p.count; i++) {
          const x = rest[i * 3], z = rest[i * 3 + 2]
          const top = surfaceAt(x, z, v)
          p.setY(i, surface ? top + .025 : Math.min(rest[i * 3 + 1] + foldAt(x, v.stress) + faultAt(x, v), top))
          if (exposure) {
            const stripped = (1.5 + foldAt(x, v.stress) + faultAt(x, v) - top) / .32
            exposure.setX(i, THREE.MathUtils.smoothstep(stripped, .2, 1.0))
          }
        }
        p.needsUpdate = true; if (exposure) exposure.needsUpdate = true
        mesh.geometry.computeVertexNormals(); mesh.geometry.computeBoundingSphere()
      }
      // Channel is draped onto the current topography, including fault offset.
      const wp = water.geometry.attributes.position
      for (let i = 0; i < wp.count; i++) {
        const z = -wp.getY(i)
        wp.setZ(i, surfaceAt(wp.getX(i), z, v) + .03)
      }
      wp.needsUpdate = true; water.geometry.computeVertexNormals()
      faultTrace.visible = v.mode === 'fault' && v.fault > 0
      faultTrace.geometry.dispose()
      faultTrace.geometry = new THREE.BufferGeometry().setFromPoints(Array.from({length:90},(_,i)=>{
        const z=-3.4+i/89*6.8; return new THREE.Vector3(.35,surfaceAt(.35,z,v)+.028,z)
      }))
    },
    dispose() { disposed = true },
  }
}

export function riverCenter(z) { return -.62 * Math.sin(z * .92) - .18 * Math.sin(z * 2.1) }
export function watershedHeight(x, z) {
  const y = -z, d = Math.abs(x - (.62 * Math.sin(y * .92) + .18 * Math.sin(y * 2.1)))
  const ridge=.32*Math.sin(x*1.7+y*.5)+.17*Math.cos(y*2.8-x)
  return -.9+.10*(y+4)+1.75*(1-Math.exp(-d*d/3.8))+(ridge+.07*Math.sin(x*13+y*8)*Math.cos(y*11-x*7))*Math.min(1,Math.max(0,(d-.28)/1.2))
}
