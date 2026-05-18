export default class EnigmaSort {
  private arr: number[];

  constructor(arr: number[]) {
    this.arr = [...arr];
  }

  public sort(): void {
    let flag = false;
    do {
      // Embaralha aleatoriamente
      for (let i = 0; i < this.arr.length; i++) {
        const j = Math.floor(Math.random() * this.arr.length);
        if (i !== j) {
          const aux = this.arr[i];
          this.arr[i] = this.arr[j];
          this.arr[j] = aux;
        }
      }

      // Verifica se está ordenado
      flag = true;
      for (let i = 1; flag && i < this.arr.length; i++) {
        if (this.arr[i] < this.arr[i - 1]) {
          flag = false;
        }
      }
    } while (!flag);
  }

  public getArray(): number[] {
    return this.arr;
  }
}
