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
                menuGroupe.appendChild(div);

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
                menuNouveauGroupe.appendChild(div);
        
                checkbox.addEventListener('change', function(){
        
                    const selected = Array.from(menuNouveauGroupe.querySelectorAll('input[type="checkbox"]:checked'))
                                            .map(cb => cb.value);
                    window.filtreNouveauxGroupes = selected; 
                    rafraichirEtudiants();
                });
            });
        });
    // ____ 
    
    let FormSelectionne = document.getElementById("selectionAction").value;
    document.getElementById(FormSelectionne).classList.remove('cache');
    document.getElementById(FormSelectionne).classList.add('action');
    document.getElementById("selectionAction").addEventListener('change', function() {
        if (FormSelectionne) {
            document.getElementById(FormSelectionne).classList.remove('action');
            document.getElementById(FormSelectionne).classList.add('cache');
        };
        FormSelectionne = this.value;
        if (FormSelectionne) {
            document.getElementById(FormSelectionne).classList.remove('cache');
            document.getElementById(FormSelectionne).classList.add('action');
        };
    });

    document.getElementById("formModificationGroupe").addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(this);
        const id = formData.get('identifiant');
        const groupe = formData.get('groupe');

        nvGroupe(id, groupe);

        this.reset();
        rafraichirEtudiants();
    });

    document.getElementById("formModificationCommentaire").addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(this);
        const id = formData.get('identifiant');
        const commentaire = formData.get('commentaire');

        nvCommentaire(id, commentaire);

        this.reset();
        rafraichirEtudiants();
    });

    document.getElementById("formAjoutEtudiant").addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(this);
        const id = formData.get('identifiant');
        const civilite = formData.get('civilite');
        const prenom = formData.get('prenom');
        const nom = formData.get('nom');
        const annee = formData.get('annee');
        const langue = formData.get('langue');
        const mail = formData.get('mail');

        nvEtudiant(id, civilite, prenom, nom, annee, langue, mail);

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
}