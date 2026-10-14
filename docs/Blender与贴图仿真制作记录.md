# Blender 与贴图的地理仿真

本轮以实际 Blender 模型、生成材质和网页过程模型共同工作。素材为教学场景，未对应测绘地点，未用现场观测校准，因此不能声称已经完成严格的数字孪生。

## 已接入

- 构造：Blender 闭合地层与地表网格；河流侵蚀使用同一地表截去各层，不允许层序倒置。可查看地表、半剖面、中轴剖面，点击地层读取证据。
- 锋面：Blender 河谷地形、照片式透明云与树木；锋面位置共同驱动雨区、云区和气象站温度、气压、降水。
- 环流：带地表贴图的球面环流、六个环流单元、海岸场景；自转效应趋零时展示单圈环流近似。
- 地震/火山：Blender 地域地形与带火山口的山体；火山地下通道、岩浆房、熔岩路径，动态灰云；P/S 波前与台站来自同一传播时间；台站 S 波到达后可查看由到时差与深度换算的定位圆。
- 洋流：Blender 海盆、大陆坡与大陆边缘，海面波动与可切换温跃层；信风驱动暖水迁移、上升流与云区。海盆深度夸张，不是测得的太平洋水深。
- 河流/水循环：可编辑地形和地表纹理、贴地汇流、河道、水汽与雨滴、下渗标记。植被与下垫面条件影响显示和径流分配。
- 地球运动：地表贴图与远距离平行照明，日影几何按纬度、直射纬度、地方时共同计算。

## 可编辑源文件与资源

- `scripts/blender/author_twin_scenes.py`：Blender 场景生成与导出。
- `scripts/blender/geosim-textured-landscapes.blend`：原生可编辑场景，内含打包贴图。
- `public/picture/experiments/twin/tectonic-landscape-v2.glb`：分前后半块的 6 层地层及地表。
- `public/picture/experiments/twin/watershed-landscape-v2.glb`：地形、土壤断面、河水。
- `public/picture/experiments/twin/volcano-landscape-v2.glb`：火山地表、内部断面、通道和岩浆房。
- `public/picture/experiments/twin/ocean-basin-v2.glb`：海盆与两侧大陆边缘。
- `docs/previews/blender-geology-v2.png`：Blender 渲染。

所有生图使用内置图像生成工具。生成后复制到项目，再由 Blender 与网页实际引用。没有调用收费的 Tripo 或 Mixamo 账户。

## 图像生成提示词

### geological-albedo-atlas.png

Physically based albedo atlas, square, exactly four equal quadrants: top-left weathered ochre sandstone with fine bedding, top-right grey laminated limestone, bottom-left muted olive meadow grass and soil, bottom-right porous charcoal basalt. Orthographic flat macro photography, uniform diffuse light, no baked shadows, no highlights, no perspective, no gaps, labels or borders. Each quadrant individually seamless.

### cumulus-cloud.png

One photographic natural cumulus cloud cluster, white billows and grey lower base, neutral diffuse daylight, full cloud inside the square canvas, soft semi-transparent wispy edges. Genuinely transparent background, no sky, ground, rain, text or watermark. For a real-time weather cloud sprite.

### upland-albedo.png

Square seamless natural terrain albedo, orthographic overhead aerial scale temperate uplands. Muted olive grass, low scrub, subtle dry soil and limestone, fine tiny vegetation; low contrast, diffuse overcast light with no cast shadows or baked directional lighting. No perspective relief, giant grass blades, buildings, roads, rivers or labels. Flat base color for three-dimensional mountain meshes.

### broadleaf-tree.png

One complete photographic mature broadleaf tree at eye level, naturally irregular olive-green canopy with fine leaves and branches, brown-grey bark, slight asymmetry, diffuse neutral daylight. Tree fills 90% height, genuinely transparent background including leaf gaps, no ground patch, shadow, sky, pot, person, labels or watermark. For crossed foliage cards on a Blender landscape.

## 检查

`node scripts/checks/twin-consistency.mjs` 检查地层顺序与截切、侵蚀出露、正断层方向、锋面气温响应、河谷坡降与 P/S 到站尺度，并检查四份 GLB 的场景隔离、角色信息和 UV。附加检查流域模型和河流实验的三个河段：河床连续低于水面，水面沿下游降低。

已在浏览器检查七个实验的场景、切换与关键联动，并检查地层点击取样。检查中修复了河流曲线不一致、河床露出水面、剖面区域悬空水面、地球照明与读数不同步、太阳被视口裁切等问题。网页预览保存在 `docs/previews/web-*-v2.jpg`。

模拟水量、天气读数、构造尺度和火山喷发阈值仍为教学近似；这些检查不等于观测校准或完整水动力、气象、岩土求解。

本轮最后检查：目标文件 ESLint、几何与过程一致性脚本、生产构建均通过；浏览器确认地层点击取样、侵蚀出露、季风海陆切换、河道连通与入渗剖面、火山模式、地震到站表及锋面站点读数。数字孪生所需的实测数据与校准仍未接入。
