import UniqueNumber from "./UniqueNumber";

// Testes padrão descritos no problema
const teste1 = new UniqueNumber([1, 1, 1, 2, 1, 1]);
console.log("findUniq([ 1, 1, 1, 2, 1, 1 ]) ===", teste1.findUniq()); // Deve ser 2

const teste2 = new UniqueNumber([0, 0, 0.55, 0, 0]);
console.log("findUniq([ 0, 0, 0.55, 0, 0 ]) ===", teste2.findUniq()); // Deve ser 0.55

// Teste de Performance com um array gigante (1 milhão de elementos)
console.log("\nExecutando teste de performance com array gigante...");
const tamanhoGigante = 1000000;
const arrayGigante = new Array(tamanhoGigante).fill(42);
// Colocamos o número único no final do array para forçar a busca pelo pior caso
arrayGigante[tamanhoGigante - 1] = 99;

const start = performance.now();
const testePerformance = new UniqueNumber(arrayGigante);
const resultadoGigante = testePerformance.findUniq();
const end = performance.now();

console.log(`findUniq no array gigante == = ${resultadoGigante}`);
console.log(`Tempo de execução: ${(end - start).toFixed(4)} ms`);
