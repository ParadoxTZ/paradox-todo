const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getTasks: () => ipcRenderer.invoke('get-tasks'),
  openAddWindow: () => ipcRenderer.invoke('open-add-window'),
  minimizeWidget: () => ipcRenderer.invoke('minimize-widget'),
  addTask: (task) => ipcRenderer.invoke('add-task', task),
  toggleTask: (id) => ipcRenderer.invoke('toggle-task', id),
  deleteTask: (id) => ipcRenderer.invoke('delete-task', id),
  minimizeToTray: () => ipcRenderer.invoke('minimize-to-tray'),
  getPriorityOrder: () => ipcRenderer.invoke('get-priority-order'),
  formatDate: (dateStr) => ipcRenderer.invoke('format-date', dateStr),
  getDueClass: (dateStr) => ipcRenderer.invoke('get-due-class', dateStr),
  onTasksUpdated: (callback) => ipcRenderer.on('tasks-updated', (event, tasks) => callback(tasks))
});
