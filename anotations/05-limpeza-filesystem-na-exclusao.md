# Pedido 5 — Limpeza correta do filesystem ao excluir o usuário

## Contexto no nosso projeto

Em [`app/Controllers/UsersController.php`](../../php/mymovies/app/Controllers/UsersController.php), o método `delete()` tem **dois bugs** na limpeza de arquivos:

```php
$uploadDir = (string) Constants::rootPath()->join('public/assets/uploads/');

if ($user->avatar_file && $user->avatar_file !== 'avatar.png') {
    $filePath = $uploadDir . $user->avatar_file;   // BUG 1: caminho errado

    if (file_exists($filePath)) {
        unlink($filePath);
    }
}
// BUG 2: o banner nunca é removido
```

### Bug 1 — caminho incorreto

O serviço salva os arquivos em (veja `baseDir()` em [`ProfileImages.php`](../../php/mymovies/app/Services/ProfileImages.php)):

```
public/assets/uploads/{tabela}/{id}/{arquivo}
→ public/assets/uploads/users/42/a1b2c3d4.png
```

Mas o `delete()` monta:

```
public/assets/uploads/{arquivo}
→ public/assets/uploads/a1b2c3d4.png   ← não existe aqui!
```

Resultado: `file_exists()` retorna `false`, `unlink()` nunca roda, e o arquivo fica **órfão** no disco para sempre.

### Bug 2 — banner ignorado

Só o `avatar_file` é tratado. O `banner_file` fica órfão mesmo que o caminho estivesse certo.

A entrega 4.3 cobra exatamente: *"A exclusão deve remover automaticamente as imagens do filesystem e do banco"*.

## A forma certa: reusar o serviço que já sabe o caminho

Em vez de remontar o caminho na mão (e errar), **delegue ao `ProfileImages`**, que já tem a lógica correta em `getAbsoluteSavedFilePath()`:

```php
private function getAbsoluteSavedFilePath(): string
{
    return Constants::rootPath()
        ->join('public' . $this->baseDir())
        ->join($this->model->{$this->column});
}
```

E `baseDir()` usa `{$this->model::table()}/{$this->model->id}/` — o caminho correto.

## Implementação passo a passo

### 1. Substituir o bloco bugado no `UsersController::delete()`

```php
// ANTES de $user->destroy(), remova os arquivos pelos próprios serviços:
$user->avatar()->delete();   // remove arquivo do avatar (se não for default)
$user->banner()->delete();   // remove arquivo do banner  (se não for default)

if ($user->destroy()) {
    FlashMessage::success('Sua conta foi deletada!');
    $this->json(['message' => 'Sua conta foi deletada!'], 200);
} else {
    $this->json(['error' => 'Erro ao deletar a conta'], 500);
}
```

Remova o bloco antigo do `$uploadDir` / `unlink` manual e o `use ... Constants` se não for mais usado.

> `ProfileImages::delete()` chama `removeOldImage()`, que só apaga se a coluna não estiver vazia e o arquivo existir — seguro para chamar mesmo quando o usuário usa as imagens default (nesse caso `avatar_file` = 'avatar.png', mas o arquivo físico não está em `users/{id}/`, então `file_exists` dá false e nada acontece). Funciona sem efeito colateral.

### 2. (Opcional, mais robusto) Remover a pasta inteira do usuário

Como os arquivos ficam isolados em `uploads/users/{id}/`, dá para limpar tudo de uma vez:

```php
private function removeUserUploadDir(User $user): void
{
    $dir = (string) Constants::rootPath()
        ->join('public/assets/uploads/users/' . $user->id);

    if (is_dir($dir)) {
        foreach (glob($dir . '/*') as $file) {
            unlink($file);
        }
        rmdir($dir);
    }
}
```

Chame `removeUserUploadDir($user)` antes de `destroy()`. Vantagem: pega também imagens de galeria (Pedido 3) e qualquer arquivo órfão remanescente.

### 3. Lado do banco: o CASCADE complementa

A remoção dos **registros** relacionados (ex.: `movie_ratings`, `user_images`) deve ser garantida pela FK `ON DELETE CASCADE` (Pedido 2). Filesystem e banco são **dois mundos separados**:

- **Banco:** CASCADE no SGBD apaga as linhas.
- **Filesystem:** a aplicação precisa apagar os arquivos (o SGBD não conhece o disco).

Os dois juntos cumprem o requisito "remover do filesystem **e** do banco".

## Demonstração (roteiro)

```bash
# 1. Antes de deletar: mostrar os arquivos
docker compose exec php ls -la /var/www/public/assets/uploads/users/42/

# 2. Deletar a conta pela aplicação (DELETE /account/delete)

# 3. Depois: mostrar que a pasta/arquivos sumiram
docker compose exec php ls -la /var/www/public/assets/uploads/users/42/
# → "No such file or directory"

# 4. No banco: mostrar que o usuário e seus ratings sumiram (CASCADE)
docker compose exec db mysql -u root mymovies -e \
  "SELECT * FROM movie_ratings WHERE user_id = 42;"
```

## Frontend (Angular) — nada a mudar

A exclusão de conta já é disparada pelo front (botão que chama `DELETE /account/delete` via service). A correção é 100% backend: o que muda é *o que acontece no servidor* após o clique. O fluxo de UI (confirmar senha → chamar API → `auth.logout()` → redirecionar) permanece igual.

## Conceito para o WIKI

> **Consistência entre armazenamento transacional e não-transacional:** o banco de dados oferece transações ACID, mas o sistema de arquivos não participa dessas transações. Manter os dois consistentes exige que a aplicação orquestre as duas operações; padrões como executar a remoção de arquivos antes do commit, ou registrar arquivos órfãos para limpeza posterior, mitigam inconsistências.

**Referências de livro:**
- SILBERSCHATZ, A.; GALVIN, P.; GAGNE, G. *Sistemas Operacionais: Conceitos e Aplicações* — capítulo de Sistema de Arquivos (operações, links, remoção).
- FOWLER, Martin. *Patterns of Enterprise Application Architecture* — discussão sobre Unit of Work e coordenação de recursos.

## Checklist de demonstração
- [ ] Mostrar arquivos do avatar **e** banner antes do delete.
- [ ] Deletar conta.
- [ ] Mostrar pasta vazia/removida no filesystem.
- [ ] Mostrar ratings removidos via CASCADE no banco.
