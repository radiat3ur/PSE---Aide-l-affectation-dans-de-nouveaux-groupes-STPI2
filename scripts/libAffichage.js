// Information à noter :
// window.libDB appelle les fonctions de preload.js et pas libDB.js en réalité

function popup(message){
    const dialog = document.getElementById("alerte");
    const texteAlerte = document.getElementById("texteAlerte");
    const buttonFermer = document.getElementById("fermer");

    texteAlerte.textContent = message;
    dialog.showModal();
    buttonFermer.addEventListener("click", () => {
        dialog.close();
    });
}

async function Message_verification(message){
    return new Promise((resolve) => {
        const dialog = document.getElementById("verification");
        const texteVerification = document.getElementById("texteVerification");
        const buttonRefuser = document.getElementById("refuser");
        const buttonValider = document.getElementById("accepter");

        texteVerification.textContent = message;

        dialog.showModal();
        buttonRefuser.addEventListener("click", () => {
            dialog.close();
            resolve("annuler");
        });
        buttonValider.addEventListener("click", () => {
            dialog.close();
            resolve("valider");
        });
    })
}

// fonction permettant d'ajouter plusieurs étudiants à un groupe
async function nvGroupe(id, groupe, tousValides) {
    const alerte = await window.libDB.affectationGroupe(id, groupe, tousValides);
    if (alerte !== "Etudiant rajouté dans le groupe") {
        popup(alerte);
        tousValides = false;
        // Surligner en rouge les lignes des étudiant problématique
        const ligne = document.querySelector(`#tableauEtudiants tr[data-id='${id}']`);
        if (ligne) {
            ligne.classList.add('surligner-rouge');
        }
    }
}

// fonction permettant d'ajouter un commentaire à un étudiant
async function nvCommentaire(id, commentaire) {
    try {
        await window.libDB.ajoutCommentaire(id, commentaire);
    } catch (err) {
        console.error("Erreur ajout commentaire :", err);
    }
}

// fonction permettant d'ajouter un étudiant à la base de données
async function nvEtudiant(id, civilite, prenom, nom, annee, langue, mail) {
    const alerte = await window.libDB.ajoutEtudiant(id, civilite, prenom, nom, annee, langue, mail);
    if (alerte !== "Etudiant ajouté") {
        popup(alerte)
        }
}

// fonction permettant de récupérer la liste des étudiants
async function recupererEtudiants() {
    try {
        const etudiants = await window.libDB.recupererEtudiants();
        return etudiants;
    } catch (err) {
        console.error("Erreur lors de la récupération des étudiants :", err.message);
        throw err;
    }
}


// fonction permettant de cliquer sur les étudiants et de les mettre dans un tableau (dans le but de les affecter dans un groupe tous en même temps)
let etudiantsCliques = [];

function clicEtudiants(ligne, id) {
    // si l'étudiant est déjà dans le tableau etudiantsCliques, on le retire et on enlève le surlignage
    if (etudiantsCliques.includes(id)) {
        etudiantsCliques = etudiantsCliques.filter(idEtudiant => idEtudiant !== id);
        ligne.classList.remove('surligner');
        ligne.classList.remove('surligner-rouge');
    // sinon, on l'ajoute au tableau et on le surligne
    } else {
        etudiantsCliques.push(id);
        ligne.classList.add('surligner');
    }
}

// fonction permettant de supprimer un étudiant
function suppressionEtudiant(id) {
    Message_verification("Êtes-vous sûr de vouloir supprimer cet étudiant ?").then(async (result) => {
        if (result === "valider") {
            await window.libDB.supprimerEtudiant(id);
            rafraichirEtudiants();
        }
    });
}

window.triEtudiants = window.triEtudiants || [];

// fonction pour définir le tri des étudiants
function setTriEtudiants(criteres) {
    window.triEtudiants = criteres;
    rafraichirEtudiants();
}

// fonction permettant de trier les étudiants
function trierEtudiants(etudiants) {
    return etudiants.slice().sort((a, b) => { // Utilisation de slice() pour ne pas modifier l'original (copie)
        for (const critere of window.triEtudiants) {
            let valA = a[critere.colonne] || '';
            let valB = b[critere.colonne] || '';
            if (critere.colonne === 'num_insa') {
                if (valA !== valB) return valA - valB;
            } else {
                valA = valA.toLowerCase(); // Convertir en minuscules que que soit insensible à la casse quand on compare
                valB = valB.toLowerCase();
                if (valA < valB) return -1;
                if (valA > valB) return 1;
            }
        }
        return 0;
    });
}

// fonction permettant de rafraîchir la liste des étudiants
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

        filtreEtudiants = trierEtudiants(filtreEtudiants);

        ordreColonnes = ["num_insa", "civilite", "prenom", "nom", "annee", "langue", "email", "section", "groupe", "decision_jury", "commentaire", "Nouvelle_section", "Nouveau_groupe", ""];
        filtreEtudiants.forEach(etudiant => {
            const lig = tbody.insertRow();
            lig.setAttribute('data-id', etudiant.num_insa); // Ajout de l'attribut data-id (pour la suppression de l'étudiant dans script.js)
            ordreColonnes.forEach((col) => {
                const cell = lig.insertCell();
                if (col === "commentaire") {
                    // Zone de texte pour le commentaire
                    cell.textContent = etudiant[col] || "";
                    cell.ondblclick = () => {
                        const texteExistant = cell.textContent;
                        cell.innerHTML = "";
                        const zoneDeTexte = document.createElement("textarea");
                        zoneDeTexte.value = texteExistant;
                        cell.appendChild(zoneDeTexte);
                        zoneDeTexte.focus();
                    };
                } else if (col === "") {
                    // Bouton pour supprimer l'étudiant de la database
                    const boutondeSuppression = document.createElement("button");
                    boutondeSuppression.classList.add("boutonSupprimer");
                    const img = document.createElement("img");
                    img.src = "images/supprimer.png";
                    img.alt = "Supprimer";
                    img.style.width = "20px";
                    img.style.height = "20px";
                    boutondeSuppression.appendChild(img);
                    cell.appendChild(boutondeSuppression);
                } else {
                    // Remplissage des autres cellules
                    cell.textContent = etudiant[col];
                }
            });
            // devrait être dans script.js mais ne fonctionne pas après une autre action dans ce cas
            // nous n'avons réussi à résoudre ce problème qu'en mettant cela ici même si ce n'est pas le bon endroit
            lig.onclick = (e) => {
                clicEtudiants(lig, etudiant.num_insa);
            };
        });
    })();
}