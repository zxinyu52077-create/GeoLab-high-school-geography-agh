import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { TWIN_ASSETS, prepareTexturedMesh, riverCenter, watershedHeight, addVegetation, atlasTexture } from './GeologicalTwin.js'

function loadLandscape(group, file, onStatus, configure = () => {}) {
  let alive = true
  onStatus('loading')
  new GLTFLoader().load(`${TWIN_ASSETS}${file}.glb`, ({ scene }) => {
    if (!alive) { scene.traverse(o => { o.geometry?.dispose(); o.material?.dispose() }); return }
    scene.traverse(prepareTexturedMesh); if(file==='watershed-landscape-v2'){const trees=addVegetation(scene,(x,z)=>Math.abs(x-riverCenter(z))<.6?null:watershedHeight(x,z)+.025,100);trees.update()} configure(scene); group.add(scene); onStatus('ready')
  }, undefined, () => onStatus('error'))
  return () => { alive = false }
}
function waterTime(group,t){group.traverse(o=>{if(o.userData.waterUniforms)o.userData.waterUniforms.processTime.value=t})}
function clouds(group, count = 24, color = '#ffffff') {
  const map = new THREE.TextureLoader().load(`${TWIN_ASSETS}cumulus-cloud.png`); map.colorSpace = THREE.SRGBColorSpace
  return Array.from({ length: count }, (_,i) => {
    const cloud = new THREE.Sprite(new THREE.SpriteMaterial({ map, color, transparent: true, opacity: .8, depthWrite: false }))
    cloud.userData.seed = i; group.add(cloud); return cloud
  })
}
function particles(group, count, color) {
  const vertices = new Float32Array(count * 3); const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  const points = new THREE.Points(geometry, new THREE.PointsMaterial({ color, size: .035, transparent: true, opacity: .65, depthWrite: false }))
  group.add(points); return points
}
function station(root, x, z, y, index) {
  const group = new THREE.Group();group.position.set(x,y,z);root.add(group)
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.012,.016,.5,10),new THREE.MeshStandardMaterial({color:'#f5f1e6',metalness:.6,roughness:.3}));pole.position.y=.25;group.add(pole)
  const cabinet=new THREE.Mesh(new THREE.BoxGeometry(.13,.11,.11),new THREE.MeshStandardMaterial({color:'#e7e3d8',roughness:.7}));cabinet.position.y=.44;group.add(cabinet)
  if(index) {
    const canvas=document.createElement('canvas');canvas.width=96;canvas.height=96
    const ctx=canvas.getContext('2d');ctx.fillStyle='#f6faf8';ctx.beginPath();ctx.arc(48,48,42,0,Math.PI*2);ctx.fill()
    ctx.fillStyle='#274c59';ctx.font='bold 58px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(index),48,51)
    const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace
    const label=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,depthTest:false,depthWrite:false}));label.position.y=.88;label.scale.set(.32,.32,1);label.renderOrder=2;group.add(label)
  }
  return group
}
export function frontObservation(v, x = 0, z = 2.1) {
  const low=-4.5+v.stage*.09
  const front=v.mode==='cyclone'?low-.93*z:low
  const cold = v.mode !== 'warm'
  const passed=1/(1+Math.exp(-(front-x)*2.3))
  const rainCenter = front + (cold ? -.3 : 1.55)
  return { front, temperature: cold ? 24-v.contrast*passed : 24-v.contrast+v.contrast*passed,
    pressure: v.mode==='cyclone' ? 1000+14*(1-Math.exp(-((x-low)**2+z*z)/6)) : cold ? 1007+9*passed-3*Math.exp(-(((front-x)/1.2)**2)) : 1018-9*passed,
    rain: v.moisture/100*(cold?16:6)*Math.exp(-(((x-rainCenter)/(cold?.72:1.55))**2)),
    wind: passed>.55?(cold?'偏北风':'偏南风'):(cold?'偏南风':'偏东风') }
}

export function buildWeatherLandscape(scene, onStatus) {
  const root=new THREE.Group();scene.add(root)
  const terrain=new THREE.Group();terrain.position.y=-1.25;terrain.scale.y=.35;root.add(terrain)
  const dispose=loadLandscape(terrain,'watershed-landscape-v2',onStatus)
  const cloudGroup=new THREE.Group();root.add(cloudGroup);const sprites=clouds(cloudGroup,26)
  const rain=particles(root,650,'#86bdce')
  const atmospheric=new THREE.Group();root.add(atmospheric)
  const boundary=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:'#91b6c7',side:THREE.DoubleSide,transparent:true,opacity:.10,depthWrite:false}));atmospheric.add(boundary)
  const direction=new THREE.ArrowHelper(new THREE.Vector3(1,0,0),new THREE.Vector3(0,-.7,3),1,'#385465',.14,.08);atmospheric.add(direction)
  const cycloneHints=new THREE.Group();atmospheric.add(cycloneHints)
  for(const radius of [1,2,3,4]) {
    const points=Array.from({length:101},(_,i)=>{const a=i/100*Math.PI*2;return new THREE.Vector3(Math.cos(a)*radius,-.91,Math.sin(a)*radius*.7)})
    cycloneHints.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:'#6a8998',transparent:true,opacity:.65})))
  }
  for(const [slope,direction,color] of [[-.93,1,'#4886b3'],[-2.4,-1,'#b97657']]) {
    const points=Array.from({length:40},(_,i)=>{const z=direction*i/39*3.4;return new THREE.Vector3(slope*z,-.87,z)})
    cycloneHints.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,transparent:true,opacity:.85})))
  }
  const stations=[-3,0,3].map((x,i)=>station(root,x,2.1,-1.25+watershedHeight(x,2.1)*.35,i+1))
  const targets=stations.flatMap((group,i)=>group.children.map(o=>{o.userData.stationX=[-3,0,3][i];o.userData.stationIndex=i+1;return o}))
  let current
  return { dispose,pickTargets:targets,inspect(o){const r=frontObservation(current,o.userData.stationX);return {title:`气象站 ${o.userData.stationIndex}`,detail:`气温 ${r.temperature.toFixed(1)}℃ · 气压 ${r.pressure.toFixed(1)} hPa · 降水 ${r.rain.toFixed(1)} mm/h · ${r.wind}。这些读数来自同一锋面位置。`}},update(v,t){
    waterTime(terrain,t);current=v;const r=frontObservation(v);const warm=v.mode==='warm',cyclone=v.mode==='cyclone'
    atmospheric.visible=!!v.overlays;cycloneHints.visible=cyclone;cycloneHints.position.x=-4.5+v.stage*.09;boundary.visible=!cyclone;direction.visible=!cyclone
    const slope=warm?2.5:-.55;const h=3.1
    boundary.geometry.dispose();boundary.geometry=new THREE.BufferGeometry()
    boundary.geometry.setAttribute('position',new THREE.Float32BufferAttribute([r.front,-1.3,-3.5,r.front,-1.3,3.5,r.front+slope*h,h-1.3,3.5,r.front+slope*h,h-1.3,-3.5],3));boundary.geometry.setIndex([0,1,2,0,2,3]);boundary.geometry.computeVertexNormals()
    direction.position.x=r.front;direction.setLength(.7+v.contrast/24,.2,.1)
    sprites.forEach((c,i)=>{
      const ix=i%7-3,iz=Math.floor(i/7)-1.5; const jitter=Math.sin(i*8.71)*.13
      if(cyclone){const coldArm=i<17,z=(i%17)/16*3.2*(coldArm?1:-1);c.position.set(-4.5+v.stage*.09+(coldArm?-.93:-2.4)*z,1.5+(i%3)*.2,z)}
      else c.position.set(r.front+(warm?1.6:0)+ix*(warm?.60:.22)+jitter,.7+(i%4)*.24+(warm?.1:v.contrast/24*.85),iz*1.25)
      c.scale.set(warm?3.2:2.4,warm?1.5:2.2,1);c.material.opacity=.15+v.moisture/100*.52;c.material.color.set(warm?'#f1f3f3':'#b4bdc3')
    })
    const p=rain.geometry.attributes.position
    for(let i=0;i<p.count;i++){
      const u=((i*43)%653)/653,w=((i*71)%647)/647,fall=(t*.7+i/650)%1
      const x=cyclone?-4.5+v.stage*.09-.93*(w*3.5)+(u-.5)*.9:r.front+(warm?1.7:-.25)+(u-.5)*(warm?4:1.8)
      p.setXYZ(i,x,1.6-fall*3.25,cyclone?w*3.5:(w-.5)*5.6)
    }
    p.needsUpdate=true;rain.visible=v.moisture>25;rain.material.opacity=v.moisture/180
  }}
}

export function buildWatershedProcess(scene,onStatus){
  const root=new THREE.Group();scene.add(root)
  const dispose=loadLandscape(root,'watershed-landscape-v2',onStatus)
  const plane=new THREE.Plane(new THREE.Vector3(0,0,-1),0)
  const positions=[],uv=[],indices=[]
  for(let i=0;i<=160;i++){const x=-6+i/160*12;positions.push(x,watershedHeight(x,0),.01,x,-2.1,.01);uv.push(.004+i/160*.492,.004,.004+i/160*.492,.496);if(i<160){const a=i*2;indices.push(a,a+1,a+2,a+2,a+1,a+3)}}
  const sectionGeometry=new THREE.BufferGeometry();sectionGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));sectionGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));sectionGeometry.setIndex(indices);sectionGeometry.computeVertexNormals()
  const cutface=new THREE.Mesh(sectionGeometry,new THREE.MeshStandardMaterial({map:atlasTexture(),roughness:.95,side:THREE.DoubleSide}));cutface.userData.cutface=true;root.add(cutface)
  const cloudGroup=new THREE.Group();root.add(cloudGroup);const sprites=clouds(cloudGroup,8)
  const rain=particles(root,460,'#72afc4'),runoff=particles(root,240,'#d1f5ff'),infiltration=particles(root,140,'#4287b3'),vapor=particles(root,120,'#cce4ee')
  return {root,dispose,update(v,t){
    waterTime(root,t);cutface.visible=!!v.section;root.traverse(o=>{if(o.isMesh&&!o.userData.cutface&&o.userData.lastSection!==!!v.section){o.material.clippingPlanes=v.section?[plane]:null;o.material.clipShadows=true;o.material.needsUpdate=true;o.userData.lastSection=!!v.section}});const land=v.land/100
    root.traverse(o=>{if(o.isInstancedMesh){o.count=Math.floor((35+65*land)*2);o.instanceMatrix.needsUpdate=true}})
    sprites.forEach((c,i)=>{c.position.set(-3+(i%4)*2,3.2+Math.sin(i)*.2,-2+Math.floor(i/4)*3);c.scale.set(4,2,1);c.material.opacity=.5})
    let p=rain.geometry.attributes.position
    for(let i=0;i<p.count;i++){const x=Math.sin(i*71.3)*5.6,z=Math.cos(i*53.7)*3.8,h=watershedHeight(x,z),f=(t*.65+i/460)%1;p.setXYZ(i,x,h+(1-f)*3.2,z)}p.needsUpdate=true
    p=runoff.geometry.attributes.position
    for(let i=0;i<p.count;i++){
      const f=(t*(.08+.1*(1-land))+i/240)%1,z=-4+f*8
      const lateral=(Math.sin(i*18.3)*4.5)*(1-f)**3*(1-land)
      const x=riverCenter(z)+lateral
      p.setXYZ(i,x,watershedHeight(x,z)+.06,z)
    }p.needsUpdate=true;runoff.material.opacity=.2+(1-land)*.65
    p=infiltration.geometry.attributes.position
    for(let i=0;i<p.count;i++){const x=Math.sin(i*53.1)*5.3,z=v.section?.04:Math.cos(i*27.1)*3.5;p.setXYZ(i,x,watershedHeight(x,v.section?0:z)-((t*.35+i/140)%1)*.9,z)}p.needsUpdate=true;infiltration.visible=v.section||v.overlays;infiltration.material.opacity=land*.75
    p=vapor.geometry.attributes.position
    for(let i=0;i<p.count;i++){const z=-4+8*i/p.count,x=riverCenter(z),h=watershedHeight(x,z);p.setXYZ(i,x+Math.sin(t+i)*.14,h+((t*.2+i/p.count)%1)*2.3,z)}p.needsUpdate=true;vapor.material.opacity=v.solar/200
  }}
}
function volcanoHeight(x,z){const r=Math.hypot(x,z),a=Math.atan2(-z,x);return -.9+3.25*Math.exp(-((r/2)**1.45))-.78*Math.exp(-((r/.46)**4))+.16*(Math.sin(a*15+r*3.2)+.45*Math.sin(a*27))*Math.min(r,1)*Math.exp(-r/3)+.04*Math.sin(x*14-z*11)}
export function buildVolcanicProcess(scene,onStatus){
  const root=new THREE.Group();scene.add(root);const parts=[]
  const dispose=loadLandscape(root,'volcano-landscape-v2',onStatus,(model)=>model.traverse(o=>{if(o.isMesh){parts.push(o);if(o.userData.role==='volcano_section')o.material.side=THREE.DoubleSide}}))
  const ashGroup=new THREE.Group();root.add(ashGroup);const ash=clouds(ashGroup,36,'#6d6962')
  const lavaGroup=new THREE.Group();root.add(lavaGroup)
  const lavaCurves=[]
  for(let k=0;k<3;k++){
    const points=Array.from({length:100},(_,i)=>{const r=.32+i/99*3.9,a=-.45+k*.65+Math.sin(r*2+k)*.07,x=Math.sin(a)*r,z=Math.cos(a)*r;return new THREE.Vector3(x,volcanoHeight(x,z)+.045,z)})
    const curve=new THREE.CatmullRomCurve3(points)
    const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,160,.045,6,false),new THREE.MeshStandardMaterial({color:'#ac3516',emissive:'#f76b21',emissiveIntensity:1.4,roughness:.5}));lavaGroup.add(mesh);lavaCurves.push(mesh)
  }
  const embers=particles(root,240,'#ffc384')
  return {dispose,update(v,t){
    root.visible=v.mode==='volcano';const explosive=v.gas+v.viscosity>125,progress=v.stage/100
    parts.forEach(o=>{const role=o.userData.role;o.visible=role==='volcano'?!(v.section&&Number(o.userData.half)===0):role==='magma'||role==='volcano_section'?!!v.section:true})
    ashGroup.visible=explosive&&progress>.06
    ash.forEach((c,i)=>{const f=(t*.08+i/36)%1,spread=.2+f*f*(1+v.gas/50);c.position.set(Math.sin(i*37.2)*spread+f*.65,1.8+f*(1+v.gas/25)*progress,Math.cos(i*18.7)*spread);c.scale.setScalar(.5+f*(1.2+v.gas/60));c.material.opacity=(1-f)*.32*progress})
    lavaGroup.visible=!explosive;lavaCurves.forEach(mesh=>mesh.geometry.setDrawRange(0,Math.floor(mesh.geometry.index.count*progress/(.5+v.viscosity/100))))
    const p=embers.geometry.attributes.position
    for(let i=0;i<p.count;i++){const f=(t*.3+i/p.count)%1,a=i*2.4,speed=.5+v.gas/80,r=f*speed;p.setXYZ(i,Math.sin(a)*r,1.8+f*2.5*speed-f*f*3,Math.cos(a)*r)}p.needsUpdate=true;embers.visible=explosive&&progress>.1
  }}
}

export const QUAKE_STATIONS=[[-2.2,1],[2,1.1],[0,-2.2]]
export function quakeStationDistance(x,z){const y=watershedHeight(x,z)*.015;return Math.hypot(x,z,y+.2)}
export function buildSeismicProcess(scene,onStatus){
  const root=new THREE.Group();scene.add(root);const terrain=new THREE.Group();terrain.scale.set(1,.015,1);terrain.position.y=0;root.add(terrain)
  const dispose=loadLandscape(terrain,'watershed-landscape-v2',onStatus)
  const source=new THREE.Vector3(0,-.2,0)
  const origin=new THREE.Mesh(new THREE.SphereGeometry(.055,16,12),new THREE.MeshBasicMaterial({color:'#db7349'}));origin.position.copy(source);root.add(origin)
  const waves=['#b86b34','#287d9b'].map(color=>{const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,64,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.13,side:THREE.DoubleSide,depthWrite:false}));mesh.position.copy(source);root.add(mesh);return mesh})
  const monitors=QUAKE_STATIONS.map(([x,z],i)=>{
    const y=watershedHeight(x,z)*.015,group=station(root,x,z,y,i+1)
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(.045,12,8),new THREE.MeshBasicMaterial({color:'#788c90'}));lamp.position.y=.55;group.add(lamp)
    return {lamp,distance:quakeStationDistance(x,z)}
  })
  const circles=QUAKE_STATIONS.map(([x,z],i)=>{
    const radius=Math.hypot(x,z),points=Array.from({length:161},(_,j)=>{
      const a=j/160*Math.PI*2,px=x+radius*Math.cos(a),pz=z+radius*Math.sin(a)
      return new THREE.Vector3(px,watershedHeight(px,pz)*.015+.04,pz)
    })
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:['#b6632c','#227d99','#487a40'][i],transparent:true,opacity:.9}));root.add(line);return line
  })
  return {dispose,update(v,t){root.visible=v.mode==='quake';const p=v.stage/100*6,s=p*3.5/6
    waves[0].scale.setScalar(Math.max(.03,p));waves[1].scale.setScalar(Math.max(.03,s));waves.forEach(w=>w.visible=v.section||v.overlays)
    origin.visible=!!v.section
    const amplitude=THREE.MathUtils.clamp(10**(v.energy-6)*.008,.0001,.06)
    terrain.position.x=Math.sin(t*16)*amplitude*(p>1&&p<5?1:0)
    monitors.forEach(({lamp,distance},i)=>{lamp.material.color.set(s>=distance?'#2b9b75':p>=distance?'#d49137':'#788c90');circles[i].visible=!!v.overlays&&s>=distance})
  }}
}

export function buildCirculationLandscape(scene,onStatus) {
  const global=new THREE.Group(),coast=new THREE.Group();scene.add(global,coast)
  const ground=scene.getObjectByName('lab-ground')
  const globeMap=new THREE.TextureLoader().load('/picture/experiments/required/world-map.jpg');globeMap.colorSpace=THREE.SRGBColorSpace
  const globe=new THREE.Mesh(new THREE.SphereGeometry(2.7,96,64),new THREE.MeshStandardMaterial({map:globeMap,color:'#bac9dd',roughness:.95,envMapIntensity:.25}));global.add(globe)
  const cellColors=['#20c8ed','#ffac45','#b38aff'].map(c=>new THREE.Color(c))
  const flow=particles(global,360,'#ffffff'),loops=[]
  flow.material.size=.085;flow.material.opacity=.95;flow.material.toneMapped=false;flow.material.vertexColors=true
  const flowColors=new Float32Array(360*3)
  for(let i=0;i<360;i++) cellColors[Math.floor(i/2)%3].toArray(flowColors,i*3)
  flow.geometry.setAttribute('color',new THREE.BufferAttribute(flowColors,3))
  const xyz=(lat,lon,r)=>{
    lat=THREE.MathUtils.clamp(lat,-Math.PI/2+.002,Math.PI/2-.002)
    return new THREE.Vector3(r*Math.cos(lat)*Math.sin(lon),r*Math.sin(lat),r*Math.cos(lat)*Math.cos(lon))
  }
  const onCell=(hemisphere,cell,meridian,a,shift)=>xyz(hemisphere*(cell*30+15+14.5*Math.cos(a))*Math.PI/180+shift,meridian*Math.PI/2+.25,2.76+.48*(1+Math.sin(a))*.5)
  for(const hemisphere of [-1,1]) for(let cell=0;cell<3;cell++) for(let meridian=0;meridian<4;meridian++) {
    const vertices=Array.from({length:81},(_,i)=>onCell(hemisphere,cell,meridian,i/80*Math.PI*2,0)).flatMap(p=>p.toArray())
    const geometry=new LineGeometry().setPositions(vertices)
    const line=new Line2(geometry,new LineMaterial({color:cellColors[cell],linewidth:2.8,toneMapped:false}))
    line.onBeforeRender=renderer=>renderer.getSize(line.material.resolution)
    line.frustumCulled=false;global.add(line)
    const arrows=[Math.PI/2,Math.PI*1.5].map(a=>{
      const arrow=new THREE.ArrowHelper(new THREE.Vector3(0,1,0),new THREE.Vector3(),.22,cellColors[cell],.13,.09)
      arrow.line.material.toneMapped=false;arrow.cone.material.toneMapped=false;global.add(arrow)
      return {arrow,a}
    })
    loops.push({line,arrows,hemisphere,cell,meridian})
  }
  const land=new THREE.Group();land.scale.set(.6,.55,.82);land.position.set(2.5,-1,0);coast.add(land)
  const dispose=loadLandscape(land,'watershed-landscape-v2',onStatus)
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(6.8,7.1,50,40),new THREE.MeshPhysicalMaterial({color:'#205c74',roughness:.2,metalness:.1,clearcoat:1,envMapIntensity:.55}));sea.rotation.x=-Math.PI/2;sea.position.set(-3.5,-1.38,0);coast.add(sea)
  const air=particles(coast,360,'#1b67cb');air.material.size=.09;air.material.toneMapped=false
  const cg=new THREE.Group();coast.add(cg);const cloud=clouds(cg,8)
  let previousShift=null,previousMode=null,previousThreeCells=null
  return {dispose,update(v,t) {
    waterTime(coast,t);global.visible=v.mode==='global';coast.visible=v.mode==='monsoon'
    if(previousMode!==v.mode) {
      scene.background.set(v.mode==='global'?'#0c1e37':'#b9cbd9');scene.fog.color.copy(scene.background)
      if(ground) ground.visible=v.mode==='monsoon'
      previousMode=v.mode
    }
    const shift=v.day*.3*Math.PI/180,rotation=v.rotation/100
    const threeCells=rotation>.05
    if(previousThreeCells!==threeCells) {
      const colors=flow.geometry.attributes.color
      for(let i=0;i<colors.count;i++) colors.setXYZ(i,...cellColors[threeCells?Math.floor(i/2)%3:0].toArray())
      colors.needsUpdate=true;previousThreeCells=threeCells
    }
    loops.forEach(({line,arrows,hemisphere,cell,meridian})=>{
      line.visible=v.overlays&&rotation>.05
      arrows.forEach(({arrow})=>{arrow.visible=line.visible})
      if(previousShift===shift) return
      const start=line.geometry.attributes.instanceStart,end=line.geometry.attributes.instanceEnd
      for(let i=0;i<80;i++) {
        const p0=onCell(hemisphere,cell,meridian,i/80*Math.PI*2,shift),p1=onCell(hemisphere,cell,meridian,(i+1)/80*Math.PI*2,shift)
        start.setXYZ(i,p0.x,p0.y,p0.z);end.setXYZ(i,p1.x,p1.y,p1.z)
      }
      start.data.needsUpdate=true
      arrows.forEach(({arrow,a})=>{
        const direction=cell===1?1:-1
        const p0=onCell(hemisphere,cell,meridian,a,shift),p1=onCell(hemisphere,cell,meridian,a+.025*direction,shift)
        arrow.position.copy(p0);arrow.setDirection(p1.sub(p0).normalize())
      })
    })
    previousShift=shift
    let p=flow.geometry.attributes.position
    for(let i=0;i<p.count;i++) {
      const hemisphere=i%2?1:-1,cell=rotation>.05?Math.floor(i/2)%3:0,meridian=Math.floor(i/6)%4
      // Hadley and polar cells rise equatorward; the Ferrel cell reverses.
      const a=t*.36*(cell===1?1:-1)+Math.floor(i/24)*.71
      const lat=rotation>.05?hemisphere*(cell*30+15+14.5*Math.cos(a))*Math.PI/180+shift:hemisphere*(45+44*Math.cos(a))*Math.PI/180
      const r=2.76+.48*(1+Math.sin(a))*.5
      p.setXYZ(i,...xyz(lat,meridian*Math.PI/2+.25,r).toArray())
    }
    p.needsUpdate=true
    const summer=v.day>=0,strength=v.contrast/100
    air.material.color.set(summer?'#1766cc':'#bd621b');air.material.opacity=.45+strength*.5
    p=air.geometry.attributes.position
    for(let i=0;i<p.count;i++) {
      const a=(t*(.1+strength*.6)+i*.35)*(summer?1:-1),x=Math.cos(a)*4.4,y=-1.1+(1+Math.sin(a))*.9
      p.setXYZ(i,x,y,Math.sin(i*14)*2.9)
    }
    p.needsUpdate=true
    cloud.forEach((c,i)=>{
      c.position.set((summer?2.8:-2.9)+(i%4-1.5)*.8,1.3+Math.floor(i/4)*.15,Math.sin(i*11)*2)
      c.scale.set(2.7,1.5,1);c.material.opacity=.25+strength*.45
    })
    const q=sea.geometry.attributes.position
    for(let i=0;i<q.count;i++) q.setZ(i,.025*Math.sin(q.getX(i)*5+t*1.4)+.016*Math.cos(q.getY(i)*7+t))
    q.needsUpdate=true;sea.geometry.computeVertexNormals()
  }}
}

export function buildOceanBasin(root,onStatus) { return loadLandscape(root,'ocean-basin-v2',onStatus) }
