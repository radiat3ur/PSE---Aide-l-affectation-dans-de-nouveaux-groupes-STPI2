function exampleFunction(){
    document.getElementById('Title').style.backgroundColor = "red";
};

function fonctionCouleur(){
    document.getElementById('Text').style.backgroundColor = "blue";
}

function nvGroupe(id, groupe){
    window.libDB.affectationGroupe(id,groupe);
}

function nvCommentaire(id, commentaire){
    window.libDB.ajoutCommentaire(id,commentaire);
}

function nvEtudiant(id, civilite, prenom, nom, annee, langue, mail){
    window.libDB.ajoutEtudiant(id,civilite,prenom,nom,annee,langue,mail);
}

function getStudent(id){
    (async () => {
        let result = await window.libDB.getStudent(id);
        console.log(result);
        return result;
    })();
}