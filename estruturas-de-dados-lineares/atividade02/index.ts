import RandomList from "./randomlist";

const list = new RandomList(10);
console.log("Lista original:", list.toString());

// ex3
list.valorDeCorte(40);
console.log("Apos valorDeCorte(40):", list.toString());

// ex4
list.removeMultiplos(3);
console.log("Apos removeMultiplos(3):", list.toString());

// ex5
console.log("Mais proximo da media:", list.maisPróximoDaMedia());

// ex6
list.reduz(3);
console.log("Apos reduz(3):", list.toString());

// -- nova lista para testar fatia e inverte sem lista muito pequena --
const list2 = new RandomList(10);
console.log("\nLista2 original:", list2.toString());

// ex7
list2.fatia(2, 6);
console.log("Apos fatia(2, 6):", list2.toString());

// ex8
list2.inverte();
console.log("Apos inverte:", list2.toString());

// ex9
const list3 = new RandomList(10);
console.log("\nLista3 original:", list3.toString());
console.log("Amplitude:", list3.range());

// ex10
console.log("\n--- Josephus Variacao ---");
const listJosephus = new RandomList(6);
console.log("Pessoas e numeros escolhidos:", listJosephus.toString());
listJosephus.josephusVariacao();
