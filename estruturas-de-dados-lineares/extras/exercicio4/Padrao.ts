// PADRAO
//
// Implemente uma classe denominada Padrao que receba, no construtor, uma
// matriz unidimensional de inteiros. Forneca um metodo denominado padrao()
// que receba um inteiro n e retorne uma nova matriz.
//
// O metodo deve dividir o array em blocos consecutivos de tamanho n e
// inverter cada bloco individualmente. O ultimo bloco pode ter menos que
// n elementos — ele tambem deve ser invertido.
//
// Se n for menor ou igual a zero, retorne [].
//
// Exemplo 1
// Construtor: [1, 2, 3, 4, 5, 6]
// n: 1
// Retorno: [1, 2, 3, 4, 5, 6]   (blocos de 1 elemento, invertidos = iguais)
//
// Exemplo 2
// Construtor: [1, 2, 3, 4, 5, 6]
// n: 2
// Retorno: [2, 1, 4, 3, 6, 5]
//
// Exemplo 3
// Construtor: [1, 2, 3, 4, 5, 6]
// n: 3
// Retorno: [3, 2, 1, 6, 5, 4]
//
// Exemplo 4
// Construtor: [1, 2, 3, 4, 5]
// n: 3
// Retorno: [3, 2, 1, 5, 4]   (ultimo bloco [4,5] tem 2 elementos, invertido = [5,4])
export class Padrao {
  private data: number[];

  constructor(data: number[]) {
    this.data = data;
  }

  public padrao(n: number): number[] {
    const result: number[] = [];

    if (n <= 0) return result;

    for (let i = 0; i < this.data.length; i += n) {
      let fim = i + n - 1;
      if (fim >= this.data.length) fim = this.data.length - 1;

      // insere o bloco de fim para o inicio (invertido)
      for (let j = fim; j >= i; j--) {
        result.push(this.data[j]);
      }
    }

    return result;
  }
}
