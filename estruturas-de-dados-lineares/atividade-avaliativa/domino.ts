export default class Domino {
  private table: number[][];

  constructor(table: number[][] = []) {
    this.table = table;
  }

  public existInTable(a: number, b: number): boolean {
    for (let i = 0; i < this.table.length; i++) {
      const piece = this.table[i];
      if (
        (piece[0] === a && piece[1] === b) ||
        (piece[0] === b && piece[1] === a)
      )
        return true;
    }
    return false;
  }

  public addFirst(a: number, b: number): void {
    if (a > 6 || a < 0 || b > 6 || b < 0) return;
    if (this.existInTable(a, b)) return;
    const valueLeft = this.table[0][0];

    if (a === valueLeft) {
      //inserir [b, a] no começo
      this.table.unshift([b, a]);
      return;
    }
    if (b == valueLeft) {
      //inserir [a, b] no começo
      this.table.unshift([a, b]);
      return;
    }

    return;
  }

  public addLast(a: number, b: number): void {
    if (a > 6 || a < 0 || b > 6 || b < 0) return;
    if (this.existInTable(a, b)) return;
    const valueLeft = this.table[this.table.length - 1][1];

    if (a === valueLeft) {
      //inserir [a, b] no final
      this.table.push([a, b]);
      return;
    }
    if (b == valueLeft) {
      //inserir [b, a] no final
      this.table.push([b, a]);
      return;
    }

    return;
  }

  public getTable(): string {
    let resultado: string = "[";
    for (let i = 0; i < this.table.length; i++) {
      resultado = resultado + `[${this.table[i][0]}:${this.table[i][1]}]`;
    }

    return resultado + "]";
  }

  public startGame(a: number, b: number): void {
    if (a === b && a < 7 && a > -1 && b < 7 && b > -1) {
      this.table.push([a, b]);
      return;
    }
    console.log("Entre com o maior par");
  }
}
