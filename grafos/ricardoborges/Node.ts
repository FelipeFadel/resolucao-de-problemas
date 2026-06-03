export class Node<T> {
  public data: T;
  public adjacent: Node<T>[];
  private comparator: (a: T, b: T) => number;

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
