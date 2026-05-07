## Instalação basica

sudo apt update
sudo apt install docker.io docker-compose git -y

Ativar docker:

sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER

Importante: Sair da sessão e voltar

## Clonar projeto

git clone https://github.com/williancordeiro/mymovies.git
cd mymovies/

## env

cp .env.example .env
cp .env .env.testing

## Subir containers

docker compose up -d (melhor com o script do projeto)

### Script do projeto

./run up -d

## Instalar dependências PHP

./run composer install

## Banco de dados

./run db:reset
./run db:populate

Acessar -> localhost:3000
config/routes.php

Teste se está funcionando o back

curl -X POST localhost:3000/auth/login \
 -H "Content-Type: application/json" \
 -d '{"email":"example@email.com","password":"password123"}'

# Angular instalation

## Confirmando instalação do node

curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install nodejs -y

node -v
npm -v

## Instalando o angular

npm install -g @angular/cli (Só usar sudo se precisar)

ng version

git clone https://github.com/williancordeiro/mymovies-angular.git
cd mymovies-angular

## Dependencias do projeto

npm install

## Rodando

ng serve

## Possivel erro de proxy

nano proxy.conf.json

{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": ""
    }
  }
}

ng serve

### Falhas possiveis

sudo dockerd -> Iniciar o daemon
sudo systemctl restart docker

felipefadel@felipefadel-System-Product-Name:~/Tsi/php/mymovies$ sudo apt install docker-compose-plugin -y
docker: unknown command: docker compose

felipefadel@felipefadel-System-Product-Name:~/Tsi/php/mymovies$ sed -i 's/docker compose/docker-compose/g' run

### Se estiver com o composer V1, Precisamos desinstalar e baixar outro

sudo apt remove --purge docker.io docker-compose docker-doc podman-docker containerd runc -y

sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd
sudo rm -rf /etc/docker

sudo apt update
sudo apt install ca-certificates curl gnupg lsb-release -y

sudo mkdir -p /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
 "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
 https://download.docker.com/linux/ubuntu \
 $(lsb_release -cs) stable" | \
 sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

docker compose version
Docker Compose version v5.1.3


# Revisão de Código e Estudos

## Fluxo para Criar um Novo Tipo de Usuário (Ex: Editor)

Para adicionar um novo nível de acesso ao sistema, siga este fluxo completo:

### 1. Banco de Dados
- **Alterar Schema:** Adicione a nova permissão na tabela `users`.
  - Arquivo: `database/schema.sql`
  - Ex: `` `editor` DECIMAL(1) NOT NULL DEFAULT 0 ``
- **Popular Dados:** Atualize o script de populate para criar usuários de teste com esse perfil.
  - Arquivo: `database/Populate/UsersPopulate.php`

### 2. Backend (PHP MVC)
- **Modelo de Usuário:** Adicione a nova coluna ao array de colunas mapeadas.
  - Arquivo: `app/Models/User.php`
  - Adicionar `'editor'` no array `$columns`.
- **Criar Middleware:** Crie a classe que fará a validação de acesso.
  - Arquivo: `app/Middleware/EditorAuthenticate.php`
  - Deve herdar de `Authenticate` e verificar se o usuário logado tem a flag necessária (ex: `if ($user->editor != 1)`).
- **Registrar Middleware:** Vincule um "apelido" (alias) à classe do middleware.
  - Arquivo: `config/App.php`
  - Adicionar `'editor' => \App\Middleware\EditorAuthenticate::class`.
- **Proteger Rotas:** Aplique o middleware nas rotas que exigem essa permissão.
  - Arquivo: `config/routes.php`
  - Ex: `Route::middleware('editor')->group(function() { ... });`

### 3. Frontend (Angular)
- **Interface de Usuário:** Atualize a interface `User` para incluir o novo campo.
  - Arquivo: `src/app/models/user.model.ts` (ou similar).
- **Route Guards:** Crie um Guard para proteger as rotas no lado do cliente.
  - Ex: `ng generate guard guards/editor`
- **Controle de UI:** Utilize diretivas como `*ngIf` para exibir elementos específicos para esse nível de acesso.
  - Ex: `<button *ngIf="user.editor">Ações de Editor</button>`

## Conceitos e Atividades Realizadas em PHP

### 1. Sistema de Login e Autenticação
O fluxo de autenticação garante que apenas usuários registrados acessem o sistema.
- **Validação no Backend:** Os Controllers recebem os dados e utilizam os Models para verificar o usuário.
  - Local: `app/Controllers/UserController.php`
- **Segurança de Senhas:** 
  - `password_hash()`: Utilizado para transformar a senha em um hash seguro antes de salvar no banco. (Veja em `app/Models/User.php`)
  - `password_verify()`: Compara a senha digitada com o hash armazenado no banco durante o login. (Veja o método `authenticate` em `app/Models/User.php`)

### 2. Sessões e Controle de Acesso
Gerenciamento de quem pode acessar o quê.
- **Sessões ($_SESSION):** Iniciadas no `config/bootstrap.php`, permitem manter o usuário logado entre diferentes requisições.
- **Autorização (Middleware):** Filtros que interceptam a requisição antes de chegar ao Controller.
  - `app/Middleware/Authenticate.php`: Bloqueia usuários não autenticados.
  - `app/Middleware/AdminAuthenticate.php`: Restringe acesso a administradores.
  - `app/Middleware/EditorAuthenticate.php`: Restringe acesso a editores.
- **Logout:** Método que limpa os dados da sessão e redireciona o usuário.

### 3. Rotas e Controllers
A estrutura segue o padrão MVC (Model-View-Controller).
- **Rotas (`config/routes.php`):** Define quais URLs são públicas e quais são protegidas por middlewares.
- **Controllers (`app/Controllers/`):** Processam a lógica de negócio, recebem dados de formulários e decidem qual resposta enviar.

---

## Guia de Testes Automatizados

Os testes garantem a estabilidade do sistema e são executados via `./run tests`.

### 1. Testes de Aceitação
Simulam a interação real do usuário com a interface.
- **Cenários comuns:**
  - Tentativa de acesso a área restrita sem estar logado.
  - Autenticação com dados incorretos (deve exibir erro).
  - Autenticação bem-sucedida (deve redirecionar corretamente).
  - Realização de Logout.
- Local: `tests/Acceptance/`

### 2. Testes de Acesso e Rotas
Verificam a integridade das permissões do sistema.
- **Verificações:**
  - Rotas autenticadas só abrem com login ativo.
  - Rotas públicas estão acessíveis para todos.
  - Rotas que não devem permitir usuários já logados (ex: página de login após já estar logado).
- Local: `tests/Acceptance/` ou `tests/Integration/`

### 3. Testes Unitários
Testam a lógica interna de classes e métodos sem depender do banco de dados completo ou do navegador.
- **Foco:**
  - Métodos dos Models (validações, formatação de dados).
  - Classes auxiliares e Libs.
- Local: `tests/Unit/`

---

## Guia de Desenvolvimento: Passo a Passo Completo

Este guia detalha como realizar mudanças estruturais no projeto, desde o banco de dados até os testes automatizados.

### Passo 1: Alteração no Banco de Dados

Toda nova permissão ou dado do usuário começa no banco de dados.

1.  **Modifique o Schema:** 
    - Vá em `database/schema.sql`.
    - Adicione a coluna necessária (ex: `` `moderator` DECIMAL(1) NOT NULL DEFAULT 0 ``).
2.  **Atualize os Dados Iniciais:** 
    - No arquivo `database/Populate/UsersPopulate.php`, adicione um novo usuário ou atualize um existente com o novo campo para fins de teste.
3.  **Aplique as Mudanças:** 
    - Como o projeto usa Docker, você precisa rodar os comandos para resetar o banco:
    ```bash
    ./run db:reset
    ./run db:populate
    ```

### Passo 2: Mapeamento no Backend (PHP MVC)

O PHP precisa saber que a nova coluna existe e como protegê-la.

1.  **Model (`app/Models/User.php`):**
    - Adicione o nome da nova coluna no array `static array $columns`. Sem isso, o PHP ignorará o campo ao tentar salvar ou ler do banco.
2.  **Criação do Middleware (`app/Middleware/`):**
    - Crie um arquivo como `ModeratorAuthenticate.php`.
    - **Estrutura base:**
    ```php
    <?php
    namespace App\Middleware;
    use Core\Http\Request;
    use Lib\Authentication\Auth;

    class ModeratorAuthenticate extends Authenticate {
        public function handle(Request $request): void {
            parent::handle($request); // Verifica se está logado primeiro
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
            preg_match('/Bearer\s(\S+)/', $authHeader, $matches);
            $user = Auth::user($matches[1] ?? null);

            if (!$user || $user->moderator != 1) {
                $this->forbidden(); // Retorna 401/403 se não for moderador
            }
        }
    }
    ```
3.  **Registro do Middleware (`config/App.php`):**
    - Adicione seu novo middleware ao array `$middlewareAliases`:
    ```php
    'mod' => \App\Middleware\ModeratorAuthenticate::class,
    ```

### Passo 3: Roteamento e Controllers

1.  **Configuração de Rotas (`config/routes.php`):**
    - Agrupe as rotas que exigem a nova permissão:
    ```php
    Route::middleware('mod')->group(function () {
        Route::get('/moderacao/painel', [ModeratorController::class, 'index']);
    });
    ```
2.  **Criação do Controller (`app/Controllers/`):**
    - Crie o `ModeratorController.php` para processar as requisições dessa área.
3.  **Flash Messages:**
    - Para enviar avisos do backend para o frontend:
    ```php
    \Lib\FlashMessage::success('Dados atualizados!'); // Mensagem de sucesso
    \Lib\FlashMessage::danger('Erro crítico!');      // Mensagem de erro
    ```

### Passo 4: Testes Automatizados (Garantia de Qualidade)

Não considere a tarefa pronta antes de rodar os testes.

1.  **Teste de Aceitação (End-to-End):**
    - Cria um arquivo em `tests/Acceptance/auth/ModeratorCest.php`.
    - Este teste simula um navegador tentando acessar a URL protegida.
    ```php
    public function testAcessoNegadoSemPermissao(AcceptanceTester $page) {
        $page->sendGet('/moderacao/painel');
        $page->seeResponseCodeIs(401);
    }
    ```
2.  **Teste Unitário:**
    - Cria um arquivo em `tests/Unit/Models/UserTest.php`.
    - Valida se a lógica do objeto User está correta.
    ```php
    public function testValidarCampoModerador() {
        $user = new User(['moderator' => 1]);
        $this->assertEquals(1, $user->moderator, 'O campo moderador deve ser 1');
    }
    ```
3.  **Execução Total:**
    - Rode todos os testes para garantir que nada antigo quebrou:
    ```bash
    ./run tests
    ```

### Dicas de Ouro para Mudanças:
- **Nomenclatura:** Mantenha os nomes de classes e arquivos em Inglês e seguindo o padrão CamelCase.
- **Humanização:** Adicione comentários explicando o "porquê" de certas lógicas complexas nos seus Controllers.
- **Logs:** Se algo não funcionar, verifique os logs em `log/nginx/error.log` dentro do projeto.

---

## Explicações do Frontend (Angular)

O frontend do MyMovies é construído com **Angular**, operando como uma **Single Page Application (SPA)**. Isso significa que a página não recarrega completamente ao navegar; apenas os componentes necessários são atualizados.

### 1. Comunicação com o Backend
O Angular utiliza o `HttpClient` para fazer requisições assíncronas ao servidor PHP.
- **Proxy de Desenvolvimento:** Para evitar problemas de CORS, o arquivo `proxy.conf.json` mapeia chamadas de `/api` para `http://localhost:3000`. No código Angular, você chama `/api/login` e o proxy encaminha para o backend correto (onde o PHP está rodando).

### 2. Gerenciamento de Mensagens (Flash Messages)
As mensagens de sucesso ou erro vindas do backend são capturadas automaticamente:
- **Interceptor (`flashInterceptor`):** Intercepta todas as respostas HTTP. Se encontrar um objeto `flash` no JSON retornado pelo PHP, ele o extrai e envia para o `FlashService`.
- **FlashService:** Utiliza **Angular Signals** para armazenar as mensagens. O componente principal da aplicação "escuta" esse serviço e exibe os alertas (Toasts/Alertas) no topo da tela.

### 3. Estrutura de Pastas
- `src/app/pages/`: Componentes que representam páginas inteiras (Login, Cadastro, Listagem).
- `src/app/components/`: Elementos reutilizáveis (Header, Movie Cards, Formulários).
- `src/app/core/services/`: Lógica de comunicação com a API (ex: `AuthService` para login, `MovieService` para filmes).
- `src/app/core/guards/`: Proteção de rotas no frontend (ex: impedir que um usuário deslogado acesse a página de perfil).

---

## O que é válido mudar no Backend e Como Fazer

O seu backend segue o padrão **MVC (Model-View-Controller)** com uma camada de **ActiveRecord** para facilitar o uso do banco de dados.

### 1. Criar ou Alterar Modelos (Banco de Dados)
Sempre que precisar de uma nova tabela ou campo no banco:
- **Passo A:** Adicione a coluna no arquivo `database/schema.sql`.
- **Passo B:** Atualize o Model correspondente em `app/Models/`. Todo Model deve herdar de `Core\Database\ActiveRecord\Model`.
- **Passo C:** Liste o nome da nova coluna no array `protected static array $columns`. Se não listar aqui, o PHP não conseguirá salvar o dado.
- **Passo D:** Rode `./run db:reset` e `./run db:populate` para aplicar as mudanças.

### 2. Criar Novos Endpoints (Rotas e Controllers)
Para adicionar uma funcionalidade nova (ex: "Favoritar um Filme"):
- **Rota:** Em `config/routes.php`, adicione a linha: `Route::post('/movies/favorite', [MovieController::class, 'favorite']);`.
- **Controller:** Em `app/Controllers/MovieController.php`, crie o método `favorite`. Use `$this->json([...])` para enviar a resposta de volta ao Angular.

### 3. Implementar Regras de Acesso (Middleware)
Se uma rota for restrita (ex: apenas Admin pode deletar filmes):
- **Middleware:** Crie a lógica em `app/Middleware/AdminAuthenticate.php`.
- **Registro:** Verifique se o middleware tem um apelido em `config/App.php`.
- **Uso:** Na rota, use `Route::middleware('admin')->group(...)`.

---

## Exemplo: Como criar uma Flash Message em uma parte específica

Se você quer exibir um aviso de "Sucesso" ou "Erro" no Angular após uma ação no PHP:

1.  **No seu Controller PHP:**
    Chame a classe `Lib\FlashMessage` antes de enviar a resposta JSON.
    ```php
    public function updateProfile(Request $request) {
        // ... lógica de atualização no banco ...
        
        if ($deu_certo) {
            \Lib\FlashMessage::success('Perfil atualizado com sucesso!');
        } else {
            \Lib\FlashMessage::danger('Erro ao salvar os dados.');
        }

        // Ao chamar o método json, as mensagens acima são anexadas automaticamente
        $this->json(['status' => 'ok']);
    }
    ```

2.  **O que acontece por trás:**
    - O método `$this->json()` do backend busca mensagens pendentes no `FlashMessage::get()`.
    - Ele envia um JSON assim para o Angular:
      ```json
      {
        "status": "ok",
        "flash": { "success": "Perfil atualizado com sucesso!" }
      }
      ```
    - O **FlashInterceptor** no Angular percebe a chave `"flash"`, avisa o **FlashService**, e a mensagem aparece magicamente na interface do usuário sem você precisar escrever código extra no componente Angular.
