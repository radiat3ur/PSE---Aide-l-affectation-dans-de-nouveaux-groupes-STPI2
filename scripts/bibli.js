function exampleFunction(){
    document.getElementById('Title').style.backgroundColor = "red";
};

function fonctionCouleur(){
    document.getElementById('Text').style.backgroundColor = "blue";
}

function nvGroupe(id, groupe){
    console.log("Nouveau groupe pour l'étudiant", id, ":", groupe);
    var db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => { // crée le fichier dans le dossier PSE
    if (err) {
        console.error("Erreur lors de l'ouverture de la base de données:", err.message);
        return;
    }
    console.log("Base de données ouverte.");
});
    db.run(`UPDATE students SET nouveau_groupe = ? WHERE num_insa = ?`, [groupe, id], (err) => {
        if (err) console.error("Erreur lors de la mise à jour du groupe:", err.message);
    });
    db.close((err) => {
        if (err) console.error("Erreur lors de la fermeture de la base de données:", err.message);
        console.log("Base de données fermée.");
    });
}

window.onload = (event) => {
    document.getElementById("Text").addEventListener("click",fonctionCouleur);
    document.getElementById("bouton1").addEventListener("click",exampleFunction);
    document.getElementById("bouton2").addEventListener("click",exampleFunction);
    document.getElementById("bouton3").addEventListener("click", function() { nvGroupe(240001, 'A') });
    document.getElementById("bouton4").addEventListener("click", function() { nvGroupe(240001, 'B') });
}