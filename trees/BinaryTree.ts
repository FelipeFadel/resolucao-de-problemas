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

  public search(value: number): boolean {
    if (value == this.getRaiz()) return true;
    if (value < this.getRaiz()) {
      if (this.left !== null) return this.left.search(value);
    }
    if (value > this.getRaiz()) {
      if (this.right !== null) return this.right.search(value);
    }
    return false;
  }

  public addSon(value: number): boolean {
    const raiz = this.getRaiz();

    if (raiz === value) return true; //Retorna verdadeiro pois ja foi adicionado
    if (value < raiz) {
      if (this.left === null) {
        this.left = new BinaryTree(value);
        return true;
      } else {
        return this.left.addSon(value);
      }
    } else {
      if (this.right === null) {
        this.right = new BinaryTree(value);
        return true;
      } else {
        return this.right.addSon(value);
      }
    }
  }
}

//public left: Node | null = null,
