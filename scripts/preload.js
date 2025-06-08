const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('libDB', {
    affectationGroupe: (id, groupe, tousValides) => ipcRenderer.invoke('affectationGroupe',id, groupe, tousValides),
    ajoutCommentaire: (id, commentaire) => ipcRenderer.invoke('ajoutCommentaire',id, commentaire),
    ajoutEtudiant: (id, civilite, prenom, nom, annee, langue, mail) => ipcRenderer.invoke('ajoutEtudiant',id, civilite, prenom, nom, annee, langue, mail),
    recupererEtudiants: () => ipcRenderer.invoke('recupererEtudiants'),
    lectureCommentaire: (id) => ipcRenderer.invoke('lectureCommentaire', id),
    compterEtudiantsParGroupe: () => ipcRenderer.invoke('recupererGroupesEtValeurs'),
    compterEtudiantsParNouveauGroupe: () => ipcRenderer.invoke('recupererNouveauGroupesEtValeurs'),
    compterEtudiantsParLangue: () => ipcRenderer.invoke('recupererLangueParGroupe'),
    recupererCreneauxParGroupes:() => ipcRenderer.invoke('recupererCreneauxParGroupes'),
    supprimerEtudiant: (id) => ipcRenderer.invoke('supprimerEtudiant', id),
    Fichier_csv: (nomFichier) => ipcRenderer.invoke('Fichier_csv', nomFichier),
});
