import MatrizDeInteiros from "./MatrizDeInteiros";
import Busca from "../busca"; // Certifique-se que o arquivo busca.tsx exporta a classe Busca

const arrayTeste = [
  6, 2, 9, 4, 7, 1, 8, 5, 0, 10, 15, 12, 19, 14, 17, 11, 18, 3, 16, 13,
];
const matriz = new MatrizDeInteiros(arrayTeste);

console.log("Array original:");
console.log(matriz.getMatriz());

console.log("\nOrdenando o array...");
// matriz.selectionSortRecursivo();
console.log("Array ordenado:");
console.log(matriz.getMatriz());

const alvo = 16;
const alvoNaoExistente = 25;

console.log(`\n--- Testando Busca pela Extremidade Mais Próxima ---`);
console.log(`Buscando o número ${alvo}...`);
// const encontrouExtremidade = matriz.buscaExtremidadeMaisProxima(alvo);
// console.log(`Encontrou? ${encontrouExtremidade}`);

console.log(`Buscando o número ${alvoNaoExistente}...`);
// const encontrouNaoExistente = matriz.buscaExtremidadeMaisProxima(alvoNaoExistente);
// console.log(`Encontrou? ${encontrouNaoExistente}`);

console.log(`\n--- Testando Busca Binária (Classe de Apoio) ---`);
const buscador = new Busca();
console.log(`Buscando o número ${alvo} com Busca Binária...`);
const encontrouBinaria = buscador.buscaBinaria(matriz.getMatriz(), alvo);
console.log(`Encontrou? ${encontrouBinaria}`);

console.log(`Buscando o número ${alvoNaoExistente} com Busca Binária...`);
const encontrouBinariaNaoExistente = buscador.buscaBinaria(
  matriz.getMatriz(),
  alvoNaoExistente,
);
console.log(`Encontrou? ${encontrouBinariaNaoExistente}`);
