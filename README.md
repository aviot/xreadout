# X Following Readout（Brave/Chrome 浏览器插件）

这是一个面向 **Brave/Chrome** 的浏览器插件：在 `https://x.com/home` 页面自动切到 **Following** 时间线，按设定间隔自动刷新，并在检测到最新推文时自动朗读。

## 功能

- 自动定位 `x.com/home` 的 **Following** 标签
- 定时自动刷新页面（可配置间隔）
- 自动提取最新推文正文并朗读
- 自动去重（同一条推文不会重复朗读）
- 弹窗可配置：
  - 启用/关闭自动刷新+朗读
  - 刷新间隔
  - 语音（Voice）
  - 语速
  - 音量
  - 手动“朗读最新内容”

## 朗读引擎

插件使用浏览器原生 Web Speech API：

- `window.speechSynthesis`
- `SpeechSynthesisUtterance`

实际声音来自系统语音包（macOS / Windows / Linux）。

## 安装

1. 打开 `brave://extensions/`（或 `chrome://extensions/`）
2. 开启“开发者模式”
3. 点击“加载已解压的扩展程序”
4. 选择本仓库目录 `/workspace/xreadout`

## 使用

1. 打开并登录 `https://x.com/home`
2. 点击插件图标，开启“启用自动刷新+朗读”
3. 选择语音并设置刷新间隔
4. 保持页面打开，插件会自动刷新并朗读最新内容

## 文件说明

- `manifest.json`：Manifest V3 配置
- `content.js`：页面注入逻辑（Following 检测、刷新、提取、朗读）
- `popup.html` / `popup.js`：插件设置面板

## 开发检查

```bash
python -m json.tool manifest.json >/dev/null
node --check content.js
node --check popup.js
```

## 注意事项

- X 页面结构可能变化；如抓取失败需更新选择器。
- 插件仅对页面已加载出的动态生效。
- 首次朗读效果取决于浏览器和系统语音权限策略。
