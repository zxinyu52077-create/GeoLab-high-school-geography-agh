# GeoLab

GeoLab高中地理可验证仿真实验平台。当前主入口恢复为原 GeoSim 课程与实验平台，在原有必修一、选择性必修一仿真页面中接入 Agnes + AGH 智能体，读取原实验实时参数，自动设计、运行、核验并导出科学数据证据。

## 项目结构

- `src/App.jsx`：原 GeoSim 课程、目录与实验路由主入口。
- `src/agh/`：AGH 原实验智能体面板、后台客户端和科学计算适配器。
- `server/geolabApi.mjs`：GeoLab BFF；网页只调用 `/api/agh/*`，不接触模型 Key。
- `src/GeoLabMultiApp.jsx`、`src/geolab.css`：早期独立演示文件，当前不作为主入口。
- `agh-plugin/geolab-tool/`：可安装到 Agnes Harness 的后端工具与服务插件，注册 `geosim_run_original_experiment`、`geolab.experiment.run` 和状态服务。
- `src/`：原 GeoSim 课程与实验组件，以及 AGH 接入层。
- `选修一实验7/`：可独立开发的厄尔尼诺、拉尼娜学习模块。
- `public/picture/`：主站使用的静态图片。
- `选修一实验7/public/picture/`：学习模块单独运行时使用的图片。
- `public/选修一实验7/`：由学习模块构建生成的嵌入版文件，不需要手动维护。
- `docs/`：独立 HTML 原型和原始素材归档。
- `data/`：保留的旧本地数据库，不参与前端运行或构建。

## 本地开发

```bash
npm install
npm run dev
```

主应用默认通过 Vite 开发服务器运行。进入实验页后，点击右下角“AGH 原实验智能体”。网页请求先到 GeoLab BFF，再由配置好的 AGH 服务组织 Agnes 与地理工具。

## 构建与预览

```bash
npm run build
npm run preview
```

`npm run dev` 与 `npm run preview` 会自动把 GeoLab BFF 的本机 AGH Web 地址设为 `http://127.0.0.1:4177`；若项目内存在 `tmp/agnes-harness-src/agnes-harness-main`，启动器也会自动将它作为 AGH 已注册工作区。启动 AGH Web 后刷新页面，面板应显示“GeoLab后台 → AGH 服务已连接”。若 AGH Web 或 AGH 工作区使用其他地址，可在启动前设置 `GEOLAB_AGH_WEB_URL`、`GEOLAB_AGH_CLI_CWD`。只运行静态文件服务器或未启动 4177 时，页面会明确显示本地适配器预览。构建会生成可部署的网页文件，并复制 Cesium 与图片静态资源。Netlify 使用相同的构建流程。

## AI / AGH 演示说明

当前比赛演示保留原 GeoSim 课程、目录和 Three.js / SVG 仿真页面；网页按钮通过 BFF 进入 AGH。配置 `GEOLAB_AGH_ENDPOINT` 或已构建的 `GEOLAB_AGH_CLI_ROOT` 后，BFF 进入真实 AGH 模式；使用独立 AGH 配置目录时同时设置 `GEOLAB_AGH_HOME` 和 `GEOLAB_AGH_PROFILE`。未配置时会明确标记为“本地适配器预览”。本项目已在私有 AGH 配置下完成一次真实 Agnes 会话，`docs/GeoLab-AGH运行证据.json` 与 `docs/GeoLab-elective-07-AGH验证报告.md` 记录了真实会话的轨迹、数据证据和核验结果；模型 Key 不进入项目文件。详细材料见 `docs/AGH-安全接入说明.md`。

## 使用范围

登录信息仅用于当前页面的演示流程，不会提交到后端或持久化。教师工作台使用预置演示数据；视频、教案、作业、讨论、成绩和统计页面尚未连接在线服务。因此当前项目是可静态部署的前端演示，不提供账号认证、跨设备同步或服务端数据存储。
