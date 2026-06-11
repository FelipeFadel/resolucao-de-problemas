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

> ✅ **Você já fez isto** — a tabela `user_images` já está no seu `schema.sql` com a FK. Falta rodar `./run db:reset` para aplicá-la (ver passo final).

---

## Onde cada peça vive (mapa antes de continuar)

A partir daqui vamos criar **3 arquivos novos** e **editar 2 existentes**. Antes de mergulhar, entenda o papel de cada um e a ordem em que a requisição passa por eles:

```
Requisição: POST /gallery/images  (com o arquivo)
   │
   ▼
[1] config/routes.php          (EDITAR)  → diz qual método do controller atende a URL
   │
   ▼
[2] GalleryController.php       (CRIAR)   → recebe o $_FILES, valida o básico, chama o service
   │
   ▼
[3] User::gallery()            (EDITAR)  → devolve o service já configurado com as regras
   │
   ▼
[4] GalleryImages.php           (CRIAR)   → o "cérebro": cria a linha, valida, move o arquivo
   │        │
   │        └── reusa ProfileImages (já existe) para validar+mover o arquivo físico
   ▼
[5] UserImage.php               (CRIAR)   → representa 1 linha da tabela user_images
   │
   ▼
   banco (user_images) + filesystem (public/assets/uploads/...)
```

> **Por que tantos arquivos?** É a separação de responsabilidades do projeto (padrão MVC + Service). Cada arquivo tem **um** trabalho: a rota mapeia URL, o controller orquestra, o service tem a regra de negócio, o model representa os dados. O controller **nunca** mexe em arquivo ou SQL direto — isso é trabalho do service/model. Seguir esse padrão é o que a banca avalia em "Explicação do Funcionamento do Framework".

**Status do que falta (checklist):**
- [x] Tabela `user_images` no `schema.sql` — *você já fez*
- [x] `User::images()` (HasMany) — *você já fez*
- [ ] `app/Models/UserImage.php` — **criar** (seção 2)
- [ ] `app/Services/GalleryImages.php` — **criar** (seção 4)
- [ ] `User::gallery()` — **editar** (seção 5)
- [ ] `app/Controllers/GalleryController.php` — **criar** (seção 6)
- [ ] rotas em `config/routes.php` — **editar** (seção 7)

Vamos criar de baixo para cima (do model até a rota), porque cada peça depende da anterior. (O diagrama acima mostra a ordem **inversa** — a do *runtime*, quando a requisição chega.)

---

### 2. CRIAR o model `UserImage` — representa 1 linha da galeria

📄 **Arquivo a criar:** `app/Models/UserImage.php`
🎯 **Para que serve:** é o lado "N" da relação. Cada objeto `UserImage` é **uma** imagem da galeria (uma linha da tabela `user_images`). Ele sabe se validar e sabe quem é seu dono (`belongsTo` User). É o equivalente, para a galeria, ao que o `User` é para a tabela `users`.

> ⚠️ **Você ainda não criou este arquivo** — o `User::images()` que você já escreveu aponta para `UserImage::class`, então sem este arquivo o código quebra com "class not found". Este é o próximo passo.

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
    // Liga o model à tabela criada no schema.sql
    protected static string $table = 'user_images';

    // Colunas que o model gerencia (o 'id' é tratado pela classe Model base)
    protected static array $columns = [
        'user_id',
        'image_file',
        'created_at',
    ];

    // Regras de validação — rodam no save(). Mesmo estilo do User::validates().
    public function validates(): void
    {
        Validations::notEmpty('image_file', $this, 'O arquivo é obrigatório!');
        Validations::notEmpty('user_id', $this, 'O usuário é obrigatório!');
    }

    // Lado "N": cada imagem pertence a um usuário. Permite fazer $image->user.
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
```

---

### 3. EDITAR o `User` — a relação `images()` (HasMany) ✅ já feita

📄 **Arquivo a editar:** [`app/Models/User.php`](../../php/mymovies/app/Models/User.php)
🎯 **Para que serve:** é o lado "1" da relação. Diz que um usuário tem **muitas** `UserImage`, ligadas pela coluna `user_id`. **Você já escreveu isto:**

```php
use Core\Database\ActiveRecord\HasMany;   // já no topo do seu arquivo

public function images(): HasMany
{
    return $this->hasMany(UserImage::class, 'user_id');
}
```

**Como o framework usa isso (vale entender para a banca):** olhe o método `__get` em [`core/Database/ActiveRecord/Model.php`](../../php/mymovies/core/Database/ActiveRecord/Model.php). Quando você acessa `$user->images`:

1. Não é uma coluna nem propriedade direta.
2. O `__get` converte para o método `images()` e checa o **tipo de retorno** via Reflection.
3. Como retorna `HasMany` (tipo permitido), ele chama `->get()` automaticamente.
4. `HasMany::get()` roda `UserImage::where(['user_id' => $user->id])` e devolve o array de imagens.

Ou seja: `$user->images` (sem parênteses) → array de `UserImage` já buscado do banco. `$user->images()` (com parênteses) → o objeto `HasMany`, que dá acesso aos métodos `->new()`, `->findById()`, `->get()` que o service vai usar a seguir.

---

### 4. CRIAR o service `GalleryImages` — o cérebro da operação

📄 **Arquivo a criar:** `app/Services/GalleryImages.php`
🎯 **Para que serve:** concentra **toda** a lógica de negócio da galeria (adicionar, listar, remover). É aqui que o trabalho pesado acontece, para o controller ficar fino. Segue o mesmo papel que o [`ProfileImages`](../../php/mymovies/app/Services/ProfileImages.php) tem para avatar/banner.

> **Padrão do projeto que estamos copiando:** em `ProfileController::updateAvatar()`, o controller só faz `$user->avatar()->update($image)`. Toda a lógica vive no service `ProfileImages`, e o `User` expõe `avatar()` que devolve esse service. **A galeria faz igual:** service `GalleryImages` + método `gallery()` no `User` (próxima seção).

```php
<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserImage;

class GalleryImages
{
    /** @var array<string, string> Guarda erros de validação para o controller ler depois */
    private array $errors = [];

    /**
     * @param User $user O dono da galeria (vem do usuário autenticado)
     * @param array<string, mixed> $validations Regras (extensões, tamanho...) vindas do model
     */
    public function __construct(
        private User $user,
        private array $validations = []
    ) {
    }

    /**
     * LISTAR: devolve todas as imagens deste usuário.
     * @return array<UserImage>
     */
    public function all(): array
    {
        // images() é o HasMany que você já criou no User. ->get() roda o SELECT.
        return $this->user->images()->get();
    }

    /**
     * ADICIONAR: registra uma nova imagem na galeria.
     * @param array<string, mixed> $file  um item do $_FILES (ex.: $_FILES['image_file'])
     * @return UserImage|null  a imagem criada, ou null se algo falhou (erros em $this->errors)
     */
    public function add(array $file): ?UserImage
    {
        // 1. Cria um UserImage novo. HasMany::new() já injeta user_id = $this->user->id,
        //    então é IMPOSSÍVEL criar imagem para outro usuário. O image_file recebe o
        //    nome original só para passar na validação notEmpty na hora do save.
        $image = $this->user->images()->new(['image_file' => $file['name']]);

        // 2. Salva a linha ANTES de mover o arquivo, porque o caminho de destino
        //    usa o id (public/assets/uploads/user_images/{id}/). Sem id, sem pasta.
        if (!$image->save()) {
            $this->errors = $image->errors();
            return null;
        }

        // 3. Reusa o ProfileImages (já existe!) para validar extensão/tamanho e
        //    fisicamente mover o arquivo para a pasta. Não reescrevemos isso (DRY).
        $service = new ProfileImages($image, $this->validations, 'image_file');

        if (!$service->update($file)) {
            $this->errors = $image->errors();
            $image->destroy();   // desfaz a linha criada no passo 2 se o arquivo for inválido
            return null;
        }

        return $image;
    }

    /**
     * REMOVER: apaga uma imagem da galeria (arquivo do disco + linha do banco).
     */
    public function remove(int $id): bool
    {
        // findById() do HasMany busca filtrando por user_id E id ao mesmo tempo:
        // se a imagem for de OUTRO usuário, retorna null. Segurança por design (anti-IDOR).
        $image = $this->user->images()->findById($id);
        if (!$image) {
            return false;
        }

        // delete() do ProfileImages apaga o arquivo físico (unlink) e zera a coluna;
        // destroy() apaga a linha da tabela. Os dois: filesystem + banco.
        (new ProfileImages($image, [], 'image_file'))->delete();
        return $image->destroy();
    }

    /**
     * Expõe os erros de validação para o controller montar a resposta 422.
     * @return array<string, string>
     */
    public function errors(): array
    {
        return $this->errors;
    }
}
```

---

### 5. EDITAR o `User` — adicionar o método `gallery()`

📄 **Arquivo a editar:** [`app/Models/User.php`](../../php/mymovies/app/Models/User.php)
🎯 **Para que serve:** é o "ponto de entrada" do service. Assim como `avatar()` devolve um `ProfileImages` configurado, `gallery()` devolve um `GalleryImages` já com as regras de validação. Centraliza aqui as regras (extensões, tamanho), do mesmo jeito que avatar/banner fazem.

Você já tem o `use ... HasMany` e o método `images()`. Adicione **o import do service** no topo e o método `gallery()` junto dos outros:

```php
use App\Services\GalleryImages;   // adicionar junto aos outros 'use' no topo do arquivo
```

```php
// adicionar ao lado de avatar() / banner() / images()
public function gallery(): GalleryImages
{
    return new GalleryImages($this, [
        'extensions' => ['jpg', 'jpeg', 'png'],
        'mime_types' => ['image/jpeg', 'image/png'],
        'max_size'   => 2 * 1024 * 1024,
    ]);
}
```

Resultado — a simetria que o projeto já tem:
| Chamada | Devolve | Lida com |
|---------|---------|----------|
| `$user->avatar()` | `ProfileImages` | 1 imagem (coluna `avatar_file`) |
| `$user->banner()` | `ProfileImages` | 1 imagem (coluna `banner_file`) |
| `$user->gallery()` | `GalleryImages` | N imagens (tabela `user_images`) |

---

### 6. CRIAR o `GalleryController` — recebe a requisição HTTP

📄 **Arquivo a criar:** `app/Controllers/GalleryController.php`
🎯 **Para que serve:** é a porta de entrada HTTP. Recebe a requisição, confere o básico (usuário logado? arquivo veio?), chama **um** método do service e devolve JSON. **Não** tem lógica de banco nem de arquivo — só orquestra. Espelha o `ProfileController`.

Repare no scaffold completo (namespace, imports, `extends Controller`): os métodos `currentUser()` e `json()` vêm da classe base `Core\Http\Controllers\Controller`, igual nos outros controllers.

```php
<?php

namespace App\Controllers;

use Core\Http\Controllers\Controller;
use Core\Http\Request;

class GalleryController extends Controller
{
    // POST /gallery/images  → adiciona uma imagem
    public function addImage(): void
    {
        $user = $this->currentUser();
        if (!$user) {
            $this->json(['error' => 'Usuário não encontrado'], 401);
            return;
        }

        // valida que o upload chegou de fato (igual updateAvatar faz)
        if (!isset($_FILES['image_file']) || $_FILES['image_file']['error'] !== UPLOAD_ERR_OK) {
            $this->json(['error' => 'Arquivo inválido'], 400);
            return;
        }

        // toda a lógica está no service — o controller só chama e responde
        $image = $user->gallery()->add($_FILES['image_file']);

        if ($image) {
            $this->json(['message' => 'Imagem adicionada à galeria', 'id' => $image->id], 201);
        } else {
            $this->json(['errors' => $user->gallery()->errors()], 422);
        }
    }

    // GET /gallery/images  → lista as imagens do usuário
    public function listImages(): void
    {
        $user = $this->currentUser();
        if (!$user) {
            $this->json(['error' => 'Usuário não encontrado'], 401);
            return;
        }

        $this->json([
            'images' => array_map(
                fn($img) => ['id' => $img->id, 'url' => $img->image_file],
                $user->gallery()->all()
            ),
        ]);
    }

    // DELETE /gallery/images/{id}  → remove uma imagem
    public function deleteImage(Request $request): void
    {
        $user = $this->currentUser();
        if (!$user) {
            $this->json(['error' => 'Usuário não encontrado'], 401);
            return;
        }

        $id = (int) $request->getParam('id');   // o {id} da URL

        if ($user->gallery()->remove($id)) {
            $this->json(['message' => 'Imagem removida']);
        } else {
            $this->json(['error' => 'Imagem não encontrada'], 404);
        }
    }
}
```

> Compare com [`ProfileController::updateAvatar`](../../php/mymovies/app/Controllers/ProfileController.php) — mesma estrutura: valida o request, chama **um** método do service, devolve JSON. Zero lógica de banco/arquivo aqui.

---

### 7. EDITAR as rotas — conectar URLs ao controller

📄 **Arquivo a editar:** [`config/routes.php`](../../php/mymovies/config/routes.php)
🎯 **Para que serve:** mapeia cada URL+método HTTP para um método do controller. Sem isso, as URLs `/gallery/images` retornam 404 — o framework não sabe quem deve atendê-las.

Adicione **dentro do grupo `Route::middleware('auth')->group(...)`** que já existe (assim só usuário autenticado acessa, atendendo ao requisito de "rotas autenticadas"). Lembre de importar o controller no topo do arquivo:

```php
use App\Controllers\GalleryController;   // junto aos outros 'use' no topo
```

```php
// dentro do grupo middleware('auth'):
Route::post('/gallery/images', [GalleryController::class, 'addImage']);
Route::get('/gallery/images', [GalleryController::class, 'listImages']);
Route::delete('/gallery/images/{id}', [GalleryController::class, 'deleteImage']);
```

---

### 8. Aplicar e testar o backend

```bash
cd ~/Tsi/php/mymovies
./run db:reset && ./run db:populate     # cria a tabela user_images e dados de teste
# garante permissão da pasta de uploads (senão dá mkdir(): Permission denied):
docker compose exec php chown -R www-data:www-data /var/www/public/assets/uploads
```

Teste rápido com curl (pegue um token via login antes):
```bash
# listar (deve vir vazio no começo)
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/gallery/images

# adicionar
curl -X POST -H "Authorization: Bearer <TOKEN>" \
     -F "image_file=@/caminho/para/foto.png" http://localhost:3000/gallery/images
```

## Frontend (Angular) — a galeria na tela

A galeria precisa de UI nova (não existe componente equivalente hoje). Vamos seguir os padrões já usados em [`edit-avatar`](../../php/mymovies-angular/src/app/components/edit-avatar/edit-avatar.ts) e [`profile.service.ts`](../../php/mymovies-angular/src/app/core/services/profile.service.ts).

### 1. Métodos no service

Em `core/services/profile.service.ts` (ou um `gallery.service.ts` novo):

```typescript
// Lista as imagens da galeria do usuário logado
getGalleryImages() {
  return this.http.get<{ images: { id: number; url: string }[] }>(
    `${this.API_URL}/gallery/images`
  ).pipe(catchError(handleError));
}

// Sobe uma imagem nova
addGalleryImage(file: File) {
  const formData = new FormData();
  formData.append('image_file', file);            // mesmo nome que o backend lê em $_FILES
  return this.http.post(`${this.API_URL}/gallery/images`, formData)
    .pipe(catchError(handleError));
}

// Remove uma imagem específica por id
deleteGalleryImage(id: number) {
  return this.http.delete(`${this.API_URL}/gallery/images/${id}`)
    .pipe(catchError(handleError));
}

// URL pública da imagem (mesmo padrão de getAvatarUrl)
getGalleryUrl(path: string): string {
  return `${this.API_URL}${path}`;
}
```

### 2. Componente de galeria (lista 1×N + upload + remover)

Crie `components/gallery/gallery.ts` seguindo o estilo signals do projeto:

```typescript
import { Component, inject, signal, OnInit } from '@angular/core';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  templateUrl: './gallery.html',
})
export class Gallery implements OnInit {
  private service = inject(ProfileService);
  images = signal<{ id: number; url: string }[]>([]);
  error = signal<string | null>(null);

  ngOnInit() { this.load(); }

  load() {
    this.service.getGalleryImages().subscribe({
      next: res => this.images.set(res.images),
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.service.addGalleryImage(input.files[0]).subscribe({
        next: () => this.load(),                       // recarrega após subir
        error: (err) => this.error.set(
          err.errors?.['image_file']?.[0] ?? 'Erro no upload'
        ),
      });
    }
  }

  remove(id: number) {
    this.service.deleteGalleryImage(id).subscribe({
      next: () => this.images.update(list => list.filter(i => i.id !== id)),
    });
  }
}
```

### 3. Template `gallery.html` — o `@for` é o "1×N" na tela

```html
<div class="grid grid-cols-3 gap-3">
  @for (img of images(); track img.id) {
    <div class="relative group">
      <img [src]="service.getGalleryUrl(img.url)" class="w-full h-40 object-cover rounded-lg" />
      <button
        (click)="remove(img.id)"
        class="absolute top-1 right-1 bg-red-600 text-white rounded-full w-7 h-7 opacity-0 group-hover:opacity-100 transition"
      >✕</button>
    </div>
  } @empty {
    <p class="text-neutral-400 col-span-3">Nenhuma imagem na galeria ainda.</p>
  }
</div>

<input type="file" #fileInput class="hidden" (change)="onFileSelected($event)" accept="image/*" />
<button (click)="fileInput.click()" class="mt-4 bg-accent text-white px-4 py-2 rounded uppercase font-bold">
  Adicionar imagem
</button>

@if (error()) { <span class="text-red-600 text-sm">{{ error() }}</span> }
```

> O `@for ... track img.id` renderiza **N** imagens a partir do array — é literalmente a relação 1×N aparecendo na interface. O `@empty` cobre o caso de galeria vazia. O `service` precisa ser `public` ou exposto para o template chamar `getGalleryUrl`.

### 4. Plugar na página de perfil

Em [`pages/profile/profile.ts`](../../php/mymovies-angular/src/app/pages/profile/profile.ts), adicione `Gallery` ao `imports`, e no `profile.html` insira `<app-gallery />` na seção desejada. O `auth-interceptor` cuida do token em todas as chamadas.

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
