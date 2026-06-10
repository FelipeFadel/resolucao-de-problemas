import { Node } from "./Node";
import { canReach } from "./canReach";

let passou = 0;
let falhou = 0;

function teste(nome: string, esperado: boolean, recebido: boolean): void {
  if (esperado === recebido) {
    passou++;
    console.log(`ok   - ${nome}`);
  } else {
    falhou++;
    console.log(`falha - ${nome} (esperado ${esperado}, recebido ${recebido})`);
  }
}

// grafo aciclico:  a -> b -> d
//                  a -> c -> d
const a1 = new Node("a");
const b1 = new Node("b");
const c1 = new Node("c");
const d1 = new Node("d");
a1.edges = [b1, c1];
b1.edges = [d1];
c1.edges = [d1];

teste("aciclico: a alcanca d", true, canReach(a1, d1));
teste("aciclico: a alcanca b", true, canReach(a1, b1));
teste("aciclico: d nao alcanca a (direcionado)", false, canReach(d1, a1));
teste("aciclico: b nao alcanca c", false, canReach(b1, c1));
teste("aciclico: a nao alcanca a si mesmo", false, canReach(a1, a1));

// grafo ciclico:  a -> b -> c -> a
const a2 = new Node("a");
const b2 = new Node("b");
const c2 = new Node("c");
a2.edges = [b2];
b2.edges = [c2];
c2.edges = [a2];

teste("ciclico: a alcanca c", true, canReach(a2, c2));
teste("ciclico: c alcanca a (ciclo)", true, canReach(c2, a2));
teste("ciclico: a alcanca a si mesmo (ciclo)", true, canReach(a2, a2));

// no isolado
const solto = new Node("solto");
teste("isolado nao alcanca a", false, canReach(solto, a2));
teste("a nao alcanca isolado", false, canReach(a2, solto));

console.log(`\nresultado: ${passou} ok, ${falhou} falha(s)`);
