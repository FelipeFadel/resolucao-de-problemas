import { Node } from "./Node";

export function canReach<T>(a: Node<T>, b: Node<T>): boolean {
  const visitados = new Set<Node<T>>();
  const pilha: Node<T>[] = [...a.edges];

  while (pilha.length > 0) {
    const atual = pilha.pop()!;
    if (atual === b) {
      return true;
    }
    if (!visitados.has(atual)) {
      visitados.add(atual);
      for (let i = 0; i < atual.edges.length; i++) {
        pilha.push(atual.edges[i]);
      }
    }
  }

  return false;
}
