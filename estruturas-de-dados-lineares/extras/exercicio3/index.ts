import { Zipper } from "./Zipper";

const z = new Zipper([1, 2, 3, 4, 5, 6]);

console.log("original  :", [1, 2, 3, 4, 5, 6]);
console.log("zipper(1) :", z.zipper(1));  // [1,2,3,4,5,6]
console.log("zipper(2) :", z.zipper(2));  // [1,4,2,5,3,6]
console.log("zipper(3) :", z.zipper(3));  // [1,3,5,2,4,6]
console.log("zipper(0) :", z.zipper(0));  // []
console.log("zipper(7) :", z.zipper(7));  // [] (n maior que o array)
