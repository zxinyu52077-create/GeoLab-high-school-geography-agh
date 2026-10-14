"""Author a morphable, layered tectonic block model in Blender and export GLB."""
import bpy
import math
import os

OUTPUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../public/picture/experiments/elective-folded-strata.glb"))
os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

palette = [
    ("Caprock ochre", (0.70, 0.39, 0.16, 1)),
    ("Sandstone", (0.80, 0.57, 0.30, 1)),
    ("Shale", (0.40, 0.31, 0.27, 1)),
    ("Limestone", (0.76, 0.72, 0.57, 1)),
    ("Mudstone", (0.55, 0.42, 0.32, 1)),
    ("Basement", (0.31, 0.34, 0.34, 1)),
]

def make_material(name, color):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = color
    mat.use_nodes = True
    bsdf = next((node for node in mat.node_tree.nodes if node.type == "BSDF_PRINCIPLED"), None)
    if bsdf is None:
        bsdf = mat.node_tree.nodes.new("ShaderNodeBsdfPrincipled")
    output = next((node for node in mat.node_tree.nodes if node.type == "OUTPUT_MATERIAL"), None)
    if output is None:
        output = mat.node_tree.nodes.new("ShaderNodeOutputMaterial")
    if not any(link.from_node == bsdf and link.to_node == output for link in mat.node_tree.links):
        mat.node_tree.links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = 0.86
    return mat

materials = [make_material(name, color) for name, color in palette]

def make_stratum(level, nx=96, nz=24):
    x0, x1 = -5.7, 5.7
    z0, z1 = -2.7, 2.7
    thickness = 0.54
    base_y = 1.36 - level * 0.59
    verts = []
    faces = []
    is_top = []
    coordinates = []

    def add_vertex(x, z, top, y_offset=0):
        y = base_y - (0 if top else thickness) + y_offset
        # Blender uses Z as vertical; the glTF exporter converts this to Y-up.
        verts.append((x, z, y))
        is_top.append(top)
        coordinates.append((x, z, y, top))
        return len(verts) - 1

    top_grid = []
    bottom_grid = []
    for iz in range(nz + 1):
        z = z0 + (z1 - z0) * iz / nz
        top_row = []
        bottom_row = []
        for ix in range(nx + 1):
            x = x0 + (x1 - x0) * ix / nx
            top_row.append(add_vertex(x, z, True))
            bottom_row.append(add_vertex(x, z, False))
        top_grid.append(top_row)
        bottom_grid.append(bottom_row)

    for iz in range(nz):
        for ix in range(nx):
            a, b = top_grid[iz][ix], top_grid[iz][ix + 1]
            c, d = top_grid[iz + 1][ix + 1], top_grid[iz + 1][ix]
            # The top surface lies in Blender's XY plane and faces +Z.
            faces.append((a, b, c, d))
            a, b = bottom_grid[iz][ix], bottom_grid[iz + 1][ix]
            c, d = bottom_grid[iz + 1][ix + 1], bottom_grid[iz][ix + 1]
            faces.append((a, b, c, d))

    # Close each exposed edge once. Repeating these faces for every grid cell
    # creates overlapping polygons that Blender's glTF exporter rejects.
    for ix in range(nx):
        faces.append((top_grid[0][ix], bottom_grid[0][ix], bottom_grid[0][ix + 1], top_grid[0][ix + 1]))
        faces.append((top_grid[-1][ix + 1], bottom_grid[-1][ix + 1], bottom_grid[-1][ix], top_grid[-1][ix]))
    # Close the left and right ends.
    for iz in range(nz):
        faces.append((top_grid[iz + 1][0], bottom_grid[iz + 1][0], bottom_grid[iz][0], top_grid[iz][0]))
        faces.append((top_grid[iz][nx], bottom_grid[iz][nx], bottom_grid[iz + 1][nx], top_grid[iz + 1][nx]))

    mesh = bpy.data.meshes.new(f"stratum-{level:02d}-mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.materials.append(materials[level])
    mesh.update()
    obj = bpy.data.objects.new(f"Stratum_{level + 1:02d}", mesh)
    bpy.context.collection.objects.link(obj)

    basis = obj.shape_key_add(name="Basis")
    compression = obj.shape_key_add(name="Compression")
    extension = obj.shape_key_add(name="Extension")
    fault = obj.shape_key_add(name="Fault")
    erosion = obj.shape_key_add(name="RiverErosion")

    scale = max(0.58, 1 - level * 0.065)
    for i, (x, z, y, top) in enumerate(coordinates):
        fold = math.cos(x * 0.72) * math.exp(-(x * x) / 42)
        compression.data[i].co.z = y + 1.08 * scale * fold
        extension.data[i].co.z = y - 0.9 * scale * fold
        extension.data[i].co.x = x + (x / 5.7) * 0.28
        # Extension opens a normal fault: the right-hand block drops.
        fault.data[i].co.z = y + (-0.82 * scale if x > 0 else 0.08 * scale)
        # A narrow incised valley lowers each exposed stratum progressively,
        # revealing the age sequence in section as erosion advances.
        channel = math.exp(-((x - 0.12) ** 2) / 0.74) * math.exp(-(z ** 2) / 3.4)
        erosion.data[i].co.z = y - (0.54 * channel if top else 0.04 * channel)

    for key in obj.data.shape_keys.key_blocks:
        key.value = 0
    compression.value = 0.68
    erosion.value = 0.34
    for poly in mesh.polygons:
        poly.use_smooth = False
    obj["layer_age_order"] = "Older layers are lower; the central anticline exposes older beds after erosion."
    obj["simulation_targets"] = "Compression, Extension, Fault, RiverErosion"
    return obj

for level in range(len(palette)):
    make_stratum(level)

# A dark, solid crystalline basement closes the lower block.
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, -1.96))
basement = bpy.context.object
basement.name = "Crystalline_Basement"
basement.dimensions = (11.4, 5.4, 0.5)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
basement.data.materials.append(materials[-1])

for obj in bpy.context.scene.objects:
    obj.select_set(obj.type == "MESH")
bpy.context.view_layer.objects.active = bpy.data.objects.get("Stratum_01")

bpy.ops.export_scene.gltf(
    filepath=OUTPUT,
    export_format="GLB",
    use_selection=True,
    export_apply=False,
    export_morph=True,
    export_morph_normal=False,
    export_morph_tangent=False,
)
print("EXPORTED", OUTPUT)
