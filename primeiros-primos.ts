function firstPrimes(num: number): number[] {
  let answer: number[] = [];
  if (num < 2) {
    return answer;
  }
  for (let i = 2; i <= num; i++) {
    let isPrimo: boolean = true;
    for (let j = 2; j <= Math.sqrt(i); j++) {
      if (i % j === 0) {
        isPrimo = false;
      }
    }
    if (isPrimo) answer.push(i);
  }
  return answer;
}

console.log(firstPrimes(1));
console.log(firstPrimes(2));
console.log(firstPrimes(25));
console.log(firstPrimes(100));
