# Pedido 3 — Galeria de imagens com relação 1xN real

## Contexto no nosso projeto

A entrega se chama **"Galeria de imagens/arquivos com relação 1xN"**, mas hoje o sistema só tem:

- `users.avatar_file` → 1 imagem
- `users.banner_file` → 1 imagem

Isso é uma relação **1×2 fixa**, embutida em colunas. **Não é 1×N.** O professor pode pedir uma galeria verdadeira: uma entidade pai que possui **N imagens** numa tabela separada, ligadas por FK. É o caso de uso natural do `HasMany` / `BelongsTo` do nosso framework (que hoje existem mas **não são usados** por nenhum model — ver [`core/Database/ActiveRecord/HasMany.php`](../../php/mymovies/core/Database/ActiveRecord/HasMany.php) e [`BelongsTo.php`](../../php/mymovies/core/Database/ActiveRecord/BelongsTo.php)).

## Desenho da solução

Vamos criar uma galeria de imagens para o **usuário** (poderia ser para `Movie` também). Um usuário tem **muitas** imagens de galeria; cada imagem **pertence a** um usuário.

```
users (1) ────< (N) user_images
```

### 1. Tabela nova no schema

Em [`database/schema.sql`](../../php/mymovies/database/schema.sql):

```sql
CREATE TABLE `user_images` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `image_file` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_user_images_user`
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB;
```

> `ON DELETE CASCADE` garante que deletar o usuário apaga os **registros** das imagens no banco. A remoção dos **arquivos** do filesystem é responsabilidade da aplicação (ver Pedido 5).

### 2. Model `UserImage` (lado N — `BelongsTo`)

Crie `app/Models/UserImage.php`, seguindo o padrão de [`app/Models/User.php`](../../php/mymovies/app/Models/User.php):

```php
<?php

namespace App\Models;

use Core\Database\ActiveRecord\Model;
use Core\Database\ActiveRecord\BelongsTo;
use Lib\Validations;

/**
 * @property int $id
 * @property int $user_id
 * @property string $image_file
 * @property string $created_at
 */
class UserImage extends Model
{
    protected static string $table = 'user_images';
    protected static array $columns = [
        'user_id',
        'image_file',
        'created_at',
    ];

    public function validates(): void
    {
        Validations::notEmpty('image_file', $this, 'O arquivo é obrigatório!');
        Validations::notEmpty('user_id', $this, 'O usuário é obrigatório!');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
```

### 3. Relação `HasMany` no `User` (lado 1)

Em `app/Models/User.php` adicione:

```php
use Core\Database\ActiveRecord\HasMany;

public function images(): HasMany
{
    return $this->hasMany(UserImage::class, 'user_id');
}
```

### Como o framework "magicamente" resolve isso

Olhe [`core/Database/ActiveRecord/Model.php`](../../php/mymovies/php/mymovies/core/Database/ActiveRecord/Model.php) (método `__get`). Quando você acessa `$user->images`:

1. Não é uma coluna nem propriedade direta.
2. O `__get` converte para o método `images()` e checa o **tipo de retorno** via Reflection.
3. Como retorna `HasMany` (tipo permitido), ele chama `->get()` automaticamente.
4. `HasMany::get()` roda `UserImage::where(['user_id' => $user->id])` e devolve o array de imagens.

Ou seja: `$user->images` (sem parênteses) → array de `UserImage`. `$user->images()` (com parênteses) → objeto `HasMany`, útil para `->new()`, `->findById()`, `->paginate()`.

### 4. Controller — registrar uma imagem na galeria

```php
public function addImage(): void
{
    $user = $this->currentUser();
    if (!$user) {
        $this->json(['error' => 'Usuário não encontrado'], 401);
        return;
    }

    if (!isset($_FILES['image_file']) || $_FILES['image_file']['error'] !== UPLOAD_ERR_OK) {
        $this->json(['error' => 'Arquivo inválido'], 400);
        return;
    }

    // HasMany::new() já injeta o user_id correto — impossível "errar" o dono
    $image = $user->images()->new();

    // Reaproveita o ProfileImages para validar + mover o arquivo
    $service = new ProfileImages($image, [
        'extensions' => ['jpg', 'jpeg', 'png'],
        'mime_types' => ['image/jpeg', 'image/png'],
        'max_size'   => 2 * 1024 * 1024,
    ], 'image_file');

    if ($service->update($_FILES['image_file'])) {
        $this->json(['message' => 'Imagem adicionada à galeria'], 201);
    } else {
        $this->json(['errors' => $image->errors()], 422);
    }
}
```

### 5. Controller — listar e remover

```php
public function listImages(): void
{
    $user = $this->currentUser();
    $this->json([
        'images' => array_map(
            fn($img) => ['id' => $img->id, 'url' => $img->image_file],
            $user->images   // dispara o HasMany::get()
        ),
    ]);
}

public function deleteImage(Request $request): void
{
    $user = $this->currentUser();
    $id   = (int) $request->getParam('id');

    // findById restringe ao dono: só acha se a imagem for DESTE usuário
    $image = $user->images()->findById($id);
    if (!$image) {
        $this->json(['error' => 'Imagem não encontrada'], 404);
        return;
    }

    // remove arquivo do filesystem + registro do banco
    (new ProfileImages($image, [], 'image_file'))->delete();
    $image->destroy();

    $this->json(['message' => 'Imagem removida']);
}
```

> Repare que `findById()` do `HasMany` já filtra por `user_id` — um usuário **nunca** consegue deletar a imagem de outro. Segurança via design (IDOR prevention).

### 6. Rotas

Em [`config/routes.php`](../../php/mymovies/config/routes.php), dentro do grupo `middleware('auth')`:

```php
Route::post('/gallery/images', [GalleryController::class, 'addImage']);
Route::get('/gallery/images', [GalleryController::class, 'listImages']);
Route::delete('/gallery/images/{id}', [GalleryController::class, 'deleteImage']);
```

## Conceitos para o WIKI

> **Relação 1:N (um-para-muitos):** associação em que uma instância da entidade A está vinculada a zero ou muitas instâncias da entidade B, enquanto cada B está vinculada a no máximo uma A. Implementada colocando a FK no lado "muitos" (N).

> **HasMany / BelongsTo (padrão Active Record):** Active Record é um padrão em que cada objeto de domínio encapsula tanto os dados quanto o acesso ao banco. `hasMany` expressa o lado "1" da relação (o pai busca os filhos via FK); `belongsTo` expressa o lado "N" (o filho busca o pai pela FK que ele carrega).

**Referências de livro:**
- FOWLER, Martin. *Patterns of Enterprise Application Architecture*. Addison-Wesley. — Padrão **Active Record** e **Foreign Key Mapping** (a base do nosso `Model`, `HasMany`, `BelongsTo`).
- ELMASRI; NAVATHE. *Sistemas de Banco de Dados*. — Modelo Entidade-Relacionamento, cardinalidade 1:N.

## Checklist de demonstração
- [ ] Subir 3 imagens para o mesmo usuário → aparecem todas (1×N).
- [ ] Listar a galeria via `$user->images`.
- [ ] Deletar 1 imagem específica → as outras permanecem.
- [ ] Mostrar no banco: `SELECT * FROM user_images WHERE user_id = X`.
