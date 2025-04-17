window.onload = (event) => {
    (async () => {
        const result = await window.libDB.test();
        console.log(result);
    })();
    document.getElementById("Text").addEventListener("click",fonctionCouleur);
    document.getElementById("bouton1").addEventListener("click",exampleFunction);
    document.getElementById("bouton2").addEventListener("click",exampleFunction);
    document.getElementById("bouton3").addEventListener("click", () => { nvGroupe(240001, 'A') });
    document.getElementById("bouton4").addEventListener("click", () => { nvGroupe(240001, 'B') });
    document.getElementById("OK").addEventListener('click', () => {
        var id = document.getElementById('textId').value;
        var groupe = document.getElementById('textGroupe').value;
        nvGroupe(id, groupe);
        document.getElementById('textGroupe').value = '';
    });
    document.getElementById("OK").addEventListener('click', () => {
        var id = document.getElementById('textId').value;
        var commentaire = document.getElementById('textCommentaire').value;
        nvCommentaire(id, commentaire);
        document.getElementById('textId').value = '';
        document.getElementById('textCommentaire').value = '';
    });
    document.getElementById("OK2").addEventListener('click', () => {
        var id = document.getElementById('texteId').value;
        var civilite = document.getElementById('textCivilite').value;
        var prenom = document.getElementById('textPrenom').value;
        var nom = document.getElementById('textNom').value;
        var annee = document.getElementById('textAnnee').value;
        var langue = document.getElementById('textLangue').value;
        var mail = document.getElementById('textMail').value;
        nvEtudiant(id, civilite, prenom, nom, annee, langue, mail);

        document.getElementById('texteId').value = '';
        document.getElementById('textCivilite').value = '';
        document.getElementById('textPrenom').value = '';
        document.getElementById('textNom').value = '';
        document.getElementById('textAnnee').value = '';
        document.getElementById('textLangue').value = '';
        document.getElementById('textMail').value = '';
    });
}
