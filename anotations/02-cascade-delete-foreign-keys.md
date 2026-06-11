# Pedido 2 — Foreign Keys reais e Cascade Delete no banco

## Contexto no nosso projeto

O [`database/schema.sql`](../../php/mymovies/database/schema.sql) atual **desabilita as foreign keys** e não declara nenhuma:

```sql
SET foreign_key_checks = 0;

CREATE TABLE movie_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,   -- aponta para users.id mas SEM constraint
    movie_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY user_movie (user_id, movie_id)
);

SET foreign_key_checks = 1;
```

**Problemas que a entrega 4.3 cobra diretamente:**
1. "Testar o comportamento ao excluir a entidade principal" — hoje, ao deletar um usuário, suas `movie_ratings` ficam **órfãs** no banco.
2. "Tentar registrar uma imagem para uma galeria inexistente" — hoje nada impede inserir `user_id = 99999` mesmo que esse usuário não exista.

## Por que isso importa

Sem FK, o banco não garante **integridade referencial**: a tabela "filha" pode apontar para uma linha "pai" que não existe (ou que foi apagada). Você passa a depender 100% do código da aplicação para manter a consistência — e o código erra (como já erra na limpeza de arquivos, ver Pedido 5).

## Implementação passo a passo

### 1. Reescrever a tabela com a constraint

```sql
SET foreign_key_checks = 0;

DROP TABLE IF EXISTS movie_ratings;
DROP TABLE IF EXISTS users;

CREATE TABLE `users` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(64) NOT NULL,
    `handle` VARCHAR(64) NOT NULL UNIQUE,
    `email` VARCHAR(64) NOT NULL UNIQUE,
    `encrypted_password` VARCHAR(255) NOT NULL,
    `role` ENUM('Default', 'Admin') NOT NULL DEFAULT 'Default',
    `avatar_file` VARCHAR(255) DEFAULT 'avatar.png',
    `banner_file` VARCHAR(255) DEFAULT 'banner.png',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE `movie_ratings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `movie_id` INT NOT NULL,
    `rating` INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `user_movie` (`user_id`, `movie_id`),
    CONSTRAINT `fk_ratings_user`
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

SET foreign_key_checks = 1;
```

### Pontos críticos (erros comuns)

1. **`ENGINE=InnoDB`** — MyISAM aceita a sintaxe de FK mas **ignora silenciosamente**. Tem que ser InnoDB.
2. **Tipos idênticos** — `users.id` é `INTEGER UNSIGNED`; a coluna `user_id` na filha também precisa ser `INTEGER UNSIGNED`. Tipo divergente = erro `errno 150`.
3. **Ordem de criação** — a tabela pai (`users`) precisa existir antes da filha. Ou mantenha `foreign_key_checks = 0` durante o `DROP/CREATE` e reative no fim (como acima).

### 2. Escolher a política correta de `ON DELETE`

| Política | Comportamento ao deletar o pai | Quando usar |
|---|---|---|
| `CASCADE` | Apaga as linhas filhas automaticamente | Dados que **não fazem sentido** sem o pai (ratings de um usuário) |
| `SET NULL` | Coloca NULL na FK da filha (a coluna precisa aceitar NULL) | Filho **sobrevive** ao pai (ex.: posts ficam "autor desconhecido") |
| `RESTRICT` | **Bloqueia** o delete do pai se houver filhos | Proteger contra exclusão acidental |

Para `movie_ratings`, `CASCADE` é o correto: uma avaliação não existe sem o usuário.

### 3. Aplicar e acessar o banco com os comandos do `./run`

O projeto tem um script [`./run`](../../php/mymovies/run) que encapsula os comandos Docker. **Use ele** em vez de digitar `docker compose exec ...` na mão. Todos rodam a partir da raiz do backend (`cd ~/Tsi/php/mymovies`).

**Garanta os containers de pé:**
```bash
./run up -d        # sobe tudo em background
./run ps           # confere que db, php, nginx estão "running"
```

**Reaplicar o schema** (depois de editar `database/schema.sql`):
```bash
./run db:reset     # copia o schema.sql pro container e executa — recria as tabelas
```
> O `db:reset` faz exatamente o `DROP TABLE` + `CREATE TABLE` do seu arquivo. **Apaga todos os dados.** É o jeito de aplicar as novas Foreign Keys sem precisar destruir o volume.

**Repopular com dados de teste** (cria o usuário `example@email.com`, etc.):
```bash
./run db:populate
```

**Abrir o console SQL interativo** (é aqui que você roda os SELECT/INSERT/DELETE da demonstração):
```bash
./run db:console
```
Isso abre o prompt do MariaDB já conectado no banco certo (`MariaDB [mymovies]>`). Para sair: `exit` ou `Ctrl+D`.

> Sequência típica antes de demonstrar: `./run db:reset && ./run db:populate && ./run db:console`.

## Demonstração da integridade (roteiro para a banca)

Depois de abrir o console com `./run db:console`, rode os comandos abaixo **dentro do prompt do MariaDB**:

```sql
-- 0. Confirmar que a FK existe de verdade
SHOW CREATE TABLE movie_ratings\G
-- procure a linha: CONSTRAINT `fk_ratings_user` FOREIGN KEY ... ON DELETE CASCADE

-- 1. Pegar o id de um usuário existente e criar um rating pra ele
SELECT id FROM users WHERE email = 'example@email.com';   -- ex.: 1
INSERT INTO movie_ratings (user_id, movie_id, rating) VALUES (1, 550, 5);
SELECT * FROM movie_ratings WHERE user_id = 1;            -- o rating está lá

-- 2. CASCADE: deletar o usuário apaga o rating automaticamente
DELETE FROM users WHERE id = 1;
SELECT * FROM movie_ratings WHERE user_id = 1;            -- vazio! cascateou.

-- 3. Integridade: inserir rating para usuário inexistente FALHA
INSERT INTO movie_ratings (user_id, movie_id, rating) VALUES (99999, 550, 5);
-- ERROR 1452: Cannot add or update a child row: a foreign key constraint fails
```

> O `\G` no lugar do `;` mostra o resultado em formato vertical (mais legível para `SHOW CREATE TABLE`).

**Verificar o engine** (lembrete do conceito InnoDB — sem ele, nada acima funciona):
```sql
SHOW TABLE STATUS WHERE Name = 'movie_ratings'\G
-- coluna "Engine" deve mostrar: InnoDB
```

## Conceitos para o WIKI

> **Chave Estrangeira (FK):** coluna (ou conjunto de colunas) em uma tabela cujo valor deve corresponder a uma chave primária (ou candidata) de outra tabela, estabelecendo um vínculo lógico entre as duas relações.

> **Integridade Referencial:** propriedade que garante que toda FK aponte para uma linha existente na tabela referenciada — não existem "referências penduradas" (dangling references).

> **Cascade Delete / SET NULL / RESTRICT:** ações referenciais (`ON DELETE`) que o SGBD executa automaticamente quando a linha pai é removida — respectivamente: apagar os filhos, anular a FK do filho, ou impedir a remoção do pai.

**Referências de livro:**
- ELMASRI, Ramez; NAVATHE, Shamkant B. *Sistemas de Banco de Dados*. 6ª ed. Pearson. — Capítulo 3 (modelo relacional, restrições de integridade) e Capítulo 4 (SQL, ações referenciais `ON DELETE CASCADE/SET NULL`).
- DATE, C. J. *Introdução a Sistemas de Banco de Dados*. 8ª ed. Campus/Elsevier. — Capítulo sobre integridade referencial e chaves estrangeiras.
- SILBERSCHATZ, A.; KORTH, H.; SUDARSHAN, S. *Sistemas de Banco de Dados*. — Capítulo de restrições de integridade.

## Checklist de demonstração
- [ ] `SHOW CREATE TABLE movie_ratings` mostrando a CONSTRAINT.
- [ ] Deletar usuário pai → mostrar que os ratings sumiram (CASCADE).
- [ ] Inserir rating com `user_id` inexistente → erro 1452.
