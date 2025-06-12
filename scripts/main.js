// programmation principale de l'application Electron
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { groupes_esp, groupes_fle, groupes_espd, groupes_alld } = require('./libDB');
const libDB = require(path.join(__dirname,'libDB.js'));
const sqlite3 = require('sqlite3').verbose(); // importe sqlite3 ; .verbose() permet d'afficher des messages d'erreur plus detailles

// créer la fenêtre de l'application (voir la doc)
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
    // ouvre le fichier index.html dans la fenêtre créée
    win.loadFile('index.html')
}

const dbPath = path.resolve(__dirname, './students.db'); // cree le fichier students.db dans le dossier PSE

let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => { // crée le fichier dans le dossier PSE
    if (err) {
        console.error("Erreur lors de l'ouverture de la base de donnees:", err.message);
        return;
    }
    console.log("Base de donnees ouverte.");
});

// initialise la base de données
libDB.init(db);


// voir la doc mais lorsque l'application est prête, on crée la fenêtre
app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// lorsque l'on quitte l'application, on ferme la database
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

ipcMain.handle('affectationGroupe', async (event, id, groupe, tousValides) => {
    const resultat = await libDB.affectationGroupe(db,id,groupe)
    return resultat
});


// fonction permettant d'ajouter un étudiant lorsque l'on reçoit un message du preload.js
ipcMain.handle('ajoutEtudiant', async (event, id, civilite, prenom, nom, annee, langue, mail) => {
    const resultat = await libDB.ajoutEtudiant(db, id, civilite, prenom, nom, annee, langue, mail)
    return resultat
});

// fonction permettant de récupérer les étudiants de la db lorsque l'on reçoit un message du preload.js
ipcMain.handle('recupererEtudiants', async (event) => {
    try {
        const etudiants = await libDB.recupererEtudiants(db); // Attendre que la promesse soit résolue
        return etudiants;
    } catch (err) {
        console.error("Erreur lors de la recuperation des etudiants:", err.message);
        throw err;
    }
});

// fonction permettant d'ajouter un commentaire lorsque l'on reçoit un message du preload.js
ipcMain.handle('ajoutCommentaire', async (event, id, nouveauCommentaire) => {
    const commentaireFinal = nouveauCommentaire.trim();
    db.prepare('UPDATE students SET commentaire = ? WHERE num_insa = ?').run(commentaireFinal, id);
});

ipcMain.handle('recupererGroupesEtValeurs', async (event) => {
    try {
        const groupes = await libDB.compterEtudiantsParGroupe(db); // Appelle la fonction dans libDB.js
        return groupes;
    } catch (err) {
        console.error("Erreur lors de la récupération des groupes et valeurs :", err.message);
        throw err;
    }
});

ipcMain.handle('recupererNouveauGroupesEtValeurs', async (event) => {
    try {
        const groupes = await libDB.compterEtudiantsParNouveauGroupe(db); // Appelle la fonction dans libDB.js
        return groupes;
    } catch (err) {
        console.error("Erreur lors de la récupération des nouveaux groupes et valeurs :", err.message);
        throw err;
    }
});

ipcMain.handle('recupererLangueParGroupe', async (event) => {
    try {
        const groupes = await libDB.compterEtudiantsParLangue(db); // Appelle la fonction dans libDB.js
        return groupes;
    } catch (err) {
        console.error("Erreur lors de la récupération des langues par groupe :", err.message);
        throw err;
    }
});

ipcMain.handle('recupererCreneauxParGroupes',async () => {
    try {
        const creneaux = await libDB.recupererCreneauxParGroupes();
        return creneaux;
    } catch (err) {
        console.error("Erreur lors de la récupération des créneaux par groupes :", err.message);
        throw err;
    }

});

// fonction permettant de supprimer un étudiant lorsque l'on reçoit un message du preload.js
ipcMain.handle('supprimerEtudiant', async (event, id) => {
    try {
        await libDB.supprimerEtudiant(db, id);
    } catch (err) {
        console.error("Erreur lors de la suppression de l'étudiant:", err.message);
        throw err;
    }
});

// fonction permettant de générer un fichier CSV lorsque l'on reçoit un message du preload.js
ipcMain.handle('Fichier_csv', async (event, nomFichier) => {
    try {
        const resultat = await libDB.Fichier_csv(db, nomFichier);
        return resultat;
    } catch (err) {
        console.error("Erreur lors de la génération du CSV:", err.message);
        throw err;
    }
});