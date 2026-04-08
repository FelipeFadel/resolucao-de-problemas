import Mensagem from "./Mensagem.ts";

let motivacao = new Mensagem("Gabaritei o Exercício Avaliativo de Recursividade!");

console.log("Exibindo 10 vezes:");
motivacao.exibe(10);

console.log();
console.log("Exibindo uma vez:");
motivacao.exibe(1);

console.log();
console.log("Exibindo zero vezes:");
motivacao.exibe(0);

console.log();
console.log("Exibindo -10 vezes:");
motivacao.exibe(-10);