const dayNow: number = 16;
const monthNow: number = 3;
const yearNow: number = 2026;

function validade(day: number, month: number, year: number): boolean {
  if (year < yearNow) {
    return false;
  }
  if (year > yearNow) {
    return true;
  }
  if (year == yearNow) {
    if (month < monthNow) return false;
    if (month > monthNow) return true;
    if (month === monthNow) {
      if (day < dayNow) {
        return false;
      } else if (day > dayNow) {
        return true;
      } else {
        return true;
        // Vai vencer hoje
      }
    }
  }
  return true;
}

if (validade(2, 7, 2027)) console.log("Produto não venceu");
else console.log("Produto venceu");

if (validade(15, 2, 2026)) console.log("Produto não venceu");
else console.log("Produto venceu");

if (validade(16, 3, 2026)) console.log("Produto não venceu");
else console.log("Produto venceu");

console.log("\n");

function isPrimo(num: number): boolean {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) {
      return false;
    }
  }
  return true;
}

if (isPrimo(17)) console.log("17 é primo");
if (!isPrimo(4)) console.log("4 não é primo");

function maximoDivisorComum(first_num: number, second_num: number): number {
  //Quando o second_num virar 0 o first_num é o maximo divisor comum
  while (second_num !== 0) {
    //a ideia é ir divindo e colocando o resto no segundo numero para uma nova iteração até resto chegar em 0
    const rest = first_num % second_num;
    first_num = second_num;
    second_num = rest;
  }

  return first_num;
}

function minimoMultiploComum(first_num: number, second_num: number): number {
  const multiplication = first_num * second_num;
  const comumDivisor = maximoDivisorComum(first_num, second_num);
  return multiplication / comumDivisor;
}

console.log(minimoMultiploComum(12, 18));
