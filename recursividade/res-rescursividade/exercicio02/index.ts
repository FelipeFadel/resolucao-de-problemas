import Inteiro from "./Inteiro.ts";

let dez = new Inteiro(10);
console.log("Contagem progressiva até 10:");
dez.contagemProgressiva();

let um = new Inteiro(1);
console.log();
console.log("Contagem progressiva até 1:");
um.contagemProgressiva();

let zero = new Inteiro(0);
console.log();
console.log("Contagem progressiva até 0:");
zero.contagemProgressiva();

let menosDez = new Inteiro(-10);
console.log();
console.log("Contagem progressiva até -10:");
menosDez.contagemProgressiva();