const fs = require('fs'); // permet de travailler avec des fichiers (lire, écrire, ...)
const csv = require('csv-parser'); // analyser des fichiers CSV, ligne par ligne
const path = require('path'); // module path pour gérer les chemins de manière robuste

const sqlite3 = require('sqlite3').verbose(); // importe sqlite3 ; .verbose() permet d'afficher des messages d'erreur plus détaillés

// Utiliser path.resolve pour obtenir le chemin absolu vers le dossier parent (PSE)
const dbPath = path.resolve(__dirname, '../students.db'); // crée le fichier students.db dans le dossier PSE
const db = new sqlite3.Database(dbPath); // crée le fichier dans le dossier PSE

// Utiliser path.resolve pour obtenir le chemin absolu vers le fichier CSV
const csvFilePath = path.resolve(__dirname, '../scripts/Sujet5_base.csv'); // cherche le fichier CSV dans le dossier scripts à partir du dossier PSE

db.serialize(() => { // les requêtes sont exécutées dans l'ordre
    db.run(`CREATE TABLE IF NOT EXISTS students (
        num_insa INTEGER PRIMARY KEY AUTOINCREMENT,
        civilite TEXT,
        prenom TEXT,
        nom TEXT,
        annee TEXT,
        langue TEXT,
        email TEXT,
        section TEXT,
        groupe TEXT,
        decision_jury TEXT,
        commentaire TEXT
    )`);

    // Maintenant on cherche le fichier CSV avec le bon chemin
    fs.createReadStream(csvFilePath) // ouvre le fichier CSV avec le chemin correct
        .pipe(csv({ separator: ',' })) // transforme CSV en objet JS en séparant les valeurs par ,
        .on('data', (row) => { // chaque ligne
            const { "N° INSA": num_insa, "M/Mme": civilite, Prenom: prenom, NOM: nom, Année: annee, Langue: langue, mail: email, Groupe: groupe, "Decision Jury STPI1": decision_jury, Commentaire: commentaire } = row; // extrait les valeurs des colonnes du CSV
            
            db.run(`INSERT INTO students (num_insa, civilite, prenom, nom, annee, langue, email, groupe, decision_jury, commentaire) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                    [num_insa, civilite, prenom, nom, annee, langue, email, groupe, decision_jury, commentaire]); // insère les valeurs extraites dans le .db
        })
        .on('end', () => { // lorsque tout le CSV a été traité
            console.log('CSV importé dans SQLite.');
            db.close(); // fermer la connexion à la base de données SQLite
        });
});