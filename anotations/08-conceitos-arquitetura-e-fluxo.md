# Conceitos, Arquitetura e Fluxo da Entrega 4.3

Este documento é o "mapa" da entrega. Explica **como as duas aplicações conversam**, **o ciclo de vida de uma imagem** (upload → exibição → remoção), **o que cada pasta faz** e **onde cada um dos 7 pedidos toca a stack**. Leia este antes dos tutoriais numerados.

---

## 1. Visão geral: duas aplicações separadas

O sistema é dividido em **dois repositórios independentes**:

| Repo | Papel | Tecnologia |
|------|-------|------------|
| [`php/mymovies`](../../php/mymovies) | **Backend / API REST** | PHP puro (framework próprio MVC + Active Record), MariaDB, rodando em Docker (Nginx + PHP-FPM) |
| [`php/mymovies-angular`](../../php/mymovies-angular) | **Frontend / SPA** | Angular 19 (signals, standalone components), TailwindCSS |

Eles **não compartilham código**. Conversam só por **HTTP/JSON** (e `multipart/form-data` no upload). O backend não renderiza tela; o Angular não acessa o banco. Essa separação é o conceito de **arquitetura cliente-servidor desacoplada** (API REST + SPA).

---

## 2. Como uma requisição viaja (ponta a ponta)

Exemplo: o usuário troca o avatar. Acompanhe o caminho físico do dado:

```
[Navegador / Angular]
   │  POST /api/change/avatar   (FormData com o arquivo)
   │  Header: Authorization: Bearer <JWT>
   ▼
[Angular dev-server proxy]      proxy.conf.json
   │  reescreve  /api/change/avatar  →  http://localhost:3000/change/avatar
   │  (remove o prefixo /api)
   ▼
[Nginx do container]            server/nginx.conf  (porta 3000→80)
   │  fastcgi_pass php:9000
   ▼
[PHP-FPM]  public/index.php → config/bootstrap.php → Core\Router
   │  casa a rota:  Route::post('/change/avatar', [ProfileController, 'updateAvatar'])
   │  passa pelo middleware 'auth' (valida o JWT)
   ▼
[ProfileController::updateAvatar]
   │  lê $_FILES['avatar_file']
   ▼
[User::avatar()  →  ProfileImages::update()]
   │  valida (extensão, tamanho, proporção...) e move o arquivo
   ├──► grava o arquivo em  public/assets/uploads/users/{id}/<hash>.png   (FILESYSTEM)
   └──► atualiza  users.avatar_file = '<hash>.png'                        (BANCO)
   │
   ▼  resposta JSON  { token: <novo JWT com avatar_file atualizado>, user: {...} }
[volta ao Angular]
   │  auth.updateSession(token) → re-decodifica o JWT → currentUser signal muda
   ▼
[A tela re-renderiza]  computed() recalcula a URL da imagem → <img src> novo
```

**Detalhe-chave do `proxy.conf.json`:** em desenvolvimento, o Angular roda em `localhost:4200` e o backend em `localhost:3000`. O `pathRewrite` `^/api → ''` faz o prefixo `/api` existir só no frontend. Por isso o `environment.apiUrl = '/api'` no Angular vira `/change/avatar` no backend. Era esse o caminho do erro 500 que você viu lá no começo (`http://localhost:4200/api/change/banner`).

---

## 3. O ciclo de vida de uma imagem (o coração da entrega)

A entrega cobra três operações + a relação com banco e filesystem. Veja onde cada uma vive:

### 3.1 UPLOAD (registrar)
| Camada | Arquivo | O que faz |
|--------|---------|-----------|
| Front | `components/edit-avatar/edit-avatar.ts` | `onFileSelected()` pega o `File` do `<input type=file>` |
| Front | `core/services/profile.service.ts` | monta `FormData`, faz `POST /change/avatar` |
| Back | `app/Controllers/ProfileController.php` | lê `$_FILES`, chama o serviço |
| Back | `app/Services/ProfileImages.php` | **valida** e dá `move_uploaded_file()` |
| **Filesystem** | `public/assets/uploads/users/{id}/` | onde o arquivo físico fica |
| **Banco** | coluna `users.avatar_file` | guarda só o **nome** do arquivo, não a imagem |

### 3.2 EXIBIÇÃO (apresentar)
| Camada | Arquivo | O que faz |
|--------|---------|-----------|
| Back | `ProfileImages::path()` | monta a URL pública + hash MD5 (cache-busting) ou cai no default |
| Back | `User::getAvatarPath()` | expõe o caminho no JSON da API |
| Front | `profile.service.ts → getAvatarUrl()` | prefixa com `apiUrl` |
| Front | `pages/profile/profile.html` | `<img [src]="userAvatar()">` |

### 3.3 REMOÇÃO (remover)
| Camada | Arquivo | O que faz |
|--------|---------|-----------|
| Front | (botão a criar) → `profile.service.ts` | `DELETE /change/avatar` |
| Back | `ProfileController::deleteAvatar()` | chama o serviço |
| Back | `ProfileImages::delete()` | `unlink()` o arquivo **e** seta a coluna = null |
| **Filesystem** | arquivo é apagado | requisito: "mostrar que a imagem foi removida no filesystem" |
| **Banco** | `avatar_file = NULL` | volta ao default na próxima leitura |

> **Conceito central:** o banco **nunca guarda a imagem**, só o *nome do arquivo*. A imagem mora no filesystem. Por isso toda operação precisa manter os **dois mundos em sincronia** — é exatamente o que o Pedido 5 corrige (hoje a exclusão deixa arquivo órfão).

---

## 4. Mapa do BACKEND (`php/mymovies`) — pasta por pasta

```
mymovies/
├── public/
│   ├── index.php              ← porta de entrada. TUDO passa por aqui.
│   └── assets/uploads/        ← imagens enviadas (Docker volume). É o "filesystem" da entrega.
├── config/
│   ├── routes.php             ← mapa URL → Controller. ONDE você adiciona rotas novas.
│   └── bootstrap.php          ← inicializa o Router.
├── app/
│   ├── Controllers/           ← recebem a request, devolvem JSON. Orquestram, não têm regra pesada.
│   │   ├── ProfileController.php   (avatar/banner: upload, delete, show)
│   │   └── UsersController.php      (login, register, delete conta, ratings)
│   ├── Models/                ← representam tabelas + regras de validação de negócio.
│   │   └── User.php                (define avatar()/banner() com as regras de validação)
│   └── Services/              ← lógica reutilizável e "gorda".
│       └── ProfileImages.php       ← O CORAÇÃO do upload. Valida e move arquivos.
├── core/                      ← o "mini-framework" caseiro (não mexa sem necessidade).
│   ├── Database/ActiveRecord/
│   │   ├── Model.php               (CRUD genérico, __get/__set mágicos, relações)
│   │   ├── HasMany.php             (lado "1" da relação 1×N)
│   │   └── BelongsTo.php           (lado "N" da relação 1×N)
│   └── Router/                     (casa URL com controller + middlewares)
├── database/
│   └── schema.sql             ← DDL das tabelas. ONDE entram as Foreign Keys (Pedido 2).
├── tests/
│   ├── Unit/                  ← testa Models e Services isolados (ProfileImagesTest)
│   ├── Integration/Access/    ← testa que rotas exigem autenticação
│   └── Acceptance/            ← testa a API de ponta a ponta (ProfileCest)
└── server/nginx.conf          ← roteamento HTTP → PHP-FPM
```

**Fluxo MVC resumido:** `routes.php` (rota) → `Controller` (orquestra) → `Model`/`Service` (regra + dados) → `Model` fala com o `core` → MariaDB. O Controller **nunca** deve ter SQL nem `move_uploaded_file` direto; isso é trabalho do Model/Service.

---

## 5. Mapa do FRONTEND (`php/mymovies-angular`) — pasta por pasta

```
mymovies-angular/src/app/
├── pages/                     ← componentes de página inteira (rota dedicada)
│   └── profile/               (profile.ts + profile.html: monta avatar+banner, abre os modais)
├── components/                ← componentes reutilizáveis / modais
│   ├── edit-avatar/           (modal de upload do avatar — onFileSelected)
│   ├── edit-banner/           (modal de upload do banner)
│   └── flash-message/         (toast de feedback)
├── core/
│   ├── services/              ← onde vivem as chamadas HTTP. NÃO chame http em componente.
│   │   ├── profile.service.ts (updateUserIcon, updateUserBanner, getAvatarUrl, getBannerUrl)
│   │   └── auth.ts            (login, token no localStorage, currentUser signal, updateSession)
│   ├── interceptor/
│   │   └── auth-interceptor.ts (anexa "Bearer <token>" em TODA request automaticamente)
│   ├── guards/
│   │   └── auth-guard.ts       (bloqueia rota se não logado)
│   └── models/
│       └── auth.user.ts        (interface AuthUser: id, username, avatar_file, banner_file...)
├── app.routes.ts              ← rotas do Angular (qual componente para cada URL)
├── app.config.ts              ← registra interceptors e router globalmente
└── environments/environment.ts ← apiUrl = '/api'
```

**Padrão de dados no Angular (importante para todos os tutoriais de front):**
- Estado reativo via **signals**: `currentUser = signal<AuthUser>()`.
- A foto não é "estado próprio" do componente — ela é **derivada** do usuário logado via `computed()`: `userAvatar = computed(() => service.getAvatarUrl(authService.currentUser()?.avatar_file))`.
- Por isso, depois do upload, o backend devolve um **JWT novo** com o `avatar_file` atualizado; o front chama `auth.updateSession(token)`, o signal muda, e **a imagem troca sozinha** na tela. Esse é o truque que mantém front e back sincronizados sem recarregar a página.

---

## 6. Onde cada um dos 7 pedidos toca a stack

| # | Pedido | Backend | Banco | Frontend | Doc |
|---|--------|:-------:|:-----:|:--------:|-----|
| 1 | MIME type | `ProfileImages.php` | — | só exibe o erro (já funciona) | [01](01-validacao-mime-type.md) |
| 2 | FK + Cascade | — | `schema.sql` | — | [02](02-cascade-delete-foreign-keys.md) |
| 3 | Galeria 1×N | novo Controller + Model | nova tabela `user_images` | **novos componentes** (galeria, upload, lista, delete) | [03](03-galeria-1xN-real.md) |
| 4 | Delete banner | `ProfileController` + rota | — | **novo botão + método no service** | [04](04-delete-banner.md) |
| 5 | Limpeza filesystem | `UsersController` | (CASCADE complementa) | — | [05](05-limpeza-filesystem-na-exclusao.md) |
| 6 | Dimensão mínima | `ProfileImages.php` | — | só exibe o erro (já funciona) | [06](06-validacao-dimensao-minima.md) |
| 7 | Galeria inexistente | Controller + `exists()` | FK (do Pedido 2) | — | [07](07-impedir-imagem-entidade-inexistente.md) |

**Leitura da tabela:**
- Pedidos **1 e 6** (validações): o frontend **já está pronto**. Os componentes `edit-avatar`/`edit-banner` já leem `err.errors['avatar_file']` e mostram a mensagem que o backend mandar. Você só adiciona a validação no backend e a mensagem aparece sozinha.
- Pedidos **3 e 4**: exigem **trabalho real no Angular** (detalhado nas seções "Frontend" dos respectivos tutoriais).
- Pedidos **2, 5, 7**: backend/banco puro, sem mudança de tela.

---

## 7. Conceitos transversais (com referência de livro)

### multipart/form-data (enctype)
> **Definição:** codificação de corpo de requisição HTTP usada para enviar formulários que contêm arquivos binários. Diferente de `application/x-www-form-urlencoded`, ela divide o corpo em "partes" (boundaries), cada uma com seus próprios headers, permitindo misturar campos de texto e arquivos sem corromper os bytes binários. No Angular, `new FormData()` + `http.post` gera esse enctype automaticamente; no PHP, as partes chegam em `$_FILES`.

**Referência:** KUROSE; ROSS. *Redes de Computadores e a Internet* (camada de aplicação / HTTP); spec original RFC 7578.

### Arquitetura MVC + Active Record
> **MVC:** separa a aplicação em Model (dados+regra), View (apresentação) e Controller (orquestra a request). Aqui a "View" é a API JSON. **Active Record:** cada objeto de Model encapsula uma linha da tabela e sabe se salvar/buscar/atualizar.

**Referência:** FOWLER, Martin. *Patterns of Enterprise Application Architecture* — padrões **Model View Controller**, **Active Record** e **Front Controller** (o nosso `public/index.php` é exatamente um Front Controller).

### Autenticação stateless com JWT
> **Definição:** o servidor não guarda sessão; toda a identidade do usuário viaja num token assinado (JWT) enviado no header `Authorization`. O backend valida a assinatura a cada request. Atualizar o avatar gera um token novo porque os dados do usuário (incluindo `avatar_file`) estão *dentro* do token.

**Referência:** ANDERSON, Ross. *Security Engineering* — autenticação e tokens; RFC 7519 (JWT).

---

## 8. Roteiro de demonstração full-stack (para a banca)

1. **Upload (tela + filesystem + banco):** subir avatar pela UI → mostrar a imagem trocando na hora → `docker compose exec php ls public/assets/uploads/users/{id}/` (arquivo apareceu) → `SELECT avatar_file FROM users WHERE id={id}` (nome gravado).
2. **Validação:** subir um `.php` renomeado → ver a mensagem de erro na própria tela (Pedido 1).
3. **Remoção:** remover a imagem → `ls` mostra que sumiu do filesystem → coluna volta a NULL/default.
4. **Relação 1×N + integridade:** mostrar `SHOW CREATE TABLE` com a FK → deletar o pai e ver o CASCADE → tentar inserir filho órfão e ver o erro 1452.
