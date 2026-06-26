// // process.stdin.resume();
// // process.stdin.setEncoding("utf8");

// // let input = "";
// // let lineCount = 0;

// // process.stdin.on("data", (chunk) => {
// //   input += chunk;
// // });

// // process.stdin.on("end", () => {
// //   const i = input.trim().split("\n");

// //   const nMess: number = Number(i[0]);

// //   if (nMess <= 3) {
// //     console.log("vai ganhar o biscoito");
// //   } else {
// //     console.log("vai ficar sem o biscoito");
// //   }
// // });

// process.stdin.resume();
// process.stdin.setEncoding("utf8");

// let input = "";
// let lineCount = 0;

// process.stdin.on("data", (chunk) => {
//   input += chunk;
// });

// process.stdin.on("end", () => {
//   const inputI = input.trim().split("\n");

//   const n: number = Number(inputI[0]);
//   const vogais: string = "aeiouAEIOU";

//   for (let i = 1; i < n + 1; i++) {
//     const name: string = inputI[i];
//     let contador: number = 0;
//     let isFound: boolean = false;

//     for (let j = 0; j < name.length; j++) {
//       if (!isFound) {
//         const letra = name[j];
//         if (vogais.includes(letra)) {
//           contador = 0;
//         } else {
//           contador = contador + 1;
//           if (contador === 3) {
//             console.log(name + " nao eh facil");
//             isFound = true;
//           }
//         }
//       }
//     }
//     if (!isFound) console.log(name + " eh facil");
//   }
// });

// process.stdin.resume();
// process.stdin.setEncoding("utf8");

// let input = "";
// let lineCount = 0;

// process.stdin.on("data", (chunk) => {
//   input += chunk;
// });

// function getIndex(a: string): number {
//   return a.charCodeAt(0) - 97;
// }

// function getDistancia(a: string, b: string): number {
//   if (a === b) return 0;

//   const indexA = getIndex(a);
//   const indexB = getIndex(b);

//   const diferenca = Math.abs(indexA - indexB);

//   return Math.min(diferenca, 26 - diferenca);
// }

// process.stdin.on("end", () => {
//   const inputI = input.trim().split("\n");

//   const S = inputI[0].trim();
//   const T = inputI[1].trim();

//   let distancia = 0;

//   for (let i = 0; i < S.length; i++) {
//     distancia += getDistancia(S[i], T[i]);
//   }

//   console.log(distancia);
// });

//97
//toLowerCase()

//azur
//aala

process.stdin.resume();
process.stdin.setEncoding("utf8");

let input = "";
let lineCount = 0;

process.stdin.on("data", (chunk) => {
  input += chunk;
});

process.stdin.on("end", () => {
  const inputI: string[] = input.trim().split("\n");

  const first = inputI[0].split(" ");
  const N: number = Number(first[0]);
  const L: number = Number(first[1].replace(",", "."));
  const Q: number = Number(first[2].replace(",", "."));

  const Lint = Math.round(L * 10);
  const Qint = Math.round(Q * 10);

  const names = inputI[1].split(" ");

  const cabacas: number = Math.floor(Lint / Qint);
  const resto = Lint % Qint;

  let rico: number;
  let sobra: number;

  if (resto === 0) {
    rico = (cabacas - 1) % N;
    sobra = Q;
  } else {
    rico = cabacas % N;
    sobra = resto / 10;
  }

  console.log(names[rico] + " " + sobra.toFixed(1));
});
