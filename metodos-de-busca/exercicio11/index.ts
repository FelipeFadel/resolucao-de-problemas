import EnigmaSort from "./EnigmaSort";

console.log("=== Testando o Enigma Sort (Bogo Sort) ===");
// Usamos um array pequeno porque Bogo Sort pode demorar eternamente com mais de 7-10 elementos
const arrayTeste = [5, 2, 8, 1, 3];
const enigma = new EnigmaSort(arrayTeste);

console.log("Array Gerado:", enigma.getArray());
console.log("Ordenando (pode depender da sorte)...");

enigma.sort();

console.log("Array Ordenado:", enigma.getArray());
