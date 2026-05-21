# Tutorial: Novo Campo Obrigatório (Ponta a Ponta)

## 🎯 O Objetivo

Adicionar um campo **novo e obrigatório** chamado `genre` (gênero do filme) ao CRUD de filmes personalizados. Isso envolve **4 camadas**:

```
1. Banco de Dados  →  2. Model (PHP)  →  3. Controller (PHP)  →  4. Frontend (Angular)
```

> [!IMPORTANT]
> A **ordem de implementação** importa! Sempre comece pelo banco e termine no frontend. Se fizer ao contrário, o frontend vai enviar dados que o backend não sabe receber.

---

## 📂 Arquivos que Precisam Ser Editados

| # | Arquivo | Caminho | O que fazer |
|---|---|---|---|
| 1 | `schema.sql` | `database/schema.sql` | Adicionar a coluna no CREATE TABLE |
| 2 | `CustomMovie.php` | `app/Models/CustomMovie.php` | Adicionar na lista de colunas + validação |
| 3 | `CustomMoviesController.php` | `app/Controllers/CustomMoviesController.php` | Receber o campo do JSON |
| 4 | `custom-movie-modal.html` | `src/app/components/custom-movie-modal/custom-movie-modal.html` | Adicionar o input |
| 5 | `custom-movie-modal.ts` | `src/app/components/custom-movie-modal/custom-movie-modal.ts` | Adicionar o formControl |

---

## 🛠️ Passo 1: Banco de Dados

**Arquivo**: `database/schema.sql`

### O que mudar:

Adicionar a coluna `genre` na tabela `custom_movies`:

```sql
CREATE TABLE custom_movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(100) NOT NULL,          -- 🆕 NOVO CAMPO
    release_year INT,
    poster_url VARCHAR(255),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    status ENUM('Vou assistir', 'Assistido', 'Não terminei'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Conceitos importantes:

| Propriedade SQL | Significado |
|---|---|
| `VARCHAR(100)` | Texto com no máximo 100 caracteres |
| `NOT NULL` | O banco **recusa** inserir se esse campo for nulo |
| `TEXT` | Texto sem limite prático (usado para description) |
| `INT` | Número inteiro |
| `ENUM(...)` | Só aceita valores da lista |

> [!WARNING]
> Após alterar o `schema.sql`, você precisa **resetar o banco** para aplicar a mudança:
> ```bash
> ./run db:reset
> ./run db:populate
> ```
> Isso apaga todos os dados! Em produção usaríamos **migrations**, mas para desenvolvimento o reset é ok.

### Erro Comum: Esquecer o `NOT NULL`

```sql
-- ❌ Campo aceita nulo — não é obrigatório no banco
genre VARCHAR(100),

-- ✅ Campo obrigatório no banco
genre VARCHAR(100) NOT NULL,
```

O `NOT NULL` é a **última barreira**. Mesmo que o backend tenha um bug e não valide, o banco vai rejeitar.

---

## 🛠️ Passo 2: Model (PHP)

**Arquivo**: `app/Models/CustomMovie.php`

### 2A — Adicionar na lista de colunas

O array `$columns` diz ao Model quais campos existem na tabela:

```php
protected static array $columns = [
    'user_id',
    'title',
    'description',
    'genre',           // 🆕 NOVO CAMPO
    'release_year',
    'poster_url',
    'rating',
    'status',
    'created_at',
    'updated_at'
];
```

#### Conceito: Por que o `$columns` é importante?

O Model base usa esse array para:
- **INSERT**: `INSERT INTO custom_movies (user_id, title, ..., genre, ...) VALUES (:user_id, :title, ..., :genre, ...)`
- **SELECT**: `SELECT id, user_id, title, ..., genre, ... FROM custom_movies`
- **UPDATE**: `SET user_id = :user_id, title = :title, ..., genre = :genre, ...`

Se você adiciona a coluna no banco mas **esquece de colocar no `$columns`**, o Model não sabe que ela existe!

### 2B — Adicionar validação obrigatória

No método `validates()`, adicione a validação do `genre`:

```php
public function validates(): void
{
    Validations::notEmpty('user_id', $this, 'O ID do usuário é obrigatório!');
    Validations::notEmpty('title', $this, 'O título é obrigatório!');
    Validations::notEmpty('genre', $this, 'O gênero é obrigatório!');  // 🆕 NOVO

    // ... resto das validações existentes
}
```

#### Conceito: `notEmpty` vs `NOT NULL`

| Camada | Mecanismo | Quando roda |
|---|---|---|
| **Model** (`notEmpty`) | PHP verifica `=== null \|\| === ''` | Antes do INSERT |
| **Banco** (`NOT NULL`) | MySQL rejeita o INSERT | Durante o INSERT |

O Model valida **primeiro** e retorna erros amigáveis. O banco é a **rede de segurança** caso o Model falhe.

### Erro Comum: Adicionar no `$columns` mas esquecer a validação (ou vice-versa)

```php
// ❌ Está no $columns mas sem validação
// → Aceita salvar com genre = null, mas o banco rejeita (NOT NULL) e dá erro feio

// ❌ Tem validação mas não está no $columns
// → A validação roda, mas o INSERT não inclui o campo genre

// ✅ Precisa dos DOIS
// $columns: para o SQL saber que o campo existe
// validates(): para validar antes de tentar salvar
```

---

## 🛠️ Passo 3: Controller (PHP)

**Arquivo**: `app/Controllers/CustomMoviesController.php`

### 3A — No método `create()`:

Adicione a linha que lê o `genre` do JSON:

```php
$movie = new CustomMovie();
$movie->user_id = $user->id;
$movie->title = !empty($data['title']) ? $data['title'] : null;
$movie->description = !empty($data['description']) ? $data['description'] : null;
$movie->genre = !empty($data['genre']) ? $data['genre'] : null;  // 🆕 NOVO
$movie->release_year = !empty($data['release_year']) ? (int)$data['release_year'] : null;
// ... resto
```

### 3B — No método `update()`:

Adicione a mesma lógica para o update:

```php
if (array_key_exists('genre', $data))
    $movie->genre = !empty($data['genre']) ? $data['genre'] : null;  // 🆕 NOVO
```

#### Conceito: Por que `!empty()` com ternário?

```php
$movie->genre = !empty($data['genre']) ? $data['genre'] : null;
```

Essa linha faz:
1. `$data['genre']` — pega o valor que veio do JSON
2. `!empty(...)` — verifica se não é vazio, null, ou string ""
3. Se tem valor → usa ele. Se não → coloca `null`

Isso evita erros se o frontend não enviar o campo.

#### Conceito: `!empty()` vs `isset()` vs `array_key_exists()`

| Função | Retorna `true` quando |
|---|---|
| `isset($data['x'])` | A chave existe E não é `null` |
| `!empty($data['x'])` | A chave existe E não é `null`, `""`, `0`, `false` |
| `array_key_exists('x', $data)` | A chave existe (mesmo se for `null`) |

No `create`: usamos `!empty()` porque queremos ignorar valores vazios.
No `update`: usamos `array_key_exists()` primeiro porque o campo pode não ter sido enviado (atualização parcial).

### Erro Comum: Esquecer de receber o campo no Controller

```php
// ❌ ERRADO — o campo genre nunca é setado no Model!
$movie = new CustomMovie();
$movie->title = !empty($data['title']) ? $data['title'] : null;
// Esqueceu $movie->genre = ...
// Resultado: genre = null → validação falha → "O gênero é obrigatório!"
// O frontend envia o dado mas ele nunca chega no Model
```

---

## 🛠️ Passo 4: Frontend (Angular)

### 4A — Adicionar formControl no TypeScript

**Arquivo**: `src/app/components/custom-movie-modal/custom-movie-modal.ts`

No método `initForm()`, adicione o `genre`:

```typescript
initForm() {
    const isTmdb = this.mode === 'tmdb';

    const title = this.movie?.title || '';
    const description = isTmdb ? (this.movie?.overview || '') : (this.movie?.description || '');
    const genre = this.movie?.genre || '';   // 🆕 NOVO
    // ... outras variáveis

    this.movieForm = this.fb.group({
        title: [{ value: title, disabled: isTmdb }],
        description: [{ value: description, disabled: isTmdb }],
        genre: [{ value: genre, disabled: isTmdb }],    // 🆕 NOVO
        release_year: [{ value: releaseYear, disabled: isTmdb }],
        // ... resto
    });
}
```

#### Conceito: O que é `FormGroup` e `FormControl`?

```typescript
this.movieForm = this.fb.group({
    title: [{ value: '', disabled: false }],   // Cada linha = 1 FormControl
    genre: [{ value: '', disabled: false }],   // Cada FormControl = 1 campo do form
});
```

- `FormGroup` = o formulário inteiro (agrupa vários campos)
- `FormControl` = um campo individual (title, genre, etc.)
- `this.movieForm.value` = retorna `{title: "...", genre: "...", ...}`

Se você adiciona o `<input>` no HTML mas **esquece o formControl no TS**, o Angular dá erro.

### 4B — Adicionar input no HTML

**Arquivo**: `src/app/components/custom-movie-modal/custom-movie-modal.html`

Adicione o campo abaixo do bloco de Descrição (após o `</div>` da descrição e antes do `grid grid-cols-2`):

```html
<!-- 🆕 NOVO CAMPO: Gênero -->
<div>
    <label class="block text-sm font-medium text-white mb-1">Gênero</label>
    <input type="text" formControlName="genre"
        class="w-full bg-neutral-900 border border-white/10 rounded-brand px-4 py-2 text-white
               focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent
               transition-all placeholder:text-neutral-600 disabled:opacity-50"
        placeholder="Ex: Ação, Drama, Comédia">

    <!-- Mensagem de erro (vermelho) -->
    <p *ngIf="apiErrors['genre']" class="text-red-500 text-xs mt-1">
        {{ apiErrors['genre'] }}
    </p>
</div>
```

> [!NOTE]
> O `formControlName="genre"` deve ser **exatamente igual** ao nome usado no `this.fb.group({genre: ...})`. Se estiver diferente, o Angular não vai vincular o campo.

### Erro Comum no Frontend: Nome diferente no HTML e no TS

```html
<!-- ❌ ERRADO — nomes diferentes! -->
<input formControlName="genero">  <!-- HTML: "genero" (português) -->
```
```typescript
// TS: "genre" (inglês)
this.fb.group({ genre: [''] });
```

```html
<!-- ✅ CORRETO — mesmo nome nos dois -->
<input formControlName="genre">
```
```typescript
this.fb.group({ genre: [''] });
```

---

## 📋 Checklist Final

Depois de fazer tudo, verifique:

- [ ] `schema.sql` — coluna `genre VARCHAR(100) NOT NULL` adicionada
- [ ] `./run db:reset` e `./run db:populate` executados
- [ ] `CustomMovie.php` — `'genre'` no array `$columns`
- [ ] `CustomMovie.php` — `Validations::notEmpty('genre', ...)` no `validates()`
- [ ] `CustomMoviesController.php` — `$movie->genre = ...` no `create()`
- [ ] `CustomMoviesController.php` — `$movie->genre = ...` no `update()`
- [ ] `custom-movie-modal.ts` — `genre` no `this.fb.group({...})`
- [ ] `custom-movie-modal.html` — `<input formControlName="genre">` adicionado
- [ ] `custom-movie-modal.html` — `<p *ngIf="apiErrors['genre']">` para exibir erro

---

## ⚠️ Erros Comuns (Resumo Geral)

| Erro | Consequência | Solução |
|---|---|---|
| Adicionar no banco mas não no `$columns` | INSERT ignora o campo, banco rejeita | Sempre sincronizar os dois |
| Adicionar no `$columns` mas não no banco | Erro SQL: coluna não existe | `./run db:reset` |
| Esquecer no Controller `create()` | Campo sempre `null`, validação falha | Adicionar `$movie->genre = ...` |
| Esquecer no Controller `update()` | Não consegue editar o gênero | Adicionar no `update()` também |
| FormControl no TS ≠ formControlName no HTML | Erro Angular: "Cannot find control" | Usar mesmo nome nos dois |
| Esquecer `./run db:reset` | Tabela antiga sem a coluna | Resetar o banco |

---

## 📝 Conceitos-Chave para a Prova

| Conceito | Explicação |
|---|---|
| **Camadas** | Banco → Model → Controller → Frontend (sempre nessa ordem) |
| **`$columns`** | Array que mapeia quais colunas do banco o Model conhece |
| **`validates()`** | Método que define regras de validação, chamado pelo `save()` |
| **`NOT NULL`** | Constraint do banco que impede valores nulos |
| **`notEmpty()`** | Validação PHP que verifica null e string vazia |
| **`FormGroup`** | Conjunto de campos de formulário no Angular |
| **`formControlName`** | Atributo HTML que vincula o input ao FormControl |
| **`apiErrors['campo']`** | Exibe o erro retornado pelo backend abaixo do campo |
