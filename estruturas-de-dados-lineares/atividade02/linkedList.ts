class ListNode<T> {
  public value: T;
  public next: ListNode<T> | null;

  constructor(value: T) {
    this.value = value;
    this.next = null;
  }
}

export default class LinkedList<T> {
  private head: ListNode<T> | null;
  private size: number;

  constructor() {
    this.head = null;
    this.size = 0;
  }

  public append(value: T): void {
    const newNode = new ListNode(value);

    if (!this.head) {
      this.head = newNode;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = newNode;
    }
    this.size++;
  }

  public print(n: number = 0): void {
    let current = this.head;
    const elements: T[] = [];
    let iterador = 0;
    while (current) {
      if (iterador === this.getSize() + n) break;
      elements.push(current.value);
      current = current.next;
      iterador++;
    }
    console.log(elements.join(" -> "));
  }

  public getSize(): number {
    return this.size;
  }

  public makeCircular(): void {
    if (!this.head) return;

    let current = this.head;
    while (current.next) {
      current = current.next;
    }
    current.next = this.head;
  }

  public removeAt(index: number): T | null {
    if (index < 0 || index >= this.size || !this.head) return null;

    let current = this.head;

    if (index === 0) {
      const removedValue = this.head.value;

      if (this.size === 1) {
        this.head = null;
      } else {
        let tail = this.head;
        while (tail.next && tail.next !== this.head) {
          tail = tail.next;
        }

        this.head = this.head.next;

        if (tail.next === current) {
          tail.next = this.head;
        }
      }
      this.size--;
      return removedValue;
    }

    let previous: ListNode<T> | null = null;
    let i = 0;

    while (i < index) {
      previous = current;
      current = current.next!;
      i++;
    }

    if (previous) {
      previous.next = current.next;
    }

    this.size--;
    return current.value;
  }
}
