async function nvGroupe(id, groupe) {
    window.libDB.affectationGroupe(id, groupe);
    const alerte = await window.libDB.affectationGroupe(id, groupe);
    if (alerte !== "Etudiant rajouté dans le groupe") {
        alert(alerte)
    }
}

function nvCommentaire(id, commentaire) {
    window.libDB.ajoutCommentaire(id, commentaire);
}

async function nvEtudiant(id, civilite, prenom, nom, annee, langue, mail) {
    const alerte = await window.libDB.ajoutEtudiant(id, civilite, prenom, nom, annee, langue, mail);
    if (alerte !== "Etudiant ajouté") {
        alert(alerte)
        }
}

async function recupererEtudiants() {
    try {
        const etudiants = await window.libDB.recupererEtudiants();
        return etudiants;
    } catch (err) {
        console.error("Erreur lors de la récupération des étudiants :", err.message);
        throw err;
    }
}

function rafraichirEtudiants() {
    (async () => {
        const etudiants = await recupererEtudiants();
        const tbody = document.querySelector("#tableauEtudiants tbody");
        tbody.innerHTML = "";

        let filtreEtudiants = etudiants;
        if (window.filtreLangues && window.filtreLangues.length > 0) {
            filtreEtudiants = etudiants.filter(etudiant => window.filtreLangues.includes(etudiant.langue));
        }
        if (window.filtreSections && window.filtreSections.length > 0) {
            filtreEtudiants = etudiants.filter(etudiant => window.filtreSections.includes(etudiant.section));
        }
        if (window.filtreGroupes && window.filtreGroupes.length > 0) {
            filtreEtudiants = filtreEtudiants.filter(etudiant => window.filtreGroupes.includes(etudiant.groupe));
        }
        if (window.filtreNouvellesSections && window.filtreNouvellesSections.length > 0) {
            filtreEtudiants = filtreEtudiants.filter(etudiant => window.filtreNouvellesSections.includes(etudiant.Nouvelle_section));
        }
        if (window.filtreNouveauxGroupes && window.filtreNouveauxGroupes.length > 0) {
            filtreEtudiants = filtreEtudiants.filter(etudiant => window.filtreNouveauxGroupes.includes(etudiant.Nouveau_groupe));
        }

        ordreColonnes = ["num_insa", "civilite", "prenom", "nom", "annee", "langue", "email", "section", "groupe", "decision_jury", "commentaire", "Nouvelle_section", "Nouveau_groupe"];
        filtreEtudiants.forEach(etudiant => {
            const lig = tbody.insertRow();
            ordreColonnes.forEach(col => {
                const cell = lig.insertCell();
                cell.textContent = etudiant[col];
            });
        });
    })();
}