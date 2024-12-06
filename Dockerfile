# Etapa 1: Build
FROM ubuntu:20.04 AS build

# Atualiza e instala dependências necessárias
RUN apt update && apt install -y \
    openjdk-17-jdk \
    maven \
    && apt clean

# Define o diretório de trabalho
WORKDIR /chamagol-spring
# Copia apenas os arquivos necessários para o Maven (evita copiar desnecessários)
COPY pom.xml ./
COPY src ./src

# Executa o build do Maven
RUN mvn clean package -DskipTests

# Etapa 2: Runtime
FROM openjdk:17-jdk-slim

# Define a porta exposta pelo aplicativo
EXPOSE 8080

# Copia o artefato gerado do estágio de build
COPY --from=build /app/target/chamagol-0.0.1-SNAPSHOT.jar app.jar

# Define o comando de inicialização
ENTRYPOINT ["java", "-jar", "app.jar"]
