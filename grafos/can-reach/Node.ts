export class Node<T> {
  public value: T;
  public edges: Node<T>[];

  constructor(value: T, edges: Node<T>[] = []) {
    this.value = value;
    this.edges = edges;
  }
}
