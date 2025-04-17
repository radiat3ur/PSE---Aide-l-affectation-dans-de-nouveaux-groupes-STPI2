const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('libDB', {
    test: async () => ipcRenderer.invoke('test'),
    affectationGroupe: (id,groupe) => ipcRenderer.invoke('affectationGroupe',id,groupe),
    ajoutCommentaire: (id,commentaire) => ipcRenderer.invoke('ajoutCommentaire',id,commentaire),
    ajoutEtudiant: (id,civilite,prenom,nom,annee,langue,mail) => ipcRenderer.invoke('ajoutEtudiant',id,civilite,prenom,nom,annee,langue,mail),
    getStudent: (id) => ipcRenderer.invoke('getStudent',id)
});
