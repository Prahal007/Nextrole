# Railway Multi-Service Dockerfile
# This file tells Railway which service to build
# We'll build the backend as the main service

FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY backend/pom.xml backend/
COPY backend/src backend/src
WORKDIR /app/backend
RUN mvn -B package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN adduser -D appuser
USER appuser
COPY --from=build /app/backend/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
