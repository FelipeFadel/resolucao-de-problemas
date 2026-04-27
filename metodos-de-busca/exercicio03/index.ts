import Baralho from './Baralho';

// (a) Primeiro arranjo: 10, 9, 8, 7, 6, 5, 4, 3, 2, 1.
// (b) Segundo arranjo: 10, 1, 9, 2, 8, 3, 7, 4, 6, 5.
// (c) Terceiro arranjo: 4, 5, 6, 1, 2, 3, 7, 8, 9, 10.

const arranjos = [
  [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  [10, 1, 9, 2, 8, 3, 7, 4, 6, 5],
  [4, 5, 6, 1, 2, 3, 7, 8, 9, 10]
];

const nomes = ["a) Primeiro", "b) Segundo", "c) Terceiro"];

console.log("=== Resultados do Exercício 3 (Baralho) ===");

arranjos.forEach((arr, index) => {
  const baralho = new Baralho(arr);
  console.log(`\n${nomes[index]} arranjo: [${arr.join(', ')}]`);
  
  const selSort = baralho.selectionSort();
  console.log(`  Selection Sort -> Comparações: ${selSort.comparacoes}, Trocas: ${selSort.trocas}`);
  
  const bubSort = baralho.bubbleSort();
  console.log(`  Bubble Sort    -> Comparações: ${bubSort.comparacoes}, Trocas: ${bubSort.trocas}`);
  
  const insSort = baralho.insertionSort();
  console.log(`  Insertion Sort -> Comparações: ${insSort.comparacoes}, Trocas (deslocamentos): ${insSort.trocas}`);
});

console.log("\n(Nota: No Insertion Sort, as 'trocas' foram contadas como as vezes que ocorreu um deslocamento 'shift' de um elemento do arranjo.)\n");
