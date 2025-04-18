const fs = require('fs'); // permet de travailler avec des fichiers (lire, écrire, ...)
const csv = require('csv-parser'); // analyser des fichiers CSV, ligne par ligne
const path = require('path'); // module path pour gérer les chemins de manière robuste

function init(db){
    // Activer le mode WAL (Write-Ahead Logging) pour éviter les verrous
    db.run('PRAGMA journal_mode = WAL', (err) => {
        if (err) {
            console.error("Erreur lors de l'activation du mode WAL:", err.message);
        } else {
            // console.log("Mode WAL active.");
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
            Nouveau_groupe TEXT,
            Nouvelle_section TEXT
        )`, (err) => {
            if (err) {
                console.error("Erreur lors de la création de la table:", err.message);
                return;
            }
            console.log("Table 'students' creee ou deja existante.");
        });

        // Commencer une transaction pour les insertions
        db.run('BEGIN TRANSACTION', (err) => {
            if (err) {
                console.error("Erreur lors du début de la transaction:", err.message);
                return;
            }
            const csvFilePath = path.resolve(__dirname, './Sujet5_base.csv'); // cherche le fichier CSV dans le dossier scripts à partir du dossier PSE
            // Lecture du fichier CSV et insertion des données
            fs.createReadStream(csvFilePath)
                .pipe(csv({ separator: ',' }))
                .on('data', (row) => {
                    // console.log("Ligne lue du CSV:", row); // Affiche chaque ligne lue
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
                                            // console.log(`Étudiant ${num_insa} inséré avec succès.`);
                                        }
                                    });
                        } else {
                            // console.log(`Étudiant ${num_insa} déjà présent, pas d'insertion.`);
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
                    
                        console.log("Debut des mises a jour...");
                    
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
                        db.run(`UPDATE students SET Allemand = CASE WHEN langue LIKE '%ALL%' AND langue NOT LIKE '%ALLD%' THEN 1 ELSE 0 END`, (err) => {
                            if (err) console.error("Erreur mise à jour 'Allemand':", err.message);
                        });
                    
                        // Mise à jour des espagnols
                        db.run(`UPDATE students SET Espagnol = CASE WHEN langue LIKE '%ESP%' AND langue NOT LIKE '%ESPD%' THEN 1 ELSE 0 END`, (err) => {
                            if (err) console.error("Erreur mise à jour 'Espagnol':", err.message);
                        });
                    
                        // Mise à jour des francais
                        db.run(`UPDATE students SET Français = CASE WHEN langue LIKE '%FLE%' THEN 1 ELSE 0 END`, (err) => {
                            if (err) console.error("Erreur mise à jour 'Français':", err.message);
                        });
                    
                        // Mise à jour des espagnols débutants
                        db.run(`UPDATE students SET Espagnol_debutant = CASE WHEN langue LIKE '%ESPD%' THEN 1 ELSE 0 END`, (err) => {
                            if (err) console.error("Erreur mise à jour 'Espagnol_debutant':", err.message);
                        });
                    
                        // Mise à jour des allemands débutants
                        db.run(`UPDATE students SET Allemand_debutant = CASE WHEN langue LIKE '%ALLD%' THEN 1 ELSE 0 END`, (err) => {
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
                    
                        console.log("Toutes les mises à jour sont terminees.");
                    });
                });
            
        });
    });
}

function miseAJourNouvelleSection(db,id,groupe) {
    db.run(`UPDATE students SET Nouvelle_section = CASE 
        WHEN ? LIKE '%A%' OR ? LIKE '%B%' OR ? LIKE '%C%' THEN 1 
        WHEN ? LIKE '%D%' OR ? LIKE '%E%' OR ? LIKE '%F%' OR ? LIKE '%G%' THEN 2 
        WHEN ? LIKE '%H%' OR ? LIKE '%I%' OR ? LIKE '%J%' THEN 'SIB' 
        ELSE 0 END WHERE num_insa = ?`, 
        [groupe, groupe, groupe, groupe, groupe, groupe, groupe, groupe, groupe, groupe, id], (err) => {
        if (err) console.error("Erreur mise à jour 'Nouvelle section':", err.message);
    });
}

function affectationGroupe(db,id,groupe){
    db.run('UPDATE students SET Nouveau_groupe = ? WHERE num_insa = ?',[groupe,id], (err) => {
        if (err) {
            console.error("Erreur lors de la mise à jour du groupe:", err.message);
            return;
        }
    });
    miseAJourNouvelleSection(db,id,groupe)
}

function ajoutCommentaire(db,id,commentaire){
    db.run(`UPDATE students SET commentaire = ? WHERE num_insa = ?`,
            [commentaire, id], (err) => {
        if (err) console.error("Erreur mise à jour d un commentaire", err.message);
    });
}

function ajoutEtudiant(db,id,civilite,prenom,nom,annee,langue,mail){
    db.run(`INSERT INTO students (num_insa,civilite,prenom,nom,annee,langue,email)
        VALUES (?,?,?,?,?,?,?)`,
            [id,civilite,prenom,nom,annee,langue,mail], (err) => {
        if (err) console.error("Erreur ajout d un etudiant", err.message);
    });
    db.run(`UPDATE students SET an = SUBSTR(annee, 1, 4) WHERE num_insa = ?`, [id], (err) => {
        if (err) console.error("Erreur mise à jour 'an':", err.message);
    });
    db.run(`UPDATE students SET redoublant = CASE 
        WHEN annee LIKE '%RED%' AND annee LIKE '%1A%' THEN 1 
        WHEN annee LIKE '%RED%' AND annee LIKE '%2A%' THEN 2 
        ELSE 0 END WHERE num_insa = ?`, [id], (err) => {
        if (err) console.error("Erreur mise à jour 'redoublant':", err.message);
    });
    db.run(`UPDATE students SET intégré = CASE WHEN annee LIKE '%INT%' THEN 1 ELSE 0 END WHERE num_insa = ?`, [id], (err) => {
        if (err) console.error("Erreur mise à jour 'intégré':", err.message);
    });
    db.run(`UPDATE students SET Allemand = CASE WHEN langue LIKE '%ALL%' AND langue NOT LIKE '%ALLD%' THEN 1 ELSE 0 END WHERE num_insa = ?`, [id], (err) => {
        if (err) console.error("Erreur mise à jour 'Allemand':", err.message);
    });
    db.run(`UPDATE students SET Espagnol = CASE WHEN langue LIKE '%ESP%' AND langue NOT LIKE '%ESPD%' THEN 1 ELSE 0 END WHERE num_insa = ?`, [id], (err) => {
        if (err) console.error("Erreur mise à jour 'Espagnol':", err.message);
    });
    db.run(`UPDATE students SET Français = CASE WHEN langue LIKE '%FLE%' THEN 1 ELSE 0 END WHERE num_insa = ?`, [id], (err) => {
        if (err) console.error("Erreur mise à jour 'Français':", err.message);
    });
    db.run(`UPDATE students SET Espagnol_debutant = CASE WHEN langue LIKE '%ESPD%' THEN 1 ELSE 0 END WHERE num_insa = ?`, [id], (err) => {
        if (err) console.error("Erreur mise à jour 'Espagnol_debutant':", err.message);
    });
    db.run(`UPDATE students SET Allemand_debutant = CASE WHEN langue LIKE '%ALLD%' THEN 1 ELSE 0 END WHERE num_insa = ?`, [id], (err) => {
        if (err) console.error("Erreur mise à jour 'Allemand_debutant':", err.message);
    });
    db.run(`UPDATE students SET Allemand_grand_debutant = CASE WHEN langue LIKE '%ALLGD%' THEN 1 ELSE 0 END WHERE num_insa = ?`, [id], (err) => {
        if (err) console.error("Erreur mise à jour 'Allemand_grand_debutant':", err.message);
    });
    db.run(`UPDATE students SET Espagnol_grand_debutant = CASE WHEN langue LIKE '%ESPGD%' THEN 1 ELSE 0 END WHERE num_insa = ?`, [id], (err) => {
        if (err) console.error("Erreur mise à jour 'Espagnol_grand_debutant':", err.message);
    });
    db.run(`UPDATE students SET section = CASE WHEN (groupe LIKE '%A%' OR groupe LIKE '%B%' OR groupe LIKE '%C%' OR groupe LIKE '%D%') AND groupe NOT LIKE '%SA%' THEN 1 WHEN groupe LIKE '%E%' OR groupe LIKE '%F%' OR groupe LIKE '%G%' OR groupe LIKE '%H%' THEN 2 WHEN groupe LIKE '%I%' OR groupe LIKE '%J%' OR groupe LIKE '%K%' THEN 'SIB' ELSE 0 END WHERE num_insa = ?`, [id], (err) => {
        if (err) console.error("Erreur mise à jour 'section':", err.message);
    });
    
}

function getStudent(db,id){
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM students WHERE num_insa = ?', [id], (err, row) => {
            if (err) {
                console.error("Erreur lors de la récupération de l'étudiant:", err.message);
                reject('Identifiant non existant.');
            }
            resolve(row);
        });
    });
}

module.exports = { init,affectationGroupe,ajoutCommentaire,ajoutEtudiant,getStudent };