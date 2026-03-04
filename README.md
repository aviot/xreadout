# X Pro Readout（Brave 浏览器插件）

这是一个面向 **Brave/Chrome** 的浏览器插件：在 `pro.x.com`（X Pro）页面检测到新动态后，自动提取文字并朗读。

> 适用于 Brave（Brave 基于 Chromium，可直接加载此插件）。

## 调用的是什么朗读引擎？

插件使用浏览器原生 Web Speech API：

- `window.speechSynthesis`
- `SpeechSynthesisUtterance`

也就是说，实际声音来自你的操作系统语音包（例如 macOS、Windows、Linux 已安装的语音）。

## 可以换语音吗？

可以。现在在插件弹窗里新增了 **语音（Voice）** 下拉框：

- 可选“系统默认语音”
- 或选择具体 voice（如 `xx-XX`）
- 选择后会保存，下次继续生效

## 功能

- 监听页面新增 tweet（支持 X Pro 的动态加载）
- 提取推文正文文本（`tweetText`）
- 自动去重（同一条推文只读一次）
- 使用浏览器内置 `speechSynthesis` 朗读
- 支持在插件弹窗里：
  - 开关朗读
  - 选择语音（Voice）
  - 调整语速
  - 调整音量
  - 点击按钮手动朗读最新动态

## 安装（Brave）

1. 打开 `brave://extensions/`
2. 右上角开启“开发者模式”
3. 点击“加载已解压的扩展程序”
4. 选择本仓库目录 `/workspace/xreadout`

## 使用

1. 打开 `https://pro.x.com`
2. 确保你已登录，并在你常看的时间线页面
3. 点击插件图标，在弹窗中：
   - 开启 `Auto Read`
   - 选择 Voice（可选）
   - 调整语速 / 音量
4. 有新动态进入页面时，插件会自动朗读文字
5. 如需立即验证，点击 **“朗读最新动态”** 按钮

## 如何测试

### 1) 语法检查（开发者）

```bash
python -m json.tool manifest.json >/dev/null
node --check content.js
node --check popup.js
```

### 2) Brave 手工测试（推荐）

1. 打开 `brave://extensions/`，开启开发者模式并加载本目录
2. 进入 `https://pro.x.com`，保持页面打开
3. 打开插件弹窗，先选择一个明显不同的 Voice（如英文声线）
4. 点击 **“朗读最新动态”**
5. 预期：会用你选择的语音朗读当前页面最上方动态

## 文件说明

- `manifest.json`：插件配置（Manifest V3）
- `content.js`：注入 `pro.x.com`，监听新动态并触发朗读
- `popup.html` / `popup.js`：插件设置面板（包含 Voice 选择与手动朗读按钮）

## 注意事项

- X Pro 页面结构可能变化；若抓不到文本，需要更新选择器。
- 浏览器 TTS 会使用系统语音引擎，效果取决于本机语音包。
- 插件只处理“页面中实际加载出来”的动态。
