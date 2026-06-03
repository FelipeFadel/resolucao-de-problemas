export class Node {
  public value: unknown;
  public neighbors: Node[];

  constructor(value: unknown) {
    this.value = value;
    this.neighbors = [];
  }

  public addNeighbor(node: Node): void {
    this.neighbors.push(node);
  }
}
