export default class BuscaBinariaAnalise {
  public analisar(): void {
    const conjuntos = [100, 1000, 10000, 100000];

    // Utilizando matriz nativa do JS/TS (array de objetos) para calcular e exibir a tabela
    const tabela = conjuntos.map(n => {
      const seq = n;
      // Número de comparações no pior caso da busca binária = floor(log2(n)) + 1
      const bin = Math.floor(Math.log2(n)) + 1;
      
      const economia = seq - bin;
      const ganhoPercentual = (economia / seq) * 100;

      return {
        "Qtd Elementos": n,
        "Busca Sequencial": seq,
        "Busca Binária": bin,
        "Ganho (%)": ganhoPercentual.toFixed(4) + "%"
      };
    });

    console.log("Análise de Comparações (Pior Caso):\n");
    console.table(tabela);
  }
}
