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
