# GeoLab × Agnes Harness 安全接入说明

本项目按比赛要求提供 AGH 本地工具插件：`agh-plugin/geolab-tool/`。插件注册 `geosim_run_original_experiment`，并通过 `ctx.services.register()` 暴露 `geolab.experiment.run` 与 `geolab.experiment.status`。GeoLab 网页只访问自己的 BFF `/api/agh/*`，由 BFF 把任务送入 AGH 服务边界；模型 Key 始终留在 AGH 私有配置中。

## 运行边界

原 GeoSim 前端页面和 Three.js / SVG 实验画面保持不变；AGH 智能体作为实验页的附加运行层。数据链路为：学生 → GeoLab 网页 → GeoLab BFF → AGH 会话 → Agnes 规划/解释 → `geosim_run_original_experiment` → 结构化证据 → BFF → 网页。未配置桥接端点时，BFF 只提供明确标注的本地可复现适配器预览，不冒充真实 Agnes 调用。

## 私密凭据处理

模型 Key 不属于作品源码，也不属于提交材料。请在 AGH 的 Web/TUI 私有配置流程中粘贴 Key，并使用密码字段保存；不要写入项目目录、前端环境变量、浏览器 localStorage、报告、截图、视频或压缩包。若凭据曾在聊天、截图或其他公开位置出现，应先在模型服务后台轮换，再用于正式演示。

## 官方 AGH 启动流程

以下命令与官方仓库 Quickstart 对齐，AGH 需要在本机从源码构建：

```bash
pnpm install --frozen-lockfile
pnpm --filter @agnes/cli build:local
node packages/cli/dist/local/agnes.mjs serve
```

启动后按 AGH Web/TUI 的插件管理流程安装、信任并启用本项目的 `agh-plugin/geolab-tool`，然后在 AGH Web/TUI 中配置 Agnes provider / model route。不要给本项目增加 `--api-key` 参数，也不要把 Key 写成命令行历史或配置示例。

正式提交前需要在本机隔离 AGH profile 中完成官方 CLI 的 `inspect → install → trust → enable → status` 验证，并在 AGH 私有配置中由队长自行输入 Agnes Key，随后完成一次真实三步模型会话。只有当插件状态为 `trusted / enabled / running`、网页显示“AGH 服务已连接”，且 `geolab_verify_experiment` 的工具轨迹和核验结果被重新记录后，才可把该会话作为比赛证据。当前提交包已附真实 AGH 运行记录；如重新启动本地 GeoLab，优先使用 `npm run preview`，它会自动探测本机 4177 的 AGH Web 通道。

## GeoLab BFF 与 AGH 桥接

GeoLab 使用以下可审计的桥接合同：

```text
POST /api/agh/experiments/run
{
  "protocol": "geolab.agh.bridge.v1",
  "action": "run_original_experiment",
  "experimentId": "required-02",
  "question": "...",
  "params": { "latitude": 30, "season": 0 }
}
```

启动 GeoLab 前有两种真实 AGH 接入方式：如果已有服务桥接端点，设置 `GEOLAB_AGH_ENDPOINT`；如果使用 AGH 官方 CLI，则设置 `GEOLAB_AGH_CLI_ROOT` 为 AGH 源码根目录。配置 `GEOLAB_AGH_HOME` 和 `GEOLAB_AGH_PROFILE` 时，BFF 会通过 `agnes.mjs --mode json --meta --standalone` 发起一次有限 AGH 会话；未配置独立 Home 时才使用临时会话。桥接端点的独立访问令牌只放在 `GEOLAB_AGH_BRIDGE_TOKEN`，它不是 Agnes 模型 Key。GeoLab BFF 不保存、不转发、不读取模型 Key。AGH 官方当前推荐通过同源 BFF、受限 client service 和当前会话完成前后端联动；因此不要在浏览器中直接请求 Agnes，也不要把 AGH daemon 凭据硬编码进网页。

网页 AGH 面板中的状态必须显示“GeoLab后台 → AGH 服务已连接”后，才可在演示中声称完成真实 AGH 调用；显示“本地适配器预览”时只能作为离线复现演示。

## 现场验收

建议依次发送四个问题并保存 AGH trace：

1. “南京夏至日的正午太阳高度与昼长是多少？如果移动到哈尔滨，差异如何？”
2. “长江流域降水、蒸散发和径流如何共同决定水量盈余？”
3. “白天海陆温差如何形成海风？请自动判断气压和风向。”
4. “副热带海区蒸发、降水和径流如何影响海水盐度与密度？”

每次运行都应能看到同一任务内连续的三个 AGH 工具步骤：`geolab_plan_experiment` 规划变量和对照组，`geosim_run_original_experiment` 调用原有 GeoSim 仿真，`geolab_verify_experiment` 检查结果边界与规律，之后 Agnes 再解释结论。截图只保留工具名、输入摘要和核验结果，不显示 provider Key、密码框内容或本机隐私路径。
