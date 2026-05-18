export default class Busca {
  // 1. Busca em vetor DESORDENADO (Linear)
  public buscaDesordenada(vetor: number[], alvo: number): boolean {
    for (let i = 0; i < vetor.length; i++) {
      if (vetor[i] === alvo) {
        return true;
      }
    }
    return false;
  }

  // 2. Busca em vetor ORDENADO (com parada antecipada)
  public buscaOrdenada(vetor: number[], alvo: number): boolean {
    for (let i = 0; i < vetor.length; i++) {
      if (vetor[i] === alvo) {
        return true;
      }

      // Se passou do valor, não precisa continuar
      if (vetor[i] > alvo) {
        return false;
      }
    }
    return false;
  }

  // 3. Busca BINÁRIA (vetor precisa estar ordenado)
  public buscaBinaria(vetor: number[], alvo: number): boolean {
    let inicio = 0;
    let fim = vetor.length - 1;

    while (inicio <= fim) {
      const meio = Math.floor((inicio + fim) / 2);

      if (vetor[meio] === alvo) {
        return true;
      }

      if (vetor[meio] < alvo) {
        inicio = meio + 1;
      } else {
        fim = meio - 1;
      }
    }

    return false;
  }

  public buscaBinariaRecursiva(
    vetor: number[],
    alvo: number,
    inicio: number = 0,
    fim: number = vetor.length - 1,
  ): boolean {
    // Caso base: não encontrou
    if (inicio > fim) {
      return false;
    }

    const meio = Math.floor((inicio + fim) / 2);

    // Encontrou
    if (vetor[meio] === alvo) {
      return true;
    }

    // Busca na direita
    if (vetor[meio] < alvo) {
      return this.buscaBinariaRecursiva(vetor, alvo, meio + 1, fim);
    }

    // Busca na esquerda
    return this.buscaBinariaRecursiva(vetor, alvo, inicio, meio - 1);
  }
}
