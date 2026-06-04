class Node {
  private value: number;

  constructor(value: number) {
    this.value = value;
  }

  public setValue(value: number): Node {
    this.value = value;
    return this;
  }
  public getValue(): number {
    return this.value;
  }
}

export default class BinaryTree {
  private raiz: Node;
  private left: BinaryTree | null = null;
  private right: BinaryTree | null = null;

  constructor(raiz: number) {
    this.raiz = new Node(raiz);
    this.left = null;
    this.right = null;
  }

  public getRaiz(): number {
    return this.raiz.getValue();
  }

  public addSon(value: number): boolean {
    if (value < this.getRaiz()) {
      //add esquerda
      this.left = new BinaryTree(value);
    } else {
      //add right
      this.right = new BinaryTree(value);
    }
    return true;
  }
}

//public left: Node | null = null,
