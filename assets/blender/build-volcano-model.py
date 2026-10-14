import bpy
import math
from mathutils import Vector

OUTPUT = '/Users/zhuqingmeng/Desktop/本科/GeoSim：高中地理核心知识点AI交互仿真教学平台/public/picture/experiments/volcano-cutaway.glb'
SEGMENTS = 96
created = []
old_selection = list(bpy.context.selected_objects)

def material(name, color, metallic=0.0, roughness=0.78):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    output = nodes.new('ShaderNodeOutputMaterial')
    mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    return mat

rock = material('Volcanic basalt and ash', (0.19, 0.22, 0.23))
dark = material('Crater interior', (0.055, 0.065, 0.07))
strata = material('Layered volcanic deposits', (0.39, 0.29, 0.20))
magma = material('Molten magma', (0.95, 0.16, 0.025), 0.05, 0.36)
lava = material('Lava surface', (1.0, 0.30, 0.035), 0.0, 0.44)
ash = material('Eruption ash plume', (0.31, 0.35, 0.37))
ground = material('Basalt platform', (0.11, 0.14, 0.15))

def add_obj(obj):
    created.append(obj)
    return obj

def lathe_volcano():
    # Cross-section rings run from the open crater floor, over its rim, down the cone.
    profile = [
        (0.34, 3.28), (0.62, 3.34), (0.92, 3.48), (1.10, 3.62),
        (1.27, 3.58), (1.48, 3.43), (1.72, 3.15), (2.08, 2.78),
        (2.48, 2.28), (2.95, 1.65), (3.40, 0.98), (3.78, 0.38), (4.05, 0.12),
    ]
    verts, faces, face_profile = [], [], []
    for ring, (radius, z) in enumerate(profile):
        for i in range(SEGMENTS):
            a = math.tau * i / SEGMENTS
            rough = 1 + 0.025 * math.sin(a * 7 + ring * 0.7) + 0.012 * math.sin(a * 17 - ring)
            verts.append((math.cos(a) * radius * rough, math.sin(a) * radius * rough, z + 0.025 * math.sin(a * 5 + ring)))
    for ring in range(len(profile) - 1):
        for i in range(SEGMENTS):
            a = ring * SEGMENTS + i
            b = ring * SEGMENTS + (i + 1) % SEGMENTS
            c = (ring + 1) * SEGMENTS + (i + 1) % SEGMENTS
            d = (ring + 1) * SEGMENTS + i
            faces.append((a, b, c, d))
            face_profile.append(ring)
    mesh = bpy.data.meshes.new('Volcano terrain mesh')
    mesh.from_pydata(verts, [], faces)
    mesh.materials.append(rock)
    mesh.materials.append(dark)
    mesh.materials.append(strata)
    obj = add_obj(bpy.data.objects.new('Composite stratovolcano and crater bowl', mesh))
    bpy.context.collection.objects.link(obj)
    for poly, ring in zip(mesh.polygons, face_profile):
        poly.material_index = 1 if ring < 3 else 2 if ring in (6, 8, 10) else 0
        poly.use_smooth = ring >= 4
    return obj

def uv_sphere(name, location, scale, mat, segments=40, rings=24):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(mat)
    for p in obj.data.polygons:
        p.use_smooth = True
    return add_obj(obj)

def tube(name, points, radius, mat, bevel=0.06):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.resolution_u = 2
    curve.bevel_depth = bevel
    curve.bevel_resolution = 3
    spline = curve.splines.new('POLY')
    spline.points.add(len(points) - 1)
    for p, co in zip(spline.points, points):
        p.co = (*co, 1)
    obj = add_obj(bpy.data.objects.new(name, curve))
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    return obj

def add_lava_flow(angle, length, width):
    verts, faces = [], []
    for step in range(24):
        t = step / 23
        r = 1.22 + length * t
        a = angle + 0.045 * math.sin(t * 9)
        w = width * (1 - 0.42 * t) * (1 + 0.08 * math.sin(t * 17))
        for side in (-1, 1):
            aa = a + side * w / r
            z = max(0.16, 3.58 - 3.48 * (r - 1.27) / 2.8)
            verts.append((math.cos(aa) * r, math.sin(aa) * r, z + 0.035))
    for i in range(23):
        faces.append((2*i, 2*i+1, 2*i+3, 2*i+2))
    mesh = bpy.data.meshes.new('Lava flow mesh')
    mesh.from_pydata(verts, [], faces)
    mesh.materials.append(lava)
    obj = add_obj(bpy.data.objects.new('Lava flow', mesh))
    bpy.context.collection.objects.link(obj)

def add_plume():
    # Irregular, vertically billowing ash cloud built from overlapping soft volumes.
    uv_sphere('Ash column lower', (0, 0, 4.20), (0.48, 0.46, 0.82), ash)
    uv_sphere('Ash column upper', (0.04, 0.01, 5.05), (0.64, 0.58, 0.62), ash)
    uv_sphere('Ash plume billow left', (-0.43, -0.02, 5.42), (0.61, 0.56, 0.49), ash)
    uv_sphere('Ash plume billow right', (0.48, 0.04, 5.48), (0.66, 0.57, 0.53), ash)
    uv_sphere('Ash plume crown', (0.04, 0.0, 5.82), (0.67, 0.56, 0.40), ash)

def create_model():
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, -0.12))
    base = bpy.context.object
    base.name = 'Basalt display plinth'
    base.dimensions = (9.1, 9.1, 0.32)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    base.data.materials.append(ground)
    bevel = base.modifiers.new('Soft platform edges', 'BEVEL')
    bevel.width = 0.14
    bevel.segments = 3
    base.modifiers.new('Weighted corner normals', 'WEIGHTED_NORMAL')
    add_obj(base)

    lathe_volcano()
    # Cutaway evidence: magma chamber and feeder conduit exposed on the near face.
    uv_sphere('Shallow magma chamber', (0.1, -0.60, 1.02), (0.95, 0.70, 0.52), magma)
    tube('Central feeder conduit', [(0.1, -0.58, 1.25), (0.0, -0.42, 1.9), (0.0, -0.25, 2.55), (0.0, 0.0, 3.25)], 0.18, magma, 0.16)
    for i, angle in enumerate((0.28, 2.36, 4.4)):
        add_lava_flow(angle, 2.2 + (i % 2) * 0.45, 0.14)
    add_plume()
    uv_sphere('Volcanic gas glow', (0.0, 0.0, 3.54), (0.34, 0.34, 0.18), lava, 32, 16)

    bpy.ops.object.select_all(action='DESELECT')
    for obj in created:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = created[0]
    bpy.ops.export_scene.gltf(filepath=OUTPUT, export_format='GLB', use_selection=True, export_apply=True)

    # Keep the user's open river-valley scene intact after exporting the additional asset.
    for obj in created:
        bpy.data.objects.remove(obj, do_unlink=True)
    for obj in old_selection:
        if obj.name in bpy.data.objects:
            obj.select_set(True)
    if old_selection:
        bpy.context.view_layer.objects.active = old_selection[0]

create_model()
