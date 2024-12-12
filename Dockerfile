# Etapa de build
FROM maven:3.8.5-openjdk-17 as build

COPY chamagol-spring/src /app/src
COPY chamagol-spring/pom.xml /app

WORKDIR /app
RUN mvn clean package -DskipTests

# Etapa de execução
FROM openjdk:17-jdk-slim

EXPOSE 8080

COPY --from=build /app/target/chamagol-0.0.1-SNAPSHOT.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
