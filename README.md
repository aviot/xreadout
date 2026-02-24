# X Pro Readout（Brave 浏览器插件）

这是一个面向 **Brave/Chrome** 的浏览器插件：在 `pro.x.com`（X Pro）页面检测到新动态后，自动提取文字并朗读。

> 适用于 Brave（Brave 基于 Chromium，可直接加载此插件）。

## 功能

- 监听页面新增 tweet（支持 X Pro 的动态加载）
- 提取推文正文文本（`tweetText`）
- 自动去重（同一条推文只读一次）
- 使用浏览器内置 `speechSynthesis` 朗读
- 支持在插件弹窗里：
  - 开关朗读
  - 调整语速
  - 调整音量

## 安装（Brave）

1. 打开 `brave://extensions/`
2. 右上角开启“开发者模式”
3. 点击“加载已解压的扩展程序”
4. 选择本仓库目录 `/workspace/xreadout`

## 使用

1. 打开 `https://pro.x.com`
2. 确保你已登录，并在你常看的时间线页面
3. 点击插件图标，在弹窗中开启 `Auto Read`
4. 有新动态进入页面时，插件会自动朗读文字

## 文件说明

- `manifest.json`：插件配置（Manifest V3）
- `content.js`：注入 `pro.x.com`，监听新动态并触发朗读
- `popup.html` / `popup.js`：插件设置面板

## 注意事项

- X Pro 页面结构可能变化；若抓不到文本，需要更新选择器。
- 浏览器 TTS 会使用系统语音引擎，效果取决于本机语音包。
- 插件只处理“页面中实际加载出来”的动态。
