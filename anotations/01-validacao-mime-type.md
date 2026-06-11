# Pedido 1 — Validação por MIME Type (não apenas extensão)

## Contexto no nosso projeto

Hoje, em [`app/Services/ProfileImages.php`](../../php/mymovies/app/Services/ProfileImages.php), a única checagem de "tipo" de arquivo é a **extensão do nome**:

```php
private function validateImageExtension(): void
{
    $file_name_splitted = explode('.', $this->image['name']);
    $file_extension = end($file_name_splitted);

    if (!in_array($file_extension, $this->validations['extensions'])) {
        $this->model->addError(
            $this->column,
            'A Imagem deve ser um arquivo do tipo: ' . implode(', ', $this->validations['extensions'])
        );
    }
}
```

**Problema:** a extensão faz parte do *nome*, controlado pelo cliente. Um atacante renomeia `shell.php` para `shell.jpg` e passa direto. Como o arquivo é salvo dentro de `public/` (webroot acessível pelo Nginx), isso é exatamente o cenário de **upload malicioso** que a entrega 4.3 pede para tratar.

## Por que MIME Type resolve

O **MIME Type** descreve a natureza real do conteúdo (ex.: `image/png`). A forma confiável de descobri-lo é **inspecionar os bytes iniciais do arquivo** (os "magic numbers"), não confiar no nome nem no header `Content-Type` enviado pelo cliente (que também é falsificável).

Em PHP usamos a extensão **Fileinfo** (`finfo`), que lê os magic bytes:

```php
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime  = $finfo->file($tmpName); // ex.: "image/png"
```

## Implementação passo a passo

### 1. Adicionar a lista de MIME types permitidos na configuração do model

Em [`app/Models/User.php`](../../php/mymovies/app/Models/User.php), no método `avatar()` e `banner()`:

```php
public function avatar(): ProfileImages
{
    return new ProfileImages($this, [
        'extensions'  => ['jpg', 'jpeg', 'png'],
        'mime_types'  => ['image/jpeg', 'image/png'], // <- NOVO
        'max_size'    => 2 * 1024 * 1024,
        'aspect_ratio' => ['min' => 0.95, 'max' => 1.05],
    ], 'avatar_file');
}
```

> Boa prática: mantenha a validação de extensão **e** a de MIME. A extensão dá uma mensagem amigável; o MIME garante a segurança. Defesa em camadas.

### 2. Chamar a validação no orquestrador `isValidImage()`

Em `ProfileImages.php`:

```php
private function isValidImage(): bool
{
    if (isset($this->validations['extensions'])) {
        $this->validateImageExtension();
    }

    if (isset($this->validations['mime_types'])) {   // <- NOVO
        $this->validateMimeType();
    }

    if (isset($this->validations['max_size'])) {
        $this->validateImageSize();
    }

    if (isset($this->validations['aspect_ratio'])) {
        $this->validateImageAspectRatio();
    }

    return $this->model->errors($this->column) === null;
}
```

### 3. Implementar `validateMimeType()`

```php
private function validateMimeType(): void
{
    if (empty($this->image['tmp_name']) || !is_readable($this->image['tmp_name'])) {
        $this->model->addError($this->column, 'Imagem inválida ou corrompida');
        return;
    }

    $finfo = new \finfo(FILEINFO_MIME_TYPE);
    $detectedMime = $finfo->file($this->image['tmp_name']);

    if (!in_array($detectedMime, $this->validations['mime_types'], true)) {
        $this->model->addError(
            $this->column,
            'O conteúdo do arquivo não corresponde a uma imagem válida.'
        );
    }
}
```

Lembre de adicionar `use finfo;` no topo, ou referenciar `\finfo` com a barra como acima.

### 4. (Defesa extra) Confirmar com `getimagesize()`

O projeto já usa `getimagesize()` na validação de proporção. Essa função **retorna `false` se o arquivo não for uma imagem real**, então ela também funciona como segunda barreira. Garanta que ela rode antes de mover o arquivo — hoje ela só roda se `aspect_ratio` estiver configurado. Considere sempre validar que `getimagesize()` não retorna `false`.

## Teste automatizado

Seguindo o padrão de [`tests/Unit/Services/ProfileImagesTest.php`](../../php/mymovies/tests/Unit/Services/ProfileImagesTest.php):

```php
public function test_should_reject_php_disguised_as_png(): void
{
    // Cria um arquivo com conteúdo PHP mas nome .png
    $tmp = tempnam(sys_get_temp_dir(), 'evil');
    file_put_contents($tmp, "<?php echo 'hacked'; ?>");

    $validations = ['mime_types' => ['image/jpeg', 'image/png']];
    $service = new ProfileImages($this->mockModel, $validations, 'avatar_file');

    $fakeImage = [
        'name' => 'inocente.png',
        'tmp_name' => $tmp,
        'size' => 100,
        'error' => 0,
    ];

    $result = $service->update($fakeImage);

    $this->assertFalse($result);
    $this->assertStringContainsString(
        'O conteúdo do arquivo não corresponde',
        $this->mockModel->errors('avatar_file')
    );

    unlink($tmp);
}
```

## Frontend (Angular) — nada a mudar (já funciona)

O componente [`edit-avatar.ts`](../../php/mymovies-angular/src/app/components/edit-avatar/edit-avatar.ts) já trata o erro retornado pelo backend:

```typescript
error: (err: ErrorsResponse) => {
  if (err.errors && err.errors['avatar_file']) {
    const errorData = err.errors['avatar_file'];
    const errorMessage = Array.isArray(errorData) ? errorData[0] : errorData;
    this.avatarError.set(errorMessage);   // exibe a mensagem na tela
  }
}
```

Como a nova validação de MIME devolve o erro na mesma estrutura (`errors['avatar_file']` / `errors['banner_file']`), **a mensagem aparece sozinha** na UI. Não precisa tocar no Angular.

> **Opcional — feedback antecipado:** o `<input type="file" accept="image/*">` já filtra no seletor de arquivos do SO, mas isso é só conveniência visual — **não é segurança** (o usuário pode burlar). A validação que vale é a do backend (magic bytes). Nunca confie no `accept`.

## Conceito para o WIKI — MIME Type

> **Definição:** MIME (Multipurpose Internet Mail Extensions) Type é um identificador padronizado de duas partes (`tipo/subtipo`, ex.: `image/png`) que descreve a natureza e o formato de um arquivo ou conteúdo transmitido. Originalmente criado para e-mail (RFC 2045/2046), foi adotado pela web para que cliente e servidor saibam interpretar o corpo de uma mensagem HTTP através do header `Content-Type`.

**Referência de livro:**
- KUROSE, James F.; ROSS, Keith W. *Redes de Computadores e a Internet: uma abordagem top-down*. 6ª ed. São Paulo: Pearson. — Seção sobre correio eletrônico e MIME / cabeçalhos HTTP.
- Alternativa: TANENBAUM, Andrew S. *Redes de Computadores* — capítulo de camada de aplicação (MIME).

**Referência sobre o ataque (upload malicioso):**
- STUTTARD, Dafydd; PINTO, Marcus. *The Web Application Hacker's Handbook*. 2ª ed. Wiley. — Capítulo sobre "Attacking File Upload Functionality".

## Checklist de demonstração
- [ ] Renomear um `.php`/`.txt` para `.png` e tentar subir → deve ser rejeitado.
- [ ] Mostrar a mensagem de erro retornada (status 422).
- [ ] Subir uma imagem real `.png` → deve passar.
