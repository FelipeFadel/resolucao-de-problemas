import Inteiro from "./Inteiro.ts";

let cinco = new Inteiro(-5);

console.log("Fatorial de 5:");
console.log(cinco.fatorial());

console.log();
console.log("5 elevado a 0:");
console.log(cinco.potencia(0));

console.log();
console.log("5 elevado a 1:");
console.log(cinco.potencia(1));

console.log();
console.log("5 elevado a 3:");
console.log(cinco.potencia(3));

console.log();
console.log("Quinto elemento da série de Fibonacci:");
console.log(cinco.fibo());