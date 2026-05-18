// JANELA DESLIZANTE
//
// Implemente uma classe denominada Janela que receba, no construtor, uma
// matriz unidimensional de inteiros. Forneca um metodo denominado getJanela()
// que receba um inteiro n e retorne uma nova matriz contendo a soma de cada
// subarray contíguo de tamanho n (a janela desliza uma posicao por vez).
//
// Se n for menor ou igual a zero, retorne [].
// Se n for maior que o tamanho do array, retorne [].
//
// Exemplo 1
// Construtor: [1, 2, 3, 4, 5]
// n: 0
// Retorno: []
//
// Exemplo 2
// Construtor: [1, 2, 3, 4, 5]
// n: 1
// Retorno: [1, 2, 3, 4, 5]
//
// Exemplo 3
// Construtor: [1, 2, 3, 4, 5]
// n: 3
// Retorno: [6, 9, 12]   (1+2+3=6, 2+3+4=9, 3+4+5=12)
//
// Exemplo 4
// Construtor: [1, 2, 3, 4, 5]
// n: 6
// Retorno: []
export class Janela {
  private data: number[];

  constructor(data: number[]) {
    this.data = data;
  }

  public getJanela(n: number): number[] {
    const result: number[] = [];

    if (n <= 0 || n > this.data.length) return result;

    for (let i = 0; i <= this.data.length - n; i++) {
      let soma = 0;
      for (let j = i; j < i + n; j++) {
        soma = soma + this.data[j];
      }
      result.push(soma);
    }

    return result;
  }
}
