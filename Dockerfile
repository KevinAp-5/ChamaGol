# Etapa 1: Build
FROM ubuntu:20.04 AS build

# Instala dependências necessárias
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    maven \
    && apt-get clean

# Define o diretório de trabalho
WORKDIR /app

# Copia todo o projeto para o container
COPY . .

# Navega para o diretório do projeto Spring
WORKDIR /app/chamagol-spring

# Copia os arquivos necessários para o build
COPY chamagol-spring/pom.xml ./
COPY chamagol-spring/src ./src

# Executa o build do Maven
RUN mvn clean package -DskipTests

# Etapa 2: Runtime
FROM openjdk:17-jdk-slim

# Define a porta exposta pelo aplicativo
EXPOSE 8080

# Copia o artefato gerado do estágio de build
COPY --from=build /app/chamagol-spring/target/chamagol-0.0.1-SNAPSHOT.jar app.jar

# Define o comando de inicialização
ENTRYPOINT ["java", "-jar", "app.jar"]