// INTERCALA
//
// Implemente uma classe denominada Intercala que receba, no construtor, duas
// matrizes unidimensionais de inteiros (a e b). Forneca um metodo denominado
// intercala() que receba um inteiro n e retorne uma nova matriz.
//
// O metodo deve pegar n elementos de a, depois n elementos de b, alternando
// entre os dois arrays ate que ambos sejam esgotados. Se um array acabar antes
// do outro, o restante do outro e colocado no final sem alteracao.
//
// Se n for menor ou igual a zero, retorne [].
//
// Exemplo 1
// Construtor: a=[1,2,3,4]  b=[10,20,30,40]
// n: 1
// Retorno: [1, 10, 2, 20, 3, 30, 4, 40]
//
// Exemplo 2
// Construtor: a=[1,2,3,4]  b=[10,20,30,40]
// n: 2
// Retorno: [1, 2, 10, 20, 3, 4, 30, 40]
//
// Exemplo 3
// Construtor: a=[1,2,3,4]  b=[10,20,30,40]
// n: 4
// Retorno: [1, 2, 3, 4, 10, 20, 30, 40]
//
// Exemplo 4
// Construtor: a=[1,2,3]  b=[10,20]
// n: 1
// Retorno: [1, 10, 2, 20, 3]   (b acabou antes, o 3 de a vai ao final)
export class Intercala {
  private a: number[];
  private b: number[];

  constructor(a: number[], b: number[]) {
    this.a = a;
    this.b = b;
  }

  public intercala(n: number): number[] {
    const result: number[] = [];

    if (n <= 0) return result;

    let ia = 0;
    let ib = 0;

    while (ia < this.a.length || ib < this.b.length) {
      for (let i = 0; i < n && ia < this.a.length; i++) {
        result.push(this.a[ia]);
        ia++;
      }
      for (let i = 0; i < n && ib < this.b.length; i++) {
        result.push(this.b[ib]);
        ib++;
      }
    }

    return result;
  }
}
