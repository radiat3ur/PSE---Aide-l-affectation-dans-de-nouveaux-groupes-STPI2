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

const csvFilePath = path.resolve(__dirname, '../scripts/Sujet5_base.csv'); // cherche le fichier CSV dans le dossier scripts à partir du dossier PSE

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
        Allemand_grand_debutant BOOLEAN
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

                const { "num_insa": num_insa, "M/Mme": civilite, Prenom: prenom, NOM: nom, Année: annee, Langue: langue, mail: email, Groupe: groupe, "Decision Jury STPI1": decision_jury, Commentaire: commentaire } = row;

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
                });
                
                // Mise à jour de la colonne 'an' avec les 4 premiers caractères de 'annee'
                db.run('UPDATE students SET an = +SUBSTR(annee, 1, 4)', (err) => {
                    if (err) {
                        console.error("Erreur lors de la mise à jour de la colonne 'an':", err.message);
                    } else {
                        console.log("Colonne 'an' mise à jour avec les 4 premiers caractères de 'annee'.");
                    }
                });

                // Mise à jour de la colonne 'redoublant' si les élèves sont redoublants ou non
                db.run(`UPDATE students SET redoublant = CASE WHEN annee LIKE '%RED%' AND annee LIKE '%1A%' THEN 1 WHEN annee LIKE '%RED%' AND annee LIKE '%2A%' THEN 2 ELSE 0 END`, (err) => {
                    if (err) {
                        console.error("Erreur lors de la mise à jour de la colonne 'redoublant':", err.message);
                    } else {
                        console.log("Colonne 'redoublant' mise à jour avec les si ce sont des redoublants.");
                    }
                });

                // Mise à jour de la colonne 'intégré' si les élèves sont intégrés ou non
                db.run(`UPDATE students SET intégré = CASE WHEN annee LIKE '%INT%' THEN TRUE ELSE FALSE END`, (err) => {
                    if (err) {
                        console.error("Erreur lors de la mise à jour de la colonne 'intégré':", err.message);
                    } else {
                        console.log("Colonne 'intégré' mise à jour avec si ils ce sont des intégrés.");
                    }
                });

                // Mise à jour de la colonne 'allemand' si les élèves sont intégrés ou non
                db.run(`UPDATE students SET Allemand = CASE WHEN langue LIKE '%ALL%' AND langue NOT LIKE '%ALLD%' AND langue NOT LIKE '%ALLGD%' THEN TRUE ELSE FALSE END`, (err) => {
                    if (err) {
                        console.error("Erreur lors de la mise à jour de la colonne 'allemand':", err.message);
                    } else {
                        console.log("Colonne 'allemand' mise à jour avec si ils suivent des cours d'allemand.");
                    }
                });

                // Mise à jour de la colonne 'espagnol' si les élèves sont intégrés ou non
                db.run(`UPDATE students SET Espagnol = CASE WHEN langue LIKE '%ESP%' AND langue NOT LIKE '%ESPD%' AND langue NOT LIKE '%ESPGD%' THEN TRUE ELSE FALSE END`, (err) => {
                    if (err) {
                        console.error("Erreur lors de la mise à jour de la colonne 'espagnol':", err.message);
                    } else {
                        console.log("Colonne 'espagnol' mise à jour avec si ils suivent des cours d'espagnol.");
                    }
                });

                // Mise à jour de la colonne 'français' si les élèves sont intégrés ou non
                db.run(`UPDATE students SET Français = CASE WHEN langue LIKE '%FLE%' THEN TRUE ELSE FALSE END`, (err) => {
                    if (err) {
                        console.error("Erreur lors de la mise à jour de la colonne 'français':", err.message);
                    } else {
                        console.log("Colonne 'français' mise à jour avec si ils suivent des cours de français.");
                    }
                });

                // Mise à jour de la colonne 'espagnol debutant' si les élèves sont intégrés ou non
                db.run(`UPDATE students SET Espagnol_debutant = CASE WHEN langue LIKE '%ESPD%' AND langue NOT LIKE '%ESPGD%' THEN TRUE ELSE FALSE END`, (err) => {
                    if (err) {
                        console.error("Erreur lors de la mise à jour de la colonne 'espagnol debutant':", err.message);
                    } else {
                        console.log("Colonne 'espagnol debutant' mise à jour avec si ils suivent des cours d'espagnol debutant.");
                    }
                });

                // Mise à jour de la colonne 'allemand debutant' si les élèves sont intégrés ou non
                db.run(`UPDATE students SET Allemand_debutant = CASE WHEN langue LIKE '%ALLD%' AND langue NOT LIKE '%ALLGD%' THEN TRUE ELSE FALSE END`, (err) => {
                    if (err) {
                        console.error("Erreur lors de la mise à jour de la colonne 'allemand debutant':", err.message);
                    } else {
                        console.log("Colonne 'allemand debutant' mise à jour avec si ils suivent des cours d'allemand debutant.");
                    }
                });

                // Mise à jour de la colonne 'allemand grand debutant' si les élèves sont intégrés ou non
                db.run(`UPDATE students SET Allemand_grand_debutant = CASE WHEN langue LIKE '%ALLGD%' THEN TRUE ELSE FALSE END`, (err) => {
                    if (err) {
                        console.error("Erreur lors de la mise à jour de la colonne 'allemand grand debutant':", err.message);
                    } else {
                        console.log("Colonne 'allemand grand debutant' mise à jour avec si ils suivent des cours d'allemand grand debutant.");
                    }
                });

                // Mise à jour de la colonne 'espagnol grand debutant' si les élèves sont intégrés ou non
                db.run(`UPDATE students SET Espagnol_grand_debutant = CASE WHEN langue LIKE '%ESPGD%' THEN TRUE ELSE FALSE END`, (err) => {
                    if (err) {
                        console.error("Erreur lors de la mise à jour de la colonne 'espagnol grand debutant':", err.message);
                    } else {
                        console.log("Colonne 'espagnol grand debutant' mise à jour avec si ils suivent des cours d'espagnol grand debutant.");
                    }
                });

                // Fermeture de la base de données après l'importation avec un délai
                setTimeout(() => {
                    db.close((err) => {
                        if (err) {
                            console.error("Erreur lors de la fermeture de la base de données:", err.message);
                        } else {
                            console.log("Base de données fermée.");
                        }
                    });
                }, 1000); // Attends 1 seconde avant de fermer la base de données
            })
            .on('error', (err) => {
                console.error("Erreur lors de la lecture du fichier CSV:", err.message);
            });
    });
});
