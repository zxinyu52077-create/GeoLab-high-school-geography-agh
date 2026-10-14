# GeoLab AGH 工具插件

这是原 GeoSim 平台的 AGH 本地插件。它向 Agnes 注册 `geosim_run_original_experiment` 工具，支持原平台必修一、选择性必修一实验的参数读取、确定性计算、证据输出和规则核验。

插件只做确定性科学计算、结构化证据输出和规则核验，不读取网络、不写文件、不保存模型密钥。Agnes 模型提供自然语言理解、实验规划和结论解释，AGH 负责工具调用与运行轨迹；原网页的 Three.js / SVG 仿真仍是实验画面和参数来源。

## 安全原则

- 不要把模型 Key 写入此目录、`.env`、前端代码、截图、报告或压缩包。
- 按 AGH 官方 Web/TUI 流程配置 Agnes provider；Key 只在 AGH 的私有密码输入框中使用。
- 作品提交包只包含插件源码和配置说明，不包含任何真实凭据。

## 接入方式

1. 按 AGH 官方仓库的 Quickstart 在本机完成构建并启动 AGH。
2. 将本目录作为本地插件包安装，在 AGH 中完成 trust / enable。
3. 在 AGH Web/TUI 中配置 Agnes provider 和模型路由。
4. 新建会话后让 Agnes 识别地理问题，并调用 `geolab_run_experiment`。

插件的 `package.json` 使用 AGH 的 `agnes.plugins` 清单格式，方便在 AGH 本地插件管理流程中发现和加载。
