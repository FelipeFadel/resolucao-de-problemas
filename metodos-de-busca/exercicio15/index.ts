import SudokuMelhorado from "./sudokuMelhorado";

//TABULEIROS
const sudokuValido: number[][] = [
  [4, 3, 5, 2, 6, 9, 7, 8, 1],
  [6, 8, 2, 5, 7, 1, 4, 9, 3],
  [1, 9, 7, 8, 3, 4, 5, 6, 2],
  [8, 2, 6, 1, 9, 5, 3, 4, 7],
  [3, 7, 4, 6, 8, 2, 9, 1, 5],
  [9, 5, 1, 7, 4, 3, 6, 2, 8],
  [5, 1, 9, 3, 2, 6, 8, 7, 4],
  [2, 4, 8, 9, 5, 7, 1, 3, 6],
  [7, 6, 3, 4, 1, 8, 2, 5, 9],
];

const sudokuInvalidoRange: number[][] = [
  [4, 3, 0, 2, 6, 9, 7, 8, 1], // 0 inválido
  [6, 8, 2, 5, 7, 1, 4, 9, 3],
  [1, 9, 7, 8, 3, 4, 5, 6, 2],
  [8, 2, 6, 1, 9, 5, 3, 4, 7],
  [3, 7, 4, 6, 8, 2, 9, 1, 5],
  [9, 5, 1, 7, 4, 3, 6, 2, 8],
  [5, 1, 9, 3, 2, 6, 8, 7, 4],
  [2, 4, 8, 9, 5, 7, 1, 3, 6],
  [7, 6, 3, 4, 1, 8, 2, 5, 9],
];

const sudokuInvalidoLinha: number[][] = [
  [4, 3, 5, 2, 6, 9, 7, 8, 1],
  [6, 8, 2, 5, 7, 1, 4, 9, 6], // 6 repetido na linha
  [1, 9, 7, 8, 3, 4, 5, 6, 2],
  [8, 2, 6, 1, 9, 5, 3, 4, 7],
  [3, 7, 4, 6, 8, 2, 9, 1, 5],
  [9, 5, 1, 7, 4, 3, 6, 2, 8],
  [5, 1, 9, 3, 2, 6, 8, 7, 4],
  [2, 4, 8, 9, 5, 7, 1, 3, 6],
  [7, 6, 3, 4, 1, 8, 2, 5, 9],
];

const sudokuInvalidoColuna: number[][] = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 6, 7, 8, 9, 2, 3, 4], // <- repetiu "1" na coluna 1
  [4, 8, 9, 1, 2, 3, 5, 6, 7],
  [2, 3, 1, 5, 6, 4, 8, 9, 7],
  [5, 6, 4, 8, 9, 7, 3, 1, 2],
  [8, 9, 7, 2, 3, 1, 4, 5, 6],
  [3, 1, 2, 6, 4, 5, 9, 7, 8],
  [6, 4, 5, 9, 7, 8, 1, 2, 3],
  [7, 7, 8, 3, 1, 2, 6, 4, 5],
];

//Erro 3x3
const sudokuInvalidoRegiao: number[][] = [
  [4, 3, 5, 2, 6, 9, 7, 8, 1],
  [6, 4, 2, 5, 7, 1, 8, 9, 3], // <- duplicado "4" no bloco
  [1, 9, 7, 8, 3, 4, 5, 6, 2],

  [8, 2, 6, 1, 9, 5, 3, 4, 7],
  [3, 7, 1, 6, 8, 2, 9, 5, 4],
  [9, 5, 4, 7, 3, 8, 6, 2, 1],

  [5, 1, 9, 3, 2, 6, 8, 7, 4],
  [2, 8, 3, 9, 4, 7, 1, 5, 6],
  [7, 6, 8, 4, 1, 5, 2, 3, 9],
];

const sudokuTudoErrado: number[][] = [
  [4, 3, 10, 2, 6, 9, 7, 8, 1], // fora do intervalo
  [6, 8, 2, 5, 7, 1, 4, 9, 6], // repetido na linha
  [1, 9, 7, 8, 3, 4, 5, 6, 2],
  [8, 2, 6, 1, 9, 5, 3, 4, 7],
  [3, 7, 4, 6, 8, 2, 9, 1, 5],
  [9, 5, 1, 7, 4, 3, 6, 2, 8],
  [5, 1, 9, 3, 2, 6, 8, 7, 4],
  [2, 4, 8, 9, 5, 7, 1, 3, 6],
  [7, 6, 3, 4, 1, 8, 2, 5, 9],
];

//CLASSES
let sudoko1 = new SudokuMelhorado(sudokuValido);
sudoko1.isValid();
console.log("Teste 1");
console.log(sudoko1.getError());

let sudoko2 = new SudokuMelhorado(sudokuInvalidoRange);
sudoko2.isValid();
console.log("Teste 2");
console.log(sudoko2.getError());

let sudoko3 = new SudokuMelhorado(sudokuInvalidoLinha);
sudoko3.isValid();
console.log("Teste 3");
console.log(sudoko3.getError());

let sudoko4 = new SudokuMelhorado(sudokuInvalidoColuna);
sudoko4.isValid();
console.log("Teste 4");
console.log(sudoko4.getError());

let sudoko5 = new SudokuMelhorado(sudokuInvalidoRegiao);
sudoko5.isValid();
console.log("Teste 5");
console.log(sudoko5.getError());

let sudoko6 = new SudokuMelhorado(sudokuTudoErrado);
sudoko6.isValid();
console.log("Teste 6");
console.log(sudoko6.getError());
