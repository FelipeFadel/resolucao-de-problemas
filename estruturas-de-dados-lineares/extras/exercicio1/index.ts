import { Rotaciona } from "./Rotaciona";

const r = new Rotaciona([1, 2, 3, 4, 5]);

console.log("original  :", [1, 2, 3, 4, 5]);
console.log("rotate(0) :", r.rotate(0));   // [1,2,3,4,5]
console.log("rotate(2) :", r.rotate(2));   // [4,5,1,2,3]
console.log("rotate(-1):", r.rotate(-1));  // [2,3,4,5,1]
console.log("rotate(5) :", r.rotate(5));   // [1,2,3,4,5] (volta ao original)
console.log("rotate(7) :", r.rotate(7));   // [4,5,1,2,3] (equivale a rotate(2))
