# Implementação de Grafo — `ricardoborges`

Uma implementação de **grafo não-direcionado** em TypeScript, **indexada por valor** e com **tipagem genérica** (`<T>`). É a versão mais completa: tem CRUD de nós e arestas, buscas (BFS/DFS) e impressão da lista de adjacência.

> **Não-direcionado** = se existe uma aresta entre A e B, ela vale nos dois sentidos (A↔B). Você pode ir de A para B e de B para A.

## Arquivos

| Arquivo | Papel |
|---|---|
| `Node.ts` | Representa um **vértice** (nó) do grafo e seus vizinhos. |
| `Graph.ts` | Representa o **grafo** e todas as operações. |
| `index.ts` | Exemplo de uso (ponto de entrada). |

---

## 1. `Node.ts` — o vértice

```ts
export class Node<T> {
  public data: T;                              // o valor guardado no nó
  public adjacent: Node<T>[];                  // lista de vizinhos
  private comparator: (a: T, b: T) => number;  // como comparar dois valores

  constructor(data: T, comparator: (a: T, b: T) => number) {
    this.data = data;
    this.adjacent = [];
    this.comparator = comparator;
  }

  public addAdjacent(node: Node<T>): void {
    this.adjacent.push(node);
  }

  public removeAdjacent(data: T): Node<T> | null {
    const index = this.adjacent.findIndex(
      (node) => this.comparator(node.data, data) === 0
    );
    if (index === -1) return null;
    return this.adjacent.splice(index, 1)[0];
  }
}
```

### Conceitos

- **`<T>` (genérico):** o nó funciona com qualquer tipo (`number`, `string`, objetos…). O tipo é escolhido na hora de criar o grafo e fica consistente em todos os lugares.
- **`adjacent`:** a famosa **lista de adjacência** — cada nó guarda referências diretas aos seus vizinhos.
- **`comparator`:** uma função `(a, b) => number` que devolve `0` quando `a` e `b` são "iguais". É necessária porque, ao remover um vizinho, precisamos saber **qual** valor remover. Para números, basta `(a, b) => a - b`.

### Por que comparar com `=== 0`?

Um comparator segue a convenção do `Array.sort`:
- retorna **negativo** se `a < b`
- retorna **zero** se `a === b`  ← é isso que usamos para "encontrei o vizinho"
- retorna **positivo** se `a > b`

---

## 2. `Graph.ts` — o grafo

O coração da implementação é guardar os nós num **`Map`**, indexado pelo próprio valor:

```ts
private nodes: Map<T, Node<T>>;
```

Isso permite achar um nó pelo seu valor em tempo O(1) — você nunca precisa segurar a referência do objeto `Node`.

### `addNode(data)` — adiciona um nó (idempotente)

```ts
public addNode(data: T): Node<T> {
  let node = this.nodes.get(data);
  if (node) return node;          // já existe? devolve o mesmo
  node = new Node(data, this.comparator);
  this.nodes.set(data, node);
  return node;
}
```

**Idempotente** = chamar com o mesmo valor duas vezes não cria duplicata; devolve o nó já existente.

### `addEdge(a, b)` — adiciona uma aresta

```ts
public addEdge(sourceData: T, destinationData: T): void {
  const source = this.addNode(sourceData);
  const destination = this.addNode(destinationData);
  source.addAdjacent(destination);
  destination.addAdjacent(source);   // <- liga os dois lados (não-direcionado)
}
```

Repare que recebe **valores**, não objetos `Node`. Se os nós ainda não existem, são criados automaticamente.

### `removeEdge(a, b)` e `removeNode(data)`

```ts
public removeNode(data: T): Node<T> | null {
  const target = this.nodes.get(data);
  if (!target) return null;
  this.nodes.forEach((node) => node.removeAdjacent(data)); // limpa arestas pendentes
  this.nodes.delete(data);
  return target;
}
```

Ao remover um nó, é preciso também **remover todas as arestas que apontavam para ele** — senão sobrariam referências "quebradas". É isso que o `forEach` faz.

### `depthFirstSearch(start)` — busca em profundidade (DFS)

Vai **fundo** num caminho antes de voltar. Implementada com **recursão**:

```ts
public depthFirstSearch(startData: T): T[] {
  const startNode = this.nodes.get(startData);
  if (!startNode) return [];

  const visited = new Set<T>();
  const result: T[] = [];

  const dfsAux = (node: Node<T>): void => {
    visited.add(node.data);
    result.push(node.data);
    for (const neighbor of node.adjacent) {
      if (!visited.has(neighbor.data)) dfsAux(neighbor);
    }
  };

  dfsAux(startNode);
  return result;
}
```

O `Set visited` evita visitar o mesmo nó duas vezes (e evita loop infinito em grafos com ciclos).

### `breadthFirstSearch(start)` — busca em largura (BFS)

Visita os nós **por camadas** (primeiro os vizinhos diretos, depois os vizinhos dos vizinhos…). Usa uma **fila**:

```ts
public breadthFirstSearch(startData: T): T[] {
  const startNode = this.nodes.get(startData);
  if (!startNode) return [];

  const visited = new Set<T>();
  const queue: Node<T>[] = [startNode];
  const result: T[] = [];

  visited.add(startNode.data);

  while (queue.length > 0) {
    const current = queue.shift()!;   // tira o primeiro da fila
    result.push(current.data);

    for (const neighbor of current.adjacent) {
      if (!visited.has(neighbor.data)) {
        visited.add(neighbor.data);
        queue.push(neighbor);         // adiciona no fim da fila
      }
    }
  }

  return result;
}
```

> **DFS vs BFS:** DFS usa pilha (a própria pilha de recursão); BFS usa fila. DFS vai "fundo" primeiro; BFS vai "largo" primeiro.

### `print()` — visualiza a lista de adjacência

```ts
public print(): void {
  this.nodes.forEach((node) => {
    const neighbors = node.adjacent.map((n) => n.data).join(", ");
    console.log(`${node.data} -> [${neighbors}]`);
  });
}
```

---

## 3. Como usar (`index.ts`)

```ts
import Graph from "./Graph";

// 1. Crie o grafo passando um comparator para o tipo escolhido (number)
const comparator = (a: number, b: number) => a - b;
const graph = new Graph<number>(comparator);

// 2. Adicione arestas (os nós são criados automaticamente)
graph.addEdge(1, 2);
graph.addEdge(1, 3);
graph.addEdge(2, 4);
graph.addEdge(3, 4);
graph.addEdge(4, 5);

// 3. Imprima a lista de adjacência
console.log("Lista de adjacencia:");
graph.print();

// 4. Percorra o grafo
console.log("\nBFS a partir de 1:", graph.breadthFirstSearch(1));
console.log("DFS a partir de 1:", graph.depthFirstSearch(1));

// 5. Remova uma aresta
graph.removeEdge(1, 2);
console.log("\nApos remover aresta 1-2:");
graph.print();

// 6. Remova um nó (e todas as suas arestas)
graph.removeNode(4);
console.log("\nApos remover no 4:");
graph.print();
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
Lista de adjacencia:
1 -> [2, 3]
2 -> [1, 4]
3 -> [1, 4]
4 -> [2, 3, 5]
5 -> [4]

BFS a partir de 1: [ 1, 2, 3, 4, 5 ]
DFS a partir de 1: [ 1, 2, 4, 3, 5 ]

Apos remover aresta 1-2:
1 -> [3]
2 -> [4]
3 -> [1, 4]
4 -> [2, 3, 5]
5 -> [4]

Apos remover no 4:
1 -> [3]
2 -> []
3 -> [1]
5 -> []
```

> **Entendendo o DFS `[1, 2, 4, 3, 5]`:** começa em 1 → vai para o primeiro vizinho 2 → de 2 vai para 4 → de 4 vai para 3 (2 já visitado) → de 3 não há novos → volta e visita 5. Vai "fundo" antes de voltar.
>
> **Entendendo o BFS `[1, 2, 3, 4, 5]`:** visita 1, depois toda a camada de vizinhos (2 e 3), depois a próxima camada (4), depois 5. Vai "por níveis".

---

## Usando com outros tipos

Como a classe é genérica, o mesmo código funciona com `string`:

```ts
const cityGraph = new Graph<string>((a, b) => a.localeCompare(b));
cityGraph.addEdge("Recife", "Olinda");
cityGraph.addEdge("Recife", "Jaboatao");
console.log(cityGraph.breadthFirstSearch("Recife")); // [ 'Recife', 'Olinda', 'Jaboatao' ]
```

Basta trocar o comparator para o tipo certo (`localeCompare` para strings).

---

## Complexidade

| Operação | Custo |
|---|---|
| `addNode` | O(1) |
| `addEdge` | O(1) |
| `removeNode` | O(V + E) — varre todos os nós limpando arestas |
| `removeEdge` | O(grau do nó) |
| `BFS` / `DFS` | O(V + E) |

(V = número de vértices, E = número de arestas.)

---

## Resumo

- **Indexado por valor** (`Map<T, Node<T>>`): você opera sempre com valores, nunca com referências de nó.
- **Genérico** (`<T>`): type-safe para qualquer tipo, contanto que você forneça um comparator.
- **CRUD completo**: adiciona e remove nós e arestas, limpando referências pendentes.
- **Buscas**: BFS (fila) e DFS (recursão).
- Ideal quando você precisa **montar e modificar** o grafo com segurança de tipos.
