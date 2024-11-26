FROM ubuntu:lastest AS build

RUN apt update && apt clean
RUN apt install openjdk-17-jdk -y && apt clean
COPY . .

RUN apt install maven -y && apt clean
RUN mvn clean install

FROM openjdk:17-jdk-slim

EXPOSE 8080

COPY --from=build /target/chamagol-spring/target/chamagol-0.0.1-SNAPSHOT.jar app.jar

ENTRYPOINT [ "java", "-jar" "app.jar" ]