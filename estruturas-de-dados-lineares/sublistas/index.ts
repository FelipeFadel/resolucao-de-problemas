import { List } from "./List";

// exemplo 1: n=0 → []
const l1 = new List([1, 2, 3, 4, 5, 6]);
console.log("n=0 :", l1.getSublist(0));

// exemplo 2: n=1 → [1,2,3,4,5,6]
console.log("n=1 :", l1.getSublist(1));

// exemplo 3: n=-2 → [5,3,1]
console.log("n=-2:", l1.getSublist(-2));

// exemplo 4: [1,2], n=-3 → []
const l2 = new List([1, 2]);
console.log("n=-3:", l2.getSublist(-3));

// extras
console.log("n=2 :", l1.getSublist(2));  // [1,3,5]
console.log("n=3 :", l1.getSublist(3));  // [1,4]
console.log("n=-1:", l1.getSublist(-1)); // [6,5,4,3,2,1]
