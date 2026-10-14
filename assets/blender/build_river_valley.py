import bpy
import math
import os
from mathutils import Vector

ROOT = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(ROOT))
OUT_GLB = os.path.join(PROJECT_ROOT, 'public/picture/experiments/river-valley-terrain.glb')
OUT_BLEND = os.path.join(ROOT, 'river-valley.blend')
os.makedirs(os.path.dirname(OUT_GLB), exist_ok=True)

# Start from a clean scene so repeated runs do not accumulate duplicate meshes.
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

NX, NZ = 181, 181
XMAX = ZMAX = 12.5
BASE_SLOPE = 62
BASE_LEVEL = 52
BASE_VEGETATION = 52

def path_x(z):
    return math.sin(z * 0.49) * 1.15 + math.sin(z * 0.96 + 0.7) * 0.3

def height_at(x, z, slope=BASE_SLOPE, base=BASE_LEVEL, vegetation=BASE_VEGETATION):
    upstream = (z + ZMAX) / (2 * ZMAX)
    base_elevation = -0.72 + upstream * (1.2 + (100 - base) / 100 * 0.5)
    center = path_x(z)
    distance = abs(x - center)
    valley_width = 2.2 + (1 - upstream) * 1.7
    relief = 0.62 + slope / 100 * 1.45
    slope_wall = relief * min(1.0, (distance / valley_width) ** 0.82)
    incision = 0.42 * math.exp(-((x - center) ** 2) / (2 * 0.52 ** 2))
    # Multi-scale ridges make the surrounding relief read as a natural landscape at oblique scale.
    ridge = (0.13 * math.sin(x * 0.83 + z * 0.28) * math.sin(z * 0.61)
             + 0.065 * math.sin(x * 1.9 - z * 1.17)
             + 0.034 * math.sin(x * 4.1 + z * 3.3)
             + 0.018 * math.sin(x * 8.4 - z * 7.1))
    gullies = 0.055 * math.sin(z * 1.4 + x * 0.7) * min(1.0, distance / 3.5)
    roughness = (0.35 + (100 - vegetation) / 100 * 0.65)
    return base_elevation + slope_wall + ridge * roughness + gullies * roughness - incision

def ensure_principled(material):
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    bsdf = nodes.get('Principled BSDF') or nodes.new('ShaderNodeBsdfPrincipled')
    output = nodes.get('Material Output') or nodes.new('ShaderNodeOutputMaterial')
    if not any(link.from_node == bsdf and link.to_node == output for link in links):
        links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    return bsdf, nodes, links

verts = []
faces = []
colors = []
for j in range(NZ):
    z = -ZMAX + (2 * ZMAX) * j / (NZ - 1)
    for i in range(NX):
        x = -XMAX + (2 * XMAX) * i / (NX - 1)
        y = height_at(x, z)
        verts.append((x, z, y))  # Blender Z-up; glTF loader maps this to Three.js Y-up.
        distance = abs(x - path_x(z))
        grade = min(1.0, distance / 4.2)
        upstream = (z + ZMAX) / (2 * ZMAX)
        h = y
        # Native vertex colors survive glTF export and distinguish valley floor, forested slopes, and exposed rock.
        if distance < 0.72:
            color = (0.47, 0.39, 0.25, 1.0)  # alluvial channel bed
        elif grade > 0.86 and upstream > 0.64:
            color = (0.44, 0.45, 0.40, 1.0)  # exposed high ridges
        elif grade < 0.42:
            color = (0.31, 0.40, 0.25, 1.0)  # vegetated valley shoulder
        else:
            variation = 0.035 * math.sin(x * 1.7 + z * 1.3)
            color = (0.38 + variation, 0.43 + variation, 0.29 + variation * 0.6, 1.0)
        colors.append(color)
        if i < NX - 1 and j < NZ - 1:
            a = j * NX + i
            b = a + 1
            c = a + NX
            d = c + 1
            # Winding upward in Blender Z-up.
            faces.append((a, b, c))
            faces.append((b, d, c))

mesh = bpy.data.meshes.new('RiverTerrainMesh')
mesh.from_pydata(verts, [], faces)
mesh.update()
color_attr = mesh.color_attributes.new(name='GeoColor', type='FLOAT_COLOR', domain='POINT')
for index, color in enumerate(colors):
    color_attr.data[index].color = color
terrain = bpy.data.objects.new('RiverTerrain', mesh)
bpy.context.collection.objects.link(terrain)
for polygon in mesh.polygons:
    polygon.use_smooth = True

mat = bpy.data.materials.new('Terrain | vertex-painted grass, alluvium, exposed rock')
mat.diffuse_color = (0.34, 0.42, 0.28, 1)
mat.use_nodes = True
bsdf, nodes, links = ensure_principled(mat)
bsdf.inputs['Roughness'].default_value = 0.92
color_node = nodes.new('ShaderNodeVertexColor')
color_node.layer_name = 'GeoColor'
links.new(color_node.outputs['Color'], bsdf.inputs['Base Color'])
terrain.data.materials.append(mat)

# A separate named datum object gives the WebGL scene a real, draggable reference plane.
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, -1.45))
base = bpy.context.object
base.name = 'TerrainDatum'
base.dimensions = (25.0, 25.0, 0.65)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
base_mat = bpy.data.materials.new('Datum | layered sediment cutaway')
base_mat.diffuse_color = (0.49, 0.39, 0.25, 1)
base_mat.use_nodes = True
base_bsdf, _, _ = ensure_principled(base_mat)
base_bsdf.inputs['Base Color'].default_value = (0.34, 0.27, 0.18, 1)
base_bsdf.inputs['Roughness'].default_value = 1.0
base.data.materials.append(base_mat)

# Save a native project for continued Blender editing; export both named meshes for web use.
bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND)
bpy.ops.object.select_all(action='DESELECT')
terrain.select_set(True)
base.select_set(True)
bpy.context.view_layer.objects.active = terrain
bpy.ops.export_scene.gltf(filepath=OUT_GLB, export_format='GLB', use_selection=True,
                          export_apply=True, export_normals=True, export_texcoords=True,
                          export_vertex_color='NAME', export_vertex_color_name='GeoColor',
                          export_all_vertex_colors=True, export_attributes=True,
                          export_materials='EXPORT')
print('Wrote', OUT_BLEND, OUT_GLB)
