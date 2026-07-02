# Guia de Validação — Relação NxN (MyMovies)

> User ↔ Movie via `movies_rating` · `BelongsToMany` · Testes de Aceitação

---

## Estrutura do Projeto

| Arquivo             | Caminho                                        |
|---------------------|------------------------------------------------|
| BelongsToMany       | `core/Database/ActiveRecord/BelongsToMany.php` |
| Model base          | `core/Database/ActiveRecord/Model.php`         |
| User                | `app/Models/User.php`                          |
| Movie               | `app/Models/Movie.php`                         |
| MovieRating (pivot) | `app/Models/MovieRating.php`                   |
| MoviesController    | `app/Controllers/MoviesController.php`         |
| UsersController     | `app/Controllers/UsersController.php`          |
| Rotas               | `config/routes.php`                            |
| Schema SQL          | `database/schema.sql`                          |
| Frontend JS         | `public/assets/js/application.js`              |

## Endpoints NxN

| Método | Rota                      | Ação                                    |
|--------|---------------------------|-----------------------------------------|
| POST   | `/movies/rate`            | Registrar avaliação (criar relação NxN) |
| DELETE | `/movies/rate/{movie_id}` | Remover avaliação                       |
| GET    | `/users/{handle}/ratings` | Visualizar filmes avaliados             |

---

## Exercício 1 — Impedir avaliação duplicada do mesmo filme

**Alta Chance** · Backend · BD · Dificuldade: Média

### O que é e por que importa

O rubrica cita explicitamente `index unique: true` — o professor vai testar se o mesmo usuário pode avaliar o mesmo filme duas vezes. Sem proteção, duas linhas com o mesmo `user_id + movie_id` seriam criadas na tabela `movies_rating`.

> **Cenário do professor:** POST /movies/rate com o mesmo filme duas vezes. Deve retornar 422, não 201 nem 500.

### Arquivos a editar

- `database/schema.sql`
- `app/Models/MovieRating.php`
- `app/Controllers/MoviesController.php`

### Passo 1 — UNIQUE constraint no schema.sql

```sql
-- database/schema.sql
CREATE TABLE movies_rating (
    id          INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INTEGER UNSIGNED NOT NULL,
    movie_id    INTEGER UNSIGNED NOT NULL,
    rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_movie (user_id, movie_id)  -- ← ADICIONE ISTO
);
```

### Passo 2 — Validar no Model (app/Models/MovieRating.php)

```php
public function isValid(): bool
{
    if (self::exists(['user_id' => $this->user_id, 'movie_id' => $this->movie_id])) {
        $this->addError('movie_id', 'Você já avaliou este filme.');
    }

    if ($this->rating < 1 || $this->rating > 5) {
        $this->addError('rating', 'A nota deve ser entre 1 e 5.');
    }

    return empty($this->errors());
}
```

### Passo 3 — Tratar erro no Controller (MoviesController.php)

```php
public function rate(Request $request): void
{
    $movieRating           = new MovieRating();
    $movieRating->user_id  = Auth::user()->id;
    $movieRating->movie_id = $request->input('movie_id');
    $movieRating->rating   = $request->input('rating');

    if (!$movieRating->isValid()) {
        $this->respondWithJson([
            'error'  => true,
            'errors' => $movieRating->errors()
        ], 422);
        return;
    }

    $movieRating->save();
    $this->respondWithJson(['success' => true], 201);
}
```

---

## Exercício 2 — Deletar usuário com avaliações (ON DELETE CASCADE)

**Alta Chance** · Backend · BD · Dificuldade: Fácil

### O que é e por que importa

O rubrica marca "Remover registros com dependências" com nota 0. O professor vai deletar um usuário que tem avaliações e verificar se as linhas em `movies_rating` são limpas automaticamente via CASCADE.

> **Cenário:** Criar usuário → avaliar filme → deletar usuário → verificar no banco que `movies_rating` está vazio para aquele `user_id`.

### Arquivos a verificar

- `database/schema.sql`
- `app/Controllers/UsersController.php`

### Confirmar CASCADE no schema.sql

```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

-- Após deletar, verificar:
SELECT * FROM movies_rating WHERE user_id = :id;
-- Deve retornar 0 linhas
```

### Controller de delete (UsersController.php)

```php
public function delete(Request $request): void
{
    $user = Auth::user();
    $user->destroy();  // CASCADE remove movies_rating automaticamente
    Auth::logout();
    $this->respondWithJson(['success' => true, 'message' => 'Conta deletada.']);
}
```

### Como demonstrar

1. Login com usuário que tem filmes avaliados.
2. `GET /users/{handle}/ratings` — mostrar os filmes avaliados.
3. `DELETE /account/delete` — deletar a conta.
4. SQL: `SELECT * FROM movies_rating WHERE user_id = X` — mostrar 0 linhas.

> **Livro:** "Database System Concepts" (Silberschatz) — ON DELETE CASCADE: ao deletar o registro pai, todos os filhos com FK referenciando ele são deletados automaticamente.

---

## Exercício 3 — Deletar filme que possui avaliações

**Média Chance** · Backend · BD · Dificuldade: Fácil

### O que é e por que importa

Similar ao exercício 2, mas do outro lado: deletar um **Movie** que possui avaliações. O CASCADE deve estar em ambas as FKs da tabela pivot.

### Arquivos a verificar

- `database/schema.sql`
- `app/Controllers/MoviesController.php`

```sql
-- Ambas as FKs do pivot devem ter CASCADE
FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE  -- ← importante
```

```php
// config/routes.php
$router->delete('/movies/{id}', [MoviesController::class, 'destroy'], ['admin']);

// app/Controllers/MoviesController.php
public function destroy(Request $request): void
{
    $movie = Movie::findById($request->param('id'));
    if (!$movie) {
        $this->respondWithJson(['error' => 'Não encontrado'], 404);
        return;
    }
    $movie->destroy();  // CASCADE limpa movies_rating
    $this->respondWithJson(['success' => true]);
}
```

---

## Exercício 4 — Adicionar campo extra na tabela pivot

**Média Chance** · Backend · BD · Frontend · Dificuldade: Média

### O que é e por que importa

Em relações NxN reais, a tabela pivot carrega dados além das FKs. O professor pode pedir para adicionar um campo `review` (comentário textual) na tabela `movies_rating`.

### Arquivos a editar

- `database/schema.sql`
- `app/Models/MovieRating.php`
- `app/Controllers/MoviesController.php`
- `public/assets/js/application.js`

```sql
-- database/schema.sql — adicionar coluna
rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
review      VARCHAR(500) NULL,  -- ← campo extra
created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
```

```php
// app/Models/MovieRating.php — adicionar propriedade
public int     $rating;
public ?string $review;  // ← novo
public string  $created_at;
```

```php
// app/Controllers/MoviesController.php
$movieRating->review = $request->input('review');  // ← receber do request
```

```js
// public/assets/js/application.js
async function rateMovie(movieId, rating, review = '') {
    await fetch('/movies/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movie_id: movieId, rating, review })
    });
}
```

---

## Exercício 5 — Validar rating entre 1 e 5 no PHP (além do banco)

**Alta Chance** · Backend · Validação · Dificuldade: Fácil

### O que é e por que importa

O banco tem `CHECK (rating BETWEEN 1 AND 5)`, mas validar apenas no banco resulta em erro 500. O professor vai enviar `rating: 0` ou `rating: 99` diretamente via API e esperar um JSON de erro 422.

> **Cenário:** POST /movies/rate com `rating: 0`. Deve retornar 422 com mensagem, não 500.

### Arquivos a editar

- `app/Models/MovieRating.php`

```php
// app/Models/MovieRating.php
public function isValid(): bool
{
    if (!is_numeric($this->rating) || $this->rating < 1 || $this->rating > 5) {
        $this->addError('rating', 'A nota deve ser um número entre 1 e 5.');
    }

    if (empty($this->movie_id)) {
        $this->addError('movie_id', 'O ID do filme é obrigatório.');
    }

    if (self::exists(['user_id' => $this->user_id, 'movie_id' => $this->movie_id])) {
        $this->addError('movie_id', 'Você já avaliou este filme.');
    }

    return empty($this->errors());
}

// No Controller, usar antes do save():
if (!$movieRating->isValid()) {
    $this->respondWithJson(['errors' => $movieRating->errors()], 422);
    return;
}
```

> **Livro:** "Clean Code" (Martin) — valide na camada mais próxima da entrada. Nunca dependa só do banco como barreira de validação.

---

## Exercício 6 — Exibir contagem de avaliações por usuário

**Média Chance** · Backend · Frontend · Dificuldade: Fácil

### O que é e por que importa

O `BelongsToMany` já tem um método `count()`. O professor pode pedir para exibir quantos filmes cada usuário avaliou — usando a relação NxN, não um SELECT manual.

### Arquivos a editar

- `app/Controllers/UsersController.php`
- `public/assets/js/application.js`

```php
// app/Controllers/UsersController.php
public function ratings(Request $request): void
{
    $user = User::findByHandle($request->param('handle'));

    $this->respondWithJson([
        'movies' => $user->ratedMovies()->get(),
        'total'  => $user->ratedMovies()->count()  // ← usa count() do BelongsToMany
    ]);
}
```

```js
// public/assets/js/application.js
const data = await (await fetch(`/users/${handle}/ratings`)).json();
document.getElementById('ratings-count').textContent = `${data.total} filmes avaliados`;
data.movies.forEach(movie => renderMovie(movie));
```

> `BelongsToMany.count()` executa `SELECT COUNT(*) FROM movies_rating WHERE user_id = :id` — sem carregar os registros em memória.

---

## Exercício 7 — Ordenar filmes avaliados por nota

**Baixa Chance** · Framework · Backend · Dificuldade: Média

### O que é e por que importa

O método `get()` do `BelongsToMany` não aceita ordenação. O professor pode pedir para retornar os filmes ordenados pela nota em ordem decrescente.

### Arquivos a editar

- `core/Database/ActiveRecord/BelongsToMany.php`

```php
// core/Database/ActiveRecord/BelongsToMany.php
public function get(string $orderBy = ''): array
{
    // ... query base existente ...
    $sql = "SELECT {$relatedTable}.* FROM ...";

    // Whitelist de ordenações seguras (evita SQL injection)
    $allowed = ['rating ASC', 'rating DESC', 'created_at DESC'];
    if (in_array($orderBy, $allowed)) {
        $sql .= " ORDER BY {$this->pivot_table}.{$orderBy}";
    }
    // ... execute e return ...
}

// Uso no Controller:
$movies = $user->ratedMovies()->get('rating DESC');
```

---

## Exercício 8 — Atualizar avaliação existente (upsert)

**Média Chance** · Backend · BD · Dificuldade: Média

### O que é e por que importa

Alternativa ao bloquear duplicata: se o usuário já avaliou o filme, **atualizar** a nota em vez de retornar erro.

> **Atenção:** Escolha uma estratégia — bloquear (exercício 1) OU atualizar (este). Não use os dois ao mesmo tempo.

### Arquivos a editar

- `app/Models/MovieRating.php`
- `app/Controllers/MoviesController.php`

```php
// app/Models/MovieRating.php
public static function findByUserAndMovie(int $userId, int $movieId): ?static
{
    return static::findBy(['user_id' => $userId, 'movie_id' => $movieId]);
}
```

```php
// app/Controllers/MoviesController.php
public function rate(Request $request): void
{
    $userId  = Auth::user()->id;
    $movieId = (int) $request->input('movie_id');
    $rating  = (int) $request->input('rating');

    $existing = MovieRating::findByUserAndMovie($userId, $movieId);

    if ($existing) {
        $existing->rating = $rating;
        $existing->save();
        $this->respondWithJson(['success' => true, 'updated' => true]);
    } else {
        $mr           = new MovieRating();
        $mr->user_id  = $userId;
        $mr->movie_id = $movieId;
        $mr->rating   = $rating;
        $mr->save();
        $this->respondWithJson(['success' => true, 'updated' => false], 201);
    }
}
```

---

## Exercício 9 — Implementar paginação no BelongsToMany

**Baixa Chance** · Framework · Backend · Dificuldade: Alta

### O que é e por que importa

O `HasMany` tem `paginate()`, mas o `BelongsToMany` só tem `get()` e `count()`. O professor pode pedir paginação nos filmes avaliados.

### Arquivos a editar

- `core/Database/ActiveRecord/BelongsToMany.php`
- `app/Controllers/UsersController.php`

```php
// core/Database/ActiveRecord/BelongsToMany.php
public function paginate(int $page = 1, int $perPage = 10): array
{
    $offset = ($page - 1) * $perPage;
    $total  = $this->count();

    $sql = "SELECT {$relatedTable}.*
            FROM {$sourceTable}, {$relatedTable}, {$this->pivot_table}
            WHERE {$relatedTable}.id = {$this->pivot_table}.{$this->to_foreign_key}
              AND {$sourceTable}.id  = {$this->pivot_table}.{$this->from_foreign_key}
              AND {$sourceTable}.id  = :id
            LIMIT :limit OFFSET :offset";

    $stmt = Database::getDatabaseConn()->prepare($sql);
    $stmt->bindValue(':id',     $this->model->id, PDO::PARAM_INT);
    $stmt->bindValue(':limit',  $perPage,         PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset,          PDO::PARAM_INT);
    $stmt->execute();

    $related = $this->related;
    $models  = array_map(fn($row) => $related::fromRow($row), $stmt->fetchAll(PDO::FETCH_ASSOC));

    return [
        'data'         => $models,
        'total'        => $total,
        'per_page'     => $perPage,
        'current_page' => $page,
        'last_page'    => (int) ceil($total / $perPage),
    ];
}

// Uso no Controller:
$page   = (int) $request->input('page', 1);
$result = $user->ratedMovies()->paginate($page, 10);
```

---

## Exercício 10 — Escrever testes de aceitação (NxN Cest)

**Alta Chance** · Testes · Codeception · Dificuldade: Média

### O que é e por que importa

O rubrica mostra nota 0 em **todos** os testes de aceitação NxN (registrar, visualizar, remover). Os testes de aceitação validam o fluxo completo: HTTP → controller → banco → response.

### Arquivos a criar/editar

- ✨ `tests/Acceptance/Movies/MovieRatingCest.php` **(CRIAR)**
- `tests/Acceptance/BaseAcceptanceCest.php`

```php
// tests/Acceptance/Movies/MovieRatingCest.php
<?php

namespace Tests\Acceptance\Movies;

use Tests\Acceptance\BaseAcceptanceCest;
use Tests\Support\AcceptanceTester;

class MovieRatingCest extends BaseAcceptanceCest
{
    private int $movieId = 862;  // Toy Story — ID do populate

    /** Teste 1.1 — Registro da relação NxN */
    public function testRegistrarAvaliacao(AcceptanceTester $I): void
    {
        $this->loginAsUser($I);

        $I->sendPost('/movies/rate', ['movie_id' => $this->movieId, 'rating' => 4]);

        $I->seeResponseCodeIs(201);
        $I->seeResponseIsJson();
        $I->seeResponseContains('"success":true');
        $I->seeInDatabase('movies_rating', ['movie_id' => $this->movieId, 'rating' => 4]);
    }

    /** Teste 1.2 — Visualização da relação NxN */
    public function testVisualizarFilmesAvaliados(AcceptanceTester $I): void
    {
        $this->loginAsUser($I);
        $I->sendPost('/movies/rate', ['movie_id' => $this->movieId, 'rating' => 5]);

        $I->sendGet('/users/testuser/ratings');

        $I->seeResponseCodeIs(200);
        $I->seeResponseIsJson();
        $I->seeResponseContainsJson([['id' => $this->movieId]]);
    }

    /** Teste 1.3 — Remoção da relação NxN */
    public function testRemoverAvaliacao(AcceptanceTester $I): void
    {
        $this->loginAsUser($I);
        $I->sendPost('/movies/rate', ['movie_id' => $this->movieId, 'rating' => 3]);

        $I->sendDelete("/movies/rate/{$this->movieId}");

        $I->seeResponseCodeIs(200);
        $I->dontSeeInDatabase('movies_rating', ['movie_id' => $this->movieId]);
    }

    /** Teste extra — Impedir duplicata */
    public function testImpedirDuplicata(AcceptanceTester $I): void
    {
        $this->loginAsUser($I);
        $I->sendPost('/movies/rate', ['movie_id' => $this->movieId, 'rating' => 4]);
        $I->sendPost('/movies/rate', ['movie_id' => $this->movieId, 'rating' => 5]);

        $I->seeResponseCodeIs(422);
        $I->seeResponseContains('error');
    }
}
```

### Comandos para rodar

```bash
# Testes de aceitação NxN
./run vendor/bin/codecept run Acceptance/Movies/MovieRatingCest --steps

# Todos os testes de aceitação
./run vendor/bin/codecept run Acceptance --steps

# Testes unitários
./run vendor/bin/phpunit
```

---

## Comandos SQL úteis na validação

```sql
-- Ver todas as avaliações (relação NxN)
SELECT u.username, m.title, mr.rating
FROM movies_rating mr
JOIN users  u ON u.id = mr.user_id
JOIN movies m ON m.id = mr.movie_id;

-- Verificar UNIQUE index
SHOW INDEX FROM movies_rating;

-- Contar avaliações por usuário
SELECT u.username, COUNT(*) AS total
FROM movies_rating mr
JOIN users u ON u.id = mr.user_id
GROUP BY u.username;

-- Recriar banco
./run php database/Populate/populate.php
```

---

## BelongsToMany — o que saber de cor

**Arquivo:** `core/Database/ActiveRecord/BelongsToMany.php`

**Construtor:** `(Model $model, string $related, string $pivot_table, string $from_fk, string $to_fk)`

**Métodos:**
- `get()` — JOIN triplo entre source, pivot e related
- `count()` — COUNT(*) no pivot sem carregar registros

---

# Como Testar cada Exercício

O projeto usa **três camadas de teste**. Entenda o padrão antes de escrever:

## Padrão do Projeto

### Teste Unitário (PHPUnit)
- Arquivo: `tests/Unit/...`
- Extende: `Tests\TestCase`
- `setUp()` chama `parent::setUp()` → cria e migra o banco de teste
- `tearDown()` (herdado) → dropa o banco
- Testa o **Model diretamente**, sem HTTP

```php
// Esqueleto base
class MovieRatingTest extends TestCase
{
    private User $user;
    private Movie $movie;

    public function setUp(): void
    {
        parent::setUp();  // cria DB + migrate

        $this->user = new User([
            'username' => 'User Test',
            'handle'   => 'usertest',
            'email'    => 'test@example.com',
            'password' => '123456',
            'password_confirmation' => '123456',
            'role'     => 'Default',
        ]);
        $this->user->save();

        $this->movie = new Movie([
            'id'           => 862,
            'title'        => 'Toy Story',
            'overview'     => 'Um filme de brinquedos.',
            'poster_path'  => '/path.jpg',
            'release_date' => '1995-11-22',
            'vote_average' => 7.9,
        ]);
        $this->movie->save();
    }
}
```

### Teste de Integração (PHPUnit + Controller)
- Arquivo: `tests/Integration/Controllers/...`
- Extende: `ControllerTestCase`
- Usa `$this->post()`, `$this->get()`, `$this->put()` para chamar actions
- Captura a resposta JSON com `json_decode($response, true)`
- Simula o ciclo HTTP **sem servidor real**

```php
// Esqueleto base
class MoviesControllerTest extends ControllerTestCase
{
    public function setUp(): void
    {
        parent::setUp();
        UsersPopulate::populate();
        MovieRatingsPopulate::populate();
    }

    // Chamada típica:
    $response = $this->post(
        action:         'rate',
        controllerName: 'App\Controllers\MoviesController',
        params:         ['movie_id' => 862, 'rating' => 4]
    );
    $data = json_decode($response, true);
}
```

### Teste de Aceitação (Codeception)
- Arquivo: `tests/Acceptance/...`
- Extende: `BaseAcceptanceCest`
- `_before()` chama `parent::_before()` → cria DB + migrate
- `_after()` (herdado) → dropa o banco
- Usa `AcceptanceTester $page` injetado em cada método
- Testa o **fluxo HTTP completo** com servidor rodando

```php
// Esqueleto base
class MovieRatingCest extends BaseAcceptanceCest
{
    public function _before(AcceptanceTester $page): void
    {
        parent::_before($page);  // cria DB + migrate
        UsersPopulate::populate();
        MovieRatingsPopulate::populate();
    }

    // Padrão de autenticação:
    $page->haveHttpHeader('Content-Type', 'application/json');
    $page->sendPost('/auth/login', json_encode([
        'email'    => 'admin@email.com',
        'password' => 'adminpass'
    ]));
    $token = $page->grabDataFromResponseByJsonPath('$.token')[0];
    $page->haveHttpHeader('Authorization', 'Bearer ' . $token);
}
```

---

## Exercício 1 — Teste de duplicata

### Unitário (`tests/Unit/Models/MovieRatingTest.php`)

```php
public function test_should_not_save_duplicate_rating(): void
{
    $mr1 = new MovieRating([
        'user_id'  => $this->user->id,
        'movie_id' => $this->movie->id,
        'rating'   => 4,
    ]);
    $mr1->save();

    $mr2 = new MovieRating([
        'user_id'  => $this->user->id,
        'movie_id' => $this->movie->id,
        'rating'   => 5,
    ]);

    $this->assertFalse($mr2->isValid());
    $this->assertFalse($mr2->save());
    $this->assertEquals('Você já avaliou este filme.', $mr2->errors('movie_id'));
}

public function test_should_save_rating_for_different_movies(): void
{
    $mr1 = new MovieRating(['user_id' => $this->user->id, 'movie_id' => 862,     'rating' => 4]);
    $mr2 = new MovieRating(['user_id' => $this->user->id, 'movie_id' => 1275779, 'rating' => 3]);

    $this->assertTrue($mr1->save());
    $this->assertTrue($mr2->save());
    $this->assertCount(2, MovieRating::all());
}
```

### Aceitação (`tests/Acceptance/Movies/MovieRatingCest.php`)

```php
public function testImpedirAvaliacaoDuplicada(AcceptanceTester $page): void
{
    // autentica
    $page->haveHttpHeader('Content-Type', 'application/json');
    $page->sendPost('/auth/login', json_encode(['email' => 'example@email.com', 'password' => 'password123']));
    $token = $page->grabDataFromResponseByJsonPath('$.token')[0];
    $page->haveHttpHeader('Authorization', 'Bearer ' . $token);

    // primeira avaliação — deve passar
    $page->haveHttpHeader('Content-Type', 'application/json');
    $page->sendPost('/movies/rate', json_encode(['movie_id' => 862, 'rating' => 4]));
    $page->seeResponseCodeIs(201);

    // segunda avaliação do mesmo filme — deve falhar
    $page->haveHttpHeader('Content-Type', 'application/json');
    $page->sendPost('/movies/rate', json_encode(['movie_id' => 862, 'rating' => 5]));
    $page->seeResponseCodeIs(422);
    $page->seeResponseContainsJson(['error' => true]);
}
```

---

## Exercício 2 — Teste de CASCADE ao deletar usuário

### Unitário (`tests/Unit/Models/MovieRatingTest.php`)

```php
public function test_deleting_user_should_remove_ratings(): void
{
    $mr = new MovieRating([
        'user_id'  => $this->user->id,
        'movie_id' => $this->movie->id,
        'rating'   => 5,
    ]);
    $mr->save();

    $this->assertCount(1, MovieRating::all());

    // deleta o usuário
    $this->user->destroy();

    // CASCADE deve ter removido o rating
    $this->assertCount(0, MovieRating::all());
}
```

### Aceitação (`tests/Acceptance/Movies/MovieRatingCest.php`)

```php
public function testDeletarUsuarioRemoveAvaliacoes(AcceptanceTester $page): void
{
    // autentica
    $page->haveHttpHeader('Content-Type', 'application/json');
    $page->sendPost('/auth/login', json_encode(['email' => 'example@email.com', 'password' => 'password123']));
    $token = $page->grabDataFromResponseByJsonPath('$.token')[0];
    $page->haveHttpHeader('Authorization', 'Bearer ' . $token);

    // avalia um filme
    $page->haveHttpHeader('Content-Type', 'application/json');
    $page->sendPost('/movies/rate', json_encode(['movie_id' => 862, 'rating' => 4]));
    $page->seeResponseCodeIs(201);

    // deleta a conta
    $page->haveHttpHeader('Content-Type', 'application/json');
    $page->sendDelete('/account/delete');
    $page->seeResponseCodeIs(200);

    // verifica que não há ratings órfãos no banco
    $page->dontSeeInDatabase('movies_rating', ['movie_id' => 862]);
}
```

---

## Exercício 3 — Teste de CASCADE ao deletar filme

### Unitário (`tests/Unit/Models/MovieRatingTest.php`)

```php
public function test_deleting_movie_should_remove_ratings(): void
{
    $mr = new MovieRating([
        'user_id'  => $this->user->id,
        'movie_id' => $this->movie->id,
        'rating'   => 3,
    ]);
    $mr->save();

    $this->assertCount(1, MovieRating::all());

    $this->movie->destroy();

    $this->assertCount(0, MovieRating::all());
}
```

---

## Exercício 4 — Teste de campo extra no pivot

### Unitário (`tests/Unit/Models/MovieRatingTest.php`)

```php
public function test_should_save_rating_with_review(): void
{
    $mr = new MovieRating([
        'user_id'  => $this->user->id,
        'movie_id' => $this->movie->id,
        'rating'   => 5,
        'review'   => 'Filme incrível!',
    ]);

    $this->assertTrue($mr->save());

    $saved = MovieRating::findById($mr->id);
    $this->assertEquals('Filme incrível!', $saved->review);
}

public function test_should_save_rating_without_review(): void
{
    $mr = new MovieRating([
        'user_id'  => $this->user->id,
        'movie_id' => $this->movie->id,
        'rating'   => 3,
    ]);

    $this->assertTrue($mr->save());
    $this->assertNull(MovieRating::findById($mr->id)->review);
}
```

---

## Exercício 5 — Teste de validação do rating

### Unitário (`tests/Unit/Models/MovieRatingTest.php`)

```php
public function test_rating_below_1_should_be_invalid(): void
{
    $mr = new MovieRating([
        'user_id'  => $this->user->id,
        'movie_id' => $this->movie->id,
        'rating'   => 0,
    ]);

    $this->assertFalse($mr->isValid());
    $this->assertEquals('A nota deve ser um número entre 1 e 5.', $mr->errors('rating'));
}

public function test_rating_above_5_should_be_invalid(): void
{
    $mr = new MovieRating([
        'user_id'  => $this->user->id,
        'movie_id' => $this->movie->id,
        'rating'   => 99,
    ]);

    $this->assertFalse($mr->isValid());
    $this->assertNotEmpty($mr->errors('rating'));
}

public function test_rating_between_1_and_5_should_be_valid(): void
{
    foreach ([1, 2, 3, 4, 5] as $nota) {
        $mr = new MovieRating([
            'user_id'  => $this->user->id,
            'movie_id' => $this->movie->id,
            'rating'   => $nota,
        ]);
        $this->assertTrue($mr->isValid(), "Rating {$nota} deveria ser válido");
    }
}
```

### Aceitação (`tests/Acceptance/Movies/MovieRatingCest.php`)

```php
public function testRatingInvalidoRetorna422(AcceptanceTester $page): void
{
    $page->haveHttpHeader('Content-Type', 'application/json');
    $page->sendPost('/auth/login', json_encode(['email' => 'example@email.com', 'password' => 'password123']));
    $token = $page->grabDataFromResponseByJsonPath('$.token')[0];
    $page->haveHttpHeader('Authorization', 'Bearer ' . $token);

    $page->haveHttpHeader('Content-Type', 'application/json');
    $page->sendPost('/movies/rate', json_encode(['movie_id' => 862, 'rating' => 0]));

    $page->seeResponseCodeIs(422);
    $page->seeResponseContainsJson(['errors' => ['rating' => 'A nota deve ser um número entre 1 e 5.']]);
}
```

---

## Exercício 6 — Teste de contagem

### Unitário (`tests/Unit/Models/UserTest.php` ou `MovieRatingTest.php`)

```php
public function test_rated_movies_count_should_return_correct_total(): void
{
    // cria 3 avaliações para o mesmo usuário
    foreach ([862, 1275779, 1226863] as $movieId) {
        (new MovieRating([
            'user_id'  => $this->user->id,
            'movie_id' => $movieId,
            'rating'   => 4,
        ]))->save();
    }

    $count = $this->user->ratedMovies()->count();
    $this->assertEquals(3, $count);
}

public function test_rated_movies_count_should_return_zero_when_no_ratings(): void
{
    $this->assertEquals(0, $this->user->ratedMovies()->count());
}
```

---

## Exercício 7 — Teste de ordenação

### Unitário (`tests/Unit/Models/MovieRatingTest.php`)

```php
public function test_get_should_return_movies_ordered_by_rating_desc(): void
{
    (new MovieRating(['user_id' => $this->user->id, 'movie_id' => 862,     'rating' => 2]))->save();
    (new MovieRating(['user_id' => $this->user->id, 'movie_id' => 1275779, 'rating' => 5]))->save();
    (new MovieRating(['user_id' => $this->user->id, 'movie_id' => 1226863, 'rating' => 3]))->save();

    $movies = $this->user->ratedMovies()->get('rating DESC');

    // primeiro deve ter rating 5, último rating 2
    $ratings = array_map(fn($m) => $m->pivot_rating, $movies);
    $this->assertEquals([5, 3, 2], $ratings);
}
```

---

## Exercício 8 — Teste de upsert

### Unitário (`tests/Unit/Models/MovieRatingTest.php`)

```php
public function test_should_update_existing_rating(): void
{
    $mr = new MovieRating([
        'user_id'  => $this->user->id,
        'movie_id' => $this->movie->id,
        'rating'   => 3,
    ]);
    $mr->save();

    // atualiza via findByUserAndMovie
    $existing = MovieRating::findByUserAndMovie($this->user->id, $this->movie->id);
    $existing->rating = 5;
    $existing->save();

    // deve continuar sendo 1 registro, mas com nova nota
    $this->assertCount(1, MovieRating::all());
    $this->assertEquals(5, MovieRating::findById($existing->id)->rating);
}
```

### Integração (`tests/Integration/Controllers/MoviesControllerTest.php`)

```php
public function test_rate_should_update_if_already_rated(): void
{
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_SERVER['REQUEST_URI'] = '/movies/rate';

    // primeira avaliação
    $this->post('rate', 'App\Controllers\MoviesController', ['movie_id' => 862, 'rating' => 3]);

    // segunda avaliação do mesmo filme
    $response = $this->post('rate', 'App\Controllers\MoviesController', ['movie_id' => 862, 'rating' => 5]);
    $data = json_decode($response, true);

    $this->assertTrue($data['success']);
    $this->assertTrue($data['updated']);  // deve indicar que foi atualizado

    // deve ter só 1 registro no banco
    $this->assertCount(1, MovieRating::all());
}
```

---

## Exercício 9 — Teste de paginação

### Unitário (`tests/Unit/Models/MovieRatingTest.php`)

```php
public function test_paginate_should_return_correct_structure(): void
{
    // cria 15 avaliações (de filmes com IDs fictícios)
    for ($i = 1; $i <= 15; $i++) {
        (new MovieRating([
            'user_id'  => $this->user->id,
            'movie_id' => $i,
            'rating'   => rand(1, 5),
        ]))->save();
    }

    $result = $this->user->ratedMovies()->paginate(1, 10);

    $this->assertArrayHasKey('data', $result);
    $this->assertArrayHasKey('total', $result);
    $this->assertArrayHasKey('last_page', $result);
    $this->assertCount(10, $result['data']);
    $this->assertEquals(15, $result['total']);
    $this->assertEquals(2, $result['last_page']);
}

public function test_paginate_page_2_should_return_remaining(): void
{
    for ($i = 1; $i <= 15; $i++) {
        (new MovieRating(['user_id' => $this->user->id, 'movie_id' => $i, 'rating' => 3]))->save();
    }

    $result = $this->user->ratedMovies()->paginate(2, 10);

    $this->assertCount(5, $result['data']);
    $this->assertEquals(2, $result['current_page']);
}
```

---

## Exercício 10 — Testes de aceitação NxN completos

Arquivo: `tests/Acceptance/Movies/MovieRatingCest.php`

```php
<?php

namespace Tests\Acceptance\Movies;

use Database\Populate\UsersPopulate;
use Database\Populate\MovieRatingsPopulate;
use Tests\Acceptance\BaseAcceptanceCest;
use Tests\Support\AcceptanceTester;

class MovieRatingCest extends BaseAcceptanceCest
{
    private int    $movieId = 862;
    private string $token   = '';

    public function _before(AcceptanceTester $page): void
    {
        parent::_before($page);          // cria DB + migrate
        UsersPopulate::populate();       // popula usuários
        MovieRatingsPopulate::populate(); // popula filmes
    }

    // Helper privado para autenticar e guardar o token
    private function autenticar(AcceptanceTester $page): void
    {
        $page->haveHttpHeader('Content-Type', 'application/json');
        $page->sendPost('/auth/login', json_encode([
            'email'    => 'example@email.com',
            'password' => 'password123'
        ]));
        $page->seeResponseCodeIs(200);
        $this->token = $page->grabDataFromResponseByJsonPath('$.token')[0];
    }

    // Helper para setar headers autenticados
    private function comAuth(AcceptanceTester $page): void
    {
        $page->haveHttpHeader('Content-Type', 'application/json');
        $page->haveHttpHeader('Authorization', 'Bearer ' . $this->token);
    }

    /** 1.1 — Registro da relação NxN */
    public function testRegistrarAvaliacao(AcceptanceTester $page): void
    {
        $this->autenticar($page);
        $this->comAuth($page);

        $page->sendPost('/movies/rate', json_encode([
            'movie_id' => $this->movieId,
            'rating'   => 4
        ]));

        $page->seeResponseCodeIs(201);
        $page->seeResponseIsJson();
        $page->seeResponseContainsJson(['success' => true]);
        $page->seeInDatabase('movies_rating', [
            'movie_id' => $this->movieId,
            'rating'   => 4
        ]);
    }

    /** 1.2 — Visualização da relação NxN */
    public function testVisualizarFilmesAvaliados(AcceptanceTester $page): void
    {
        $this->autenticar($page);

        // registra primeiro
        $this->comAuth($page);
        $page->sendPost('/movies/rate', json_encode(['movie_id' => $this->movieId, 'rating' => 5]));

        // consulta os filmes avaliados
        $this->comAuth($page);
        $page->sendGet('/users/user1/ratings');

        $page->seeResponseCodeIs(200);
        $page->seeResponseIsJson();
        $page->seeResponseContainsJson([['id' => $this->movieId]]);
    }

    /** 1.3 — Remoção da relação NxN */
    public function testRemoverAvaliacao(AcceptanceTester $page): void
    {
        $this->autenticar($page);

        // cria
        $this->comAuth($page);
        $page->sendPost('/movies/rate', json_encode(['movie_id' => $this->movieId, 'rating' => 3]));
        $page->seeResponseCodeIs(201);

        // remove
        $this->comAuth($page);
        $page->sendDelete("/movies/rate/{$this->movieId}");

        $page->seeResponseCodeIs(200);
        $page->seeResponseIsJson();
        $page->dontSeeInDatabase('movies_rating', ['movie_id' => $this->movieId]);
    }

    /** Rota autenticada não deve ser acessível sem token */
    public function testRotaProtegidaSemToken(AcceptanceTester $page): void
    {
        $page->sendPost('/movies/rate', json_encode(['movie_id' => 862, 'rating' => 4]));
        $page->seeResponseCodeIs(401);
    }
}
```

---

## Comandos para rodar os testes

```bash
# Todos os testes unitários
./run vendor/bin/phpunit

# Arquivo específico de testes unitários
./run vendor/bin/phpunit tests/Unit/Models/MovieRatingTest.php

# Todos os testes de aceitação
./run vendor/bin/codecept run Acceptance --steps

# Arquivo específico de aceitação
./run vendor/bin/codecept run Acceptance/Movies/MovieRatingCest --steps

# Com saída detalhada
./run vendor/bin/codecept run Acceptance/Movies/MovieRatingCest --steps --debug
```
