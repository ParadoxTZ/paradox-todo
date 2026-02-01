const { app, BrowserWindow, Tray, Menu, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

let tray = null;
let smallWindow = null;
let addWindow = null;
let tasks = [];
let isAlwaysOnTop = false; // 默认不置顶

// 数据文件路径
const dataFilePath = path.join(app.getPath('userData'), 'tasks.json');

// 读取任务数据
function loadTasks() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf-8');
      tasks = JSON.parse(data) || [];
    } else {
      tasks = [];
    }
  } catch (e) {
    tasks = [];
  }
}

// 保存任务数据
function saveTasks() {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(tasks, null, 2));
  } catch (e) {
    console.error('Failed to save tasks:', e);
  }
}

// 排序任务
function sortTasks(a, b) {
  if (a.completed !== b.completed) return a.completed ? 1 : -1;
  const dateA = a.dueDate ? new Date(a.dueDate) : null;
  const dateB = b.dueDate ? new Date(b.dueDate) : null;
  if (dateA && dateB) {
    if (dateA.getTime() !== dateB.getTime()) return dateA - dateB;
  } else if (dateA) return -1;
  else if (dateB) return 1;
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return priorityOrder[a.priority] - priorityOrder[b.priority];
}

// 创建小窗口（桌面小组件）
function createSmallWindow() {
  loadTasks();

  smallWindow = new BrowserWindow({
    width: 320,
    height: 480,
    minWidth: 280,
    minHeight: 300,
    title: "Paradox's TODO",
    frame: false,
    transparent: false,
    alwaysOnTop: false, // 默认不置顶
    skipTaskbar: true,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  smallWindow.loadFile('widget.html');
  smallWindow.setVisibleOnAllWorkspaces(true);

  smallWindow.webContents.on('dom-ready', () => {
    smallWindow.webContents.send('tasks-updated', tasks.sort(sortTasks));
  });

  smallWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      smallWindow.hide();
    }
  });

  smallWindow.on('show', () => {
    loadTasks();
    smallWindow.webContents.send('tasks-updated', tasks.sort(sortTasks));
  });
}

// 创建添加任务窗口
function createAddWindow() {
  if (addWindow) {
    addWindow.show();
    return;
  }

  // 获取屏幕尺寸，计算中心位置
  const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize;
  const windowWidth = 500;
  const windowHeight = 420;
  const x = Math.round((width - windowWidth) / 2);
  const y = Math.round((height - windowHeight) / 2);

  addWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: x,
    y: y,
    title: "添加任务",
    frame: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  addWindow.loadFile('add-task.html');

  addWindow.on('close', () => {
    addWindow = null;
  });
}

// 创建系统托盘
function createTray() {
  tray = new Tray(__dirname + '/icon.png');
  tray.setToolTip("Paradox's TODO");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => smallWindow && smallWindow.show()
    },
    {
      label: '添加任务',
      click: () => createAddWindow()
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    smallWindow && smallWindow.show();
  });
}

// IPC通信
ipcMain.handle('get-tasks', () => {
  return tasks.sort(sortTasks);
});

ipcMain.handle('add-task', (event, task) => {
  const newTask = {
    id: Date.now(),
    ...task,
    completed: false,
    createdAt: new Date().toISOString()
  };
  tasks.unshift(newTask);
  saveTasks();
  smallWindow && smallWindow.webContents.send('tasks-updated', tasks.sort(sortTasks));
  return newTask;
});

ipcMain.handle('toggle-task', (event, id) => {
  const taskId = typeof id === 'string' ? parseInt(id) : id;
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    smallWindow && smallWindow.webContents.send('tasks-updated', tasks.sort(sortTasks));
  }
});

ipcMain.handle('delete-task', (event, id) => {
  const taskId = typeof id === 'string' ? parseInt(id) : id;
  tasks = tasks.filter(t => t.id !== taskId);
  saveTasks();
  smallWindow && smallWindow.webContents.send('tasks-updated', tasks.sort(sortTasks));
});

ipcMain.handle('open-add-window', () => {
  createAddWindow();
});

ipcMain.handle('minimize-widget', () => {
  if (smallWindow) {
    smallWindow.hide();
  }
});

ipcMain.handle('toggle-always-on-top', () => {
  if (smallWindow) {
    isAlwaysOnTop = !isAlwaysOnTop;
    smallWindow.setAlwaysOnTop(isAlwaysOnTop);
    return isAlwaysOnTop;
  }
  return false;
});

ipcMain.handle('get-always-on-top', () => {
  return isAlwaysOnTop;
});

ipcMain.handle('minimize-to-tray', () => {
  if (addWindow) {
    addWindow.hide();
    addWindow = null;
  }
});

ipcMain.handle('get-priority-order', () => {
  return { high: 0, medium: 1, low: 2 };
});

ipcMain.handle('format-date', (event, dateStr) => {
  if (!dateStr) return '';
  // 直接显示月日
  const [year, month, day] = dateStr.split('-');
  return `${month}月${day}日`;
});

ipcMain.handle('get-due-class', (event, dateStr) => {
  if (!dateStr) return '';
  // 简单的日期比较
  const today = new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  const dueDate = new Date(y, m - 1, d);
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((dueDate - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays <= 2) return 'urgent';
  return '';
});

app.whenReady().then(() => {
  // 禁用菜单栏
  Menu.setApplicationMenu(null);

  createSmallWindow();
  createTray();

  // 注册全局快捷键
  globalShortcut.register('CommandOrControl+Shift+T', () => {
    createAddWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createSmallWindow();
  } else {
    smallWindow && smallWindow.show();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});
