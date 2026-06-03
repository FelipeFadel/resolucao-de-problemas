import { Node } from "./Node";

export default class Graph {
  private nodes: Node[];

  constructor() {
    this.nodes = [];
  }

  public addNode(value: unknown): Node {
    const node = new Node(value);
    this.nodes.push(node);
    return node;
  }

  public addEdge(source: Node, destination: Node): void {
    source.addNeighbor(destination);
    destination.addNeighbor(source);
  }

  public breadthFirstSearch(start: Node): unknown[] {
    const visited = new Set<Node>();
    const queue: Node[] = [start];
    const result: unknown[] = [];

    visited.add(start);

    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current.value);

      for (const neighbor of current.neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    return result;
  }

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

  public shortestPath(start: Node, end: Node): unknown[] | null {
    if (start === end) return [start.value];

    const visited = new Set<Node>();
    const queue: [Node, unknown[]][] = [[start, [start.value]]];
    visited.add(start);

    while (queue.length > 0) {
      const [current, path] = queue.shift()!;

      for (const neighbor of current.neighbors) {
        if (visited.has(neighbor)) continue;
        const newPath = [...path, neighbor.value];
        if (neighbor === end) return newPath;
        visited.add(neighbor);
        queue.push([neighbor, newPath]);
      }
    }

    return null;
  }
}
