import BinaryTree from "./BinaryTree";

const bst = new BinaryTree(50);

bst.addSon(50);
bst.addSon(126);
bst.addSon(28);
bst.addSon(77);
bst.addSon(12);
bst.addSon(429);
bst.addSon(39);
bst.addSon(84);
bst.addSon(256);
bst.addSon(31);

console.log("Ordem: " + bst.getOrdem());
console.log("Pre Ordem: " + bst.getPreOrdem());
console.log("Pos Ordem: " + bst.getPosOrdem());

if (bst.remove(12)) console.log("12 removido");
else console.log("12 não removido, n inexistente");
console.log("Ordem: " + bst.getOrdem());
