import Graph from "./Graph";

let passou = 0;
let falhou = 0;

function teste(nome: string, esperado: unknown, recebido: unknown): void {
  const igual = JSON.stringify(esperado) === JSON.stringify(recebido);
  if (igual) {
    passou++;
    console.log(`ok   - ${nome}`);
  } else {
    falhou++;
    console.log(`falha - ${nome}`);
    console.log(`  esperado: ${JSON.stringify(esperado)}`);
    console.log(`  recebido: ${JSON.stringify(recebido)}`);
  }
}

function novoGrafo(): Graph<number> {
  const g = new Graph<number>();
  g.addEdge(1, 2);
  g.addEdge(1, 3);
  g.addEdge(2, 4);
  g.addEdge(3, 4);
  g.addEdge(4, 5);
  return g;
}

// addNode
const gNode = new Graph<number>();
gNode.addNode(10);
teste("addNode cria no com lista vazia", [], gNode.vizinhos(10));
gNode.addNode(10);
teste("addNode nao duplica no existente", [], gNode.vizinhos(10));

// addEdge
const gEdge = new Graph<number>();
gEdge.addEdge(1, 2);
teste("addEdge liga origem -> destino", [2], gEdge.vizinhos(1));
teste("addEdge liga destino -> origem", [1], gEdge.vizinhos(2));
gEdge.addEdge(1, 2);
teste("addEdge permite arestas paralelas", [2, 2], gEdge.vizinhos(1));

// vizinhos
const gViz = novoGrafo();
teste("vizinhos de 4", [2, 3, 5], gViz.vizinhos(4));
teste("vizinhos de no inexistente", [], gViz.vizinhos(99));

// grau
teste("grau de 4", 3, gViz.grau(4));
teste("grau de 1", 2, gViz.grau(1));
teste("grau de no inexistente", 0, gViz.grau(99));

// everyWays
const gWays = novoGrafo();
teste(
  "everyWays de 1 a 5",
  [
    [1, 2, 4, 5],
    [1, 3, 4, 5],
  ],
  gWays.everyWays(1, 5)
);
teste("everyWays de 1 a 1", [[1]], gWays.everyWays(1, 1));

// shortWay
const gShort = novoGrafo();
teste("shortWay de 1 a 5", [1, 2, 4, 5], gShort.shortWay(1, 5));
teste("shortWay de 1 a 1", [1], gShort.shortWay(1, 1));
gShort.addNode(100);
teste("shortWay sem caminho retorna null", null, gShort.shortWay(1, 100));

// removeNode
const gRemove = novoGrafo();
gRemove.removeNode(4);
teste("removeNode tira no das chaves", [], gRemove.vizinhos(4));
teste("removeNode tira no dos vizinhos de 2", [1], gRemove.vizinhos(2));
teste("removeNode tira no dos vizinhos de 5", [], gRemove.vizinhos(5));

// print (apenas executa)
console.log("\nprint:");
novoGrafo().print();

console.log(`\nresultado: ${passou} ok, ${falhou} falha(s)`);
