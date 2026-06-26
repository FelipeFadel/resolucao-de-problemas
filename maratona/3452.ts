// process.stdin.resume();
// process.stdin.setEncoding("utf8");

// let input = "";
// let lineCount = 0;

// process.stdin.on("data", (chunk) => {
//   input += chunk;
// });

// function fits(nut: string, linha: string): boolean {
//   for (let i = 0; i < nut.length; i++) {
//     if (nut[i] === "1" && linha[i] === "1") return false; //Nao cabe
//   }
//   return true;
// }

// function fitsOnTheLine(line: string, rots: string[]): boolean {
//   for (let i = 0; i < rots.length; i++) {
//     if (fits(rots[i], line)) {
//       console.log("cabe com: " + rots[i] + " na linha: " + line);
//       return true;
//     }
//   }
//   console.log("Não cabe");
//   return false;
// }

// function spinForRight(s: string): string {
//   return s[s.length - 1] + s.slice(0, -1);
// }

// function spinForLeft(s: string): string {
//   return s.slice(1) + s[0];
// }

// process.stdin.on("end", () => {
//   const i = input.trim().split("\n");

//   const firstLine = i[0].trim().split(" "); // 0 Rows e 1 Colunas

//   const rowns = Number(firstLine[0]);
//   const columns = Number(firstLine[1]);

//   const pinNut: string = i[1].trim(); // Marcas internas da porca
//   const nutFlipped = pinNut.split("").reverse().join("");

//   const maze: string[] = i.slice(2).map((line) => line.trim());

//   const nutRotations: string[] = [];

//   let currentPin = pinNut;

//   for (let j = 0; j < columns; j++) {
//     //Armazenar todas as possiveis inserções
//     nutRotations.push(currentPin);
//     currentPin = spinForRight(currentPin);
//   }

//   let currentFlipped = nutFlipped;

//   for (let j = 0; j < columns; j++) {
//     //Armazenar todas as possiveis inserções flipadas
//     nutRotations.push(currentFlipped);
//     currentFlipped = spinForRight(currentFlipped);
//   }

//   const totalConfigs: number = nutRotations.length;

//   const visited: boolean[][] = Array.from({ length: rowns }, () =>
//     new Array(totalConfigs).fill(false),
//   );

//   const queue: [number, number][] = [];

//   for (let c = 0; c < totalConfigs; c++) {
//     if (fits(nutRotations[c], maze[0])) {
//       visited[0][c] = true;
//       queue.push([0, c]);
//     }
//   }

//   let found = false;

//   while (queue.length > 0 && !found) {
//     const [row, cfg] = queue.shift()!;

//     if (row + 1 === rowns) {
//       found = true;
//       break;
//     }
//     if (fits(nutRotations[cfg], maze[row + 1]) && !visited[row + 1][cfg]) {
//       visited[row + 1][cfg] = true;
//       queue.push([row + 1, cfg]);
//     }

//     if (row - 1 >= 0) {
//       if (fits(nutRotations[cfg], maze[row - 1]) && !visited[row - 1][cfg]) {
//         visited[row - 1][cfg] = true;
//         queue.push([row - 1, cfg]);
//       }
//     } else {
//       for (let c = 0; c < totalConfigs; c++) {
//         if (fits(nutRotations[c], maze[0]) && !visited[0][c]) {
//           visited[0][c] = true;
//           queue.push([0, c]);
//         }
//       }
//     }

//     let nextRot: number;
//     if (cfg % columns === columns - 1) {
//       nextRot = cfg - (columns - 1);
//     } else {
//       nextRot = cfg + 1;
//     }
//     if (fits(nutRotations[nextRot], maze[row]) && !visited[row][nextRot]) {
//       visited[row][nextRot] = true;
//       queue.push([row, nextRot]);
//     }

//     let prevRot: number;
//     if (cfg % columns === 0) {
//       prevRot = cfg + (columns - 1);
//     } else {
//       prevRot = cfg - 1;
//     }
//     if (fits(nutRotations[prevRot], maze[row]) && !visited[row][prevRot]) {
//       visited[row][prevRot] = true;
//       queue.push([row, prevRot]);
//     }
//   }

//   if (found) console.log("Y");
//   else console.log("N");
// });
