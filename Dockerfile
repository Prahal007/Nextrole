# Railway Backend Service Dockerfile
# Single-stage build for better reliability

FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
RUN apk add --no-cache maven
COPY backend/pom.xml .
COPY backend/src backend/src
COPY backend/src/main/resources/startup.sh /app/

# Build Maven and force inclusion of all classes
RUN mvn -B package -DskipTests -Dmaven.test.skip=true && \
    mvn package -DskipTests -Dmaven.test.skip=true -Dspring-boot.repackage.skip=false

# Copy JAR file to correct location
RUN cp /app/target/*.jar /app/app.jar

RUN adduser -D appuser
USER appuser

EXPOSE 8080

# Add debug logging
ENV JAVA_OPTS="-Xmx512m -XX:+UseG1GC -XX:+UseStringDeduplication"
ENV SPRING_PROFILES_ACTIVE=production

# Start with startup script for better error handling
ENTRYPOINT ["sh", "/app/startup.sh"]
