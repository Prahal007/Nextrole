# Railway Backend Service Dockerfile
# Optimized build with Maven dependency caching

FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
RUN apk add --no-cache maven

# Copy pom.xml first for better layer caching
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY backend/src/main/java src/main/java
COPY backend/src/main/resources src/main/resources

# Build application
RUN mvn -B package -DskipTests -Dmaven.test.skip=true

# Production stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN adduser -D appuser

# Copy only what's needed for production
COPY --from=build /app/target/*.jar app.jar

USER appuser
EXPOSE 8080

# Simple startup
ENV JAVA_OPTS="-Xmx512m -XX:+UseG1GC"
ENV SPRING_PROFILES_ACTIVE=production

# Run from JAR with all dependencies included
ENTRYPOINT ["java", "$JAVA_OPTS", "-Djava.awt.headless=true", "-Dspring.profiles.active=$SPRING_PROFILES_ACTIVE", "-jar", "app.jar"]
