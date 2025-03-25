const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const sqlite3 = require('sqlite3').verbose()

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1900,
        height: 1200,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    win.loadFile('pageTest.html')
}

// n'a pas l'air de fonctionner pour l'instant
// ipcMain.handle('get-students', async () => {
//     return new Promise((resolve, reject) => {
//         const db = new sqlite3.Database('./students.db');

//         db.all("SELECT * FROM students WHERE groupe = 'B'", [], (err, rows) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(rows);
//             }
//             db.close();
//         });
//     });
// });

app.whenReady().then(() => {
    createWindow()
  
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
});