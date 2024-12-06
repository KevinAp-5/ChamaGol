FROM ubuntu:20.04 AS build

RUN apt update && apt clean
RUN apt install openjdk-17-jdk -y && apt clean
COPY . .

RUN apt install maven -y && apt clean

WORKDIR "/chamagol-spring"
RUN mvn clean install -Dmaven.test.skip=true

FROM openjdk:17-jdk-slim

EXPOSE 8080

COPY --from=build /target/chamagol-spring/target/chamagol-0.0.1-SNAPSHOT.jar app.jar

ENTRYPOINT [ "java", "-jar" "app.jar" ]