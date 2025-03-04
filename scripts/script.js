const fs = require('fs');
const csv = require('csv-parser');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('students.db');

db.serialize(() => {
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

    fs.createReadStream('Sujet5_base.csv')
        .pipe(csv({ separator: ',' }))
        .on('data', (row) => {
            const { "N° INSA": num_insa, "M/Mme": civilite, Prenom: prenom, NOM: nom, Année: annee, Langue: langue, mail: email, Groupe: groupe, "Decision Jury STPI1": decision_jury, Commentaire: commentaire } = row;
            
            db.run(`INSERT INTO students (num_insa, civilite, prenom, nom, annee, langue, email, groupe, decision_jury, commentaire) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                    [num_insa, civilite, prenom, nom, annee, langue, email, groupe, decision_jury, commentaire]);
        })
        .on('end', () => {
            console.log('CSV importé dans SQLite.');
            db.close();
        });
});

// TEST