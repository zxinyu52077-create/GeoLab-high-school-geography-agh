"""Blender-authored textured environments. Run in Blender Python Console.
Coordinate convention: Blender Z up -> exported glTF Y up.
Albedo is AI-authored, not a photograph or remotely sensed material.
"""
import bpy, math, os, random, json
from mathutils import Vector
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
OUT = os.path.join(ROOT, 'public/picture/experiments/twin')
os.makedirs(OUT, exist_ok=True)
scene = bpy.data.scenes.new('GeoSim Textured Teaching Landscapes')
bpy.context.window.scene = scene
ground_image=bpy.data.images.load(os.path.join(OUT,'upland-albedo.png'),check_existing=True)
atlas = bpy.data.images.load(os.path.join(OUT, 'geological-albedo-atlas.png'), check_existing=True)

def mat(name, tile, tint=(1,1,1,1)):
    m=bpy.data.materials.new(name); m.use_nodes=True; m.diffuse_color=tint
    ns=m.node_tree.nodes; ls=m.node_tree.links
    bs=next((n for n in ns if n.type=='BSDF_PRINCIPLED'),None) or ns.new('ShaderNodeBsdfPrincipled')
    op=next((n for n in ns if n.type=='OUTPUT_MATERIAL'),None) or ns.new('ShaderNodeOutputMaterial')
    ls.new(bs.outputs['BSDF'],op.inputs['Surface'])
    tex=ns.new('ShaderNodeTexImage'); tex.image=ground_image if tile==2 else atlas
    ls.new(tex.outputs['Color'],bs.inputs['Base Color']); bs.inputs['Roughness'].default_value=.92
    bump=ns.new('ShaderNodeBump'); bump.inputs['Strength'].default_value=.10; bump.inputs['Distance'].default_value=.012
    ls.new(tex.outputs['Color'],bump.inputs['Height']); ls.new(bump.outputs['Normal'],bs.inputs['Normal'])
    m['atlas_tile']=tile
    return m
mats=[mat('Weathered sandstone',0),mat('Laminated limestone',1),mat('Meadow ground',2),mat('Porous basalt',3)]

def mesh_obj(name, verts, faces, tile=0, role='', **extras):
    mesh=bpy.data.meshes.new(name); mesh.from_pydata(verts,[],faces); mesh.update()
    obj=bpy.data.objects.new(name,mesh); scene.collection.objects.link(obj); mesh.materials.append(mats[tile])
    uv=mesh.uv_layers.new(name='UVMap')
    # Face-dependent projection keeps texture readable on cut faces and terrain.
    for p in mesh.polygons:
        n=p.normal
        for li in p.loop_indices:
            x,y,z=mesh.vertices[mesh.loops[li].vertex_index].co
            if abs(n.z)>.5: u,v=(x+6)/12,(y+4)/8
            elif abs(n.y)>.5: u,v=(x+6)/12,(z+2)/5
            else: u,v=(y+4)/8,(z+2)/5
            # Atlas row order: top sandstone/limestone, bottom meadow/basalt.
            uv.data[li].uv=(u,v) if tile==2 else (.004+(tile%2)*.5+max(0,min(1,u))*.492,
                            .004+(0 if tile>=2 else .5)+max(0,min(1,v))*.492)
        p.use_smooth=abs(n.z)>.5
    obj['role']=role;obj['ground_uv_normalized']=tile==2
    for k,v in extras.items(): obj[k]=v
    return obj

def grid(name, func, xmin=-6,xmax=6,ymin=-4,ymax=4,nx=120,ny=80,tile=2,role='landscape',**extras):
    vs=[]; fs=[]
    for j in range(ny+1):
        y=ymin+(ymax-ymin)*j/ny
        for i in range(nx+1):
            x=xmin+(xmax-xmin)*i/nx; vs.append((x,y,func(x,y)))
    for j in range(ny):
        for i in range(nx):
            a=j*(nx+1)+i; fs.append((a,a+1,a+nx+2,a+nx+1))
    return mesh_obj(name,vs,fs,tile,role,**extras)

def export(name,objects):
    for o in scene.objects: o.select_set(False)
    for o in objects: o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,name+'.glb'),export_format='GLB',export_image_format='NONE',use_selection=True,use_active_scene=True,export_extras=True,export_apply=False)

# Closed, independently sampled strata: the web model truncates each bed at
# the erosion surface. Every exposed surface therefore retains its age.
geology=[]
for half,(y0,y1) in enumerate([(-3.4,0),(0,3.4)]):
    for level in range(6):
        nx,ny=100,20; top=1.5-level*.6; bottom=top-.6; vs=[];fs=[]
        for j in range(ny+1):
            for i in range(nx+1):
                x=-6+12*i/nx; y=y0+(y1-y0)*j/ny; vs.extend([(x,y,top),(x,y,bottom)])
        idx=lambda i,j,b=0:2*(j*(nx+1)+i)+b
        for j in range(ny):
            for i in range(nx):
                fs.append((idx(i,j),idx(i+1,j),idx(i+1,j+1),idx(i,j+1)))
                fs.append((idx(i,j,1),idx(i,j+1,1),idx(i+1,j+1,1),idx(i+1,j,1)))
        for i in range(nx):
            fs.append((idx(i,0),idx(i,0,1),idx(i+1,0,1),idx(i+1,0)))
            fs.append((idx(i+1,ny),idx(i+1,ny,1),idx(i,ny,1),idx(i,ny)))
        for j in range(ny):
            fs.append((idx(0,j+1),idx(0,j+1,1),idx(0,j,1),idx(0,j)))
            fs.append((idx(nx,j),idx(nx,j,1),idx(nx,j+1,1),idx(nx,j+1)))
        geology.append(mesh_obj(f'Bed_{level+1}_Half_{half}',vs,fs,level%2,'stratum',level=level,half=half))
    geology.append(grid(f'Landcover_Half_{half}',lambda x,y:1.5,ymin=y0,ymax=y1,nx=120,ny=40,role='landcover',half=half))
export('tectonic-landscape-v2',geology)

# Watershed with longitudinal gradient, incised meander, tributary ravines,
# coherent stream coordinates. World x controls cross-valley distance.
def river_x(y): return .62*math.sin(y*.92)+.18*math.sin(y*2.1)
def relief(x,y):
    d=abs(x-river_x(y)); slope=.10*(y+4)
    hill=1.75*(1-math.exp(-d*d/3.8))
    ridge=.32*math.sin(x*1.7+y*.5)+.17*math.cos(y*2.8-x)
    rugged=.07*math.sin(x*13+y*8)*math.cos(y*11-x*7)
    return -.9+slope+hill+(ridge+rugged)*min(1,max(0,(d-.28)/1.2))
terrain=grid('Watershed_surface',relief,role='watershed')
# Cut soil walls down to datum.
vs=[];fs=[]
for edges in [[(-6,-4+8*i/80) for i in range(81)],[(6,-4+8*i/80) for i in range(81)],[(-6+12*i/120,-4) for i in range(121)],[(-6+12*i/120,4) for i in range(121)]]:
    start=len(vs)
    for x,y in edges: vs.extend([(x,y,relief(x,y)),(x,y,-2.1)])
    for i in range(len(edges)-1): a=start+2*i;fs.append((a,a+1,a+3,a+2))
soil=mesh_obj('Watershed_soil_section',vs,fs,0,'soil')
vs=[];fs=[]
for j in range(181):
    y=-4+8*j/180; x=river_x(y)
    for k in range(7):
        xx=x+(k/6-.5)*.40; vs.append((xx,y,-.865+.10*(y+4)))
for j in range(180):
    for k in range(6): a=j*7+k;fs.append((a,a+1,a+8,a+7))
water=mesh_obj('Watershed_river',vs,fs,1,'water')
wm=bpy.data.materials.new('River water');wm.diffuse_color=(.07,.30,.33,1);wm.use_nodes=True
bs=next((n for n in wm.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None) or wm.node_tree.nodes.new('ShaderNodeBsdfPrincipled');wm.node_tree.links.new(bs.outputs['BSDF'],next(n for n in wm.node_tree.nodes if n.type=='OUTPUT_MATERIAL').inputs['Surface']);bs.inputs['Base Color'].default_value=(.07,.30,.33,1);bs.inputs['Roughness'].default_value=.18;bs.inputs['Metallic'].default_value=.12
water.data.materials.clear();water.data.materials.append(wm)
export('watershed-landscape-v2',[terrain,soil,water])

# Volcano is a sculpted radial terrain with a genuine crater depression,
# channel erosion, asymmetry, and a cut face (not a cone primitive).
def volcanic(x,y):
    r=math.hypot(x,y);a=math.atan2(y,x)
    mountain=3.25*math.exp(-((r/2.0)**1.45))
    crater=.78*math.exp(-(r/.46)**4)
    gullies=.16*(math.sin(a*15+r*3.2)+.45*math.sin(a*27))*min(r,1)*math.exp(-r/3)
    return -.9+mountain-crater+gullies+.04*math.sin(x*14+y*11)
volcano=[]
for half,(y0,y1) in enumerate([(-4,0),(0,4)]):
    volcano.append(grid(f'Volcano_surface_Half_{half}',volcanic,ymin=y0,ymax=y1,tile=3,role='volcano',half=half))
# Front interior follows profile, with distinct rock section and curved conduit.
vs=[];fs=[]
for i in range(181):
    x=-6+12*i/180; vs.extend([(x,0,volcanic(x,0)),(x,0,-1.8)])
for i in range(180): a=i*2; fs.append((a,a+1,a+3,a+2))
section=mesh_obj('Volcano_interior_section',vs,fs,0,'volcano_section');volcano.append(section)
# Curved volcanic plumbing from magma reservoir to crater; actual mesh tubing.
curve=bpy.data.curves.new('Magma feeder conduit','CURVE');curve.dimensions='3D';curve.bevel_depth=.13;curve.bevel_resolution=5
spline=curve.splines.new('BEZIER');spline.bezier_points.add(3)
for p,co in zip(spline.bezier_points,[(.35,-.015,-1.5),(.15,-.015,-.35),(-.12,-.015,.8),(0,-.015,1.7)]):p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
obj=bpy.data.objects.new('Magma_conduit',curve);scene.collection.objects.link(obj)
lava=bpy.data.materials.new('Incandescent magma');lava.diffuse_color=(1,.14,.012,1);lava.use_nodes=True
bs=next((n for n in lava.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None) or lava.node_tree.nodes.new('ShaderNodeBsdfPrincipled');lava.node_tree.links.new(bs.outputs['BSDF'],next(n for n in lava.node_tree.nodes if n.type=='OUTPUT_MATERIAL').inputs['Surface']);bs.inputs['Base Color'].default_value=(.65,.06,.005,1);bs.inputs['Emission Color'].default_value=(1,.18,.02,1);bs.inputs['Emission Strength'].default_value=2
obj.data.materials.append(lava);obj['role']='magma';volcano.append(obj)
bpy.ops.mesh.primitive_uv_sphere_add(segments=40,ring_count=24,location=(.35,-.02,-1.45))
reservoir=bpy.context.object;reservoir.name='Magma_reservoir';reservoir.scale=(.72,.1,.36);reservoir.data.materials.append(lava);reservoir['role']='magma';volcano.append(reservoir)
export('volcano-landscape-v2',volcano)

# Idealized ocean basin: sloping continental margins, shelf and irregular coast.
# Its depth is exaggerated for viewing the thermocline, not measured bathymetry.
def bathymetry(x,y):
    edge=5.35+.13*math.sin(y*1.3)+.08*math.sin(y*3.4)
    shelf=4.8/(1+math.exp(-(abs(x)-edge)*4.5))
    ridges=.14*math.sin(x*2.2+y*.9)*math.cos(y*2.1)
    return -2.45+shelf+ridges
basin=grid('Ocean_basin_floor',bathymetry,xmin=-6.7,xmax=6.7,ymin=-3,ymax=3,nx=180,ny=70,tile=3,role='seabed')
coasts=[]
for direction in [-1,1]:
    lo,hi=(-6.7,-5.72) if direction<0 else (5.72,6.7)
    coasts.append(grid('Pacific_margin_'+str(direction),lambda x,y:bathymetry(x,y)+.015,xmin=lo,xmax=hi,ymin=-3,ymax=3,nx=28,ny=70,tile=2,role='landcover'))
export('ocean-basin-v2',[basin]+coasts)

# Preserve native editable project and render a textured geology preview.
for obj in scene.objects: obj.hide_render=obj not in geology
# Same erosion/folding formula as browser. Closed beds cannot invert.
def deform(x,y,z,level=None):
    fold=1.45*.68*math.cos(x*.72)*math.exp(-x*x/48)
    noise=.018*math.sin(x*12+y*9)+.010*math.cos(x*21-y*13)
    terrain=1.5+fold+.11*math.sin(y*1.4+x*.65)+noise-2.85*.34*math.exp(-x*x/1.65)
    return terrain+.025 if level is None else min(z+fold,terrain)
for o in geology:
    for ve in o.data.vertices:
        x,y,z=ve.co;ve.co.z=deform(x,y,z,o.get('level') if o.get('role')=='stratum' else None)
    o.data.update()
# Cut away the near half to expose intact section.
for o in geology:
    if o.get('half')==0:o.hide_render=True
# Crossed photographic foliage cards complement authored terrain geometry.
tree_image=bpy.data.images.load(os.path.join(OUT,'broadleaf-tree.png'),check_existing=True)
tree_mat=bpy.data.materials.new('Photographic broadleaf foliage');tree_mat.use_nodes=True
ns=tree_mat.node_tree.nodes;ls=tree_mat.node_tree.links
bs=next((n for n in ns if n.type=='BSDF_PRINCIPLED'),None) or ns.new('ShaderNodeBsdfPrincipled')
output=next((n for n in ns if n.type=='OUTPUT_MATERIAL'),None) or ns.new('ShaderNodeOutputMaterial')
tx=ns.new('ShaderNodeTexImage');tx.image=tree_image;ls.new(tx.outputs['Color'],bs.inputs['Base Color']);ls.new(tx.outputs['Alpha'],bs.inputs['Alpha']);ls.new(bs.outputs[0],output.inputs[0]);bs.inputs['Roughness'].default_value=1
for i in range(38):
    x=math.sin(i*43.31+1)*5.7;y=.15+(math.sin(i*27.91+2)+1)*1.5
    if abs(x)<1.35:continue
    h=.3+(math.sin(i*7.1)+1)*.18
    for side in range(2):
        mesh=bpy.data.meshes.new('Foliage card');mesh.from_pydata([(-h*.4,0,0),(h*.4,0,0),(h*.4,0,h),(-h*.4,0,h)],[],[(0,1,2,3)]);mesh.materials.append(tree_mat)
        uv=mesh.uv_layers.new();
        for j,xy in enumerate([(0,0),(1,0),(1,1),(0,1)]):uv.data[j].uv=xy
        o=bpy.data.objects.new('Landscape broadleaf tree',mesh);scene.collection.objects.link(o);o.location=(x,y,deform(x,y,1.5)+.012);o.rotation_euler.z=i*2.71+side*math.pi/2
world=bpy.data.worlds.new('Daylight');world.use_nodes=True
bg=next((n for n in world.node_tree.nodes if n.type=='BACKGROUND'),None) or world.node_tree.nodes.new('ShaderNodeBackground')
wo=next((n for n in world.node_tree.nodes if n.type=='OUTPUT_WORLD'),None) or world.node_tree.nodes.new('ShaderNodeOutputWorld')
world.node_tree.links.new(bg.outputs[0],wo.inputs[0]);bg.inputs[0].default_value=(.58,.70,.82,1);bg.inputs[1].default_value=.65;scene.world=world
for name,pos,power,size in [('Sun softbox',(-4,-8,12),1700,7),('Sky fill',(5,3,9),900,8)]:
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size
    o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.location=pos;o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat('-Z','Y').to_euler()
camdata=bpy.data.cameras.new('Landscape camera');cam=bpy.data.objects.new('Landscape camera',camdata);scene.collection.objects.link(cam);cam.location=(11,-14,10);cam.rotation_euler=(Vector((0,.3,.1))-cam.location).to_track_quat('-Z','Y').to_euler();camdata.type='ORTHO';camdata.ortho_scale=15;scene.camera=cam
scene.render.engine='CYCLES';scene.cycles.samples=32;scene.render.resolution_x=1400;scene.render.resolution_y=950;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.filepath=os.path.join(ROOT,'docs/previews/blender-geology-v2.png');scene.render.film_transparent=False
atlas.pack();ground_image.pack();tree_image.pack()
bpy.data.libraries.write(os.path.join(ROOT,'scripts/blender/geosim-textured-landscapes.blend'),{scene},fake_user=True)
with open(os.path.join(OUT,'authorship.json'),'w') as f: json.dump({'software':bpy.app.version_string,'source':'Blender authored terrain, AI generated albedo','assets':['tectonic-landscape-v2.glb','watershed-landscape-v2.glb','volcano-landscape-v2.glb','ocean-basin-v2.glb'],'calibration':'Teaching idealization; no surveyed location or observation calibration'},f,indent=2)
if not globals().get('GEOSIM_SKIP_RENDER',False): bpy.ops.render.render(write_still=True)
print('GEOSIM_TEXTURED_SCENES_COMPLETE')
