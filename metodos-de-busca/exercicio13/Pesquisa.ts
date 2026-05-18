import Busca from "../../metodos-de-busca/busca"; // Reutilizando a classe existente

export default class PesquisaDemonstracao {
  public demonstrar(): void {
    const arr = Array.from({ length: 1000000 }, (_, i) => i + 1); // 1 milhão de elementos ordenados
    const alvo = 999999;
    const buscador = new Busca();

    console.log("Demonstração de Pesquisa 1 Milhão de elementos");

    // Pesquisa Linear (fingindo desordenado)
    let start = performance.now();
    const achouSeq = buscador.buscaDesordenada(arr, alvo);
    let end = performance.now();
    console.log(
      `[Busca Sequencial] Encontrou? ${achouSeq} | Tempo: ${(end - start).toFixed(4)} ms`,
    );

    // Pesquisa Binária (Ordenado)
    start = performance.now();
    const achouBin = buscador.buscaBinaria(arr, alvo);
    end = performance.now();
    console.log(
      `[Busca Binária] Encontrou? ${achouBin} | Tempo: ${(end - start).toFixed(4)} ms`,
    );
  }
}
