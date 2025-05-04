
# UserManagerAPI

Um sistema robusto de autenticação e autorização desenvolvido com Spring Boot 3 e Java 21, oferecendo gerenciamento seguro de usuários, manipulação de tokens JWT e verificação de e-mails. Além disso, utiliza Flyway para migrações de banco de dados.

## 🚀 Funcionalidades

### 🔑 Autenticação & Autorização
- Autenticação baseada em JWT com tokens de acesso e atualização.
- Rotação segura de tokens de atualização (Refresh Tokens).
- Armazenamento seguro de tokens de atualização em cookies HttpOnly.
- Autorização baseada em papéis (Role-based Authorization).

### 👤 Gerenciamento de Usuários
- Registro de usuários com verificação de e-mail.
- Recuperação de senha via link enviado por e-mail.
- Fluxo de ativação de conta.
- Manipulação segura de senhas usando BCrypt.

### 🔒 Segurança
- Blacklist de tokens JWT inválidos.
- Rotação de Refresh Tokens para maior segurança.
- Configuração CORS e proteção contra XSS.
- Limitação de requisições (Rate Limiting).

### 📑 Migrações de Banco de Dados
- Uso de **Flyway** para versionamento e controle de migrações de banco de dados.
- Scripts de migração localizados em `src/main/resources/db/migration`.

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Java 21**
- **Spring Boot 3.3**
  - Spring Security
  - Spring Data JPA
  - Spring Validation
- **Flyway Migration** - Controle de versões de banco de dados.
- **MapStruct** - Mapeamento de DTOs.
- **Lombok** - Redução de código boilerplate.
- **PostgreSQL 17.2**

### Desenvolvimento e Deploy
- **Docker & Docker Compose**
- **Maven**
- **JUnit 5 & Mockito** - Testes unitários e mocking.

---

## 📋 Pré-requisitos

- Java 21
- Docker e Docker Compose
- Maven
- PostgreSQL 17.2+

---

## 📂 Estrutura do Projeto

```
src/
├── main/
│   ├── java/com/usermanager/manager/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── exception/
│   │   ├── model/
│   │   ├── repository/
│   │   ├── service/
│   │   └── infra/
│   └── resources/
│       ├── db/migration/
│       └── application.properties
└── test/
    └── java/com/usermanager/manager/
```

---

## 🔑 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registro de novos usuários.
- `GET  /api/auth/register/confirm` - Confirmação de e-mail para ativação de conta.
- `POST /api/auth/login` - Autenticação de usuário e geração de tokens JWT.
- `POST /api/auth/token/refresh` - Renovação de tokens de acesso.

### Gerenciamento de Senhas
- `POST /api/auth/password/forget` - Solicitação de redefinição de senha.
- `POST /api/auth/password/reset` - Redefinição de senha.
- `POST /api/auth/activate` - Ativação de conta do usuário.

---

## 📑 Configuração do Projeto

### Configurações do Banco de Dados
No arquivo `application.properties` ou `application.yml`, configure as credenciais do banco de dados:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/user_manager
spring.datasource.username=seu_usuario
spring.datasource.password=sua_senha
spring.jpa.hibernate.ddl-auto=update
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
```

### Variáveis de Ambiente
Certifique-se de configurar as seguintes variáveis de ambiente:

- `API_SECURITY_TOKEN_SECRET` - Chave secreta para geração de tokens JWT.
- `API_SECURITY_TOKEN_EXPIRATION` - Tempo de expiração do Access Token.
- `API_SECURITY_TOKEN_REFRESH_EXPIRATION` - Tempo de expiração do Refresh Token.

---

## 🐳 Execução com Docker Compose

1. Compilar o projeto:
```bash
mvn clean package
```

2. Iniciar os containers:
```bash
docker-compose up -d
```

A aplicação estará disponível em `http://localhost:8080`.

---

## 🧪 Testes

Para executar os testes, utilize o comando:
```bash
mvn test
```

---

## 📜 Licença

Este projeto está licenciado sob a MIT License. Consulte o arquivo [LICENSE](LICENSE) para mais informações.

---

## ✨ Melhorias Futuras

- [ ] Integração com OAuth2.
- [ ] Autenticação de dois fatores (2FA).
- [ ] Painel administrativo.
- [ ] Gerenciamento de perfis de usuário.
- [ ] Registro de atividades do usuário.

---

## 📧 Contato

Feel free to reach out to me! Here's how you can connect:

[![Email](https://img.shields.io/badge/Email-keven.moraes.dev%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:keven.moraes.dev@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/keven-santos-430849201/)

---
Desenvolvido por Keven - sinta-se à vontade para contribuir!
