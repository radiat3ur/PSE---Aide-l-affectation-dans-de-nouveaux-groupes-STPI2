const fs = require('fs'); // permet de travailler avec des fichiers (lire, écrire, ...)
const csv = require('csv-parser'); // analyser des fichiers CSV, ligne par ligne
const path = require('path'); // module path pour gérer les chemins de manière robuste
const sqlite3 = require('sqlite3').verbose(); // importe sqlite3 ; .verbose() permet d'afficher des messages d'erreur plus détaillés

const dbPath = path.resolve(__dirname, '../students.db'); // crée le fichier students.db dans le dossier PSE

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => { // crée le fichier dans le dossier PSE
    if (err) {
        console.error("Erreur lors de l'ouverture de la base de données:", err.message);
        return;
    }
    console.log("Base de données ouverte.");
});

const csvFilePath = path.resolve(__dirname, 'Sujet5_base.csv'); // cherche le fichier CSV dans le dossier scripts à partir du dossier PSE

// Activer le mode WAL (Write-Ahead Logging) pour éviter les verrous
db.run('PRAGMA journal_mode = WAL', (err) => {
    if (err) {
        console.error("Erreur lors de l'activation du mode WAL:", err.message);
    } else {
        console.log("Mode WAL activé.");
    }
});

db.serialize(() => { // les requêtes sont exécutées dans l'ordre
    // Création de la table si elle n'existe pas
    db.run(`CREATE TABLE IF NOT EXISTS students (
        num_insa INTEGER PRIMARY KEY,
        civilite TEXT,
        prenom TEXT,
        nom TEXT,
        annee TEXT,
        langue TEXT,
        email TEXT,
        section TEXT,
        groupe TEXT,
        decision_jury TEXT,
        commentaire TEXT,
        an INTEGER,
        redoublant INTEGER,
        intégré BOOLEAN,
        Allemand BOOLEAN,
        Espagnol BOOLEAN,
        Français BOOLEAN,
        Espagnol_debutant BOOLEAN,
        Allemand_debutant BOOLEAN,
        Espagnol_grand_debutant BOOLEAN,
        Allemand_grand_debutant BOOLEAN,
        groupe_2A TEXT
    )`, (err) => {
        if (err) {
            console.error("Erreur lors de la création de la table:", err.message);
            return;
        }
        console.log("Table 'students' créée ou déjà existante.");
    });

    // Commencer une transaction pour les insertions
    db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
            console.error("Erreur lors du début de la transaction:", err.message);
            return;
        }

        // Lecture du fichier CSV et insertion des données
        fs.createReadStream(csvFilePath)
            .pipe(csv({ separator: ',' }))
            .on('data', (row) => {
                console.log("Ligne lue du CSV:", row); // Affiche chaque ligne lue
                const { "num_insa": num_insa, "M/Mme": civilite, Prenom: prenom, NOM: nom, Annee: annee, Langue: langue, mail: email, Groupe: groupe, "Decision Jury STPI1": decision_jury, Commentaire: commentaire } = row;
                // Vérifier si l'étudiant existe déjà dans la base de données
                db.get('SELECT num_insa FROM students WHERE num_insa = ?', [num_insa], (err, existingRow) => {
                    if (err) {
                        console.error("Erreur lors de la vérification des doublons:", err.message);
                        return;
                    }

                    if (!existingRow) {
                        db.run(`INSERT INTO students (num_insa, civilite, prenom, nom, annee, langue, email, groupe, decision_jury, commentaire) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                                [num_insa, civilite, prenom, nom, annee, langue, email, groupe, decision_jury, commentaire], (err) => {
                                    if (err) {
                                        console.error("Erreur lors de l'insertion des données:", err.message);
                                    } else {
                                        console.log(`Étudiant ${num_insa} inséré avec succès.`);
                                    }
                                });
                    } else {
                        console.log(`Étudiant ${num_insa} déjà présent, pas d'insertion.`);
                    }
                });
            })
            .on('end', () => {
                // Valider la transaction après l'importation
                db.run('COMMIT', (err) => {
                    if (err) {
                        console.error("Erreur lors de la validation de la transaction:", err.message);
                        return; 
                    }
                    console.log("CSV importé et transaction validée.");
                
                    console.log("Début des mises à jour...");
                
                    // Mise à jour de la colonne 'an'
                    db.run('UPDATE students SET an = SUBSTR(annee, 1, 4)', (err) => {
                        if (err) console.error("Erreur mise à jour 'an':", err.message);
                    });
                
                    // Mise à jour des redoublants
                    db.run(`UPDATE students SET redoublant = CASE 
                        WHEN annee LIKE '%RED%' AND annee LIKE '%1A%' THEN 1 
                        WHEN annee LIKE '%RED%' AND annee LIKE '%2A%' THEN 2 
                        ELSE 0 END`, 
                        (err) => {
                            if (err) console.error("Erreur mise à jour 'redoublant':", err.message);
                        }
                    );
                
                    // Mise à jour des intégrés
                    db.run(`UPDATE students SET intégré = CASE WHEN annee LIKE '%INT%' THEN 1 ELSE 0 END`, (err) => {
                        if (err) console.error("Erreur mise à jour 'intégré':", err.message);
                    });
                    
                    // Mise à jour des allemands
                    db.run(`UPDATE students SET Allemand = CASE WHEN langue LIKE '%ALL%' AND langue NOT LIKE '%ALLD%' AND langue NOT LIKE '%ALLGD%' THEN 1 ELSE 0 END`, (err) => {
                        if (err) console.error("Erreur mise à jour 'Allemand':", err.message);
                    });
                
                    // Mise à jour des espagnols
                    db.run(`UPDATE students SET Espagnol = CASE WHEN langue LIKE '%ESP%' AND langue NOT LIKE '%ESPD%' AND langue NOT LIKE '%ESPGD%' THEN 1 ELSE 0 END`, (err) => {
                        if (err) console.error("Erreur mise à jour 'Espagnol':", err.message);
                    });
                
                    // Mise à jour des francais
                    db.run(`UPDATE students SET Français = CASE WHEN langue LIKE '%FLE%' THEN 1 ELSE 0 END`, (err) => {
                        if (err) console.error("Erreur mise à jour 'Français':", err.message);
                    });
                
                    // Mise à jour des espagnols débutants
                    db.run(`UPDATE students SET Espagnol_debutant = CASE WHEN langue LIKE '%ESPD%' AND langue NOT LIKE '%ESPGD%' THEN 1 ELSE 0 END`, (err) => {
                        if (err) console.error("Erreur mise à jour 'Espagnol_debutant':", err.message);
                    });
                
                    // Mise à jour des allemands débutants
                    db.run(`UPDATE students SET Allemand_debutant = CASE WHEN langue LIKE '%ALLD%' AND langue NOT LIKE '%ALLGD%' THEN 1 ELSE 0 END`, (err) => {
                        if (err) console.error("Erreur mise à jour 'Allemand_debutant':", err.message);
                    });
                
                    // Mise à jour des allemands grands débutants
                    db.run(`UPDATE students SET Allemand_grand_debutant = CASE WHEN langue LIKE '%ALLGD%' THEN 1 ELSE 0 END`, (err) => {
                        if (err) console.error("Erreur mise à jour 'Allemand_grand_debutant':", err.message);
                    });
                
                    // Mise à jour des espagnols grands débutants
                    db.run(`UPDATE students SET Espagnol_grand_debutant = CASE WHEN langue LIKE '%ESPGD%' THEN 1 ELSE 0 END`, (err) => {
                        if (err) console.error("Erreur mise à jour 'Espagnol_grand_debutant':", err.message);
                    });

                    // Mise à jour de la section 
                    db.run(`UPDATE students SET section = CASE WHEN (groupe LIKE '%A%' OR groupe LIKE '%B%' OR groupe LIKE '%C%' OR groupe LIKE '%D%') AND groupe NOT LIKE '%SA%' THEN 1 WHEN groupe LIKE '%E%' OR groupe LIKE '%F%' OR groupe LIKE '%G%' OR groupe LIKE '%H%' THEN 2 WHEN groupe LIKE '%I%' OR groupe LIKE '%J%' OR groupe LIKE '%K%' THEN 'SIB' ELSE 0 END`, (err) => {
                        if (err) console.error("Erreur mise à jour 'Espagnol_grand_debutant':", err.message);
                    });
                
                    console.log("Toutes les mises à jour sont terminées.");
                
                    // Fermeture de la base de données 
                    db.close((err) => {
                        if (err) console.error("Erreur fermeture DB:", err.message);
                        else console.log("Base de données fermée.");
                    });
                });
            });
        
    });
});
