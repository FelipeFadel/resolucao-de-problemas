import Graph from "./Graph";

const graph = new Graph();

const n1 = graph.addNode(1);
const n2 = graph.addNode(2);
const n3 = graph.addNode(3);
const n4 = graph.addNode(4);
const n5 = graph.addNode(5);

graph.addEdge(n1, n2);
graph.addEdge(n1, n3);
graph.addEdge(n2, n4);
graph.addEdge(n3, n4);
graph.addEdge(n4, n5);

console.log("BFS a partir de 1:", graph.breadthFirstSearch(n1));
console.log("DFS a partir de 1:", graph.depthFirstSearch(n1));
console.log("Caminho mais curto de 1 a 5:", graph.shortestPath(n1, n5));
console.log("Caminho mais curto de 1 a 1:", graph.shortestPath(n1, n1));
console.log("Caminho mais curto de 2 a 5:", graph.shortestPath(n2, n5));
