// pont sécurisé entre front-end et back-end

const { contextBridge, ipcRenderer } = require('electron');

// 'libDB' choisi pour une impression d'appeler directement les fonctions de libDB.js
// La mpême logique pour les noms de messages qui sont les mêmes que les fonctions de libDB.js
// Cela était pour une facilité d'utilisation au début du code avec Electron, pour s'adapter facilement
contextBridge.exposeInMainWorld('libDB', {
    affectationGroupe: (id, groupe, tousValides) => ipcRenderer.invoke('affectationGroupe',id, groupe, tousValides),
    ajoutCommentaire: (id, commentaire) => ipcRenderer.invoke('ajoutCommentaire',id, commentaire),
    ajoutEtudiant: (id, civilite, prenom, nom, annee, langue, mail) => ipcRenderer.invoke('ajoutEtudiant',id, civilite, prenom, nom, annee, langue, mail),
    recupererEtudiants: () => ipcRenderer.invoke('recupererEtudiants'),
    compterEtudiantsParGroupe: () => ipcRenderer.invoke('recupererGroupesEtValeurs'),
    compterEtudiantsParNouveauGroupe: () => ipcRenderer.invoke('recupererNouveauGroupesEtValeurs'),
    compterEtudiantsParLangue: () => ipcRenderer.invoke('recupererLangueParGroupe'),
    recupererCreneauxParGroupes:() => ipcRenderer.invoke('recupererCreneauxParGroupes'),
    supprimerEtudiant: (id) => ipcRenderer.invoke('supprimerEtudiant', id),
    Fichier_csv: (nomFichier) => ipcRenderer.invoke('Fichier_csv', nomFichier),
});
