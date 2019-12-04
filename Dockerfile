FROM maven:3.6.0-jdk-8
ENV APP_DIR /app
WORKDIR ${APP_DIR}

COPY pom.xml .
RUN mvn dependency:go-offline

COPY . ${APP_DIR}
RUN mvn package -Pprod verify jib:dockerBuild -DskipTests
