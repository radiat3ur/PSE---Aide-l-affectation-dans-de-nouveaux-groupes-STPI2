const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const libDB = require(path.join(__dirname,'libDB.js'));
const sqlite3 = require('sqlite3').verbose(); // importe sqlite3 ; .verbose() permet d'afficher des messages d'erreur plus détaillés

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1900,
        height: 1200,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
    })
    win.loadFile('pageTest.html')
}

const dbPath = path.resolve(__dirname, './students.db'); // crée le fichier students.db dans le dossier PSE

let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => { // crée le fichier dans le dossier PSE
    if (err) {
        console.error("Erreur lors de l'ouverture de la base de données:", err.message);
        return;
    }
    console.log("Base de données ouverte.");
});

libDB.init(db);

app.whenReady().then(() => {
    createWindow()
  
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin'){
        app.quit();
        // Fermeture de la base de données 
        db.close((err) => {
            if (err) console.error("Erreur fermeture DB:", err.message);
            else console.log("Base de données fermée.");
        });
    }
});

ipcMain.handle('test', async () => {
    return 'test2';
});

ipcMain.handle('affectationGroupe', async (event,id,groupe) => {
    libDB.affectationGroupe(db,id,groupe);
    return null;
});

ipcMain.handle('ajoutCommentaire', async (event,id,commentaire) => {
    libDB.ajoutCommentaire(db,id,commentaire);
    return null;
});

ipcMain.handle('ajoutEtudiant', async (event,id,civilite,prenom,nom,annee,langue,mail) => {
    libDB.ajoutEtudiant(db,id,civilite,prenom,nom,annee,langue,mail);
    return null;
});

ipcMain.handle('getStudent', async (event,id) => {
    id = parseInt(id);
    if (id == NaN) {
        return 'Identifiant invalide.';
    } else {
        (async () => {
            return await libDB.getStudent(db,id);
        })();
    }
});