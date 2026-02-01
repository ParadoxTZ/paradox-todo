# Paradox's TODO

一个简洁美观的桌面待办事项应用，支持 Windows。

![Paradox's TODO](https://img.shields.io/badge/Windows-0078D4?style=flat-square&logo=windows&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-47848F?style=flat-square&logo=electron&logoColor=white)

## 功能特性

- ✅ 添加/删除待办事项
- 📅 设置截止日期
- 🔴🟡🟢 支持高/中/低三种优先级
- 📋 任务排序：未完成优先 → DDL临近优先 → 高优先级优先
- 🖥️ 桌面小组件模式 - 置顶显示
- 📦 最小化到系统托盘

## 下载使用

在 [Releases](https://github.com/ParadoxTZ/paradox-todo/releases) 页面下载最新版本的压缩包：

1. 下载 `paradox-todo-win32-x64-1.0.0.zip`
2. 解压到任意目录
3. 运行 `paradox-todo.exe`

## 快捷键

- `Ctrl + Shift + T` - 打开添加任务窗口

## 截图

> (请添加截图到 screenshots 目录)

## 开发说明

### 环境要求

- Node.js 18+
- Windows 10/11

### 安装依赖

```bash
npm install
```

### 运行开发版本

```bash
npm start
```

### 打包 EXE

```bash
npm run make
```

打包后的文件位于 `out/make/zip/win32/x64/` 目录。

## 项目结构

```
paradox-todo/
├── index.js          # Electron 主进程
├── preload.js        # 预加载脚本
├── widget.html       # 小组件窗口
├── add-task.html     # 添加任务窗口
├── icon.png          # 托盘图标
├── forge.config.js   # 打包配置
└── package.json
```

## 技术栈

- [Electron](https://www.electronjs.org/) - 桌面应用框架
- HTML/CSS/JavaScript - 前端界面

## License

MIT
