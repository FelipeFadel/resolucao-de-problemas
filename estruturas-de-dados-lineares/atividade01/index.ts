import { Balanceamento } from './balanceamento';

const testCases = [
  // Testes validos
  "(a + b)",
  "{a * [c – b * (e + f)]} – 2",
  // Testes invalidos
  "(a + b",
  "a + b)",
  "{a * [(c – b * (e + f)]} – 2",
  // Invalidos pela hierarquia
  "[ a + { b } ]",
  "( a + [ b ] )",
  "( a + { b } )"
];

testCases.forEach(text => {
  const aux = new Balanceamento(text);
  const result = aux.isBalanced();
  console.log(`${result ? "Está balanceado: " : "Não está balanceado: "} [${text}]`);
});
