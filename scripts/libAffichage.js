function popup(message){
    const dialog = document.querySelector("dialog");
    const texte = document.getElementById("texte");
    const buttonFermer = document.getElementById("fermer");

    texte.textContent = message;
    dialog.showModal();
    buttonFermer.addEventListener("click", () => {
        dialog.close();
    });
}

async function Message_verification(message){
    return new Promise((resolve) => {
        const dialog = document.querySelector("dialog");
        const texte = document.getElementById("texte");
        const buttonFermer = document.getElementById("fermer");
        const buttonValider = document.getElementById("ouvrir");

        texte.textContent = message;

        dialog.showModal();
        buttonFermer.addEventListener("click", () => {
            dialog.close();
            resolve("annuler");
        });
        buttonValider.addEventListener("click", () => {
            dialog.close();
            resolve("valider");
        });
    })
}

async function nvGroupe(id, groupe) {
    const alerte = await window.libDB.affectationGroupe(id, groupe);
    if (alerte !== "Etudiant rajouté dans le groupe") {
        popup(alerte)
    }
}

async function nvCommentaire(id, commentaire) {
    try {
        await window.libDB.ajoutCommentaire(id, commentaire);
    } catch (err) {
        console.error("Erreur ajout commentaire :", err);
    }
}

async function nvEtudiant(id, civilite, prenom, nom, annee, langue, mail) {
    const alerte = await window.libDB.ajoutEtudiant(id, civilite, prenom, nom, annee, langue, mail);
    if (alerte !== "Etudiant ajouté") {
        popup(alerte)
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

let etudiantsCliques = [];

function clicEtudiants(ligne, id) {
    if (etudiantsCliques.includes(id)) {
        etudiantsCliques = etudiantsCliques.filter(studentId => studentId !== id);
        ligne.classList.remove('surligner');
    } else {
        etudiantsCliques.push(id);
        ligne.classList.add('surligner');
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
            ordreColonnes.forEach((col) => {
                const cell = lig.insertCell();
                if (col === "commentaire") {
                    cell.textContent = etudiant[col] || "";
                    cell.addEventListener("dblclick", () => {
                        const texteExistant = cell.textContent;
                        const zoneDeTexte = document.createElement("textarea");
                        zoneDeTexte.value = texteExistant;
                        cell.textContent = "";
                        cell.appendChild(zoneDeTexte);
                        zoneDeTexte.focus();
                        zoneDeTexte.addEventListener("blur", () => {
                            const ajoutTexte = zoneDeTexte.value.trim();
                            if (ajoutTexte !== texteExistant) {
                                window.libDB.ajoutCommentaire(etudiant.num_insa, ajoutTexte);
                                cell.textContent = ajoutTexte;
                            } else {
                                cell.textContent = texteExistant;
                            }
                        });
                        zoneDeTexte.addEventListener("keydown", (event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                zoneDeTexte.blur();
                            }
                        });
                    });
                } else {
                    cell.textContent = etudiant[col];
                }
            });
            lig.addEventListener('click', () => {
                clicEtudiants(lig, etudiant.num_insa)
            });
        });
    })();
}