# Pedido 6 — Validação de dimensão mínima da imagem

## Contexto no nosso projeto

Hoje [`ProfileImages.php`](../../php/mymovies/app/Services/ProfileImages.php) valida **proporção** (aspect ratio), mas não valida **tamanho em pixels**:

```php
private function validateImageAspectRatio(): void
{
    $imageInfo = getimagesize($this->image['tmp_name']);
    $width  = $imageInfo[0];
    $height = $imageInfo[1];
    $aspectRatio = $width / $height;
    // ... só checa o ratio
}
```

**Problema:** uma imagem de **5×2 pixels** tem proporção 2.5 e passa na validação do banner — mas é inútil (vira um borrão ao ser exibida). O professor pode pedir um **mínimo de dimensão** para garantir qualidade visual. É o tipo de regra de negócio adicional que ele costuma cobrar (como a idade mínima no CRUD).

## Implementação passo a passo

### 1. Adicionar `min_dimensions` na config do model

Em [`app/Models/User.php`](../../php/mymovies/app/Models/User.php):

```php
public function banner(): ProfileImages
{
    return new ProfileImages($this, [
        'extensions'   => ['jpg', 'jpeg', 'png'],
        'max_size'     => 5 * 1024 * 1024,
        'aspect_ratio' => ['min' => 2.5, 'max' => 3.5],
        'min_dimensions' => ['width' => 600, 'height' => 200], // <- NOVO
    ], 'banner_file');
}
```

(Para o avatar, algo como `['width' => 100, 'height' => 100]`.)

### 2. Chamar no orquestrador `isValidImage()`

```php
if (isset($this->validations['min_dimensions'])) {
    $this->validateMinDimensions();
}
```

### 3. Implementar `validateMinDimensions()`

```php
private function validateMinDimensions(): void
{
    $imageInfo = getimagesize($this->image['tmp_name']);

    if (!$imageInfo) {
        $this->model->addError($this->column, 'Imagem inválida ou corrompida');
        return;
    }

    [$width, $height] = $imageInfo;
    $minW = $this->validations['min_dimensions']['width'];
    $minH = $this->validations['min_dimensions']['height'];

    if ($width < $minW || $height < $minH) {
        $this->model->addError(
            $this->column,
            "A imagem deve ter no mínimo {$minW}x{$minH} pixels."
        );
    }
}
```

### Boa prática — evitar `getimagesize()` duplicado

Hoje `getimagesize()` já é chamado em `validateImageAspectRatio()`. Adicionar outra chamada lê o arquivo do disco de novo. **Refatore** para ler uma vez e reaproveitar:

```php
private ?array $imageDimensions = null;

private function imageInfo(): array|false
{
    if ($this->imageDimensions === null) {
        $this->imageDimensions = getimagesize($this->image['tmp_name']) ?: false;
    }
    return $this->imageDimensions;
}
```

E nos dois validadores use `$info = $this->imageInfo();` em vez de chamar `getimagesize()` direto. Menos I/O, código mais limpo (princípio DRY).

## Teste automatizado

Seguindo [`tests/Unit/Services/ProfileImagesTest.php`](../../php/mymovies/tests/Unit/Services/ProfileImagesTest.php) (que usa uma imagem real do projeto para o `getimagesize` funcionar):

```php
public function test_should_reject_image_below_minimum_dimensions(): void
{
    $validations = [
        'min_dimensions' => ['width' => 99999, 'height' => 99999], // impossível
    ];
    $service = new ProfileImages($this->mockModel, $validations, 'banner_file');

    $fakeImage = [
        'name' => 'pequena.png',
        'tmp_name' => $this->dummyImagePath, // banner.png real do projeto
        'size' => 1000,
        'error' => 0,
    ];

    $result = $service->update($fakeImage);

    $this->assertFalse($result);
    $this->assertStringContainsString(
        'no mínimo',
        $this->mockModel->errors('banner_file')
    );
}
```

> O teste de aspect ratio já existente usa o mesmo truque: passa um `min/max` impossível e espera a mensagem de erro. Mantemos o padrão.

## Conceito para o WIKI

> **Resolução vs. proporção:** a *proporção* (aspect ratio) descreve a relação largura/altura e é independente da escala; a *resolução* (dimensões em pixels) descreve a quantidade de informação da imagem. Duas validações ortogonais: uma garante o formato, a outra garante qualidade/densidade suficiente. Em imagens raster (bitmap), ampliar além da resolução nativa causa perda de qualidade (pixelização), pois não há informação adicional para interpolar.

**Referência de livro:**
- GONZALEZ, Rafael C.; WOODS, Richard E. *Processamento Digital de Imagens*. 3ª ed. Pearson. — Capítulo 2: fundamentos da imagem digital, amostragem, resolução espacial e em pixels.

## Checklist de demonstração
- [ ] Subir uma imagem minúscula (ex.: 50×20) com proporção válida → rejeitada por dimensão.
- [ ] Subir imagem grande o suficiente → aceita.
- [ ] Mostrar a mensagem "no mínimo NxN pixels".
