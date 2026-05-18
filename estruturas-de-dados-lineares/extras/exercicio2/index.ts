import { Janela } from "./Janela";

const j = new Janela([1, 2, 3, 4, 5]);

console.log("original   :", [1, 2, 3, 4, 5]);
console.log("janela(0)  :", j.getJanela(0));  // []
console.log("janela(1)  :", j.getJanela(1));  // [1,2,3,4,5]
console.log("janela(3)  :", j.getJanela(3));  // [6,9,12]
console.log("janela(5)  :", j.getJanela(5));  // [15]
console.log("janela(6)  :", j.getJanela(6));  // [] (maior que o array)
