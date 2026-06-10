import Graph from "../ricardoborges/Graph";

type Terra = "A" | "B" | "C" | "D"; //Tipo  da variavel que vai entrar em graph, vai ficar graph<Terra>

const pontes: [Terra, Terra][] = [
  ["A", "B"],
  ["A", "B"],
  ["C", "B"],
  ["C", "B"],
  ["A", "D"],
  ["C", "D"],
  ["B", "D"],
];

const konigsberg = new Graph<Terra>((a, b) => a.localeCompare(b));
for (const [origem, destino] of pontes) {
  konigsberg.addEdge(origem, destino);
}

console.log("as sete pontes de konigsberg");

console.log("lista de adjacencia:");
konigsberg.print();

const graus = new Map<Terra, number>();
for (const [origem, destino] of pontes) {
  graus.set(origem, (graus.get(origem) ?? 0) + 1);
  graus.set(destino, (graus.get(destino) ?? 0) + 1);
}

console.log("grau de cada terra:");
for (const [terra, grau] of graus) {
  console.log(`  ${terra}: ${grau}`);
}

const verticesImpares = [...graus.entries()].filter(
  ([, grau]) => grau % 2 !== 0,
);

console.log(`vertices de grau impar: ${verticesImpares.length}`);

if (verticesImpares.length === 0) {
  console.log("existe um circuito euleriano");
} else if (verticesImpares.length === 2) {
  console.log("existe um caminho euleriano");
} else {
  console.log("impossivel atravessar todas as pontes sem repetir");
}
