import { Padrao } from "./Padrao";

const p = new Padrao([1, 2, 3, 4, 5, 6]);

console.log("original  :", [1, 2, 3, 4, 5, 6]);
console.log("padrao(0) :", p.padrao(0));  // []
console.log("padrao(1) :", p.padrao(1));  // [1,2,3,4,5,6] (blocos de 1 invertido = igual)
console.log("padrao(2) :", p.padrao(2));  // [2,1,4,3,6,5]
console.log("padrao(3) :", p.padrao(3));  // [3,2,1,6,5,4]

const p2 = new Padrao([1, 2, 3, 4, 5]);
console.log("\noriginal  :", [1, 2, 3, 4, 5]);
console.log("padrao(3) :", p2.padrao(3)); // [3,2,1,5,4] (ultimo bloco tem 2 elementos)
