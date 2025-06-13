// script pour gérer les intéractions utilisateur
window.onload = (event) => { //
    rafraichirEtudiants();

    // Aidé par Yann (à force de rajouter des choses, on aurait dû faire une fonction pour plus d'efficacité)
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

    // Lorsque l'on clique sur le bouton "AjoutEtudiant", on ajoute les info dans la base de données
    document.getElementById("AjoutEtudiant").addEventListener('submit', async function(event) {
        event.preventDefault(); // empêche le rechargement de la page sinon ça ne fonctionne pas
        const formData = new FormData(this); // on récèpre les données du formulaire
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

    // afficher la barre de recherche avec Ctrl + F
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.code == 'KeyF') {
            barreRecherche.style.display = 'block';
            const saisie = barreRecherche.querySelector('input');
            saisie.focus(); // met le curseur sur la saisie
        }
    });

    // fermer la barre de recherche avec la croix
    const croix = barreRecherche.querySelector('.fermer-recherche');
    croix.addEventListener('click', () => {
        barreRecherche.style.display = 'none';
    });

    // permet de surligner les correspondances
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

    // permet de changer de correspondance current en appuyant sur Entrée
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

    // gestion des filtres
    const filtreLangue = document.getElementById('filtreLangue');
    const menuLangue = document.getElementById('menuLangue');
    
    filtreLangue.addEventListener('click', function(e) {
        menuLangue.classList.toggle('cache'); // toggle enlève si présent, ajoute si absent
 
        // on récupère la position
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

    // gère l'affichage des informations supplémentaires
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
        document.getElementById("barreTri").classList.remove("cache");
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
        document.getElementById("barreTri").classList.add("cache");
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
        document.getElementById("barreTri").classList.add("cache");
    })

    // permet de mettre tous les étudiants cliqués dans un nouveau groupe
    document.getElementById('submit').addEventListener('click', async function(event) {
        const verification = await Message_verification(`Etes-vous sûr de vouloir faire cette modification pour le groupe : ${document.getElementById('groupe').value} ?`);

        if (verification == "valider") {
            let tousValides = true;
            const groupe = document.getElementById('groupe').value;
            for (const id of etudiantsCliques) {
                await nvGroupe(id, groupe, tousValides);
            }

            const etudiants = await recupererEtudiants();

            const tousDansLeBonGroupe = etudiantsCliques.every(id => {
                const etudiant = etudiants.find(e => e.num_insa == id);
                return etudiant && etudiant.Nouveau_groupe === groupe;
            });

            // Si tous les étudiants cliqués sont dans le bon groupe, on vide le tableau des étudiants cliqués
            if (tousDansLeBonGroupe) {
                etudiantsCliques = [];
                rafraichirEtudiants();
            }
        }
    });

    // permet de télécharger le tableau des étudiants au format CSV (appelle directement libDB.js, ce qui ne devrait pas être le cas)
    document.getElementById('telechargerCSV').addEventListener('click', async function() {
        await window.libDB.Fichier_csv('export.csv');
        const a = document.createElement('a');
        a.href = 'export.csv';
        a.download = 'export.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    async function afficherGroupesEtValeurs() {
        try {
            // Récupère le nombre d'étudiants par groupe, nouveau groupe et langue
            const groupes = await window.libDB.compterEtudiantsParGroupe();
            const nouveauxGroupes = await window.libDB.compterEtudiantsParNouveauGroupe();
            const langues = await window.libDB.compterEtudiantsParLangue();
    
            console.log("Données des groupes :", groupes);
            console.log("Données des nouveaux groupes :", nouveauxGroupes);//tests console
            console.log("Données des langues :", langues);
    
            // Sélectionne tableau onglet 2
            const tableau = document.getElementById('contenuOnglet2');
            const thead = tableau.querySelector('thead');
            const tbody = tableau.querySelector('tbody') || document.createElement('tbody');
            tableau.appendChild(tbody);
    
            // Tableau vide
            thead.innerHTML = '';
            tbody.innerHTML = '';
    
            // Liste langue sans doublons
            const languesUniques = [...new Set(langues.map(langue => langue.langue))];
    
            // en-tête du tableau
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
            groupes
            .filter(groupe => groupe.groupe && groupe.groupe!="H") // filtre pour que la ligne 0 et H ne s'affichent pas
            .forEach((groupe) => {
                const ligne = document.createElement('tr'); // créer une ligne pour chaque groupe
    
                
                const colonnesLangues = languesUniques.map(langue => { // pour chaque langue, on crée une colonne
                    const langueData = langues.find(l => l.Nouveau_groupe === groupe.groupe && l.langue === langue);   // on cherche dans le tableau des langues les données pour le groupe et la langue
                    const nb= langueData ? langueData.nombre_etudiants_langue_nouveau_groupe : 0; // si vide on met 0
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
        tbody.appendChild(ligneTotal); //ajout ligne total au tableau

        } catch (err) {
            console.error("Erreur lors de l'affichage des groupes et valeurs :", err.message); // message d'erreur si il y a
        }
    } 

    async function afficherCreneaux() {
        const infos = await window.libDB.recupererCreneauxParGroupes(); //récupère les créneaux des groupes
        const tableau = document.getElementById('TableauCreneaux'); //selectionne le tableau de l'onglet 3
        console.log("afficherCreneaux appelé");
        console.log("infos récupérées :", infos); // debug console

        let html = `<tr><th>Groupe Langue</th><th>Créneau</th><th>Groupe(s)</th></tr>`;
        let previousNom = null;
        let currentRow = null; // tableau vide
        let rows = [];

        for (const [nom, valeur] of Object.entries(infos)) { // pour chaque nom et valeur dans infos
            if (Array.isArray(valeur)) {
                for (const item of valeur) {
                    if (Array.isArray(item) && item.length === 2) { // si tableau de 2 éléments
                        if (previousNom === nom && currentRow) { // si le nom est le même que le précédent
                            currentRow.creneau += `<br>${item[0]}`; // ajoute le créneau à la ligne actuelle
                            currentRow.groupes += `<br>${Array.isArray(item[1]) ? item[1].join(', ') : item[1]}`; // ajoute les groupes à la ligne actuelle
                        } else {// si nom différent
                            currentRow = {
                                nom: nom,
                                creneau: item[0],
                                groupes: Array.isArray(item[1]) ? item[1].join(', ') : item[1] // nouvelle ligne créée et remplie
                            };
                            rows.push(currentRow); // ajoute la ligne au tableau
                            previousNom = nom; // stocke le nom pour savoir si le prochain est identique
                        }
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

    const tbody = document.querySelector("#tableauEtudiants tbody");

    // permet de rajouter un commentaire en double cliquant sur la cellule
    // cet usage a été compliqué à faire, nous n'avons pas utilisé libAffichage et preload.js comme on aurait dû
    // On appelle directement la fonction de libDB.js (ce qui ne devrait pas être le cas)
    tbody.addEventListener("dblclick", function(event) {
        const cell = event.target;
        if (cell.tagName === "TD" && cell.cellIndex === 10) {
            const lig = cell.parentElement;
            const id = lig.getAttribute('data-id');
            const texteExistant = cell.textContent;
            const textarea = cell.querySelector('textarea');
            // si on clic autre part, on quitte la zone de texte (en mettant à jour le commentaire avec ajoutCommentaire)
            textarea.addEventListener("blur", async function() {
                const ajoutTexte = this.value.trim();
                if (ajoutTexte === texteExistant) {
                    cell.textContent = texteExistant;
                } else {
                    await window.libDB.ajoutCommentaire(id, ajoutTexte);
                    rafraichirEtudiants();
                }
            });
            textarea.addEventListener("keydown", function(event) {
                if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    textarea.blur();
                }
            });
        }
    });

    // permet de supprimer un étudiant en cliquant sur le bouton "Supprimer" de la ligne
    tbody.addEventListener("click", function(event) {
        const boutonSupp = event.target.closest('.boutonSupprimer');
        if (boutonSupp) {
            const lig = boutonSupp.closest('tr');
            const id = lig.getAttribute('data-id');
            suppressionEtudiant(id);
            etudiantsCliques = []; // on vide le tableau des étudiants cliqués pour ne pas laisser l'étudiant supprimé dedans
        }
    });

    // déplacé dans libAffichage.js
    // tbody.querySelectorAll("tr").forEach(lig => {
    //     const id = lig.getAttribute('data-id');
    //     lig.onclick = (e) => {
    //         clicEtudiants(lig, id);
    //     };
    // });

    // gestion des tris
    document.getElementById('triId').addEventListener('click', function() {
        window.setTriEtudiants([{colonne: 'num_insa'}]);
    });
    document.getElementById('triNom').addEventListener('click', function() {
        window.setTriEtudiants([{colonne: 'nom'}]);
    });
    document.getElementById('triGroupe').addEventListener('click', function() {
        window.setTriEtudiants([{colonne: 'groupe'}, {colonne: 'nom'}]);
    });
    document.getElementById('triNouveauGroupe').addEventListener('click', function() {
        window.setTriEtudiants([{colonne: 'Nouveau_groupe'}, {colonne: 'nom'}]);
    });
    document.getElementById('triClasseNom').addEventListener('click', function() {
        window.setTriEtudiants([{colonne: 'section'}, {colonne: 'groupe'}, {colonne: 'nom'}]);
    });
});
} // on ne s'explique toujours pas le fait de devoir rajouter }); que l'on ouvre nul part