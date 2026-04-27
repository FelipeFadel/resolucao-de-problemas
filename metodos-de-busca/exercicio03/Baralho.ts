export default class Baralho {
  private arranjoAtual: number[];

  public constructor(arranjo: number[]) {
    this.arranjoAtual = [...arranjo];
  }

  public selectionSort(): { comparacoes: number; trocas: number } {
    let arr = [...this.arranjoAtual];
    let comparacoes = 0;
    let trocas = 0;
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      let min = i;
      for (let j = i + 1; j < n; j++) {
        comparacoes++;
        if (arr[j] < arr[min]) {
          min = j;
        }
      }
      if (min !== i) {
        trocas++;
        let aux = arr[i];
        arr[i] = arr[min];
        arr[min] = aux;
      }
    }

    return { comparacoes, trocas };
  }

  public bubbleSort(): { comparacoes: number; trocas: number } {
    let arr = [...this.arranjoAtual];
    let comparacoes = 0;
    let trocas = 0;
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        comparacoes++;
        if (arr[j] > arr[j + 1]) {
          trocas++;
          let aux = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = aux;
        }
      }
    }

    return { comparacoes, trocas };
  }

  public insertionSort(): { comparacoes: number; trocas: number } {
    let arr = [...this.arranjoAtual];
    let comparacoes = 0;
    let trocas = 0;
    const n = arr.length;

    for (let i = 1; i < n; i++) {
      let atual = arr[i];
      let j = i - 1;
      
      comparacoes++;
      while (j >= 0 && arr[j] > atual) {
        trocas++;
        arr[j + 1] = arr[j];
        j--;
        if (j >= 0) comparacoes++; 
      }
      arr[j + 1] = atual;
    }

    return { comparacoes, trocas };
  }
}
