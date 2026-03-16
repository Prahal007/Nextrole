#!/bin/sh

echo "Starting Spring Boot application..."
echo "Java Version: $(java -version)"
echo "Available Memory: $(free -m)"
echo "Current Directory: $(pwd)"
echo "Files in app directory: $(ls -la /app/)"

# Start the application with error handling
java $JAVA_OPTS -Djava.awt.headless=true -Dspring.profiles.active=$SPRING_PROFILES_ACTIVE -jar app.jar --debug 2>&1 | tee /app/startup.log

# Check if application started successfully
if [ $? -eq 0 ]; then
    echo "Application started successfully"
    exit 0
else
    echo "Application failed to start"
    echo "Check startup.log for details:"
    cat /app/startup.log
    exit 1
fi
