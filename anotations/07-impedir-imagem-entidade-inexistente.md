# Pedido 7 — Impedir registrar imagem para uma entidade (galeria) inexistente

## Contexto no nosso projeto

A entrega 4.3 lista explicitamente:
> *"Tentar registrar uma imagem para uma galeria inexistente."*

Hoje o sistema não defende isso em **duas camadas** que deveriam estar protegidas:

1. **Banco:** sem FK (ver Pedido 2), nada impede `INSERT INTO user_images (user_id, ...) VALUES (99999, ...)` mesmo que o usuário 99999 não exista.
2. **Aplicação:** se um controller construir uma imagem com um `id` de pai vindo do cliente sem verificar a existência, gera registro órfão ou erro 500 não tratado.

## Estratégia: validar nas duas camadas (defesa em profundidade)

### Camada 1 — Banco (a rede de segurança final)

A FK do Pedido 2 já faz o banco **rejeitar** a inserção:

```sql
CONSTRAINT `fk_user_images_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE
```

Tentar inserir para um pai inexistente resulta em:

```
ERROR 1452 (23000): Cannot add or update a child row:
a foreign key constraint fails
```

Isso é a garantia **infalível** — mesmo que o código da aplicação tenha um bug, o banco não deixa entrar lixo. Mas um erro 1452 cru vira um 500 feio para o usuário. Por isso precisamos da camada 2.

### Camada 2 — Aplicação (mensagem amigável + 404/422)

O jeito mais seguro é **nunca aceitar o `id` do pai vindo do corpo da requisição**. Em vez disso, derive-o do **usuário autenticado** e use o relacionamento `HasMany`, que injeta o `user_id` correto automaticamente:

```php
public function addImage(): void
{
    $user = $this->currentUser();          // vem do token, não do body
    if (!$user) {
        $this->json(['error' => 'Usuário não encontrado'], 401);
        return;
    }

    // HasMany::new() seta user_id = $user->id internamente.
    // Impossível apontar para uma galeria que não é a sua.
    $image = $user->images()->new();
    // ...validação e upload...
}
```

Veja [`core/Database/ActiveRecord/HasMany.php`](../../php/mymovies/core/Database/ActiveRecord/HasMany.php):

```php
public function new(array $params = []): Model
{
    $params[$this->foreignKey] = $this->model->id; // injeta o dono correto
    return new $this->related($params);
}
```

### Quando o ID do pai PRECISA vir do cliente

Se a galeria não for sempre a do usuário logado (ex.: admin subindo imagem para um filme), valide a existência **explicitamente** antes de prosseguir, usando o `exists()` do nosso `Model` ([`Model.php`](../../php/mymovies/core/Database/ActiveRecord/Model.php) já tem):

```php
public function addMovieImage(Request $request): void
{
    $movieId = (int) $request->getParam('movie_id');

    // checagem explícita de existência da entidade pai
    if (!Movie::exists(['id' => $movieId])) {
        $this->json(['error' => 'Filme não encontrado'], 404);
        return;
    }

    // ... segue o upload
}
```

> Padrão: **valide antes de agir** (fail fast). Retorne `404` quando o pai não existe — é o status correto para "recurso referenciado não encontrado".

### 3. Tratar o erro do banco como fallback (não vazar 500)

Mesmo com a checagem, envolva a inserção para traduzir a violação de FK numa resposta limpa:

```php
try {
    $image->save();
} catch (\PDOException $e) {
    // 23000 = integrity constraint violation
    if ($e->getCode() === '23000') {
        $this->json(['error' => 'Galeria inexistente'], 422);
        return;
    }
    throw $e;
}
```

## Teste automatizado

```php
public function test_should_reject_image_for_nonexistent_gallery(): void
{
    // tenta criar UserImage apontando para user_id que não existe
    $image = new \App\Models\UserImage([
        'user_id'    => 999999,
        'image_file' => 'x.png',
    ]);

    $this->expectException(\PDOException::class);
    $image->save(); // o banco rejeita pela FK
}
```

E um teste de validação de aplicação (sem tocar o banco):

```php
public function test_exists_returns_false_for_unknown_user(): void
{
    $this->assertFalse(\App\Models\User::exists(['id' => 999999]));
}
```

## Frontend (Angular) — nada a mudar (e por quê)

Esse caso **nem deveria ser alcançável pela UI**: o front nunca manda o `id` do dono no corpo — o usuário vem do token (ver o padrão em [`profile.service.ts`](../../php/mymovies-angular/src/app/core/services/profile.service.ts), que só envia o `FormData` do arquivo). O `user_id` é derivado do JWT no backend.

A defesa do Pedido 7 protege contra requisições **forjadas fora da UI** (Postman, curl, script malicioso). Se o backend devolver 404/422, o tratamento genérico de erro do Angular (`handleError` + os `error:` dos componentes) já exibe a mensagem. Sem mudança de tela.

> Conexão importante: é justamente por o front **não** confiar no cliente para o `id` do dono que o ataque fica difícil pela UI — mas como a API é pública, a validação no backend + FK no banco são indispensáveis.

## Conceitos para o WIKI

> **Violação de integridade referencial:** tentativa de inserir/atualizar uma FK com um valor que não existe na tabela referenciada. O SGBD com integridade referencial ativa rejeita a operação (no MySQL/InnoDB, erro 1452 / SQLSTATE 23000), preservando a consistência do banco.

> **Defesa em profundidade (defense in depth):** princípio de segurança em que múltiplas camadas independentes de validação protegem o sistema, de modo que a falha de uma camada não compromete o todo — aqui, validação na aplicação **e** constraint no banco.

**Referências de livro:**
- ELMASRI; NAVATHE. *Sistemas de Banco de Dados*. — Restrições de integridade referencial e como o SGBD as impõe em operações de inserção/atualização.
- DATE, C. J. *Introdução a Sistemas de Banco de Dados*. — Capítulo sobre integridade e chaves estrangeiras.
- ANDERSON, Ross. *Security Engineering*. Wiley. — Princípio de defesa em profundidade.

## Checklist de demonstração
- [ ] `INSERT` direto no banco com `user_id` inexistente → erro 1452.
- [ ] Chamar o endpoint forçando entidade pai inexistente → resposta 404/422 amigável (não 500).
- [ ] Mostrar que nenhum registro órfão foi criado.
