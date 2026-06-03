import { Node } from "./Node";

export default class Graph<T> {
  private nodes: Map<T, Node<T>>;
  private comparator: (a: T, b: T) => number;

  constructor(comparator: (a: T, b: T) => number) {
    this.nodes = new Map();
    this.comparator = comparator;
  }

  public addNode(data: T): Node<T> {
    let node = this.nodes.get(data);
    if (node) return node;
    node = new Node(data, this.comparator);
    this.nodes.set(data, node);
    return node;
  }

  public removeNode(data: T): Node<T> | null {
    const target = this.nodes.get(data);
    if (!target) return null;
    this.nodes.forEach((node) => node.removeAdjacent(data));
    this.nodes.delete(data);
    return target;
  }

  public addEdge(sourceData: T, destinationData: T): void {
    const source = this.addNode(sourceData);
    const destination = this.addNode(destinationData);
    source.addAdjacent(destination);
    destination.addAdjacent(source);
  }

  public removeEdge(sourceData: T, destinationData: T): void {
    const source = this.nodes.get(sourceData);
    const destination = this.nodes.get(destinationData);
    if (!source || !destination) return;
    source.removeAdjacent(destinationData);
    destination.removeAdjacent(sourceData);
  }

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

  public breadthFirstSearch(startData: T): T[] {
    const startNode = this.nodes.get(startData);
    if (!startNode) return [];

    const visited = new Set<T>();
    const queue: Node<T>[] = [startNode];
    const result: T[] = [];

    visited.add(startNode.data);

    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current.data);

      for (const neighbor of current.adjacent) {
        if (!visited.has(neighbor.data)) {
          visited.add(neighbor.data);
          queue.push(neighbor);
        }
      }
    }

    return result;
  }

  public print(): void {
    this.nodes.forEach((node) => {
      const neighbors = node.adjacent.map((n) => n.data).join(", ");
      console.log(`${node.data} -> [${neighbors}]`);
    });
  }
}
