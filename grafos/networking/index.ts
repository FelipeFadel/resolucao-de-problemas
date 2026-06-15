import Network from "./Network";

let network = new Network();

network.add("a", "b");
network.add("a", "c");
network.add("c", "d");
network.add("e", "f");
network.add("g", "e");
network.add("h", "i");

console.log(network.getConnected("a"));
// esperado: b, c, d

console.log(network.getNotConnected("a"));
// esperado: e, f, g, h, i

console.log(network.getConnected("e"));
// esperado: f, g

console.log(network.getNotConnected("e"));
// esperado: a, b, c, d, h, i

console.log(network.getConnected("h"));
// esperado: i

console.log(network.getConnected("d"));
// esperado: a, b, c

console.log(network.getConnected("i"));
// esperado: h

network.addNode("z");

console.log(network.getConnected("z"));
// esperado: (vazio)

console.log(network.getNotConnected("z"));
// esperado: a, b, c, d, e, f, g, h, i

network.add("b", "c");

console.log(network.getConnected("a"));
// esperado: b, c, d

console.log(network.getConnected("naoexiste"));
// esperado: (vazio)
