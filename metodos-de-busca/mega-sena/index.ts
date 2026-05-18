import MegaSena from "./MegaSena";

const cartaoSena = new MegaSena([1, 10, 23, 34, 45, 56]);
console.log(cartaoSena.obterResultado([34, 1, 56, 10, 45, 23]));

const cartaoQuina = new MegaSena([2, 5, 12, 19, 28, 33, 44, 50]);
console.log(cartaoQuina.obterResultado([5, 19, 33, 44, 60, 2]));

const cartaoQuadra = new MegaSena([4, 8, 15, 16, 23, 42]);
console.log(cartaoQuadra.obterResultado([4, 8, 15, 16, 1, 2]));

const cartaoNaoPremiado = new MegaSena([10, 20, 30, 40, 50, 60]);
console.log(cartaoNaoPremiado.obterResultado([11, 21, 31, 41, 51, 61]));
