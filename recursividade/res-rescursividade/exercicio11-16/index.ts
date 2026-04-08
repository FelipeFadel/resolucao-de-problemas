import MatrizDeInteiros from "./MatrizDeInteiros.ts";

let umaMatriz: MatrizDeInteiros = new MatrizDeInteiros();

console.log("Matriz unidimensional gerada:");
console.log(umaMatriz.toString());

console.log();
console.log("Qual é a primeira ocorrência do 1 na matriz?");
console.log(umaMatriz.primeiraOcorrencia(1));
// É indevido repassar a posição inicial aqui.
// console.log(umaMatriz.primeiraOcorrencia(1, 0));

console.log();
console.log("Qual é soma dos elementos da matriz?");
console.log(umaMatriz.somaDosElementos());

console.log();
console.log("Qual o maior elemento da matriz?");
console.log(umaMatriz.maiorElemento());

console.log();
console.log("Quantidade de ocorrências do número 1?");
console.log(umaMatriz.numeroDeOcorrencias(1));

console.log();
console.log("Quantidade de ocorrências do número 5?");
console.log(umaMatriz.numeroDeOcorrencias(5));

console.log();
console.log("Quantidade de ocorrências do número 7?");
console.log(umaMatriz.numeroDeOcorrencias(7));

console.log();
console.log("Está ordenado?")
console.log(umaMatriz.isOrdenado());

console.log();
console.log("Ordenando a matriz:")
umaMatriz.ordena();
console.log(umaMatriz.toString());

console.log();
console.log("Está ordenado?")
console.log(umaMatriz.isOrdenado());