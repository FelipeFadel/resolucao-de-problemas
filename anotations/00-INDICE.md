# Entrega 4.3 — Galeria 1×N: possíveis pedidos de validação do professor

Histórico: nas duas entregas anteriores, após a entrega o professor pediu **uma melhoria extra**:
- Autenticação → permitir login por **email OU username** (só tínhamos email).
- CRUD → bloquear criação de usuário com **menos de 12 anos**.

Abaixo, os 7 pedidos mais prováveis para a entrega 4.3, cada um com tutorial de implementação (backend + frontend Angular), testes e referência bibliográfica.

> **Comece por aqui:** [08 — Conceitos, Arquitetura e Fluxo](08-conceitos-arquitetura-e-fluxo.md). Explica como o Angular conversa com o PHP, o ciclo de vida de uma imagem (upload→exibição→remoção), o que cada pasta faz nos dois repos, e onde cada pedido toca a stack. Ler antes dos tutoriais.

| # | Pedido | Onde mexe | Front? | Probabilidade |
|---|--------|-----------|:---:|---------------|
| [01](01-validacao-mime-type.md) | Validar **MIME type** (não só extensão) — bloquear upload malicioso | `ProfileImages.php` | já pronto | 🔴 Alta — a entrega pede explicitamente "tratamento de upload malicioso" |
| [02](02-cascade-delete-foreign-keys.md) | **Foreign Keys reais + Cascade Delete** no schema | `schema.sql` | — | 🔴 Alta — a entrega cobra integridade referencial e cascata |
| [03](03-galeria-1xN-real.md) | **Galeria 1×N real** (tabela separada com HasMany/BelongsTo) | novo model + schema | **sim** | 🔴 Alta — é o tema central da entrega; hoje só temos 1×2 fixo |
| [04](04-delete-banner.md) | Implementar **remoção do banner** (`deleteBanner`) | `ProfileController.php` + rotas | **sim** | 🟡 Média — funcionalidade pela metade, padrão "análogo" dele |
| [05](05-limpeza-filesystem-na-exclusao.md) | Corrigir **limpeza do filesystem** ao excluir usuário | `UsersController.php` | — | 🟡 Média — há bug real de caminho; entrega cobra "remover do filesystem" |
| [06](06-validacao-dimensao-minima.md) | Validar **dimensão mínima** em pixels | `ProfileImages.php` | já pronto | 🟡 Média — regra de negócio extra, estilo "idade mínima" |
| [07](07-impedir-imagem-entidade-inexistente.md) | Impedir **imagem para galeria inexistente** | controller + FK | — | 🔴 Alta — item textual da entrega |

**Coluna "Front?":** _sim_ = exige código novo no Angular (detalhado na seção "Frontend" do tutorial); _já pronto_ = os componentes `edit-avatar`/`edit-banner` já exibem o erro do backend automaticamente; _—_ = sem impacto de tela.

## Conexões entre os pedidos
- **02 → 07:** a FK do pedido 02 é a base técnica que faz o pedido 07 funcionar no banco.
- **02 → 05:** CASCADE (banco) + limpeza de arquivos (aplicação) juntos cumprem "remover do filesystem **e** do banco".
- **03 → 05/07:** a galeria real usa `HasMany`, que já injeta o dono correto e isola arquivos por pasta.
- **01 + 06:** ambos endurecem o `ProfileImages` (segurança + qualidade) e devem reusar uma única chamada de `getimagesize()`.

## Como rodar a entrega (passo a passo)

Todos os comandos `./run` rodam a partir da raiz do backend: `cd ~/Tsi/php/mymovies`.

### 1. Subir o ambiente (backend + banco + nginx)
```bash
./run up -d        # sobe os containers em background
./run ps           # confere: db, php, nginx devem estar "running"
```

### 2. Preparar o banco (aplica schema + dados de teste)
```bash
./run db:reset     # recria as tabelas a partir de database/schema.sql (aplica as FKs novas)
./run db:populate  # cria os dados de teste (usuário example@email.com, etc.)
```
> ⚠️ `db:reset` faz `DROP TABLE` — apaga tudo. Sempre rode `db:populate` em seguida.

### 3. Permissão da pasta de uploads (OBRIGATÓRIO para imagens funcionarem)
A pasta `public/assets/uploads` é um **Docker volume** e o PHP roda como `www-data`. Sem isso, qualquer upload dá `mkdir(): Permission denied` (erro 500). Rode **uma vez** após subir os containers:
```bash
docker compose exec php chown -R www-data:www-data /var/www/public/assets/uploads
```
> Cobre também as subpastas novas da galeria (`uploads/users/{id}/`, `uploads/user_images/...`), pois o `-R` é recursivo. Não precisa repetir a cada upload — só se recriar o volume (`./run down -v`).

### 4. Subir o frontend (Angular)
Em outro terminal: `cd ~/Tsi/php/mymovies-angular`
```bash
npm install        # só na primeira vez
npm start          # ou: ng serve  → abre em http://localhost:4200
```
> O `proxy.conf.json` redireciona `/api/*` para o backend em `localhost:3000`. Por isso o front e o back rodam juntos sem configurar CORS.

### 5. Rodar os testes
```bash
./run test                 # todos os testes (unit + integração)
./run test tests/Unit      # só unitários
./run test:browser         # testes de aceitação (Selenium)
./run phpstan              # análise estática
./run phpcs                # estilo de código (PSR)
```

### Resumo rápido (do zero ao funcionando)
```bash
cd ~/Tsi/php/mymovies
./run up -d
./run db:reset && ./run db:populate
docker compose exec php chown -R www-data:www-data /var/www/public/assets/uploads
# em outro terminal:
cd ~/Tsi/php/mymovies-angular && npm start
```

## Referências bibliográficas usadas (consolidado)
- ELMASRI; NAVATHE. *Sistemas de Banco de Dados* — FK, integridade referencial, ações ON DELETE.
- DATE, C. J. *Introdução a Sistemas de Banco de Dados* — integridade referencial.
- FOWLER, M. *Patterns of Enterprise Application Architecture* — Active Record, Foreign Key Mapping.
- KUROSE; ROSS. *Redes de Computadores e a Internet* — MIME, HTTP.
- STUTTARD; PINTO. *The Web Application Hacker's Handbook* — file upload attacks.
- GONZALEZ; WOODS. *Processamento Digital de Imagens* — resolução vs. proporção.
- SILBERSCHATZ; GALVIN; GAGNE. *Sistemas Operacionais* — sistema de arquivos.
- FIELDING, R. T. *Architectural Styles...* (tese REST) — métodos HTTP/idempotência.
- ANDERSON, R. *Security Engineering* — defesa em profundidade.
