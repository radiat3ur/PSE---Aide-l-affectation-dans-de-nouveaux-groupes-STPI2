const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getStudents: () => ipcRenderer.invoke('get-students')
});
