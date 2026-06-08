import BinaryTree from "./BinaryTree";

const bst = new BinaryTree(50);

// Raiz
console.log(bst.search(50), "Teste 1 falhou");

// Inexistente sem filhos
console.log(bst.search(30), "Teste 2 falhou");

// Filhos diretos
bst.addSon(60);
bst.addSon(40);
console.log(bst.search(60), "Teste 3 falhou");
console.log(bst.search(40), "Teste 4 falhou");

// Múltiplos níveis
bst.addSon(70);
bst.addSon(30);
console.log(bst.search(70), "Teste 5 falhou");
console.log(bst.search(30), "Teste 6 falhou");

// Inexistente com filhos
console.log(!bst.search(99), "Teste 7 falhou");

// Duplicata
console.log(bst.addSon(50), "Teste 8 falhou");
