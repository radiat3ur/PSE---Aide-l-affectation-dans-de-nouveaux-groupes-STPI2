window.onload = (event) => {
    (async () => {})();

    rafraichirEtudiants();

    // Aidé par Yann
    // ____
    let LANGUES = {};
    fetch('./json/langues.json')
        .then(reponse => reponse.json())
        .then(data => {
            LANGUES = data;
        })
        .finally(() => {
            document.querySelectorAll('.selectionnerLangue').forEach(select => {
                Object.entries(LANGUES).forEach(([key, value]) => {
                    var option = document.createElement('option');
                    option.value = value;
                    option.text = key;
                    select.appendChild(option);
                });
            });
            Object.entries(LANGUES).forEach(([key, value]) => {
                const div = document.createElement('div');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = value;
                checkbox.id = 'langues-' + value;
                const labelElement = document.createElement('label');
                labelElement.htmlFor = checkbox.id; // lier le label au checkbox
                labelElement.textContent = key;
                div.appendChild(checkbox);
                div.appendChild(labelElement);
                menuLangue.appendChild(div);
        
                checkbox.addEventListener('change', () => {
                    const selected = Array.from(menuLangue.querySelectorAll('input[type="checkbox"]:checked'))
                                          .map(cb => cb.value);
                    window.filtreLangues = selected; // c'est ici qu'on stocke les langues sélectionnés pour les donner à rafraichirEtudiants
                    rafraichirEtudiants();
                });
            });
        });
    
    let CIVILITES = {};
    fetch('./json/civilites.json')
        .then(reponse => reponse.json())
        .then(data => {
            CIVILITES = data;
        })
        .finally(() => {
            document.querySelectorAll('.selectionnerCivilite').forEach(select => {
                Object.entries(CIVILITES).forEach(([key, value]) => {
                    var option = document.createElement('option');
                    option.value = value;
                    option.text = key;
                    select.appendChild(option);
                });
            });
        });
    
    let SECTIONS = {};
    fetch('./json/sections.json')
        .then(reponse => reponse.json())
        .then(data => {
            SECTIONS = data;
        })
        .finally(() => {
            document.querySelectorAll('.selectionnerSection').forEach(select => {
                Object.entries(SECTIONS).forEach(([key, value]) => {
                    var option = document.createElement('option');
                    option.value = value;
                    option.text = key;
                    select.appendChild(option);
                });
            });
            Object.entries(SECTIONS).forEach(([key, value]) => {
                const div = document.createElement('div');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = value;
                checkbox.id = 'sections-' + value;
                const labelElement = document.createElement('label');
                labelElement.htmlFor = checkbox.id;
                labelElement.textContent = key;
                div.appendChild(checkbox);
                div.appendChild(labelElement);
                menuSection.appendChild(div);
        
                checkbox.addEventListener('change', function(){
                    const selected = Array.from(menuSection.querySelectorAll('input[type="checkbox"]:checked'))
                                          .map(cb => cb.value);
                    window.filtreSections = selected;
                    rafraichirEtudiants();
                });
            });
            Object.entries(SECTIONS).forEach(([key, value]) => {
                const div = document.createElement('div');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = value;
                checkbox.id = 'sections-' + value;
                const labelElement = document.createElement('label');
                labelElement.htmlFor = checkbox.id;
                labelElement.textContent = key;
                div.appendChild(checkbox);
                div.appendChild(labelElement);
                menuNouvelleSection.appendChild(div);
        
                checkbox.addEventListener('change', function(){
                    const selected = Array.from(menuNouvelleSection.querySelectorAll('input[type="checkbox"]:checked'))
                                            .map(cb => cb.value);
                    window.filtreNouvellesSections = selected;
                    rafraichirEtudiants();
                });
            });
        });
    
    let GROUPES = {};
    fetch('./json/groupes.json')
        .then(reponse => reponse.json())
        .then(data => {
            GROUPES = data;
        })
        .finally(() => {
            document.querySelectorAll('.selectionnerGroupe').forEach(select => {
                Object.entries(GROUPES).forEach(([key, value]) => {
                    var option = document.createElement('option');
                    option.value = value;
                    option.text = key;
                    select.appendChild(option);
                });
            });
            Object.entries(GROUPES).forEach(([key, value]) => {
                const div = document.createElement('div');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = value;
                checkbox.id = 'groupes-' + value;
                const labelElement = document.createElement('label');
                labelElement.htmlFor = checkbox.id;
                labelElement.textContent = key;
                div.appendChild(checkbox);
                div.appendChild(labelElement);
                document.getElementById('menuGroupe').appendChild(div);

                checkbox.addEventListener('change', function(){
                    const selected = Array.from(menuGroupe.querySelectorAll('input[type="checkbox"]:checked'))
                                            .map(cb => cb.value);
                    window.filtreGroupes = selected; 
                    rafraichirEtudiants();
                });
            });
            Object.entries(GROUPES).forEach(([key, value]) => {
                const div = document.createElement('div');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = value;
                checkbox.id = 'groupes-' + value;
                const labelElement = document.createElement('label');
                labelElement.htmlFor = checkbox.id;
                labelElement.textContent = key;
                div.appendChild(checkbox);
                div.appendChild(labelElement);
                document.getElementById('menuNouveauGroupe').appendChild(div);
        
                checkbox.addEventListener('change', function(){
        
                    const selected = Array.from(menuNouveauGroupe.querySelectorAll('input[type="checkbox"]:checked'))
                                            .map(cb => cb.value);
                    window.filtreNouveauxGroupes = selected; 
                    rafraichirEtudiants();
                });
            });
    // ____     

    document.getElementById("AjoutEtudiant").addEventListener('submit', async function(event) {
        event.preventDefault();
        const formData = new FormData(this);
        const id = formData.get('identifiant');
        const civilite = formData.get('civilite');
        const prenom = formData.get('prenom');
        const nom = formData.get('nom');
        const annee = formData.get('annee');
        const langue = formData.get('langue');
        const mail = formData.get('mail');
        const verification = await Message_verification(`Etes-vous sûr de vouloir ajouter l'étudiant : ${prenom} ${nom} ?`);

        if (verification == "valider") {
            await nvEtudiant(id, civilite, prenom, nom, annee, langue, mail);
        }
        this.reset();
        rafraichirEtudiants();
    });

    const barreRecherche = document.querySelector('.barre-recherche');

    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.code == 'KeyF') {
            barreRecherche.style.display = 'block';
            const saisie = barreRecherche.querySelector('input');
            saisie.focus(); // met le curseur sur la saisie
        }
    });

    const croix = barreRecherche.querySelector('.fermer-recherche');
    croix.addEventListener('click', () => {
        barreRecherche.style.display = 'none';
    });

    document.getElementById("recherche").addEventListener("keyup", (event) => { // problème avec keydown
        if (event.key === "Enter") return; // évite de surligner quand on valide la saisie (sinon on reste bloqué à la première correspondance)
        let saisie = event.target.value.trim(); // trim() enlève espaces avant et après
        const tbody = document.querySelector("#tableauEtudiants tbody");
        
        // surligner toutes les occurences
        tbody.querySelectorAll("tr").forEach(lig => {
            lig.querySelectorAll("td").forEach(cell => {
                if (!cell.dataset.original) {
                    cell.dataset.original = cell.textContent;
                }
                const original = cell.dataset.original;
                if (saisie !== "") {
                    const occurences = new RegExp(`(${saisie})`);
                    cell.innerHTML = original.replace(occurences, '<span class="surligner">$1</span>');
                } else {
                    cell.innerHTML = original;
                }
            });
        });

        indexCurrentCorrespondance = -1;
        correspondance = document.querySelectorAll("#tableauEtudiants .surligner");
    });

    document.getElementById("recherche").addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            indexCurrentCorrespondance = (indexCurrentCorrespondance + 1) % correspondance.length;
            let currentElement = correspondance[indexCurrentCorrespondance];
            
            let elementPrecedent = document.querySelector(".surligner.current");
            if (elementPrecedent) elementPrecedent.classList.remove("current");
            currentElement.classList.add("current");
            
            currentElement.scrollIntoView({block: "center"});
        }
    });

    const filtreLangue = document.getElementById('filtreLangue');
    const menuLangue = document.getElementById('menuLangue');
    
    filtreLangue.addEventListener('click', function(e) {
        menuLangue.classList.toggle('cache'); // toggle enlève si présent, ajoute si absent
 
        const rect = filtreLangue.getBoundingClientRect();
        menuLangue.style.top = rect.bottom;
        menuLangue.style.left = rect.left;
    });

    const filtreSection = document.getElementById('filtreSection');
    const menuSection = document.getElementById('menuSection');

    filtreSection.addEventListener('click', function(e) {
        menuSection.classList.toggle('cache');

        const rect = filtreSection.getBoundingClientRect();
        menuSection.style.top = rect.bottom;
        menuSection.style.left = rect.left;
    });

    const filtreGroupe = document.getElementById('filtreGroupe');
    const menuGroupe = document.getElementById('menuGroupe');
    
    filtreGroupe.addEventListener('click', function(e) {
        menuGroupe.classList.toggle('cache');

        const rect = filtreGroupe.getBoundingClientRect();
        menuGroupe.style.top = rect.bottom;
        menuGroupe.style.left = rect.left;
    });

    const filtreNouvelleSection = document.getElementById('filtreNouvelleSection');
    const menuNouvelleSection = document.getElementById('menuNouvelleSection');
    
    filtreNouvelleSection.addEventListener('click', function(e) {
        menuNouvelleSection.classList.toggle('cache');
        const rect = filtreNouvelleSection.getBoundingClientRect();
        menuNouvelleSection.style.top = rect.bottom;
        menuNouvelleSection.style.left = rect.left;
    });

    const filtreNouveauGroupe = document.getElementById('filtreNouveauGroupe');
    const menuNouveauGroupe = document.getElementById('menuNouveauGroupe');
    
    filtreNouveauGroupe.addEventListener('click', function(e) {
        menuNouveauGroupe.classList.toggle('cache');

        const rect = filtreNouveauGroupe.getBoundingClientRect();
        menuNouveauGroupe.style.top = rect.bottom;
        menuNouveauGroupe.style.left = rect.left;
    });

    // const colonnesInfoSup = ['Civilité', 'Année', 'Mail', 'Décision Jury STPI1', 'Commentaire'];
    // document.querySelectorAll('#tableauEtudiants th').forEach((titre, index) => {
    //     if (colonnesInfoSup.includes(titre.textContent)) {
    //         document.querySelectorAll('#tableauEtudiants tbody tr').forEach(lig => {
    //             const cells = lig.querySelectorAll('td');
    //             if (cells[index]) {
    //                 cells[index].classList.add('cache');
    //             }
    //         });
    //     }
    // });

    document.getElementById('changerInfo').addEventListener('click', function() {
        document.querySelectorAll('#tableauEtudiants th').forEach((titre, index) => {
            if (titre.innerText === 'Civilité' || titre.innerText === 'Année' || titre.innerText === 'Mail' || titre.innerText === 'Décision Jury STPI1' || titre.innerText=== 'Commentaire') {
                titre.classList.toggle('cache');
                document.querySelectorAll('#tableauEtudiants tbody tr').forEach(lig => {
                    const cells = lig.querySelectorAll('td');
                    if (cells[index]) {
                        cells[index].classList.toggle('cache');
                    }
                });
            }
        });
        if (this.innerText == 'Plus d\'informations') {
            this.innerText = 'Moins d\'informations';
        }
        else {
            this.innerText = 'Plus d\'informations';
        }
    });

    document.getElementById('onglet1').addEventListener('click', function () {
        // Masquer contenu l'onglet 2
        document.getElementById('contenuOnglet2').classList.add('cache');
        // Masquer contenu l'onglet 3
        document.getElementById('TableauCreneaux').classList.add('cache');
        // Afficher contenu onglet 1
        document.getElementById('tableauEtudiants').classList.remove('cache');
        //met à jour style boutons
        document.getElementById('onglet1').classList.add('active');
        document.getElementById('onglet2').classList.remove('active');
        document.getElementById('onglet3').classList.remove('active');
    });
    
    document.getElementById('onglet2').addEventListener('click', function () {
        // Masquer contenu onglet 1
        document.getElementById('tableauEtudiants').classList.add('cache');
        // Afficher contenu onglet 2
        document.getElementById('contenuOnglet2').classList.remove('cache');
        //Masquer contenu onglet 3
        document.getElementById('TableauCreneaux').classList.add('cache');
        //met à jour style boutons  
        document.getElementById('onglet2').classList.add('active');
        document.getElementById('onglet1').classList.remove('active');
        document.getElementById('onglet3').classList.remove('active');
         // Charger les données pour l'onglet 2
        afficherGroupesEtValeurs();
    });

    document.getElementById('onglet3').addEventListener('click', function () {
        // Masquer contenu onglet 1
        document.getElementById('tableauEtudiants').classList.add('cache');
        // Masquer contenu onglet 2
        document.getElementById('contenuOnglet2').classList.add('cache');
        // Afficher contenu onglet 3
        document.getElementById('TableauCreneaux').classList.remove('cache');
        // Charger les créneaux pour l'onglet 3
        afficherCreneaux();
        //met à jour style boutons  
        document.getElementById('onglet3').classList.add('active');
        document.getElementById('onglet1').classList.remove('active');
        document.getElementById('onglet2').classList.remove('active');
    })
let ordreIdInverse = false; // par défaut : tri croissant


document.getElementById("triId").addEventListener("click", async () => {
    const etudiants = await recupererEtudiants();


    const sorted = etudiants.sort((a, b) => {
        return ordreIdInverse
            ? b.num_insa - a.num_insa // décroissant
            : a.num_insa - b.num_insa; // croissant
    });


    const tbody = document.querySelector("#tableauEtudiants tbody");
    tbody.innerHTML = "";


    const ordreColonnes = ["num_insa", "civilite", "prenom", "nom", "annee", "langue", "email", "section", "groupe", "decision_jury", "commentaire", "Nouvelle_section", "Nouveau_groupe"];


    sorted.forEach(etudiant => {
        const lig = tbody.insertRow();
        ordreColonnes.forEach(col => {
            const cell = lig.insertCell();
            cell.textContent = etudiant[col];
        });
        lig.addEventListener('click', () => {
            clicEtudiants(lig, etudiant.num_insa);
        });
    });


    // Inverser pour prochain clic
    ordreIdInverse = !ordreIdInverse;


    // Changer texte bouton
    const bouton = document.getElementById("triId");
    bouton.innerText = ordreIdInverse ? "Trier ID ↓" : "Trier ID ↑";
});
let ordreInverse = true; // état initial : Z → A
document.getElementById("triNomDesc").addEventListener("click", async () => {
    const etudiants = await recupererEtudiants();


    const sorted = etudiants.sort((a, b) => {
        return ordreInverse
            ? b.nom.localeCompare(a.nom) // Z → A
            : a.nom.localeCompare(b.nom); // A → Z
    });


    const tbody = document.querySelector("#tableauEtudiants tbody");
    tbody.innerHTML = "";


    const ordreColonnes = ["num_insa", "civilite", "prenom", "nom", "annee", "langue", "email", "section", "groupe", "decision_jury", "commentaire", "Nouvelle_section", "Nouveau_groupe"];


    sorted.forEach(etudiant => {
        const lig = tbody.insertRow();
        ordreColonnes.forEach(col => {
            const cell = lig.insertCell();
            cell.textContent = etudiant[col];
        });
        lig.addEventListener('click', () => {
            clicEtudiants(lig, etudiant.num_insa);
        });
    });


    // Inverse l’ordre pour la prochaine fois
    ordreInverse = !ordreInverse;


    // Optionnel : changer le texte du bouton
    const bouton = document.getElementById("triNomDesc");
    bouton.innerText = ordreInverse ? "Trier Z → A" : "Trier A → Z";
});

    document.getElementById('submit').addEventListener('click', async function(event) {
        const verification = await Message_verification(`Etes-vous sûr de vouloir faire cette modification pour le groupe : ${document.getElementById('groupe').value} ?`);

        if (verification == "valider") {
            let tousValides = true;
            const groupe = document.getElementById('groupe').value;
            for (const id of etudiantsCliques) {
                await nvGroupe(id, groupe, tousValides);
            }

            // Récupérer la liste à jour des étudiants
            const etudiants = await recupererEtudiants();

            const tousDansLeBonGroupe = etudiantsCliques.every(id => {
                const etudiant = etudiants.find(e => e.num_insa == id);
                return etudiant && etudiant.Nouveau_groupe === groupe;
            });

            if (tousDansLeBonGroupe) {
                etudiantsCliques = [];
                rafraichirEtudiants();
            } else {
                etudiantsCliques.forEach(id => {
                    const ligne = document.querySelector(`#tableauEtudiants tr[data-id='${id}']`);
                    if (ligne) {
                        const etu = etudiants.find(e => e.num_insa == id);
                        if (etu && etu.Nouveau_groupe !== groupeCible) {
                            ligne.classList.add('surligner-rouge');
                        } else {
                            ligne.classList.add('surligner');
                        }
                    }
                });;
            }
        }
    });

    async function afficherGroupesEtValeurs() {
        try {
            // Récupérer les données des groupes, nouveaux groupes et langues depuis le backend
            const groupes = await window.libDB.compterEtudiantsParGroupe();
            const nouveauxGroupes = await window.libDB.compterEtudiantsParNouveauGroupe();
            const langues = await window.libDB.compterEtudiantsParLangue();
    
            console.log("Données des groupes :", groupes);
            console.log("Données des nouveaux groupes :", nouveauxGroupes);
            console.log("Données des langues :", langues);
    
            // Sélectionner le tableau de l'onglet 2
            const tableau = document.getElementById('contenuOnglet2');
            const thead = tableau.querySelector('thead');
            const tbody = tableau.querySelector('tbody') || document.createElement('tbody');
            tableau.appendChild(tbody);
    
            // Vider le tableau avant de le remplir
            thead.innerHTML = '';
            tbody.innerHTML = '';
    
            // Obtenir la liste unique des langues
            const languesUniques = [...new Set(langues.map(langue => langue.langue))];
    
            // Créer l'en-tête du tableau
            const ligneEnTete = document.createElement('tr');
            ligneEnTete.innerHTML = `
                <th>Groupe</th>
                ${languesUniques.map(langue => `<th>${langue}</th>`).join('')}
                <th>Total</th>
            `;
            thead.appendChild(ligneEnTete);

            //totaux
             const totauxParLangue = {};
             languesUniques.forEach(langue => totauxParLangue[langue] = 0);
    
            // Ajouter les données au tableau
            groupes.forEach((groupe) => {
                const ligne = document.createElement('tr');
    
                // Calculer les données pour chaque langue
                const colonnesLangues = languesUniques.map(langue => {
                    const langueData = langues.find(l => l.Nouveau_groupe === groupe.groupe && l.langue === langue);
                    const nb= langueData ? langueData.nombre_etudiants_langue_nouveau_groupe : 0;
                    totauxParLangue[langue] += nb; // Maj total
                    return nb;
                });
    
                // total des étudiants pour le groupe
                const totalEtudiants = colonnesLangues.reduce((acc, val) => acc + val, 0);
    
                // remplir ligne tableau
                ligne.innerHTML = `
                    <td>${groupe.groupe}</td>
                    ${colonnesLangues.map(nombre => `<td>${nombre}</td>`).join('')}
                    <td>${totalEtudiants}</td>
                `;
                tbody.appendChild(ligne);
            });
            
             // total général
        const totalGeneral = Object.values(totauxParLangue).reduce((a, b) => a + b, 0);

        // ligne de total
        const ligneTotal = document.createElement('tr');
        ligneTotal.innerHTML = `
            <td><b>Total</b></td>
            ${languesUniques.map(langue => `<td><b>${totauxParLangue[langue]}</b></td>`).join('')}
            <td><b>${totalGeneral}</b></td>
        `;
        tbody.appendChild(ligneTotal);

        } catch (err) {
            console.error("Erreur lors de l'affichage des groupes et valeurs :", err.message);
        }
    } 

    async function afficherCreneaux() {
        const infos = await window.libDB.recupererCreneauxParGroupes();
        const tableau = document.getElementById('TableauCreneaux');
        console.log("afficherCreneaux appelé");
        console.log("infos récupérées :", infos);

        let html = `<tr><th>Groupe Langue</th><th>Créneau</th><th>Groupe(s)</th></tr>`;
        let previousNom = null;
        let currentRow = null;
        let rows = [];

        for (const [nom, valeur] of Object.entries(infos)) {
            if (Array.isArray(valeur)) {
                for (const item of valeur) {
                    if (Array.isArray(item) && item.length === 2) {
                        if (previousNom === nom && currentRow) {
                            // Ajoute un retour chariot dans la même cellule
                            currentRow.creneau += `<br>${item[0]}`;
                            currentRow.groupes += `<br>${Array.isArray(item[1]) ? item[1].join(', ') : item[1]}`;
                        } else {
                            // Nouvelle ligne
                            currentRow = {
                                nom: nom,
                                creneau: item[0],
                                groupes: Array.isArray(item[1]) ? item[1].join(', ') : item[1]
                            };
                            rows.push(currentRow);
                            previousNom = nom;
                        }
                    } else {
                        // Cas particulier, on traite comme une nouvelle ligne
                        currentRow = {
                            nom: nom,
                            creneau: JSON.stringify(item),
                            groupes: ''
                        };
                        rows.push(currentRow);
                        previousNom = nom;
                    }
                }
            } 
        }

        // Génère le HTML final
        for (const row of rows) {
            html += `<tr>
                <td>${row.nom}</td>
                <td>${row.creneau}</td>
                <td>${row.groupes}</td>
            </tr>`;
        }

        tableau.innerHTML = html;
    }

    document.getElementById('.boutonSupprimer').addEventListener('click', function() {
        suppressionEtudiant(this.getAttribute('data-id'));
        
    });
});
}

