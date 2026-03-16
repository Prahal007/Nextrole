# Railway Backend Service Dockerfile
# Forces Railway to build backend service correctly

FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
RUN apk add --no-cache maven
COPY backend/pom.xml .
COPY backend/src backend/src
RUN mvn -B package -DskipTests && mkdir -p /app/backend/target && ls -la /app/

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN adduser -D appuser
USER appuser
COPY --from=build /app/backend/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
