// ZIPPER
//
// Implemente uma classe denominada Zipper que receba, no construtor, uma
// matriz unidimensional de inteiros. Forneca um metodo denominado zipper()
// que receba um inteiro n e retorne uma nova matriz.
//
// O metodo deve dividir o array em n partes iguais e entao intercalar os
// elementos coluna por coluna, como se estivesse lendo uma matriz de n linhas
// da esquerda para a direita, coluna a coluna.
// Elementos que nao couberem em nenhuma parte (resto da divisao) sao
// adicionados ao final sem alteracao.
//
// Se n for menor ou igual a zero, retorne [].
// Se n for maior que o tamanho do array, retorne [].
// Se n for 1, retorne o array original.
//
// Exemplo 1
// Construtor: [1, 2, 3, 4, 5, 6]
// n: 1
// Retorno: [1, 2, 3, 4, 5, 6]
//
// Exemplo 2
// Construtor: [1, 2, 3, 4, 5, 6]
// n: 2
// Retorno: [1, 4, 2, 5, 3, 6]   (partes [1,2,3] e [4,5,6] intercaladas)
//
// Exemplo 3
// Construtor: [1, 2, 3, 4, 5, 6]
// n: 3
// Retorno: [1, 3, 5, 2, 4, 6]   (partes [1,2], [3,4], [5,6] intercaladas)
//
// Exemplo 4
// Construtor: [1, 2, 3, 4, 5, 6]
// n: 0
// Retorno: []
export class Zipper {
  private data: number[];

  constructor(data: number[]) {
    this.data = data;
  }

  public zipper(n: number): number[] {
    const result: number[] = [];

    if (n <= 0 || n > this.data.length) return result;

    if (n === 1) {
      for (let i = 0; i < this.data.length; i++) {
        result.push(this.data[i]);
      }
      return result;
    }

    const partSize = Math.floor(this.data.length / n);

    // percorre coluna a coluna, linha a linha (cada linha e uma das n partes)
    for (let col = 0; col < partSize; col++) {
      for (let row = 0; row < n; row++) {
        result.push(this.data[row * partSize + col]);
      }
    }

    // elementos que sobraram (quando o array nao e divisivel por n)
    for (let i = n * partSize; i < this.data.length; i++) {
      result.push(this.data[i]);
    }

    return result;
  }
}
