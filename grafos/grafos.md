# Representacao Interna de Grafos

Um grafo G = (V, A) e formado por um conjunto de vertices V e um conjunto de arestas (ou arcos) A. Existem varias formas de representar esse grafo na memoria de um computador. As principais estao descritas abaixo.

---

## (a) Matriz de Incidencia Vertice-Aresta

Uma matriz M com linhas representando os vertices e colunas representando as arestas.

Para um grafo nao-direcionado, M[v][e] = 1 se o vertice v e um dos extremos da aresta e, e 0 caso contrario.

Exemplo: grafo com 3 vertices (v1, v2, v3) e 2 arestas (e1 = {v1,v2}, e2 = {v2,v3}):

```
     e1  e2
v1 [  1   0 ]
v2 [  1   1 ]
v3 [  0   1 ]
```

Cada coluna tem exatamente dois 1s (os dois extremos da aresta). Se o grafo tiver lacos, a coluna correspondente tera um unico 1 (ou 2, dependendo da convencao).

---

## (b) Matriz de Incidencia No-Arco

Usada para grafos direcionados (digrafos). Cada arco tem uma origem e um destino.

M[v][a] = -1 se o vertice v e a origem do arco a
M[v][a] = +1 se o vertice v e o destino do arco a
M[v][a] = 0 caso contrario

Exemplo: grafo direcionado com 3 nos (n1, n2, n3) e 2 arcos (a1: n1->n2, a2: n2->n3):

```
     a1   a2
n1 [ -1    0 ]
n2 [ +1   -1 ]
n3 [  0   +1 ]
```

Cada coluna tem exatamente um -1 (origem) e um +1 (destino).

---

## (c) Matriz de Adjacencia (Vertice-Vertice ou No-No)

Uma matriz quadrada M de tamanho |V| x |V|.

M[i][j] = 1 se existe uma aresta entre o vertice i e o vertice j, e 0 caso contrario.

Para grafos com pesos, M[i][j] guarda o peso da aresta em vez de apenas 1.

Exemplo: grafo nao-direcionado com 3 vertices e arestas {v1,v2} e {v2,v3}:

```
     v1  v2  v3
v1 [  0   1   0 ]
v2 [  1   0   1 ]
v3 [  0   1   0 ]
```

Para grafos nao-direcionados a matriz e simetrica. Para grafos direcionados, M[i][j] e M[j][i] podem ter valores diferentes.

---

## (d) Lista de Arcos

Uma lista (ou tabela) onde cada entrada representa um arco com seus atributos: origem, destino, e eventualmente o peso.

Exemplo:

```
(v1, v2)
(v2, v3)
(v1, v3)
```

E a forma mais simples de armazenar um grafo. Util quando se quer percorrer todos os arcos, mas ineficiente para verificar se dois vertices especificos sao adjacentes, pois exige percorrer toda a lista.

---

## (e) Lista de Adjacencia

Para cada vertice, armazena-se uma lista com todos os seus vizinhos (vertices adjacentes).

Exemplo: grafo com vertices {v1, v2, v3} e arestas {v1,v2}, {v2,v3}, {v1,v3}:

```
v1 -> [v2, v3]
v2 -> [v1, v3]
v3 -> [v1, v2]
```

E a representacao mais usada na pratica. Ocupa menos memoria que a matriz de adjacencia quando o grafo e esparso (poucas arestas em relacao ao numero de vertices).

---

## Comparacao

| Representacao         | Espaco    | Verificar adjacencia | Listar vizinhos |
|-----------------------|-----------|----------------------|-----------------|
| Matriz vertice-aresta | O(V \* A) | O(A)                 | O(A)            |
| Matriz no-arco        | O(V \* A) | O(A)                 | O(A)            |
| Matriz de adjacencia  | O(V^2)    | O(1)                 | O(V)            |
| Lista de arcos        | O(A)      | O(A)                 | O(A)            |
| Lista de adjacencia   | O(V + A)  | O(grau do vertice)   | O(grau)         |
