import Domino from "./domino";

const game = new Domino();

game.startGame(6, 6);
console.log(game.getTable());

game.addFirst(6, 4);
console.log(game.getTable());

game.addLast(6, 5);
console.log(game.getTable());

game.addFirst(4, 4);
game.addLast(4, 4);
console.log(game.getTable());

game.addLast(5, 5);
console.log(game.getTable());

game.addFirst(4, 2);
console.log(game.getTable());

game.addLast(5, 1);
console.log(game.getTable());

game.addFirst(2, 3);
console.log(game.getTable());

game.addLast(1, 0);
console.log(game.getTable());

game.addFirst(3, 3);
console.log(game.getTable());

game.addLast(0, 0);
console.log(game.getTable());

// Jogadas inválidas
game.addFirst(8, 2); // número inválido
console.log(game.getTable());
game.addLast(-1, 5); // número inválido
console.log(game.getTable());
game.addFirst(1, 1); // não encaixa
console.log(game.getTable());
game.addLast(2, 2); // não encaixa
game.addFirst(7, 3);

console.log(game.getTable());
