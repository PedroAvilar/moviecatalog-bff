# MovieCatalog – Backend For Frontend (BFF)

Serviço de backend dedicado que faz a ponte entre o frontend e as APIs externas.

> **Nota:** Este repositório contém o **Backend For Frontend (BFF)**. Ele funciona em conjunto com o **cliente frontend** dedicado.

## Links do Projeto

- **Repositório do Frontend:** [moviecatalog-frontend](https://github.com/pedroavilar/moviecatalog-frontend)
- **Site em produção:** [Acessar o site](https://pedroavilar.github.io/moviecatalog-frontend/)

## Sobre o Projeto

O MovieCatalog BFF atua como uma camada intermediária essencial para o frontend. Ele foi criado para centralizar a agregação de dados, o proxy para APIs externas (especialmente a API do TMDB), o cache em memória e os mecanismos de segurança, como autenticação e autorização via JWT.

Ao delegar essas responsabilidades para fora do cliente, o frontend pode permanecer estritamente focado em interface e experiência do usuário, enquanto o BFF garante que os dados sejam entregues de forma eficiente e segura. O backend também integra com o MongoDB para persistir dados específicos de cada usuário, como favoritos, avaliações e contas.

### Arquitetura

O projeto segue uma arquitetura em camadas bem definida:

- **Routes** – Definição dos endpoints e aplicação de middlewares por rota.
- **Controllers** – Recebem as requisições, delegam ao serviço e enviam a resposta padronizada.
- **Services** – Contêm toda a lógica de negócio, comunicação com o banco de dados e com a API do TMDB.
- **Models** – Schemas do Mongoose que definem os modelos de dados persistidos no MongoDB.
- **Schemas (Zod)** – Validação e sanitização dos dados de entrada via Zod.
- **Middlewares** – Autenticação JWT (`auth.middleware.js`), validação de requisições (`validateRequest.js`) e tratamento centralizado de erros (`errorHandler.js`).
- **Utils** – Utilitários reutilizáveis: `AppError` (erros customizados), `asyncHandler` (wrapper para rotas assíncronas), `cacheHelper` (abstração do cache em memória via `node-cache`) e `sendResponse` (padronização de respostas de sucesso e erro).
- **Config** – Configuração centralizada do ambiente (`env.js`), conexão com o banco de dados (`db.js`), cache (`cache.js`) e logger com Pino (`logger.js`).

### Funcionalidades

- **Autenticação e Autorização** – Registro e login com senhas hashadas via `bcryptjs`; sessão gerenciada por JWT armazenado em cookie `httpOnly`.
- **Proxy TMDB** – Todas as requisições ao TMDB passam pelo BFF, mantendo a API Key exclusivamente no servidor.
- **Cache em memória** – Respostas do TMDB são cacheadas com `node-cache` para reduzir chamadas externas desnecessárias.
- **Rate Limiting** – Proteção contra abusos nas rotas de autenticação com `express-rate-limit`.
- **Favoritos** – CRUD completo para o gerenciamento de filmes favoritos por usuário.
- **Avaliações** – Criação, listagem e remoção de avaliações (reviews) de filmes por usuário.
- **Validação de entrada** – Todos os dados recebidos são validados com Zod antes de chegarem aos controllers.
- **Respostas padronizadas** – Utilitário `sendResponse` garante envelope `{ message, data }` consistente em todas as respostas.
- **Segurança** – Cabeçalhos HTTP seguros via `helmet` e política de CORS configurada por lista de origens permitidas.
- **Health Check** – Endpoint `GET /health` para verificação do status do serviço.

### Testes Automatizados (Quality Assurance)

A qualidade e a resiliência do código são garantidas através de uma suíte abrangente de testes de integração e unitários, essencial para aplicações de nível de produção (*production-ready*).
- **Ferramentas:** Construído utilizando **Jest** como _test runner_ e **Supertest** para asserções em requisições HTTP e simulação de rotas Express.
- **Cobertura Estratégica:** Testes rigorosos cobrindo *Happy Paths* (casos de sucesso) e *Unhappy Paths* (cenários de erro, exceções e casos de borda).
- **Validação de Contratos:** Testes específicos para garantir que a camada de validação (**Zod**) intercepte e trate adequadamente _payloads_ incorretos, maliciosos ou vazios (`400 Bad Request`).
- **Isolamento e Mocks:** Uso avançado de _mocking_ (`jest.unstable_mockModule` e `jest.fn()`) para abstrair dependências externas (TMDB), garantindo testes rápidos e determinísticos.
- **Banco de Dados em Memória:** Integração com **mongodb-memory-server** para testes de integração reais, permitindo validar persistência, consultas complexas e exclusões em cascata sem a necessidade de um banco de dados externo ou _mocks_ de modelos.
- **Segurança, Performance e Cache:** Asserções cobrindo autenticação, injeção NoSQL e XSS, além de testes dedicados para o sistema de **cache em memória**, garantindo que as APIs externas sejam consumidas de forma eficiente.
- **Ambiente Padronizado com Docker:** A conteinerização garante que o ambiente de desenvolvimento e testes seja idêntico para todos no time, fortalecendo a integração contínua.

## Tecnologias

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) / [Mongoose](https://mongoosejs.com/)
- [Zod](https://zod.dev/) (Validação de schemas)
- [Jest](https://jestjs.io/) (Test Runner)
- [Supertest](https://github.com/ladjs/supertest) (HTTP Assertions)
- [mongodb-memory-server](https://github.com/nodkz/mongodb-memory-server) (Banco de dados em memória para testes)
- [JWT](https://jwt.io/) / [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) (Hash de senhas)
- [node-cache](https://github.com/node-cache/node-cache) (Cache em memória)
- [Helmet](https://helmetjs.github.io/) (Segurança de cabeçalhos HTTP)
- [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit)
- [Pino](https://getpino.io/) (Logger)
- [Axios](https://axios-http.com/)
- [Docker](https://www.docker.com/)
- [MongoDB Atlas](https://www.mongodb.com/atlas) (Banco de dados em nuvem)
- [Render](https://render.com/) (Hospedagem em nuvem)

## Deploy

O BFF está implantado como um **Web Service no Render**, garantindo comunicação segura com o frontend via políticas de CORS. A persistência do banco de dados é gerenciada remotamente pelo **MongoDB Atlas**, oferecendo uma solução de banco de dados em nuvem totalmente gerenciada.

## Instalação e configuração

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configuração do ambiente:**
   Duplique o arquivo `.env.example` e renomeie-o para `.env`. Preencha as variáveis de ambiente necessárias (ex.: URI do MongoDB, Secret do JWT, Chave da API do TMDB).

3. **Executar o projeto:**

   **Com Node/Nodemon (Local)**:
   ```bash
   npm run dev
   ```

   **Com Docker**:
   ```bash
   docker-compose up -d
   ```

4. **Executar a suíte de testes:**
   ```bash
   npm test
   ```

> Para instruções de configuração do frontend, acesse o [Repositório do Frontend](https://github.com/pedroavilar/moviecatalog-frontend).

## Status do Projeto

Este projeto está atualmente em **desenvolvimento ativo**.

---

# MovieCatalog – Backend For Frontend (BFF)

A dedicated backend service bridging the frontend application and external APIs.

> **Note:** This repository contains the **Backend For Frontend (BFF)** application. It works in conjunction with its dedicated **Frontend client**.

## Project Links

- **Frontend Repository:** [moviecatalog-frontend](https://github.com/pedroavilar/moviecatalog-frontend)
- **Live Site:** [View live site](https://pedroavilar.github.io/moviecatalog-frontend/)

## About the Project

The MovieCatalog BFF serves as a crucial intermediary layer for the frontend application. It was introduced to handle data aggregation, external API proxying (specifically the TMDB API), in-memory caching, and security mechanisms such as authentication and authorization via JWT.

By offloading these responsibilities from the client side, the frontend can remain strictly focused on UI/UX and performance while the BFF ensures data is served efficiently and securely. The backend also integrates with MongoDB to persist user-specific data, such as favorites, reviews, and accounts.

### Architecture

The project follows a well-defined layered architecture:

- **Routes** – Endpoint definitions and per-route middleware application.
- **Controllers** – Receive requests, delegate to the service layer, and send standardized responses.
- **Services** – Contain all business logic, database communication, and TMDB API interaction.
- **Models** – Mongoose schemas defining the data models persisted in MongoDB.
- **Schemas (Zod)** – Input validation and sanitization via Zod.
- **Middlewares** – JWT authentication (`auth.middleware.js`), request validation (`validateRequest.js`), and centralized error handling (`errorHandler.js`).
- **Utils** – Reusable utilities: `AppError` (custom errors), `asyncHandler` (async route wrapper), `cacheHelper` (in-memory cache abstraction via `node-cache`), and `sendResponse` (standardized success/error response envelope).
- **Config** – Centralized environment configuration (`env.js`), database connection (`db.js`), cache (`cache.js`), and Pino logger (`logger.js`).

### Features

- **Authentication & Authorization** – Register and login with passwords hashed via `bcryptjs`; sessions managed by JWT stored in an `httpOnly` cookie.
- **TMDB Proxy** – All TMDB requests are proxied through the BFF, keeping the API Key exclusively on the server.
- **In-memory Cache** – TMDB responses are cached with `node-cache` to reduce unnecessary external calls.
- **Rate Limiting** – Abuse protection on auth routes via `express-rate-limit`.
- **Favorites** – Full CRUD for managing per-user favorite movies.
- **Reviews** – Create, list, and delete movie reviews per user.
- **Input Validation** – All incoming data is validated with Zod before reaching controllers.
- **Standardized Responses** – `sendResponse` utility ensures a consistent `{ message, data }` envelope across all responses.
- **Security** – Secure HTTP headers via `helmet` and CORS policy configured with an allowed-origins list.
- **Health Check** – `GET /health` endpoint for service status verification.

### Automated Testing (Quality Assurance)

Code quality and resilience are ensured through a comprehensive suite of integration and unit tests, demonstrating production-readiness.
- **Tools:** Built using **Jest** as the test runner and **Supertest** for HTTP request assertions and Express route simulation.
- **Strategic Coverage:** Rigorous testing covering both *Happy Paths* (success cases) and *Unhappy Paths* (error scenarios, exceptions, and edge cases).
- **Contract Validation:** Specific tests to ensure the validation layer (**Zod**) correctly intercepts malicious, empty, or incorrect payloads (`400 Bad Request`).
- **Isolation and Mocks:** Advanced usage of module mocking (`jest.unstable_mockModule` and `jest.fn()`) to abstract external dependencies (TMDB API), ensuring fast and deterministic test runs.
- **In-Memory Database:** Integration with **mongodb-memory-server** for real integration tests, allowing validation of persistence, complex queries, and cascade deletions without the need for an external database or model mocks.
- **Security, Performance & Caching:** Assertions covering authentication logic, NoSQL injection, XSS prevention, and dedicated tests for the **in-memory caching system**, ensuring efficient external API consumption.
- **Docker-Standardized Environment:** Containerization ensures that the development and testing environments are identical across the team, strengthening continuous integration.

## Technologies

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) / [Mongoose](https://mongoosejs.com/)
- [Zod](https://zod.dev/) (Schema validation)
- [Jest](https://jestjs.io/) (Test Runner)
- [Supertest](https://github.com/ladjs/supertest) (HTTP Assertions)
- [mongodb-memory-server](https://github.com/nodkz/mongodb-memory-server) (In-memory database for testing)
- [JWT](https://jwt.io/) / [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) (Password hashing)
- [node-cache](https://github.com/node-cache/node-cache) (In-memory cache)
- [Helmet](https://helmetjs.github.io/) (HTTP security headers)
- [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit)
- [Pino](https://getpino.io/) (Logger)
- [Axios](https://axios-http.com/)
- [Docker](https://www.docker.com/)
- [MongoDB Atlas](https://www.mongodb.com/atlas) (Cloud Database)
- [Render](https://render.com/) (Cloud Hosting)

## Deployment

The BFF is deployed as a production **Web Service on Render**, ensuring secure communication with the frontend via proper CORS policies. Database persistence is handled remotely via **MongoDB Atlas**, offering a fully managed cloud database solution.

## Installation and Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   Duplicate the `.env.example` file and rename it to `.env`. Fill in the required environment variables (e.g., MongoDB URI, JWT Secret, TMDB API Key).

3. **Run the project:**

   **Using Node/Nodemon (Local)**:
   ```bash
   npm run dev
   ```

   **Using Docker**:
   ```bash
   docker-compose up -d
   ```

4. **Run the test suite:**
   ```bash
   npm test
   ```

> For frontend setup instructions, please visit the [Frontend Repository](https://github.com/pedroavilar/moviecatalog-frontend).

## Project Status

This project is currently **under active development**.
