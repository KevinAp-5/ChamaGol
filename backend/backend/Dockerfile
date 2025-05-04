# Etapa 1: Build da aplicação
FROM  maven:3.9.4-eclipse-temurin-21 AS builder

WORKDIR /app

# Copia o arquivo pom.xml e baixa as dependências para otimizar o cache
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copia o código-fonte para o container
COPY src ./src

# Compila o projeto e gera o arquivo .jar
RUN mvn clean package -DskipTests

# Etapa 2: Configuração para produção
FROM eclipse-temurin:21-jdk

WORKDIR /app

# Copia o .jar gerado na etapa de build
COPY --from=builder /app/target/*.jar app.jar

# Define o comando para executar a aplicação
CMD ["java", "-jar", "app.jar"]