# Tutorial: Mensagens Personalizadas no BACKEND

## 🎯 O Objetivo

Fazer o **backend PHP** retornar mensagens categorizadas por tipo para que o frontend saiba qual cor usar. Os tipos são:

| Tipo | Significado | HTTP Status | Cor no front |
|---|---|---|---|
| `errors` | Dados inválidos, não salvou | **422** | 🔴 Vermelho |
| `warnings` | Dado aceito, mas com aviso | **201** (salvou) | 🟡 Amarelo |
| `message` | Tudo certo, sucesso | **201** | 🟢 Verde |

---

## 📂 Arquivos do Backend Envolvidos

| Arquivo | Caminho Relativo | Papel |
|---|---|---|
| `CustomMoviesController.php` | `app/Controllers/CustomMoviesController.php` | Monta a resposta JSON |
| `CustomMovie.php` | `app/Models/CustomMovie.php` | Define regras de validação |
| `Controller.php` (base) | `core/Http/Controllers/Controller.php` | Método `json()` que envia a resposta |

---

## 📖 Conceito: Quem Decide o Tipo da Mensagem?

O **Model** valida e gera erros. O **Controller** decide o que responder:

```
Model → valida os dados → gera array de errors
Controller → verifica se salvou → monta o JSON de resposta com o tipo certo
```

> [!IMPORTANT]
> A lógica de "qual tipo de mensagem retornar" fica no **Controller**, não no Model. O Model só sabe se os dados são válidos ou não.

---

## 🔄 Como Funciona Hoje

### Resposta de ERRO (422) — já existe:
```php
// app/Controllers/CustomMoviesController.php — linha 46
$this->json(['errors' => $movie->errors()], 422);
```
Retorna:
```json
{"errors": {"title": "O título é obrigatório!", "status": "O status é obrigatório."}}
```

### Resposta de SUCESSO (201) — já existe, mas sem mensagem:
```php
// app/Controllers/CustomMoviesController.php — linha 44
$this->json(['movie' => $movie], 201);
```
Retorna:
```json
{"movie": {"id": 1, "title": "Matrix", ...}}
```

**Problema**: o sucesso não retorna nenhuma mensagem para o frontend exibir.

---

## 🛠️ Implementação no Backend

### Passo 1: Adicionar mensagem de SUCESSO na resposta

**Arquivo**: `app/Controllers/CustomMoviesController.php`

Dentro do método `create()`, altere a resposta de sucesso:

```php
// ANTES (linha 43-44):
if ($movie->save()) {
    $this->json(['movie' => $movie], 201);
}

// DEPOIS:
if ($movie->save()) {
    $this->json([
        'movie'   => $movie,
        'message' => 'Filme cadastrado com sucesso!'  // 🟢 Mensagem de sucesso
    ], 201);
}
```

Agora o frontend recebe:
```json
{
  "movie": {"id": 1, "title": "Matrix", ...},
  "message": "Filme cadastrado com sucesso!"
}
```

---

### Passo 2: Adicionar ALERTAS (warnings) no Controller

Alertas são avisos que **não impedem** o salvamento. Exemplo: o ano é muito antigo ou a descrição está vazia (opcional mas recomendada).

**Arquivo**: `app/Controllers/CustomMoviesController.php`

Modifique o método `create()` completo:

```php
public function create(Request $request): void
{
    $user = $this->currentUser();
    if (!$user) {
        $this->json(['error' => 'Não autorizado'], 401);
        return;
    }

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $movie = new CustomMovie();
    $movie->user_id = $user->id;
    $movie->title = !empty($data['title']) ? $data['title'] : null;
    $movie->description = !empty($data['description']) ? $data['description'] : null;
    $movie->release_year = !empty($data['release_year']) ? (int)$data['release_year'] : null;
    $movie->poster_url = !empty($data['poster_url']) ? $data['poster_url'] : null;
    $movie->rating = !empty($data['rating']) ? (int)$data['rating'] : null;
    $movie->status = !empty($data['status']) ? $data['status'] : null;

    if ($movie->save()) {
        // ========== WARNINGS (alertas) ==========
        $warnings = [];

        // Alerta se não preencheu descrição
        if (empty($data['description'])) {
            $warnings['description'] = 'Filme salvo sem descrição. Considere adicionar uma!';
        }

        // Alerta se ano é muito antigo
        if (!empty($data['release_year']) && (int)$data['release_year'] < 1950) {
            $warnings['release_year'] = 'Ano anterior a 1950. Verifique se está correto.';
        }
        // =========================================

        $response = [
            'movie'   => $movie,
            'message' => 'Filme cadastrado com sucesso!'  // 🟢 Sucesso
        ];

        // Só inclui warnings se existirem
        if (!empty($warnings)) {
            $response['warnings'] = $warnings;  // 🟡 Alertas
        }

        $this->json($response, 201);
    } else {
        // 🔴 Erros de validação
        $this->json(['errors' => $movie->errors()], 422);
    }
}
```

---

### Passo 3: Entender as 3 respostas possíveis

Agora o backend retorna 3 formatos diferentes:

#### Resposta de ERRO 🔴 (HTTP 422)
```json
{
  "errors": {
    "title": "O título é obrigatório!",
    "description": "A descrição deve ter pelo menos 10 caracteres.",
    "status": "O status é obrigatório."
  }
}
```
**Quando**: O `save()` retornou `false` → dados inválidos, nada foi salvo.

#### Resposta de SUCESSO 🟢 sem alertas (HTTP 201)
```json
{
  "movie": {"id": 5, "title": "Matrix", "description": "Filme de ficção científica", ...},
  "message": "Filme cadastrado com sucesso!"
}
```
**Quando**: Salvou e não há nada para alertar.

#### Resposta de SUCESSO 🟢 com alertas 🟡 (HTTP 201)
```json
{
  "movie": {"id": 6, "title": "Matrix", ...},
  "message": "Filme cadastrado com sucesso!",
  "warnings": {
    "description": "Filme salvo sem descrição. Considere adicionar uma!"
  }
}
```
**Quando**: Salvou, mas tem algo que o usuário deveria saber.

> [!NOTE]
> O HTTP status **201** indica que salvou. O frontend sabe que deu certo pelo status, e pode exibir os `warnings` em amarelo se existirem.

---

## 📖 Conceito: HTTP Status Codes

| Código | Nome | Significado no nosso projeto |
|---|---|---|
| **200** | OK | Operação genérica bem-sucedida |
| **201** | Created | Recurso criado com sucesso |
| **401** | Unauthorized | Usuário não está logado |
| **404** | Not Found | Recurso não encontrado |
| **422** | Unprocessable Entity | Dados inválidos (erros de validação) |

> [!TIP]
> O frontend usa o **status code** para decidir o que fazer: `201` → sucesso, `422` → mostrar erros, `401` → redirecionar para login.

---

## 📖 Conceito: O Método `json()` do Controller Base

Toda resposta passa pelo método `json()` em `core/Http/Controllers/Controller.php`:

```php
protected function json(array $data, int $status = 200): void
{
    header('Content-Type: application/json; charset=utf-8', true, $status);
    echo json_encode($data);
    return;
}
```

Ele faz 3 coisas:
1. Define o header `Content-Type` como JSON
2. Define o **status code** HTTP
3. Converte o array PHP para JSON com `json_encode()`

Você **não precisa alterar** esse método — ele já aceita qualquer array.

---

## ⚠️ Erros Comuns no Backend

### 1. Retornar erro com status 200
```php
// ❌ ERRADO — status 200 mas tem erro
$this->json(['errors' => $movie->errors()]);

// ✅ CORRETO — usar 422 para erros de validação
$this->json(['errors' => $movie->errors()], 422);
```
**Por que importa?** O frontend Angular verifica `err.status === 422` para saber que são erros de validação.

### 2. Confundir `error` (singular) com `errors` (plural)
```php
// Para autenticação (uma mensagem só):
$this->json(['error' => 'Não autorizado'], 401);        // singular

// Para validação (múltiplos campos):
$this->json(['errors' => $movie->errors()], 422);       // plural

// O frontend espera:
// err.error?.errors  (para validação de campos)
// err.error?.error   (para erro genérico)
```

### 3. Colocar warnings ANTES do save
```php
// ❌ ERRADO — gera warnings mesmo se não salvou
$warnings = [];
if (empty($data['description'])) {
    $warnings['description'] = 'Sem descrição';
}
$movie->save();  // Pode falhar!

// ✅ CORRETO — só gera warnings se salvou com sucesso
if ($movie->save()) {
    $warnings = [];
    if (empty($data['description'])) {
        $warnings['description'] = 'Sem descrição';
    }
    // ...
}
```

### 4. Não usar `json_encode` corretamente
```php
// ❌ ERRADO — retornar string direto
echo '{"message": "ok"}';

// ✅ CORRETO — usar o método json() que já faz tudo
$this->json(['message' => 'ok'], 200);
```

---

## 🔍 Como o Frontend Já Consome Isso

No `custom-movie-modal.ts`, o código atual já captura os erros:

```typescript
// No subscribe do createCustomMovie:
error: (err) => {
  if (err.status === 422 && err.error?.errors) {
    this.apiErrors = err.error.errors;  // Pega os erros do backend
  }
}
```

Para consumir os **warnings** e **message** que adicionamos, o frontend faria:

```typescript
next: (response) => {
  this.successMessage = response.message;      // "Filme cadastrado com sucesso!"
  if (response.warnings) {
    this.apiWarnings = response.warnings;      // Alertas amarelos
  }
}
```

> [!NOTE]
> Isso é só para referência — as variáveis `apiWarnings` e `successMessage` que você já adicionou no `.ts` vão consumir exatamente isso.

---

## 📝 Resumo: O Que Muda no Backend

| O que | Onde | Tipo |
|---|---|---|
| Mensagem de sucesso | `CustomMoviesController.php` → `create()` | `'message' => 'texto'` |
| Alertas (warnings) | `CustomMoviesController.php` → `create()` | `'warnings' => ['campo' => 'texto']` |
| Erros de validação | `CustomMovie.php` → `validates()` | Já existe via `addError()` |

**Só precisa editar 1 arquivo do backend**: `app/Controllers/CustomMoviesController.php`

As validações de erro já estão no Model e continuam funcionando igual.
