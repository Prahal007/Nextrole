# Railway Backend Service Dockerfile
# Forces Railway to build backend service correctly

FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
RUN apk add --no-cache maven
COPY backend/pom.xml .
COPY backend/src backend/src

# Build Maven and verify target directory
RUN mvn -B package -DskipTests -Dmaven.test.skip=true && ls -la /app/backend/target/ && echo "Target directory exists: $?"

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN adduser -D appuser
USER appuser

# Copy JAR files with verification
COPY --from=build /app/backend/target/*.jar app.jar
RUN ls -la /app/backend/target/ && echo "JAR files copied: $?"

EXPOSE 8080

# Add debug logging
ENV JAVA_OPTS="-Xmx512m -XX:+UseG1GC -XX:+UseStringDeduplication"
ENV SPRING_PROFILES_ACTIVE=production

# Start with startup script for better error handling
ENTRYPOINT ["sh", "/app/startup.sh"]
