const { app, BrowserWindow, ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false, 
            contextIsolation: true,  
            preload: path.join(__dirname, 'preload.js')  
        }
    });

    mainWindow.loadFile('affichage.html');
});

ipcMain.handle('get-students', async () => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('./students.db');

        db.all("SELECT * FROM students WHERE groupe = 'B'", [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
            db.close();
        
        
        });
    });
});
