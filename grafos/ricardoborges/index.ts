import Graph from "./Graph";

const comparator = (a: number, b: number) => a - b;
const graph = new Graph<number>(comparator);

graph.addEdge(1, 2);
graph.addEdge(1, 3);
graph.addEdge(2, 4);
graph.addEdge(3, 4);
graph.addEdge(4, 5);

console.log("Lista de adjacencia:");
graph.print();

console.log("\nBFS a partir de 1:", graph.breadthFirstSearch(1));
console.log("DFS a partir de 1:", graph.depthFirstSearch(1));

graph.removeEdge(1, 2);
console.log("\nApos remover aresta 1-2:");
graph.print();

graph.removeNode(4);
console.log("\nApos remover no 4:");
graph.print();
