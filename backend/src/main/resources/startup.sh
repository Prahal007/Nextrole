#!/bin/sh

echo "Starting Spring Boot application..."
echo "Java Version: $(java -version 2>&1 | head -n 1)"
echo "Available Memory: $(free -m)"
echo "Current Directory: $(pwd)"
echo "Files in app directory: $(ls -la /app/)"

# Check if JAR file exists
if [ ! -f "/app/app.jar" ]; then
    echo "ERROR: app.jar not found in /app/"
    echo "Available files:"
    find /app -name "*.jar" -type f
    exit 1
fi

echo "Found JAR file: $(ls -la /app/app.jar)"

# Start the application with error handling
echo "Starting application with: java $JAVA_OPTS -Djava.awt.headless=true -Dspring.profiles.active=$SPRING_PROFILES_ACTIVE -jar app.jar"
java $JAVA_OPTS -Djava.awt.headless=true -Dspring.profiles.active=$SPRING_PROFILES_ACTIVE -jar app.jar --debug > /app/startup.log 2>&1 &

# Wait for application to start
echo "Waiting for application to start..."
sleep 10

# Check if application is running
if pgrep -f "java.*app.jar" > /dev/null; then
    echo "Application started successfully"
    echo "Application logs:"
    tail -20 /app/startup.log
    exit 0
else
    echo "Application failed to start"
    echo "Full startup logs:"
    cat /app/startup.log
    exit 1
fi
