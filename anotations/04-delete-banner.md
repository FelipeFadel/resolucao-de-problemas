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

## Frontend (Angular) — adicionar o botão de remover banner

Hoje o front tem o modal `edit-banner` que **só faz upload**. Para remover, faltam duas coisas: um método no service e um botão na UI.

### 1. Método no `profile.service.ts`

Em [`src/app/core/services/profile.service.ts`](../../php/mymovies-angular/src/app/core/services/profile.service.ts), ao lado de `updateUserBanner()`, adicione:

```typescript
deleteUserBanner() {
  return this.http.delete<{ token: string }>(`${this.API_URL}/change/banner`).pipe(
    tap(response => {
      if (response.token) {
        this.auth.updateSession(response.token); // re-decodifica o JWT → banner volta ao default
      }
    }),
    catchError(handleError),
  );
}
```

> Repare que reaproveitamos o mesmo padrão do upload: o backend devolve um **token novo** (com `banner_file` zerado), e `updateSession` faz a tela atualizar sozinha via signal. Não precisa recarregar a página.

### 2. Botão no componente `edit-banner`

Em [`src/app/components/edit-banner/edit-banner.ts`](../../php/mymovies-angular/src/app/components/edit-banner/edit-banner.ts), adicione o método:

```typescript
onDelete() {
  this.service.deleteUserBanner().subscribe({
    next: () => {
      setTimeout(() => {
        this.flashService.clear();
        this.closeForm.emit();
      }, 1000);
    },
    error: (err: ErrorsResponse) => {
      this.bannerError.set('Não foi possível remover o banner.');
    }
  });
}
```

### 3. Botão no template `edit-banner.html`

No bloco de botões (onde já existem "Enviar" e "Cancelar"), adicione entre eles:

```html
<button
    type="button"
    (click)="onDelete()"
    class="w-full bg-red-600 hover:brightness-110 text-white rounded-md uppercase font-bold tracking-wider py-2.5 transition-all duration-200 cursor-pointer"
>
    Remover Banner
</button>
```

> O `auth-interceptor` já anexa o token automaticamente no `DELETE`, então não precisa fazer nada de auth aqui. O fluxo de feedback (flash + fechar modal) é idêntico ao do avatar — mantém a simetria que o professor valoriza.

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
