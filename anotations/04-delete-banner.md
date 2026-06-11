# Pedido 4 — Implementar remoção do Banner (`deleteBanner`)

## Contexto no nosso projeto

Em [`app/Controllers/ProfileController.php`](../../php/mymovies/app/Controllers/ProfileController.php) existe `deleteAvatar()`, mas **não existe `deleteBanner()`**. Em [`config/routes.php`](../../php/mymovies/php/mymovies/config/routes.php) só há:

```php
Route::delete('/change/avatar', [ProfileController::class, 'deleteAvatar']);
// falta: Route::delete('/change/banner', ...)
```

Esse é o tipo de pedido "análogo" que o professor já fez antes (login por username, idade mínima): **uma funcionalidade que tem metade implementada e precisa ser completada de forma simétrica.** Se a banca testar remover o banner na demonstração, hoje quebra.

A boa notícia: o serviço [`ProfileImages`](../../php/mymovies/app/Services/ProfileImages.php) **já é genérico** (recebe a `$column`), e o model `User` já tem o método `banner()`. Falta só plugar o controller e a rota.

## Como o `delete()` já funciona no serviço

```php
// ProfileImages.php
public function delete(): bool
{
    $this->removeOldImage();                              // apaga o arquivo físico
    return $this->model->update([$this->column => null]); // zera a coluna no banco
}

private function removeOldImage(): void
{
    if ($this->model->{$this->column}) {
        $path = $this->getAbsoluteSavedFilePath();
        if (file_exists($path)) {
            unlink($path);
        }
    }
}
```

Ele já remove **do filesystem e do banco**. Só precisamos expô-lo para o banner.

## Implementação passo a passo

### 1. Novo método no `ProfileController`

Copie a estrutura de `deleteAvatar()` e troque `avatar` por `banner`:

```php
public function deleteBanner(Request $request): void
{
    $user = $this->currentUser();
    if (!$user) {
        $this->json(['error' => 'Usuário não encontrado'], 401);
        return;
    }

    if ($user->banner()->delete()) {
        $token = Auth::generateToken($user);
        $this->json([
            'message'     => 'Banner removido com sucesso',
            'token'       => $token,
            'banner_file' => $user->getBannerPath(),
        ]);
    } else {
        $this->json(['error' => 'Erro ao remover o banner'], 500);
    }
}
```

> Quando o banner é removido, `getBannerPath()` cai no fallback `/assets/images/defaults/banner.png` (veja `path()` no serviço). O front volta a exibir o banner padrão — comportamento idêntico ao avatar.

### 2. Registrar a rota

Em `config/routes.php`, dentro do grupo `Route::middleware('auth')`:

```php
Route::delete('/change/banner', [ProfileController::class, 'deleteBanner']);
```

> **Importante:** a rota fica dentro do grupo `auth` — só usuário autenticado pode remover o próprio banner. Isso conecta com o Pedido 7 (testes de acesso).

## Teste de aceitação

Seguindo [`tests/Acceptance/Profile/ProfileCest.php`](../../php/mymovies/tests/Acceptance/Profile/ProfileCest.php):

```php
public function testShouldRemoveBannerSuccessfully(AcceptanceTester $I): void
{
    $I->haveHttpHeader('Authorization', 'Bearer ' . $this->token);
    $I->sendDelete('/change/banner');
    $I->seeResponseCodeIs(200);
    $I->seeResponseContainsJson(['message' => 'Banner removido com sucesso']);
}
```

## Teste de acesso (não autenticado deve falhar)

Seguindo o padrão de `tests/Integration/Access/ProfileAccessTest.php`:

```php
public function test_delete_banner_requires_authentication(): void
{
    // sem header Authorization
    $response = $this->delete('/change/banner');
    $this->assertEquals(401, $response->getStatusCode());
}
```

## Conceito para o WIKI

> **Idempotência em DELETE:** segundo a semântica do HTTP, o método `DELETE` é idempotente — executá-lo uma ou várias vezes produz o mesmo estado final no servidor. Remover um banner já removido deve continuar retornando sucesso/estado consistente (volta ao default), não um erro.

**Referência de livro:**
- FIELDING, Roy T. *Architectural Styles and the Design of Network-based Software Architectures* (tese de doutorado, 2000) — definição de REST e propriedades dos métodos HTTP.
- Alternativa didática: KUROSE; ROSS. *Redes de Computadores e a Internet* — métodos HTTP.

## Checklist de demonstração
- [ ] Subir um banner, depois chamar `DELETE /change/banner`.
- [ ] Mostrar que o arquivo sumiu do filesystem (Pedido 5).
- [ ] Mostrar que `banner_file` voltou ao default no banco/response.
- [ ] Tentar sem token → 401.
