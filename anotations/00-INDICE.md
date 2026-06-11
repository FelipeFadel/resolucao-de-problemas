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
