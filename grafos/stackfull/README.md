# Implementação de Grafo — `stackfull`

Uma implementação de **grafo não-direcionado** em TypeScript, mais **enxuta e baseada em referências de nó**. O foco aqui é **consultar caminhos** — o diferencial é o método `shortestPath` (caminho mais curto).

> **Não-direcionado** = se existe uma aresta entre A e B, ela vale nos dois sentidos (A↔B).
>
> **Baseada em referências** = você trabalha diretamente com os objetos `Node` retornados, e não com os valores guardados dentro deles.

## Arquivos

| Arquivo | Papel |
|---|---|
| `Node.ts` | Representa um **vértice** (nó) do grafo e seus vizinhos. |
| `Graph.ts` | Representa o **grafo** e as operações de busca. |
| `index.ts` | Exemplo de uso (ponto de entrada). |

---

## 1. `Node.ts` — o vértice

```ts
export class Node {
  public value: unknown;       // o valor guardado no nó
  public neighbors: Node[];    // lista de vizinhos

  constructor(value: unknown) {
    this.value = value;
    this.neighbors = [];
  }

  public addNeighbor(node: Node): void {
    this.neighbors.push(node);
  }
}
```

### Conceitos

- **`value: unknown`:** o nó aceita qualquer valor, mas o tipo não é "lembrado" (não é genérico como na versão `ricardoborges`). Ao ler `node.value`, o TypeScript só sabe que é `unknown`.
- **`neighbors`:** a **lista de adjacência** — cada nó guarda referências diretas aos vizinhos.
- Muito simples: só sabe guardar um valor e adicionar vizinhos. Não tem remoção nem comparator.

---

## 2. `Graph.ts` — o grafo

Os nós ficam guardados num **array** simples:

```ts
private nodes: Node[];
```

Diferente da versão `ricardoborges` (que usa um `Map` indexado por valor), aqui você precisa **guardar as referências** dos nós que cria, porque é com elas que você opera.

### `addNode(value)` — cria e devolve um nó

```ts
public addNode(value: unknown): Node {
  const node = new Node(value);   // SEMPRE cria um nó novo
  this.nodes.push(node);
  return node;                    // devolve a referência (guarde-a!)
}
```

> ⚠️ Diferente da versão `ricardoborges`, este `addNode` **não deduplica**: chamar `addNode(1)` duas vezes cria **dois nós diferentes** com valor 1. Por isso você guarda a referência: `const n1 = graph.addNode(1)`.

### `addEdge(source, destination)` — liga dois nós

```ts
public addEdge(source: Node, destination: Node): void {
  source.addNeighbor(destination);
  destination.addNeighbor(source);   // liga os dois lados (não-direcionado)
}
```

Repare: recebe **objetos `Node`**, não valores. Por isso é preciso ter guardado as referências antes.

### `breadthFirstSearch(start)` — busca em largura (BFS)

Visita os nós **por camadas** usando uma **fila**:

```ts
public breadthFirstSearch(start: Node): unknown[] {
  const visited = new Set<Node>();   // compara por REFERÊNCIA de nó
  const queue: Node[] = [start];
  const result: unknown[] = [];

  visited.add(start);

  while (queue.length > 0) {
    const current = queue.shift()!;       // tira o primeiro da fila
    result.push(current.value);

    for (const neighbor of current.neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);             // adiciona no fim da fila
      }
    }
  }

  return result;
}
```

> Repare que `visited` é um `Set<Node>` — compara nós por **referência de objeto**, não pelo valor. (Na versão `ricardoborges` é `Set<T>`, por valor.)

### `depthFirstSearch(start)` — busca em profundidade (DFS)

Vai **fundo** num caminho antes de voltar, usando **recursão**:

```ts
public depthFirstSearch(start: Node): unknown[] {
  const visited = new Set<Node>();
  const result: unknown[] = [];

  const dfs = (node: Node): void => {
    visited.add(node);
    result.push(node.value);
    for (const neighbor of node.neighbors) {
      if (!visited.has(neighbor)) dfs(neighbor);
    }
  };

  dfs(start);
  return result;
}
```

> **DFS vs BFS:** DFS usa pilha (a própria recursão) e vai "fundo" primeiro; BFS usa fila e vai "largo" (por camadas) primeiro.

### `shortestPath(start, end)` — caminho mais curto ⭐

Este é o **diferencial** desta implementação. É um BFS que, em vez de só marcar quem foi visitado, **carrega na fila o caminho percorrido até cada nó**. Como o BFS expande por camadas, o **primeiro** caminho que chega ao destino é garantidamente o **mais curto** (em número de arestas).

```ts
public shortestPath(start: Node, end: Node): unknown[] | null {
  if (start === end) return [start.value];       // já é o destino

  const visited = new Set<Node>();
  // a fila guarda PARES: [nó atual, caminho até ele]
  const queue: [Node, unknown[]][] = [[start, [start.value]]];
  visited.add(start);

  while (queue.length > 0) {
    const [current, path] = queue.shift()!;

    for (const neighbor of current.neighbors) {
      if (visited.has(neighbor)) continue;
      const newPath = [...path, neighbor.value]; // estende o caminho
      if (neighbor === end) return newPath;      // chegou! é o mais curto
      visited.add(neighbor);
      queue.push([neighbor, newPath]);
    }
  }

  return null;   // não há caminho entre start e end
}
```

**Por que o primeiro caminho encontrado é o mais curto?**
Porque o BFS explora todos os caminhos de tamanho 1, depois todos de tamanho 2, e assim por diante. Quando alcança o destino pela primeira vez, não existe caminho menor possível.

> Vale para grafos **não-ponderados** (todas as arestas "custam" o mesmo). Para arestas com pesos diferentes, seria preciso outro algoritmo (ex.: Dijkstra).

---

## 3. Como usar (`index.ts`)

```ts
import Graph from "./Graph";

const graph = new Graph();

// 1. Crie os nós e GUARDE as referências
const n1 = graph.addNode(1);
const n2 = graph.addNode(2);
const n3 = graph.addNode(3);
const n4 = graph.addNode(4);
const n5 = graph.addNode(5);

// 2. Ligue os nós usando as referências
graph.addEdge(n1, n2);
graph.addEdge(n1, n3);
graph.addEdge(n2, n4);
graph.addEdge(n3, n4);
graph.addEdge(n4, n5);

// 3. Percorra e consulte
console.log("BFS a partir de 1:", graph.breadthFirstSearch(n1));
console.log("DFS a partir de 1:", graph.depthFirstSearch(n1));
console.log("Caminho mais curto de 1 a 5:", graph.shortestPath(n1, n5));
console.log("Caminho mais curto de 1 a 1:", graph.shortestPath(n1, n1));
console.log("Caminho mais curto de 2 a 5:", graph.shortestPath(n2, n5));
```

### O grafo do exemplo

```
        1
       / \
      2   3
       \ /
        4
        |
        5
```

### Saída esperada

```
BFS a partir de 1: [ 1, 2, 3, 4, 5 ]
DFS a partir de 1: [ 1, 2, 4, 3, 5 ]
Caminho mais curto de 1 a 5: [ 1, 2, 4, 5 ]
Caminho mais curto de 1 a 1: [ 1 ]
Caminho mais curto de 2 a 5: [ 2, 4, 5 ]
```

> **Caminho de 1 a 5 = `[1, 2, 4, 5]`:** existem dois caminhos de mesmo tamanho (`1→2→4→5` e `1→3→4→5`), ambos com 3 arestas. O algoritmo retorna o primeiro que encontra (passando por 2, pois a aresta `1-2` foi adicionada antes da `1-3`).
>
> **Caminho de 1 a 1 = `[1]`:** o início já é o destino, tratado logo na primeira linha do método.

---

## ⚠️ Cuidado: opere sempre com a mesma referência

Como o grafo é baseado em referências, isto **NÃO** funciona como esperado:

```ts
graph.shortestPath(graph.addNode(1), n5); // ❌ cria um nó NOVO com valor 1,
                                          //    sem arestas → retorna null
```

Você precisa usar a referência original (`n1`), não criar um nó novo com o mesmo valor.

---

## Complexidade

| Operação | Custo |
|---|---|
| `addNode` | O(1) |
| `addEdge` | O(1) |
| `BFS` / `DFS` | O(V + E) |
| `shortestPath` | O(V + E) — porém copia o caminho a cada passo (`[...path]`), o que adiciona custo extra |

(V = número de vértices, E = número de arestas.)

---

## Resumo

- **Baseado em referências** (`Node[]`): você guarda e opera com os objetos `Node`.
- **Não-genérico** (`value: unknown`): mais simples, mas perde a informação de tipo.
- **Sem remoção e sem dedup**: API mínima de construção.
- **Buscas**: BFS (fila), DFS (recursão) e o destaque `shortestPath` (caminho mais curto, não-ponderado).
- Ideal quando o foco é **consultar caminhos** em vez de modificar o grafo.

---

## Comparação rápida com a versão `ricardoborges`

| Aspecto | `ricardoborges` | `stackfull` |
|---|---|---|
| Armazenamento | `Map<T, Node<T>>` (por valor) | `Node[]` (array) |
| Tipagem | Genérico `<T>` + comparator | `unknown` |
| Identidade dos nós | Por **valor** (dedup automático) | Por **referência** |
| API de arestas | Recebe valores | Recebe objetos `Node` |
| Remoção de nó/aresta | ✅ | ❌ |
| Caminho mais curto | ❌ | ✅ `shortestPath` |
| Impressão (`print`) | ✅ | ❌ |
