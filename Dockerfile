# Railway Backend Service Dockerfile
# Fix Maven source directory structure

FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
RUN apk add --no-cache maven

# Copy source and build in place with correct structure
COPY backend/pom.xml .
COPY backend/src/main/java src/main/java
COPY backend/src/main/resources src/main/resources

# Build Maven and run directly (no JAR repackaging)
RUN mvn -B package -DskipTests -Dmaven.test.skip=true && \
    java -cp target/classes:target/dependency/* ai.pdfzen.PdfzenApplication

RUN adduser -D appuser
USER appuser

EXPOSE 8080

# Simple startup
ENV JAVA_OPTS="-Xmx512m -XX:+UseG1GC"
ENV SPRING_PROFILES_ACTIVE=production

# Run directly from target/classes
ENTRYPOINT ["java", "$JAVA_OPTS", "-Djava.awt.headless=true", "-Dspring.profiles.active=$SPRING_PROFILES_ACTIVE", "-cp", "target/classes:target/dependency/*", "ai.pdfzen.PdfzenApplication"]
