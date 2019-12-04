FROM maven:3.6.0-jdk-8
ENV APP_DIR /app
WORKDIR ${APP_DIR}
COPY . ${APP_DIR}
RUN mvn package -Pprod verify jib:dockerBuild -DskipTests
