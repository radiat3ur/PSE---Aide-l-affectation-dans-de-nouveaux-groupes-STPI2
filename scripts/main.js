const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const libDB = require(path.join(__dirname,'libDB.js'));
const sqlite3 = require('sqlite3').verbose(); // importe sqlite3 ; .verbose() permet d'afficher des messages d'erreur plus detailles

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

const createSecondWindow = () => {
    const secondWin = new BrowserWindow({
        width: 1900, // Dimensions de la deuxième fenêtre
        height: 1200,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
    });
    secondWin.loadFile('page_2.html'); // Chargez une page HTML (peut être différente de la première)
};

const dbPath = path.resolve(__dirname, './students.db'); // cree le fichier students.db dans le dossier PSE

let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => { // crée le fichier dans le dossier PSE
    if (err) {
        console.error("Erreur lors de l'ouverture de la base de donnees:", err.message);
        return;
    }
    console.log("Base de donnees ouverte.");
});

libDB.init(db);

app.whenReady().then(() => {
    createWindow()
    createSecondWindow(); // Deuxième fenêtre
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin'){
        app.quit();
        // Fermeture de la base de donnees 
        db.close((err) => {
            if (err) console.error("Erreur fermeture DB:", err.message);
            else console.log("Base de donnees fermee.");
        });
    }
});

ipcMain.handle('affectationGroupe', async (event, id, groupe) => {
    libDB.affectationGroupe(db,id,groupe);
    return null;
});

ipcMain.handle('ajoutCommentaire', async (event, id, commentaire) => {
    libDB.ajoutCommentaire(db,id,commentaire);
    return null;
});

ipcMain.handle('ajoutEtudiant', async (event, id, civilite, prenom, nom, annee, langue, mail) => {
    console.log("Tentative d'ajout de l'étudiant avec ID:", id);
    const resultat = await libDB.ajoutEtudiant(db, id, civilite, prenom, nom, annee, langue, mail)
    console.log(resultat)
    return resultat
});

ipcMain.handle('recupererEtudiants', async (event) => {
    try {
        const etudiants = await libDB.recupererEtudiants(db); // Attendre que la promesse soit résolue
        return etudiants;
    } catch (err) {
        console.error("Erreur lors de la recuperation des etudiants:", err.message);
        throw err;
    }
});