const fs = require('fs'); // permet de travailler avec des fichiers (lire, écrire, ...)
const csv = require('csv-parser'); // analyser des fichiers CSV, ligne par ligne
const path = require('path'); // module path pour gérer les chemins de manière robuste
const nom_fichier = './Sujet5_base.csv';
const groupes_all = ["Mercredi 15h	D I J K","Vendredi 13h15	E"];
const groupes_esp = ["Lundi 16h45	 I K","Mercredi 8h	F","Mercredi 9h45	G","Mercredi 11h30	C","Mercredi 15h	D J","Mercredi 16h45	A","Jeudi 9h45	B"];
const groupes_fle = 'I-J-K';
const groupes_alld = ["Mercredi 18h30"];
const groupes_espd = ["Mercredi 15h	D I J K","Mercredi  16h45	A G"];

function init(db) {
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
            Nouvelle_section TEXT,
            Nouveau_groupe TEXT
        )`, (err) => {
            if (err) {
                console.error("Erreur lors de la creation de la table:", err.message);
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
            const csvFilePath = path.resolve(__dirname, nom_fichier); // cherche le fichier CSV dans le dossier scripts à partir du dossier PSE
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
                    
                        console.log("Toutes les mises a jour sont terminees.");
                    });
                });
            
        });
    });
}

function miseAJourNouvelleSection(db, id, groupe) {
    db.run(`UPDATE students SET Nouvelle_section = CASE 
        WHEN (? LIKE '%A%' OR ? LIKE '%B%' OR ? LIKE '%C%') AND ? NOT LIKE '%SA%' THEN 1 
        WHEN ? LIKE '%D%' OR ? LIKE '%E%' OR ? LIKE '%F%' OR ? LIKE '%G%' THEN 2 
        WHEN ? LIKE '%H%' OR ? LIKE '%I%' OR ? LIKE '%J%' THEN 'SIB' 
        ELSE 0 END WHERE num_insa = ?`, 
        [groupe, groupe, groupe, groupe, groupe, groupe, groupe, groupe, groupe, groupe, groupe, id], (err) => {
        if (err) console.error("Erreur mise à jour 'Nouvelle section':", err.message);
    });
}

function affectationGroupe(db, id, groupe) {
    return new Promise((resolve, reject) => {
        db.get("SELECT num_insa FROM students WHERE num_insa = ? ", [id], (err, row) => {
            if (err) console.error("Erreur mise à jour d un Groupe", err.message);
            if (row) {
                db.get('SELECT langue FROM students WHERE num_insa = ?',[id], (err,lv2) => {
                    if (lv2.langue === 'ESP') {
                        if (! (groupes_esp.some(lettre_groupe => lettre_groupe.includes(groupe)))) {
                            resolve("Ce groupe ne contient pas d'espagnols")
                            return;
                        }
                        else {
                            db.run('UPDATE students SET Nouveau_groupe = ? WHERE num_insa = ?',[groupe,id], (err) => {
                                if (err) {
                                    console.error("Erreur lors de la mise à jour du groupe:", err.message);
                                    reject("Erreur DB");
                                    return;
                                }
                            });
                            miseAJourNouvelleSection(db, id, groupe)
                            resolve("Etudiant rajouté dans le groupe")
                            return
                        }
                    }
                    else {
                        if (lv2.langue === 'ALL') {
                            if (! (groupes_all.some(lettre_groupe => lettre_groupe.includes(groupe)))) {
                                resolve("Ce groupe ne contient pas d'allemands")
                                return;
                            };
                        }
                        else {
                            if (lv2.langue === 'ESPD') {
                                if (! (groupes_all.some(lettre_groupe => lettre_groupe.includes(groupe)))) {
                                    resolve("Ce groupe ne contiens pas d'espagnols debutants")
                                    return;
                                };
                            }
                            else {
                                db.run('UPDATE students SET Nouveau_groupe = ? WHERE num_insa = ?',[groupe,id], (err) => {
                                    if (err) {
                                        console.error("Erreur lors de la mise à jour du groupe:", err.message);
                                        reject("Erreur DB");
                                        return;
                                    }
                                });
                                miseAJourNouvelleSection(db, id, groupe)
                                resolve("Etudiant rajouté dans le groupe")
                                return
                            }
                        }
                        else {
                            if (lv2.langue === 'ESPD') {
                                if (! (groupes_all.some(lettre_groupe => lettre_groupe.includes(groupe)))) {
                                    resolve("Ce groupe ne contient pas d'espagnols debutants")
                                    return;
                                }
                                else {
                                    db.run('UPDATE students SET Nouveau_groupe = ? WHERE num_insa = ?',[groupe,id], (err) => {
                                        if (err) {
                                            console.error("Erreur lors de la mise à jour du groupe:", err.message);
                                            reject("Erreur DB");
                                            return;
                                        }
                                    });
                                    miseAJourNouvelleSection(db, id, groupe)
                                    resolve("Etudiant rajouté dans le groupe")
                                    return
                                }
                            }
                            else {
                                db.run('UPDATE students SET Nouveau_groupe = ? WHERE num_insa = ?',[groupe,id], (err) => {
                                    if (err) {
                                        console.error("Erreur lors de la mise à jour du groupe:", err.message);
                                        reject("Erreur DB");
                                        return;
                                    }
                                });
                                miseAJourNouvelleSection(db, id, groupe)
                                resolve("Etudiant rajouté dans le groupe")
                                return
                            }
                        }
                    }
                });

            } else {
                resolve("Cet identifiant n'existe pas")
        }});
    })
}

function ajoutCommentaire(db, id, commentaire) {
        db.run(`UPDATE students SET commentaire = ? WHERE num_insa = ?`,
                [commentaire, id], (err) => {
            if (err) console.error("Erreur mise à jour d un commentaire", err.message);
        });
}

function ajoutEtudiant(db, id, civilite, prenom, nom, annee, langue, mail) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT num_insa FROM students WHERE num_insa = ? `,
                [id], (err,eleve) => {
            if (err) {console.error("Erreur ajout d un etudiant", err.message)
                reject("Erreur DB")
                return;}
            if (eleve) {resolve("Identifiant déjà pris")
                console.log("Déja on y  est")
                return;}
            
            else {
                db.run(`INSERT INTO students (num_insa, civilite, prenom, nom, annee, langue, email)
                    VALUES (?,?,?,?,?,?,?)`,
                        [id, civilite, prenom, nom, annee, langue, mail], (err) => {
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
                resolve("Etudiant ajouté");
            }
        });
    })
}

function recupererEtudiants(db) {
    return new Promise((resolve, reject) => {
        db.all('SELECT num_insa, civilite, prenom, nom, annee, langue, email, section, groupe, decision_jury, commentaire, Nouveau_groupe, Nouvelle_section FROM students', [], (err, rows) => {
            if (err) {
                console.error("Erreur lors de la récupération des étudiants:", err.message);
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

function ajoutCommentaire(db, id, commentaire) {
    db.run(`UPDATE students SET commentaire = ? WHERE num_insa = ?`, [commentaire, id], (err) => {
        if (err) console.error("Erreur mise à jour d un commentaire", err.message);
    });
}

function lectureCommentaire(db, id) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT commentaire FROM students WHERE num_insa = ?`, [id], (err, row) => {
            if (err) {
                console.error("Erreur lecture d'un commentaire", err.message);
                reject(err);
                return;
            }
            resolve(row ? row.commentaire : '');
        });
    });
}

function compterEtudiantsParGroupe(db) {
    return new Promise((resolve, reject) => {
        db.all('SELECT groupe, COUNT(*) AS nombre_etudiants FROM students GROUP BY groupe', [], (err, rows) => {
            if (err) {
                console.error("Erreur lors du comptage des étudiants par groupe :", err.message);
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

function compterEtudiantsParNouveauGroupe(db){
    return new Promise((resolve, reject)=> {
        db.all('SELECT Nouveau_groupe, COUNT(*) AS nombre_etudiants_nouveau_groupe FROM students GROUP BY Nouveau_groupe', [], (err, rows) => {
            if (err) {
                console.error("Erreur lors du comptage des étudiants par nouveau groupe :", err.message);
                reject(err);
                return;
            }
            resolve(rows);
        });

    })
}

// Pour Lilian : pense à exporter les fonctions qui sont utilisées par l'affichage puis les mettre dans le preload.js
module.exports = { init, affectationGroupe, ajoutCommentaire, ajoutEtudiant, recupererEtudiants, lectureCommentaire, compterEtudiantsParGroupe, compterEtudiantsParNouveauGroupe };