export function rps(p1: string, p2: string): string {
  const opcoes = ["scissors", "paper", "rock"];
  
  const res = (opcoes.indexOf(p1) - opcoes.indexOf(p2) + 3) % 3;
  
  return ["Draw!", "Player 2 won!", "Player 1 won!"][res];
}