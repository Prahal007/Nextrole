# Railway Backend Service Dockerfile
# Forces Railway to build backend service correctly

FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
RUN apk add --no-cache maven
COPY backend/pom.xml .
COPY backend/src backend/src
COPY backend/src/main/resources/startup.sh /app/
RUN mvn -B package -DskipTests && ls -la /app/backend/target/

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN adduser -D appuser
USER appuser
COPY --from=build /app/backend/target/*.jar app.jar
EXPOSE 8080

# Add debug logging
ENV JAVA_OPTS="-Xmx512m -XX:+UseG1GC -XX:+UseStringDeduplication"
ENV SPRING_PROFILES_ACTIVE=production

# Start with startup script for better error handling
ENTRYPOINT ["sh", "/app/startup.sh"]
