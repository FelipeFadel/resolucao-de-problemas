/*MASCHIO, Eleandro. Recursividade: Exercícios de Revisão. Guarapuava: Universidade
Tecnológica Federal do Paraná, 2024. 2 p. Material didático da disciplina de Resolução de
Problemas.*/

import { Mensagem } from "./mensagem";
import { Contagem } from "./contagem";
import { Inteiro } from "./inteiro";
import { Ocorrencia } from "./ocorrencia";
import { Palindromo } from "./palindromo";

let arara = new Palindromo("arara");
console.log(arara.isPalindrome());

let araras = new Palindromo("araras");
console.log(araras.isPalindrome());

let reviver = new Palindromo("reviver");
console.log(reviver.isPalindrome());

let osso = new Palindromo("osso");
console.log(osso.isPalindrome());

let pura = new Palindromo("pura");
console.log(pura.isPalindrome());
