import Intervalo from "./Intervalo.ts";

let umIntervalo = new Intervalo(10, 20);
console.log("Contagem 10 até 20:");
umIntervalo.contagem();

console.log();
console.log("Soma de 10 até 20:");
console.log(umIntervalo.soma());

let outroIntervalo = new Intervalo(20, 10);
console.log();
console.log("Contagem 20 até 10:");
outroIntervalo.contagem();

console.log();
console.log("Soma de 20 até 10:");
console.log(outroIntervalo.soma());