import Park from "./Park";

console.clear();

let p1, p2, p3, p4, p5, p6;

p1 = new Park([-1, 150, 190, 170, -1, -1, 160, 180]);
console.log("Teste 1");
console.log(p1.getSorted());
console.log("[-1, 150, 160, 170, -1, -1, 180, 190]\n");


p2 = new Park([-1, 185, -1, 180, -1, 195, -1, -1, -1]);
console.log("Teste 2");
console.log(p2.getSorted());
console.log("[-1, 180, -1, 185, -1, 195, -1, -1, -1]\n");


p3 = new Park([190, 180, 170, 160, 150, 140]);
console.log("Teste 3");
console.log(p3.getSorted());
console.log("[140, 150, 160, 170, 180, 190]\n");


p4 = new Park([ -1, -1, -1, 180, -1, -1, -1]);
console.log("Teste 4");
console.log(p4.getSorted());
console.log("[ -1, -1, -1, 180, -1, -1, -1]\n");


p5 = new Park([ -1, -1, -1, 160, 150, 140]);
console.log("Teste 5");
console.log(p5.getSorted());
console.log("[-1, -1, -1, 140, 150, 160]\n");


p6 = new Park([-1, 160, -1, -1, 150, -1, -1, -1, 130, -1]);
console.log("Teste 6");
console.log(p6.getSorted());
console.log("[-1, 130, -1, -1, 150, -1, -1, -1, 160, -1]\n");