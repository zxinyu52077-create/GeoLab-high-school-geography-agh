import {riverCenter as valleyCenter,riverLevel,terrainHeightAt} from '../../src/components/elective/RiverMorphology.js'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { surfaceAt, geologyObservation, foldAt, riverCenter, watershedHeight } from '../../src/components/elective/GeologicalTwin.js'
import { frontObservation, QUAKE_STATIONS, quakeStationDistance } from '../../src/components/elective/LandscapeProcesses.js'
const v={mode:'erosion',stress:68,erosion:0,fault:0}
assert.ok(surfaceAt(0,0,{...v,erosion:100})<surfaceAt(0,0,v))
assert.ok(geologyObservation({...v,erosion:100}).exposed>geologyObservation(v).exposed)
assert.equal(geologyObservation({...v,erosion:100}).valley,true)
assert.equal(surfaceAt(-2,0,{...v,mode:'fault',fault:100}),surfaceAt(-2,0,{...v,mode:'fault',fault:0}))
assert.equal(surfaceAt(2,0,{...v,mode:'fault',fault:100}),surfaceAt(2,0,{...v,mode:'fault',fault:0})-1.5)
for(let stress=0;stress<=100;stress+=20)for(let erosion=0;erosion<=100;erosion+=20)for(let x=-6;x<=6;x+=.25){
  const cv={...v,stress,erosion};const surface=surfaceAt(x,0,cv)
  let previous=Infinity
  for(let boundary=0;boundary<=6;boundary++){
    const y=Math.min(1.5-boundary*.6+foldAt(x,stress),surface)
    assert.ok(Number.isFinite(y)&&y<=previous+1e-8);previous=y
  }
}
const front={mode:'cold',contrast:14,moisture:72}
assert.ok(frontObservation({...front,stage:90}).temperature<frontObservation({...front,stage:10}).temperature)
assert.ok(frontObservation({...front,mode:'warm',stage:90}).temperature>frontObservation({...front,mode:'warm',stage:10}).temperature)
assert.equal(frontObservation({...front,moisture:0,stage:50}).rain,0)
for(const [x,z] of QUAKE_STATIONS) assert.ok(quakeStationDistance(x,z)<3.5)
for(let z=-4;z<=4;z+=.04)for(const offset of [-.2,0,.2])assert.ok(watershedHeight(riverCenter(z)+offset,z)<-.865+.10*(-z+4),'River water must stay above its bed')
assert.ok(watershedHeight(riverCenter(-4),-4)>watershedHeight(riverCenter(4),4))
for(const [file,expected] of [['tectonic-landscape-v2',14],['watershed-landscape-v2',3],['volcano-landscape-v2',5],['ocean-basin-v2',3]]){
  const bytes=fs.readFileSync(new URL(`../../public/picture/experiments/twin/${file}.glb`,import.meta.url))
  assert.equal(bytes.toString('utf8',0,4),'glTF')
  const size=bytes.readUInt32LE(12),json=JSON.parse(bytes.toString('utf8',20,20+size))
  assert.equal(json.scenes.length,1)
  assert.equal(json.nodes.length,expected)
  for(const node of json.nodes)assert.ok(node.extras?.role)
  for(const mesh of json.meshes)for(const p of mesh.primitives)assert.ok(p.attributes.TEXCOORD_0!==undefined)
  console.log(`${file}: ${json.nodes.length} authored objects, UVs and metadata present`)
}
console.log('PASS: erosion/age sequence, non-inverted beds, normal fault offset, front station response, river gradient and P/S arrival scale')

for(const stage of ['上游侵蚀','中游搬运','下游沉积']) {
  for(const slope of [0,62,100]) for(const base of [0,52,100]) {
    for(let z=-12;z<=12;z+=.15) for(const dx of [-.72,0,.72]) {
      assert(terrainHeightAt(valleyCenter(z,stage)+dx,z,slope,base,0,stage)<riverLevel(z,base),'河流实验的河床必须连续低于水面')
    }
  }
}
console.log('河流实验：三个河段的水面与河谷连续性通过')
