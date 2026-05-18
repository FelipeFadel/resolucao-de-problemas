import { Intercala } from "./Intercala";

const i1 = new Intercala([1, 2, 3, 4], [10, 20, 30, 40]);

console.log("a:", [1, 2, 3, 4], "  b:", [10, 20, 30, 40]);
console.log("intercala(0):", i1.intercala(0));  // []
console.log("intercala(1):", i1.intercala(1));  // [1,10,2,20,3,30,4,40]
console.log("intercala(2):", i1.intercala(2));  // [1,2,10,20,3,4,30,40]
console.log("intercala(4):", i1.intercala(4));  // [1,2,3,4,10,20,30,40]

// arrays de tamanhos diferentes
const i2 = new Intercala([1, 2, 3], [10, 20]);
console.log("\na:", [1, 2, 3], "  b:", [10, 20]);
console.log("intercala(1):", i2.intercala(1));  // [1,10,2,20,3]
