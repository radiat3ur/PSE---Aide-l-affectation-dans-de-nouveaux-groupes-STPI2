function exampleFunction(){
    document.getElementById('Title').style.backgroundColor = "red";
};

function fonctionCouleur(){
    document.getElementById('Text').style.backgroundColor = "blue";
}

function nvGroupe(){
    `UPDATE students SET groupe_A2 = groupe`
}

window.onload = (event) => {
    document.getElementById("Text").addEventListener("click",fonctionCouleur);
    document.getElementById("bouton1").addEventListener("click",exampleFunction);
    document.getElementById("bouton2").addEventListener("click",exampleFunction);
}